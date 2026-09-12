import type { PhrimErrorCode } from '../../viewmodels/errors';
import type { PhrimNetworkId } from '@phrim/contract';

export interface WitnessCredentialSlot {
  slotOccupied: boolean;
  schemaVersion: number;
  providerId: number;
  facilityId: string;
  assetNonce: string;
  outstandingMinor: string;
  daysPastDue: number;
  riskScore: number;
  maturityEpoch: number;
  snapshotEpoch: number;
  signatureR8x: string;
  signatureR8y: string;
  signatureS: string;
}

export interface ProveRequestMessage {
  type: 'prove';
  requestId: string;
  networkId: PhrimNetworkId;
  originUrl: string;
  contractAddress: string;
  accountId: string;
  coinPublicKey: string;
  encryptionPublicKey: string;
  facilityId: string;
  requestedMinor: string;
  borrowerSecret: string;
  slots: WitnessCredentialSlot[];
}

export type WorkerInboundMessage = ProveRequestMessage;

export type ProvingStage = 'preparing' | 'proving';

export interface ProvingProgressMessage {
  type: 'progress';
  requestId: string;
  stage: ProvingStage;
}

export interface ProvingSuccessMessage {
  type: 'success';
  requestId: string;
  provenTransactionHex: string;
  durationMs: number;
}

export interface ProvingFailureMessage {
  type: 'failure';
  requestId: string;
  code: PhrimErrorCode | null;
  durationMs: number;
}

export type WorkerOutboundMessage = ProvingProgressMessage | ProvingSuccessMessage | ProvingFailureMessage;

export const EXPECTED_SLOT_COUNT = 8;
