import { createUnprovenCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import {
  createPhrimCompiledContract,
  buildCredentialSlots,
  PHRIM_PRIVATE_STATE_ID,
  type AssetCredential,
} from '@phrim/contract';
import { resolveNetworkEndpoints } from '../midnight/network';
import { buildPhrimProvingProviders } from '../midnight/providers';
import { ZK_CONFIG_PATH } from '../midnight/zkConfig';
import { hexToBytes, bytesToHex } from '../midnight/hex';
import type { ProveRequestMessage, WitnessCredentialSlot } from './protocol';

export interface ProvenArtifact {
  provenTransactionHex: string;
}

function toAssetCredential(slot: WitnessCredentialSlot): AssetCredential | null {
  if (!slot.slotOccupied) {
    return null;
  }
  return {
    slotOccupied: true,
    schemaVersion: BigInt(slot.schemaVersion),
    providerId: BigInt(slot.providerId),
    facilityId: hexToBytes(slot.facilityId),
    assetNonce: hexToBytes(slot.assetNonce),
    outstandingMinor: BigInt(slot.outstandingMinor),
    daysPastDue: BigInt(slot.daysPastDue),
    riskScore: BigInt(slot.riskScore),
    maturityEpoch: BigInt(slot.maturityEpoch),
    snapshotEpoch: BigInt(slot.snapshotEpoch),
    signatureAnnouncement: { x: BigInt(slot.signatureR8x), y: BigInt(slot.signatureR8y) },
    signatureResponse: BigInt(slot.signatureS),
  };
}

export async function synthesizeDrawProof(request: ProveRequestMessage): Promise<ProvenArtifact> {
  const endpoints = resolveNetworkEndpoints(request.networkId);
  const providers = buildPhrimProvingProviders(endpoints, request.originUrl, request.accountId, {
    coinPublicKey: request.coinPublicKey,
    encryptionPublicKey: request.encryptionPublicKey,
  });
  const compiledContract = createPhrimCompiledContract(ZK_CONFIG_PATH);
  const occupiedCredentials = request.slots
    .map(toAssetCredential)
    .filter((credential): credential is AssetCredential => credential !== null);
  const credentialSlots = buildCredentialSlots(occupiedCredentials);

  const callTxData = await createUnprovenCallTx(providers, {
    compiledContract,
    circuitId: 'requestDraw',
    contractAddress: request.contractAddress,
    privateStateId: PHRIM_PRIVATE_STATE_ID,
    args: [hexToBytes(request.facilityId), BigInt(request.requestedMinor), credentialSlots, hexToBytes(request.borrowerSecret)],
  });

  const provenTx = await providers.proofProvider.proveTx(callTxData.private.unprovenTx);
  return { provenTransactionHex: bytesToHex(provenTx.serialize()) };
}
