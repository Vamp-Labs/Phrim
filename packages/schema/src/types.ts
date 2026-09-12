import { bytesToHex, hexToBytes } from './bytes.js';

declare const bytes32Brand: unique symbol;

export type Bytes32 = Uint8Array & { readonly [bytes32Brand]: true };

export function asBytes32(bytes: Uint8Array, fieldName = 'value'): Bytes32 {
  if (bytes.length !== 32) {
    throw new RangeError(`${fieldName} must be exactly 32 bytes, got ${bytes.length}`);
  }
  return bytes as Bytes32;
}

export function bytes32FromHex(hex: string, fieldName = 'value'): Bytes32 {
  return asBytes32(hexToBytes(hex), fieldName);
}

export const SCHEMA_VERSION = 1;

export const CREDENTIAL_SLOT_COUNT = 8;

export const SCENARIO_IDS = ['eligible', 'undercollateralized', 'stale', 'tampered', 'replay'] as const;

export type ScenarioId = (typeof SCENARIO_IDS)[number];

export function isScenarioId(value: string): value is ScenarioId {
  return (SCENARIO_IDS as readonly string[]).includes(value);
}

export interface AttestedAssetCredential {
  readonly schemaVersion: number;
  readonly providerId: number;
  readonly facilityId: Bytes32;
  readonly assetNonce: Bytes32;
  readonly outstandingMinor: bigint;
  readonly daysPastDue: number;
  readonly riskScore: number;
  readonly maturityEpoch: number;
  readonly snapshotEpoch: number;
  readonly signatureR8x: bigint;
  readonly signatureR8y: bigint;
  readonly signatureS: bigint;
}

export type UnsignedAttestedAssetCredential = Omit<
  AttestedAssetCredential,
  'signatureR8x' | 'signatureR8y' | 'signatureS'
>;

export interface CredentialSlotEmpty {
  readonly slotOccupied: false;
  readonly credential: null;
}

export interface CredentialSlotOccupied {
  readonly slotOccupied: true;
  readonly credential: AttestedAssetCredential;
}

export type CredentialSlot = CredentialSlotEmpty | CredentialSlotOccupied;

export type CredentialBatch = readonly [
  CredentialSlot,
  CredentialSlot,
  CredentialSlot,
  CredentialSlot,
  CredentialSlot,
  CredentialSlot,
  CredentialSlot,
  CredentialSlot,
];

export function emptySlot(): CredentialSlotEmpty {
  return { slotOccupied: false, credential: null };
}

export function occupiedSlot(credential: AttestedAssetCredential): CredentialSlotOccupied {
  return { slotOccupied: true, credential };
}

export function buildCredentialBatch(occupied: readonly AttestedAssetCredential[]): CredentialBatch {
  if (occupied.length > CREDENTIAL_SLOT_COUNT) {
    throw new RangeError(`a credential batch supports at most ${CREDENTIAL_SLOT_COUNT} occupied slots`);
  }
  const slots: CredentialSlot[] = occupied.map((credential) => occupiedSlot(credential));
  while (slots.length < CREDENTIAL_SLOT_COUNT) {
    slots.push(emptySlot());
  }
  return slots as unknown as CredentialBatch;
}

export interface UnsignedCredentialSlotEmpty {
  readonly slotOccupied: false;
  readonly credential: null;
}

export interface UnsignedCredentialSlotOccupied {
  readonly slotOccupied: true;
  readonly credential: UnsignedAttestedAssetCredential;
}

export type UnsignedCredentialSlot = UnsignedCredentialSlotEmpty | UnsignedCredentialSlotOccupied;

export type UnsignedCredentialBatch = readonly [
  UnsignedCredentialSlot,
  UnsignedCredentialSlot,
  UnsignedCredentialSlot,
  UnsignedCredentialSlot,
  UnsignedCredentialSlot,
  UnsignedCredentialSlot,
  UnsignedCredentialSlot,
  UnsignedCredentialSlot,
];

export function buildUnsignedCredentialBatch(
  occupied: readonly UnsignedAttestedAssetCredential[],
): UnsignedCredentialBatch {
  if (occupied.length > CREDENTIAL_SLOT_COUNT) {
    throw new RangeError(`a credential batch supports at most ${CREDENTIAL_SLOT_COUNT} occupied slots`);
  }
  const slots: UnsignedCredentialSlot[] = occupied.map(
    (credential): UnsignedCredentialSlotOccupied => ({ slotOccupied: true, credential }),
  );
  while (slots.length < CREDENTIAL_SLOT_COUNT) {
    slots.push({ slotOccupied: false, credential: null });
  }
  return slots as unknown as UnsignedCredentialBatch;
}

export type FacilityStatus = 'Active' | 'Frozen' | 'Closed';

export interface FacilityState {
  readonly facilityId: Bytes32;
  readonly lenderAuthorityHash: Bytes32;
  readonly borrowerAuthorityHash: Bytes32;
  readonly attestorProviderId: number;
  readonly attestorPublicKeyX: bigint;
  readonly attestorPublicKeyY: bigint;
  readonly tokenColor: Bytes32;
  readonly creditLimit: bigint;
  readonly outstanding: bigint;
  readonly advanceRateBps: number;
  readonly maxDaysPastDue: number;
  readonly minRiskScore: number;
  readonly minRemainingEpochs: number;
  readonly currentEpoch: number;
  readonly status: FacilityStatus;
}

export interface DrawReceipt {
  readonly drawId: Bytes32;
  readonly facilityId: Bytes32;
  readonly epoch: number;
  readonly amount: bigint;
  readonly resultingOutstanding: bigint;
  readonly completed: boolean;
}

export interface AttestedAssetCredentialJson {
  readonly schemaVersion: number;
  readonly providerId: number;
  readonly facilityId: string;
  readonly assetNonce: string;
  readonly outstandingMinor: string;
  readonly daysPastDue: number;
  readonly riskScore: number;
  readonly maturityEpoch: number;
  readonly snapshotEpoch: number;
  readonly signatureR8x: string;
  readonly signatureR8y: string;
  readonly signatureS: string;
}

export function credentialToJson(credential: AttestedAssetCredential): AttestedAssetCredentialJson {
  return {
    schemaVersion: credential.schemaVersion,
    providerId: credential.providerId,
    facilityId: `0x${bytesToHex(credential.facilityId)}`,
    assetNonce: `0x${bytesToHex(credential.assetNonce)}`,
    outstandingMinor: credential.outstandingMinor.toString(10),
    daysPastDue: credential.daysPastDue,
    riskScore: credential.riskScore,
    maturityEpoch: credential.maturityEpoch,
    snapshotEpoch: credential.snapshotEpoch,
    signatureR8x: credential.signatureR8x.toString(10),
    signatureR8y: credential.signatureR8y.toString(10),
    signatureS: credential.signatureS.toString(10),
  };
}

export function credentialFromJson(json: AttestedAssetCredentialJson): AttestedAssetCredential {
  return {
    schemaVersion: json.schemaVersion,
    providerId: json.providerId,
    facilityId: bytes32FromHex(json.facilityId, 'facilityId'),
    assetNonce: bytes32FromHex(json.assetNonce, 'assetNonce'),
    outstandingMinor: BigInt(json.outstandingMinor),
    daysPastDue: json.daysPastDue,
    riskScore: json.riskScore,
    maturityEpoch: json.maturityEpoch,
    snapshotEpoch: json.snapshotEpoch,
    signatureR8x: BigInt(json.signatureR8x),
    signatureR8y: BigInt(json.signatureR8y),
    signatureS: BigInt(json.signatureS),
  };
}

export interface UnsignedAttestedAssetCredentialJson {
  readonly schemaVersion: number;
  readonly providerId: number;
  readonly facilityId: string;
  readonly assetNonce: string;
  readonly outstandingMinor: string;
  readonly daysPastDue: number;
  readonly riskScore: number;
  readonly maturityEpoch: number;
  readonly snapshotEpoch: number;
}

export function unsignedCredentialToJson(
  credential: UnsignedAttestedAssetCredential,
): UnsignedAttestedAssetCredentialJson {
  return {
    schemaVersion: credential.schemaVersion,
    providerId: credential.providerId,
    facilityId: `0x${bytesToHex(credential.facilityId)}`,
    assetNonce: `0x${bytesToHex(credential.assetNonce)}`,
    outstandingMinor: credential.outstandingMinor.toString(10),
    daysPastDue: credential.daysPastDue,
    riskScore: credential.riskScore,
    maturityEpoch: credential.maturityEpoch,
    snapshotEpoch: credential.snapshotEpoch,
  };
}

export function unsignedCredentialFromJson(
  json: UnsignedAttestedAssetCredentialJson,
): UnsignedAttestedAssetCredential {
  return {
    schemaVersion: json.schemaVersion,
    providerId: json.providerId,
    facilityId: bytes32FromHex(json.facilityId, 'facilityId'),
    assetNonce: bytes32FromHex(json.assetNonce, 'assetNonce'),
    outstandingMinor: BigInt(json.outstandingMinor),
    daysPastDue: json.daysPastDue,
    riskScore: json.riskScore,
    maturityEpoch: json.maturityEpoch,
    snapshotEpoch: json.snapshotEpoch,
  };
}
