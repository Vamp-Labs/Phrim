import {
  ecMulGenerator,
  jubjubPointX,
  jubjubPointY,
  degradeToTransient,
  type JubjubPoint,
} from '@midnight-ntwrk/compact-runtime';
import { pureCircuits, type AssetCredential } from '../../managed/phrim/contract/index.js';
import { EMPTY_ASSET_CREDENTIAL } from '../../src/index.js';

export type AttestorKeypair = {
  secretKey: bigint;
  publicKey: JubjubPoint;
};

export function makeAttestorKeypair(secretKey: bigint): AttestorKeypair {
  return { secretKey, publicKey: ecMulGenerator(secretKey) };
}

const TWO_248 = 1n << 248n;
const JUBJUB_SCALAR_FIELD_ORDER = 6554484396890773809930967563523245729705921265872317281365359162392183254199n;

export function signCredentialDigest(
  digest: Uint8Array,
  attestor: AttestorKeypair,
  nonceSeed: bigint,
): { announcement: JubjubPoint; response: bigint } {
  const nonce = 9_000_000_007n + nonceSeed;
  const announcement = ecMulGenerator(nonce);
  const msgField = degradeToTransient(digest);
  const challenge = pureCircuits.computeChallenge1(
    jubjubPointX(announcement),
    jubjubPointY(announcement),
    jubjubPointX(attestor.publicKey),
    jubjubPointY(attestor.publicKey),
    [msgField],
  );
  const quotient = challenge / TWO_248;
  if (quotient >= 116n) {
    throw new Error('unlucky nonce produced an out-of-range Schnorr quotient, pick another nonceSeed');
  }
  const remainder = challenge % TWO_248;
  const response = (nonce + remainder * attestor.secretKey) % JUBJUB_SCALAR_FIELD_ORDER;
  return { announcement, response };
}

export type UnsignedCredentialFields = {
  schemaVersion: bigint;
  providerId: bigint;
  facilityId: Uint8Array;
  assetNonce: Uint8Array;
  outstandingMinor: bigint;
  daysPastDue: bigint;
  riskScore: bigint;
  maturityEpoch: bigint;
  snapshotEpoch: bigint;
};

export function signCredential(
  fields: UnsignedCredentialFields,
  attestor: AttestorKeypair,
  nonceSeed: bigint,
): AssetCredential {
  const digest = pureCircuits.credentialDigest(
    fields.schemaVersion,
    fields.providerId,
    fields.facilityId,
    fields.assetNonce,
    fields.outstandingMinor,
    fields.daysPastDue,
    fields.riskScore,
    fields.maturityEpoch,
    fields.snapshotEpoch,
  );
  const signature = signCredentialDigest(digest, attestor, nonceSeed);
  return {
    slotOccupied: true,
    schemaVersion: fields.schemaVersion,
    providerId: fields.providerId,
    facilityId: fields.facilityId,
    assetNonce: fields.assetNonce,
    outstandingMinor: fields.outstandingMinor,
    daysPastDue: fields.daysPastDue,
    riskScore: fields.riskScore,
    maturityEpoch: fields.maturityEpoch,
    snapshotEpoch: fields.snapshotEpoch,
    signatureAnnouncement: signature.announcement,
    signatureResponse: signature.response,
  };
}

export function tamperCredential(
  credential: AssetCredential,
  patch: Partial<AssetCredential>,
): AssetCredential {
  return { ...credential, ...patch };
}

export function emptySlot(): AssetCredential {
  return { ...EMPTY_ASSET_CREDENTIAL };
}
