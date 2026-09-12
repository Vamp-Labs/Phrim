import { DS_CREDENTIAL } from './domain.js';
import { asBytes32, SCHEMA_VERSION, type AttestedAssetCredential, type Bytes32, type UnsignedAttestedAssetCredential } from './types.js';

export const CANONICAL_WORD_LENGTH = 32;
export const CANONICAL_WORD_COUNT = 10;

export type CanonicalWords = readonly [
  Bytes32,
  Bytes32,
  Bytes32,
  Bytes32,
  Bytes32,
  Bytes32,
  Bytes32,
  Bytes32,
  Bytes32,
  Bytes32,
];

function encodeUnsignedIntWord(value: bigint, bitWidth: number, fieldName: string): Bytes32 {
  if (value < 0n) {
    throw new RangeError(`${fieldName} must not be negative, got ${value}`);
  }
  const max = (1n << BigInt(bitWidth)) - 1n;
  if (value > max) {
    throw new RangeError(`${fieldName} exceeds Uint${bitWidth} (max ${max}), got ${value}`);
  }
  const word = new Uint8Array(CANONICAL_WORD_LENGTH);
  let remaining = value;
  for (let i = 0; i < CANONICAL_WORD_LENGTH; i += 1) {
    word[i] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }
  return asBytes32(word, fieldName);
}

export type CredentialPreimageInput = Pick<
  UnsignedAttestedAssetCredential,
  | 'schemaVersion'
  | 'providerId'
  | 'facilityId'
  | 'assetNonce'
  | 'outstandingMinor'
  | 'daysPastDue'
  | 'riskScore'
  | 'maturityEpoch'
  | 'snapshotEpoch'
>;

export function buildCanonicalWords(credential: CredentialPreimageInput): CanonicalWords {
  if (credential.schemaVersion !== SCHEMA_VERSION) {
    throw new RangeError(`schemaVersion must equal ${SCHEMA_VERSION}, got ${credential.schemaVersion}`);
  }
  const words: Bytes32[] = [
    asBytes32(DS_CREDENTIAL.padded, 'DS_CREDENTIAL'),
    encodeUnsignedIntWord(BigInt(credential.schemaVersion), 8, 'schemaVersion'),
    encodeUnsignedIntWord(BigInt(credential.providerId), 32, 'providerId'),
    asBytes32(credential.facilityId, 'facilityId'),
    asBytes32(credential.assetNonce, 'assetNonce'),
    encodeUnsignedIntWord(credential.outstandingMinor, 64, 'outstandingMinor'),
    encodeUnsignedIntWord(BigInt(credential.daysPastDue), 16, 'daysPastDue'),
    encodeUnsignedIntWord(BigInt(credential.riskScore), 16, 'riskScore'),
    encodeUnsignedIntWord(BigInt(credential.maturityEpoch), 32, 'maturityEpoch'),
    encodeUnsignedIntWord(BigInt(credential.snapshotEpoch), 32, 'snapshotEpoch'),
  ];
  if (words.length !== CANONICAL_WORD_COUNT) {
    throw new Error('internal: canonical preimage must contain exactly ten words');
  }
  for (const word of words) {
    if (word.length !== CANONICAL_WORD_LENGTH) {
      throw new Error('internal: every canonical word must be exactly 32 bytes');
    }
  }
  return words as unknown as CanonicalWords;
}

export interface CredentialDigestCircuit {
  credentialDigest(
    schemaVersion: bigint,
    providerId: bigint,
    facilityId: Uint8Array,
    assetNonce: Uint8Array,
    outstandingMinor: bigint,
    daysPastDue: bigint,
    riskScore: bigint,
    maturityEpoch: bigint,
    snapshotEpoch: bigint,
  ): Uint8Array;
}

let boundCredentialDigestCircuit: CredentialDigestCircuit | null = null;

export function bindCredentialDigestCircuit(circuit: CredentialDigestCircuit): void {
  boundCredentialDigestCircuit = circuit;
}

export function unbindCredentialDigestCircuit(): void {
  boundCredentialDigestCircuit = null;
}

export function computeCredentialDigest(credential: CredentialPreimageInput): Bytes32 {
  buildCanonicalWords(credential);
  if (boundCredentialDigestCircuit === null) {
    throw new Error(
      'PENDING_SCHEMA_LOCK: credentialDigest pure circuit is not bound. ' +
        'Call bindCredentialDigestCircuit(pureCircuits) with the compiled contract from packages/contract once Role 01 ships it.',
    );
  }
  const digest = boundCredentialDigestCircuit.credentialDigest(
    BigInt(credential.schemaVersion),
    BigInt(credential.providerId),
    credential.facilityId,
    credential.assetNonce,
    credential.outstandingMinor,
    BigInt(credential.daysPastDue),
    BigInt(credential.riskScore),
    BigInt(credential.maturityEpoch),
    BigInt(credential.snapshotEpoch),
  );
  return asBytes32(digest, 'credentialDigest');
}

export function credentialPreimageInput(credential: AttestedAssetCredential): CredentialPreimageInput {
  return {
    schemaVersion: credential.schemaVersion,
    providerId: credential.providerId,
    facilityId: credential.facilityId,
    assetNonce: credential.assetNonce,
    outstandingMinor: credential.outstandingMinor,
    daysPastDue: credential.daysPastDue,
    riskScore: credential.riskScore,
    maturityEpoch: credential.maturityEpoch,
    snapshotEpoch: credential.snapshotEpoch,
  };
}
