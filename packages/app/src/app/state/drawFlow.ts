import { Transaction } from '@midnight-ntwrk/ledger-v8';
import type { PhrimNetworkId } from '@phrim/contract';
import type { PhrimErrorCode } from '../../viewmodels/errors';
import { getConfiguredContractAddress } from '../midnight/contractAddress';
import { hexToBytes } from '../midnight/hex';
import type { ConnectedWallet } from '../midnight/walletConnector';
import { createProvingWorker, proveDraw } from '../worker/workerClient';
import type { WitnessCredentialSlot } from '../worker/protocol';
import type { ProofStage } from '../../viewmodels/types';

function firstTransactionIdentifier(finalizedTxHex: string): string {
  const finalizedTx = Transaction.deserialize('signature', 'proof', 'binding', hexToBytes(finalizedTxHex));
  const [firstIdentifier] = finalizedTx.identifiers();
  if (firstIdentifier === undefined) {
    throw new Error('finalized transaction carries no identifier');
  }
  return firstIdentifier;
}

export interface DrawFlowRequest {
  networkId: PhrimNetworkId;
  originUrl: string;
  wallet: ConnectedWallet;
  facilityIdHex: string;
  requestedMinor: string;
  borrowerSecretHex: string;
  slots: WitnessCredentialSlot[];
}

export interface DrawFlowSuccess {
  outcome: 'funded';
  txId: string;
}

export interface DrawFlowFailure {
  outcome: 'rejected';
  code: PhrimErrorCode;
}

export type DrawFlowResult = DrawFlowSuccess | DrawFlowFailure;

export function isDrawFlowAvailable(networkId: PhrimNetworkId): boolean {
  return getConfiguredContractAddress(networkId) !== null;
}

export async function runDrawFlow(
  request: DrawFlowRequest,
  onStage: (stage: ProofStage) => void,
): Promise<DrawFlowResult> {
  const contractAddress = getConfiguredContractAddress(request.networkId);
  if (contractAddress === null) {
    onStage('failed');
    return { outcome: 'rejected', code: 'NETWORK_UNAVAILABLE' };
  }

  onStage('preparing');
  const worker = createProvingWorker();
  try {
    const requestId = crypto.randomUUID();
    let provenTransactionHex: string;
    try {
      const result = await proveDraw(
        worker,
        {
          type: 'prove',
          requestId,
          networkId: request.networkId,
          originUrl: request.originUrl,
          contractAddress,
          accountId: request.wallet.unshieldedAddress,
          coinPublicKey: request.wallet.shieldedCoinPublicKey,
          encryptionPublicKey: request.wallet.shieldedEncryptionPublicKey,
          facilityId: request.facilityIdHex,
          requestedMinor: request.requestedMinor,
          borrowerSecret: request.borrowerSecretHex,
          slots: request.slots,
        },
        { onStage },
      );
      provenTransactionHex = result.provenTransactionHex;
    } catch (workerFailureCode) {
      onStage('failed');
      const code = typeof workerFailureCode === 'string' ? (workerFailureCode as PhrimErrorCode) : 'NETWORK_UNAVAILABLE';
      return { outcome: 'rejected', code };
    }

    onStage('awaiting-wallet');
    const { tx: balancedHex } = await request.wallet.api.balanceUnsealedTransaction(provenTransactionHex);

    onStage('submitting');
    await request.wallet.api.submitTransaction(balancedHex);

    onStage('confirmed');
    return { outcome: 'funded', txId: firstTransactionIdentifier(balancedHex) };
  } catch {
    onStage('failed');
    return { outcome: 'rejected', code: 'NETWORK_UNAVAILABLE' };
  } finally {
    worker.terminate();
  }
}
