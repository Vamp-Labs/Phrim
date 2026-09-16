import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import type { PhrimNetworkId } from '@phrim/contract';
import type { DrawResultVM } from '../../viewmodels/types';
import { buildPhrimError } from '../../viewmodels/errors';
import { getConfiguredContractAddress } from '../midnight/contractAddress';
import { readPhrimLedgerState } from '../midnight/contractClient';
import { getUnshieldedMUsdBalanceMinor, type ConnectedWallet } from '../midnight/walletConnector';
import { resolveNetworkEndpoints } from '../midnight/network';
import { runDrawFlow, type DrawFlowResult } from './drawFlow';
import type { WitnessCredentialSlot } from '../worker/protocol';
import type { ProofStage } from '../../viewmodels/types';

export interface SettleDrawRequest {
  networkId: PhrimNetworkId;
  wallet: ConnectedWallet;
  facilityIdHex: string;
  requestedMinor: string;
  borrowerSecretHex: string;
  slots: WitnessCredentialSlot[];
  nullifiersConsumed: number;
}

function toDrawResultVmFromFailure(
  contractAddress: string,
  result: Extract<DrawFlowResult, { outcome: 'rejected' }>,
  outstandingMinor: string,
): DrawResultVM {
  return {
    outcome: 'rejected',
    amountMinor: '0',
    priorOutstandingMinor: outstandingMinor,
    newOutstandingMinor: outstandingMinor,
    availableCreditMinor: '0',
    walletBalanceMinor: '0',
    nullifiersConsumed: 0,
    contractAddress,
    txId: '',
    error: buildPhrimError(result.code),
  };
}

export async function settleDraw(
  request: SettleDrawRequest,
  onStage: (stage: ProofStage) => void,
): Promise<DrawResultVM> {
  const contractAddress = getConfiguredContractAddress(request.networkId);
  const endpoints = resolveNetworkEndpoints(request.networkId);
  const publicDataProvider = indexerPublicDataProvider(endpoints.indexerUrl, endpoints.indexerWsUrl);

  if (contractAddress === null) {
    return toDrawResultVmFromFailure('', { outcome: 'rejected', code: 'NETWORK_UNAVAILABLE' }, '0');
  }

  const priorLedger = await readPhrimLedgerState(publicDataProvider, contractAddress);
  const priorOutstandingMinor = (priorLedger?.outstanding ?? 0n).toString(10);
  const creditLimitMinor = priorLedger?.creditLimit ?? 0n;

  const originUrl = window.location.origin;
  const flowResult = await runDrawFlow(
    {
      networkId: request.networkId,
      originUrl,
      wallet: request.wallet,
      facilityIdHex: request.facilityIdHex,
      requestedMinor: request.requestedMinor,
      borrowerSecretHex: request.borrowerSecretHex,
      slots: request.slots,
    },
    onStage,
  );

  if (flowResult.outcome === 'rejected') {
    const postLedger = await readPhrimLedgerState(publicDataProvider, contractAddress);
    return toDrawResultVmFromFailure(
      contractAddress,
      flowResult,
      (postLedger?.outstanding ?? priorLedger?.outstanding ?? 0n).toString(10),
    );
  }

  const postLedger = await readPhrimLedgerState(publicDataProvider, contractAddress);
  const newOutstandingMinor = (postLedger?.outstanding ?? 0n).toString(10);
  const availableCreditMinor = (creditLimitMinor - (postLedger?.outstanding ?? 0n)).toString(10);
  const tokenColorHex =
    postLedger !== null
      ? Array.from(postLedger.tokenColor, (byte) => byte.toString(16).padStart(2, '0')).join('')
      : '';
  const walletBalanceMinor =
    tokenColorHex.length > 0
      ? await getUnshieldedMUsdBalanceMinor(request.wallet, tokenColorHex)
      : '0';

  return {
    outcome: 'funded',
    amountMinor: request.requestedMinor,
    priorOutstandingMinor,
    newOutstandingMinor,
    availableCreditMinor,
    walletBalanceMinor,
    nullifiersConsumed: request.nullifiersConsumed,
    contractAddress,
    txId: flowResult.txId,
    error: null,
  };
}

export type { ProofStage };
