import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { pureCircuits, type AssetCredential } from '../managed/phrim/contract/index.js';
import { PhrimSimulator, type EightSlots } from './support/simulator.js';
import { emptySlot } from './support/sign.js';
import {
  DEMO_CREDIT_LIMIT,
  DEMO_ADVANCE_RATE_BPS,
  DEMO_MAX_DAYS_PAST_DUE,
  DEMO_MIN_RISK_SCORE,
  DEMO_MIN_REMAINING_EPOCHS,
  DEMO_CURRENT_EPOCH,
  DEMO_VAULT_FUNDING,
  DEMO_DRAW_AMOUNT,
  userAddress,
  borrowerAuthorityHashFor,
  DEMO_BORROWER_SECRET,
  DEMO_LENDER_SECRET,
} from './support/fixtures.js';

const VECTORS_DIR = fileURLToPath(new URL('../../schema/test/vectors', import.meta.url));

type VectorCredentialInput = {
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
};

type VectorCredential = {
  input: VectorCredentialInput;
  credentialDigestHex: string;
  nullifierHex: string;
  signatureExpectedValid: boolean;
};

type ScenarioVector = {
  scenarioId: string;
  expectedOutcome: 'funded' | 'rejected';
  expectedErrorCode: string | null;
  facilityIdHex: string;
  attestorPublicKeyX: string;
  attestorPublicKeyY: string;
  credentials: VectorCredential[];
};

function readVector<T>(fileName: string): T {
  return JSON.parse(readFileSync(`${VECTORS_DIR}/${fileName}`, 'utf8')) as T;
}

function hexToBytes32(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i += 1) {
    bytes[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function credentialFromVector(entry: VectorCredential): AssetCredential {
  const input = entry.input;
  return {
    slotOccupied: true,
    schemaVersion: BigInt(input.schemaVersion),
    providerId: BigInt(input.providerId),
    facilityId: hexToBytes32(input.facilityId),
    assetNonce: hexToBytes32(input.assetNonce),
    outstandingMinor: BigInt(input.outstandingMinor),
    daysPastDue: BigInt(input.daysPastDue),
    riskScore: BigInt(input.riskScore),
    maturityEpoch: BigInt(input.maturityEpoch),
    snapshotEpoch: BigInt(input.snapshotEpoch),
    signatureAnnouncement: { x: BigInt(input.signatureR8x), y: BigInt(input.signatureR8y) },
    signatureResponse: BigInt(input.signatureS),
  };
}

function padToEightSlots(occupied: AssetCredential[]): EightSlots {
  const slots: AssetCredential[] = [...occupied];
  while (slots.length < 8) {
    slots.push(emptySlot());
  }
  return slots as EightSlots;
}

function setUpVectorFacility(vector: ScenarioVector): { sim: PhrimSimulator; facilityId: Uint8Array } {
  const sim = new PhrimSimulator();
  const facilityId = hexToBytes32(vector.facilityIdHex);
  sim.createFacility({
    facilityId,
    lenderSecret: DEMO_LENDER_SECRET,
    borrowerAuthorityHash: borrowerAuthorityHashFor(DEMO_BORROWER_SECRET),
    borrowerAddress: userAddress(1),
    attestorProviderId: BigInt(vector.credentials[0]?.input.providerId ?? 1),
    attestorPublicKeyX: BigInt(vector.attestorPublicKeyX),
    attestorPublicKeyY: BigInt(vector.attestorPublicKeyY),
    creditLimit: DEMO_CREDIT_LIMIT,
    advanceRateBps: DEMO_ADVANCE_RATE_BPS,
    maxDaysPastDue: DEMO_MAX_DAYS_PAST_DUE,
    minRiskScore: DEMO_MIN_RISK_SCORE,
    minRemainingEpochs: DEMO_MIN_REMAINING_EPOCHS,
    currentEpoch: DEMO_CURRENT_EPOCH,
  });
  sim.fundOrMintDemoToken(DEMO_LENDER_SECRET, DEMO_VAULT_FUNDING);
  return { sim, facilityId };
}

function expectThrowsContaining(fn: () => void, needle: string): void {
  let threw = false;
  try {
    fn();
  } catch (error) {
    threw = true;
    expect(String((error as Error).message)).toContain(needle);
  }
  expect(threw).toBe(true);
}

const ATTESTOR = readVector<{ publicKeyX: string; publicKeyY: string }>('attestor.json');
const SCENARIO_FILES = ['eligible', 'tampered', 'stale', 'undercollateralized', 'replay'] as const;

describe('Golden vectors — Schema Lock cross-check against packages/schema/test/vectors', () => {
  it.each(SCENARIO_FILES)('every credentialDigest and nullifier recorded in %s.json reproduces byte-identically in-circuit', (scenarioId) => {
    const vector = readVector<ScenarioVector>(`${scenarioId}.json`);
    for (const entry of vector.credentials) {
      const input = entry.input;
      const digest = pureCircuits.credentialDigest(
        BigInt(input.schemaVersion),
        BigInt(input.providerId),
        hexToBytes32(input.facilityId),
        hexToBytes32(input.assetNonce),
        BigInt(input.outstandingMinor),
        BigInt(input.daysPastDue),
        BigInt(input.riskScore),
        BigInt(input.maturityEpoch),
        BigInt(input.snapshotEpoch),
      );
      expect(Buffer.from(digest).toString('hex')).toBe(entry.credentialDigestHex);

      const nullifier = pureCircuits.assetNullifier(hexToBytes32(input.facilityId), hexToBytes32(input.assetNonce));
      expect(Buffer.from(nullifier).toString('hex')).toBe(entry.nullifierHex);
    }
  });

  it('attestor.json\'s recorded public key matches every scenario file\'s attestorPublicKey', () => {
    for (const scenarioId of SCENARIO_FILES) {
      const vector = readVector<ScenarioVector>(`${scenarioId}.json`);
      expect(vector.attestorPublicKeyX).toBe(ATTESTOR.publicKeyX);
      expect(vector.attestorPublicKeyY).toBe(ATTESTOR.publicKeyY);
    }
  });

  it('eligible.json\'s recorded signatures pass every eligibility rule in a real requestDraw call', () => {
    const vector = readVector<ScenarioVector>('eligible.json');
    expect(vector.expectedOutcome).toBe('funded');
    const { sim, facilityId } = setUpVectorFacility(vector);
    const credentials = padToEightSlots(vector.credentials.map(credentialFromVector));
    const before = sim.snapshot();
    expectThrowsContaining(
      () => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, credentials, DEMO_BORROWER_SECRET),
      'VAULT_INSUFFICIENT',
    );
    const after = sim.snapshot();
    expect(after.outstanding).toBe(before.outstanding);
    expect(after.receiptCount).toBe(before.receiptCount);
    expect(after.nullifierCount).toBe(before.nullifierCount);
  });

  it('tampered.json\'s mutated slot 0 fails signature verification exactly as recorded', () => {
    const vector = readVector<ScenarioVector>('tampered.json');
    expect(vector.expectedOutcome).toBe('rejected');
    expect(vector.expectedErrorCode).toBe('INVALID_SIGNATURE');
    expect(vector.credentials[0]?.signatureExpectedValid).toBe(false);
    const { sim, facilityId } = setUpVectorFacility(vector);
    const credentials = padToEightSlots(vector.credentials.map(credentialFromVector));
    const before = sim.snapshot();
    expectThrowsContaining(
      () => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, credentials, DEMO_BORROWER_SECRET),
      'Invalid attestation signature',
    );
    const after = sim.snapshot();
    expect(after.outstanding).toBe(before.outstanding);
    expect(after.nullifierCount).toBe(before.nullifierCount);
  });

  it('stale.json\'s epoch-behind batch fails with STALE_EPOCH exactly as recorded', () => {
    const vector = readVector<ScenarioVector>('stale.json');
    expect(vector.expectedOutcome).toBe('rejected');
    expect(vector.expectedErrorCode).toBe('STALE_EPOCH');
    const { sim, facilityId } = setUpVectorFacility(vector);
    const credentials = padToEightSlots(vector.credentials.map(credentialFromVector));
    const before = sim.snapshot();
    expectThrowsContaining(
      () => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, credentials, DEMO_BORROWER_SECRET),
      'STALE_EPOCH',
    );
    const after = sim.snapshot();
    expect(after.outstanding).toBe(before.outstanding);
    expect(after.nullifierCount).toBe(before.nullifierCount);
  });

  it('undercollateralized.json\'s six-slot batch fails with INSUFFICIENT_COLLATERAL exactly as recorded', () => {
    const vector = readVector<ScenarioVector>('undercollateralized.json');
    expect(vector.expectedOutcome).toBe('rejected');
    expect(vector.expectedErrorCode).toBe('INSUFFICIENT_COLLATERAL');
    expect(vector.credentials.length).toBe(6);
    const { sim, facilityId } = setUpVectorFacility(vector);
    const credentials = padToEightSlots(vector.credentials.map(credentialFromVector));
    const before = sim.snapshot();
    expectThrowsContaining(
      () => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, credentials, DEMO_BORROWER_SECRET),
      'INSUFFICIENT_COLLATERAL',
    );
    const after = sim.snapshot();
    expect(after.outstanding).toBe(before.outstanding);
    expect(after.nullifierCount).toBe(before.nullifierCount);
  });

  it('replay.json is byte-identical to eligible.json and its nullifiers therefore collide with an already-funded draw (mechanism proof; full cross-transaction replay needs a live ledger, see README)', () => {
    const eligible = readVector<ScenarioVector>('eligible.json');
    const replay = readVector<ScenarioVector>('replay.json');
    expect(replay.expectedOutcome).toBe('rejected');
    expect(replay.expectedErrorCode).toBe('ASSET_ALREADY_USED');
    expect(replay.credentials.map((c) => c.nullifierHex)).toEqual(eligible.credentials.map((c) => c.nullifierHex));

    const { sim, facilityId } = setUpVectorFacility(replay);
    const batch = padToEightSlots(replay.credentials.map(credentialFromVector));
    const duplicatedWithinOneRequest = [batch[0]!, batch[0]!, ...batch.slice(2)] as EightSlots;
    expectThrowsContaining(
      () => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, duplicatedWithinOneRequest, DEMO_BORROWER_SECRET),
      'ASSET_ALREADY_USED',
    );
  });
});
