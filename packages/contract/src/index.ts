export * from '../managed/phrim/contract/index.js';
export {
  Contract as PhrimContract,
  pureCircuits as phrimPureCircuits,
  ledger as phrimLedger,
} from '../managed/phrim/contract/index.js';
export type { PhrimPrivateState } from './witnesses.js';
export { phrimWitnesses, createPhrimPrivateState } from './witnesses.js';

import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { Contract, type AssetCredential } from '../managed/phrim/contract/index.js';
import { phrimWitnesses, createPhrimPrivateState, type PhrimPrivateState } from './witnesses.js';

export const PHRIM_PRIVATE_STATE_ID = 'phrimPrivateState';

export const PHRIM_NETWORK_IDS = {
  local: 'undeployed',
  preprod: 'preprod',
} as const;

export type PhrimNetworkId = (typeof PHRIM_NETWORK_IDS)[keyof typeof PHRIM_NETWORK_IDS];

export const PHRIM_TOKEN_DOMAIN_SEPARATOR_LABEL = 'phrim:musd:v1';

export type PhrimContractInstance = Contract<PhrimPrivateState>;

export function createPhrimContract(): PhrimContractInstance {
  return new Contract<PhrimPrivateState>(phrimWitnesses);
}

export function createPhrimCompiledContract(compiledAssetsPath: string) {
  return CompiledContract.make<PhrimContractInstance, PhrimPrivateState>('phrim', Contract).pipe(
    CompiledContract.withWitnesses(phrimWitnesses),
    CompiledContract.withCompiledFileAssets(compiledAssetsPath),
  );
}

export function createPhrimInitialPrivateState(): PhrimPrivateState {
  return createPhrimPrivateState();
}

export const EMPTY_ASSET_CREDENTIAL: AssetCredential = {
  slotOccupied: false,
  schemaVersion: 0n,
  providerId: 0n,
  facilityId: new Uint8Array(32),
  assetNonce: new Uint8Array(32),
  outstandingMinor: 0n,
  daysPastDue: 0n,
  riskScore: 0n,
  maturityEpoch: 0n,
  snapshotEpoch: 0n,
  signatureAnnouncement: { x: 0n, y: 0n },
  signatureResponse: 0n,
};

export function buildCredentialSlots(occupied: readonly AssetCredential[]): [
  AssetCredential, AssetCredential, AssetCredential, AssetCredential,
  AssetCredential, AssetCredential, AssetCredential, AssetCredential,
] {
  if (occupied.length > 8) {
    throw new RangeError('at most 8 credential slots are supported');
  }
  const slots: AssetCredential[] = [];
  for (let i = 0; i < 8; i += 1) {
    const candidate = occupied[i];
    slots.push(candidate === undefined ? EMPTY_ASSET_CREDENTIAL : candidate);
  }
  return slots as [
    AssetCredential, AssetCredential, AssetCredential, AssetCredential,
    AssetCredential, AssetCredential, AssetCredential, AssetCredential,
  ];
}

export const PHRIM_ERROR_CODES = [
  'INVALID_SIGNATURE',
  'WRONG_FACILITY',
  'STALE_EPOCH',
  'ASSET_INELIGIBLE',
  'INSUFFICIENT_COLLATERAL',
  'ASSET_ALREADY_USED',
  'CREDIT_LIMIT_EXCEEDED',
  'VAULT_INSUFFICIENT',
  'FACILITY_INACTIVE',
  'UNAUTHORIZED',
] as const;

export type PhrimCircuitErrorCode = (typeof PHRIM_ERROR_CODES)[number];

const VENDORED_SCHNORR_INVALID_SIGNATURE_MESSAGE = 'Invalid attestation signature';

export function extractPhrimErrorCode(error: unknown): PhrimCircuitErrorCode | undefined {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes(VENDORED_SCHNORR_INVALID_SIGNATURE_MESSAGE)) {
    return 'INVALID_SIGNATURE';
  }
  for (const code of PHRIM_ERROR_CODES) {
    if (message.includes(code)) {
      return code;
    }
  }
  return undefined;
}
