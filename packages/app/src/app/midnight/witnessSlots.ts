import type { AttestedAssetCredentialJson } from 'schema';
import type { WitnessCredentialSlot } from '../worker/protocol';

const EMPTY_HEX32 = `0x${'0'.repeat(64)}`;

const EMPTY_WITNESS_SLOT: WitnessCredentialSlot = {
  slotOccupied: false,
  schemaVersion: 1,
  providerId: 0,
  facilityId: EMPTY_HEX32,
  assetNonce: EMPTY_HEX32,
  outstandingMinor: '0',
  daysPastDue: 0,
  riskScore: 0,
  maturityEpoch: 0,
  snapshotEpoch: 0,
  signatureR8x: '0',
  signatureR8y: '0',
  signatureS: '0',
};

function toWitnessSlot(credential: AttestedAssetCredentialJson): WitnessCredentialSlot {
  return {
    slotOccupied: true,
    schemaVersion: credential.schemaVersion,
    providerId: credential.providerId,
    facilityId: credential.facilityId,
    assetNonce: credential.assetNonce,
    outstandingMinor: credential.outstandingMinor,
    daysPastDue: credential.daysPastDue,
    riskScore: credential.riskScore,
    maturityEpoch: credential.maturityEpoch,
    snapshotEpoch: credential.snapshotEpoch,
    signatureR8x: credential.signatureR8x,
    signatureR8y: credential.signatureR8y,
    signatureS: credential.signatureS,
  };
}

export function buildWitnessCredentialSlots(
  credentials: readonly AttestedAssetCredentialJson[],
): WitnessCredentialSlot[] {
  if (credentials.length > 8) {
    throw new RangeError('at most 8 credential slots are supported');
  }
  const slots: WitnessCredentialSlot[] = credentials.map(toWitnessSlot);
  while (slots.length < 8) {
    slots.push({ ...EMPTY_WITNESS_SLOT });
  }
  return slots;
}
