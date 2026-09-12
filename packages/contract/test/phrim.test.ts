import { describe, expect, it } from 'vitest';
import { pureCircuits } from '../managed/phrim/contract/index.js';
import { PhrimSimulator, type EightSlots } from './support/simulator.js';
import { signCredential, tamperCredential, emptySlot, type UnsignedCredentialFields } from './support/sign.js';
import {
  DEMO_ATTESTOR,
  WRONG_ATTESTOR,
  DEMO_PROVIDER_ID,
  DEMO_CREDIT_LIMIT,
  DEMO_ADVANCE_RATE_BPS,
  DEMO_MAX_DAYS_PAST_DUE,
  DEMO_MIN_RISK_SCORE,
  DEMO_MIN_REMAINING_EPOCHS,
  DEMO_CURRENT_EPOCH,
  DEMO_VAULT_FUNDING,
  DEMO_DRAW_AMOUNT,
  DEMO_SCHEMA_VERSION,
  facilityIdBytes,
  assetNonceBytes,
  userAddress,
  borrowerAuthorityHashFor,
  DEMO_BORROWER_SECRET,
  DEMO_LENDER_SECRET,
  WRONG_SECRET,
} from './support/fixtures.js';

function baseCredentialFields(index: number, facilityId: Uint8Array, overrides: Partial<UnsignedCredentialFields> = {}): UnsignedCredentialFields {
  return {
    schemaVersion: DEMO_SCHEMA_VERSION,
    providerId: DEMO_PROVIDER_ID,
    facilityId,
    assetNonce: assetNonceBytes(index),
    outstandingMinor: 1_250_000n,
    daysPastDue: 5n,
    riskScore: 720n,
    maturityEpoch: DEMO_CURRENT_EPOCH + DEMO_MIN_REMAINING_EPOCHS + 5n,
    snapshotEpoch: DEMO_CURRENT_EPOCH,
    ...overrides,
  };
}

function eligibleBatch(facilityId: Uint8Array): EightSlots {
  const slots = Array.from({ length: 8 }, (_, i) =>
    signCredential(baseCredentialFields(i, facilityId), DEMO_ATTESTOR, BigInt(i + 1)),
  );
  return slots as EightSlots;
}

function undercollateralizedBatch(facilityId: Uint8Array): EightSlots {
  const amounts = [1_500_000n, 1_500_000n, 1_500_000n, 1_500_000n, 1_500_000n, 1_000_000n];
  const occupied = amounts.map((amount, i) =>
    signCredential(baseCredentialFields(100 + i, facilityId, { outstandingMinor: amount }), DEMO_ATTESTOR, BigInt(200 + i)),
  );
  const slots = [...occupied, emptySlot(), emptySlot()];
  return slots as EightSlots;
}

type Setup = {
  sim: PhrimSimulator;
  facilityId: Uint8Array;
};

function setupFundedFacility(overrides: Partial<Parameters<PhrimSimulator['createFacility']>[0]> = {}): Setup {
  const sim = new PhrimSimulator();
  const facilityId = facilityIdBytes();
  sim.createFacility({
    facilityId,
    lenderSecret: DEMO_LENDER_SECRET,
    borrowerAuthorityHash: borrowerAuthorityHashFor(DEMO_BORROWER_SECRET),
    borrowerAddress: userAddress(1),
    attestorProviderId: DEMO_PROVIDER_ID,
    attestorPublicKeyX: DEMO_ATTESTOR.publicKey.x,
    attestorPublicKeyY: DEMO_ATTESTOR.publicKey.y,
    creditLimit: DEMO_CREDIT_LIMIT,
    advanceRateBps: DEMO_ADVANCE_RATE_BPS,
    maxDaysPastDue: DEMO_MAX_DAYS_PAST_DUE,
    minRiskScore: DEMO_MIN_RISK_SCORE,
    minRemainingEpochs: DEMO_MIN_REMAINING_EPOCHS,
    currentEpoch: DEMO_CURRENT_EPOCH,
    ...overrides,
  });
  sim.fundOrMintDemoToken(DEMO_LENDER_SECRET, DEMO_VAULT_FUNDING);
  return { sim, facilityId };
}

function expectUnchanged(before: ReturnType<PhrimSimulator['snapshot']>, sim: PhrimSimulator): void {
  const after = sim.snapshot();
  expect(after.outstanding).toBe(before.outstanding);
  expect(after.vaultBalance).toBe(before.vaultBalance);
  expect(after.receiptCount).toBe(before.receiptCount);
  expect(after.nullifierCount).toBe(before.nullifierCount);
}

function expectRejects(fn: () => void, code: string): void {
  let threw = false;
  try {
    fn();
  } catch (error) {
    threw = true;
    expect(String((error as Error).message)).toContain(code);
  }
  expect(threw).toBe(true);
}

function expectPassesEveryEligibilityRule(fn: () => void): void {
  expectRejects(fn, 'VAULT_INSUFFICIENT');
}

describe('Phrim contract — happy path and settlement (Stage 1-3 pass, Stage 4 needs a live ledger — see PM report on unshielded-balance simulation)', () => {
  it('case 1: a valid eight-asset proof passes every eligibility rule and reaches settlement', () => {
    const { sim, facilityId } = setupFundedFacility();
    const before = sim.snapshot();
    expectPassesEveryEligibilityRule(() =>
      sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, eligibleBatch(facilityId), DEMO_BORROWER_SECRET),
    );
    expectUnchanged(before, sim);
  });

  it('case 2: a valid subset with empty padding passes every eligibility rule and reaches settlement', () => {
    const { sim, facilityId } = setupFundedFacility();
    const batch = eligibleBatch(facilityId);
    const padded = [batch[0]!, batch[1]!, batch[2]!, emptySlot(), emptySlot(), emptySlot(), emptySlot(), emptySlot()] as EightSlots;
    const before = sim.snapshot();
    expectPassesEveryEligibilityRule(() => sim.requestDraw(facilityId, 2_000_000n, padded, DEMO_BORROWER_SECRET));
    expectUnchanged(before, sim);
  });
});

describe('Phrim contract — signature and provenance failures', () => {
  it('case 3: an altered balance invalidates the signature', () => {
    const { sim, facilityId } = setupFundedFacility();
    const batch = eligibleBatch(facilityId);
    const tampered = [
      tamperCredential(batch[0]!, { outstandingMinor: batch[0]!.outstandingMinor + 1n }),
      ...batch.slice(1),
    ] as EightSlots;
    const before = sim.snapshot();
    expectRejects(() => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, tampered, DEMO_BORROWER_SECRET), 'Invalid attestation signature');
    expectUnchanged(before, sim);
  });

  it('case 4: wrong provider key fails', () => {
    const { sim, facilityId } = setupFundedFacility();
    const rogueBatch = [
      signCredential(baseCredentialFields(0, facilityId), WRONG_ATTESTOR, 1n),
      ...eligibleBatch(facilityId).slice(1),
    ] as EightSlots;
    const before = sim.snapshot();
    expectRejects(() => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, rogueBatch, DEMO_BORROWER_SECRET), 'Invalid attestation signature');
    expectUnchanged(before, sim);
  });

  it('case 5: wrong facility identifier fails', () => {
    const { sim, facilityId } = setupFundedFacility();
    const otherFacility = facilityIdBytes(2);
    const foreignBatch = [
      signCredential(baseCredentialFields(0, otherFacility), DEMO_ATTESTOR, 1n),
      ...eligibleBatch(facilityId).slice(1),
    ] as EightSlots;
    const before = sim.snapshot();
    expectRejects(() => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, foreignBatch, DEMO_BORROWER_SECRET), 'WRONG_FACILITY');
    expectUnchanged(before, sim);
  });

  it('case 6: stale epoch fails', () => {
    const { sim, facilityId } = setupFundedFacility();
    const staleBatch = [
      signCredential(baseCredentialFields(0, facilityId, { snapshotEpoch: DEMO_CURRENT_EPOCH - 1n }), DEMO_ATTESTOR, 1n),
      ...eligibleBatch(facilityId).slice(1),
    ] as EightSlots;
    const before = sim.snapshot();
    expectRejects(() => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, staleBatch, DEMO_BORROWER_SECRET), 'STALE_EPOCH');
    expectUnchanged(before, sim);
  });
});

describe('Phrim contract — policy eligibility failures', () => {
  it('case 7: excessive delinquency fails', () => {
    const { sim, facilityId } = setupFundedFacility();
    const batch = [
      signCredential(baseCredentialFields(0, facilityId, { daysPastDue: DEMO_MAX_DAYS_PAST_DUE + 1n }), DEMO_ATTESTOR, 1n),
      ...eligibleBatch(facilityId).slice(1),
    ] as EightSlots;
    const before = sim.snapshot();
    expectRejects(() => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, batch, DEMO_BORROWER_SECRET), 'ASSET_INELIGIBLE');
    expectUnchanged(before, sim);
  });

  it('case 8: insufficient risk score fails', () => {
    const { sim, facilityId } = setupFundedFacility();
    const batch = [
      signCredential(baseCredentialFields(0, facilityId, { riskScore: DEMO_MIN_RISK_SCORE - 1n }), DEMO_ATTESTOR, 1n),
      ...eligibleBatch(facilityId).slice(1),
    ] as EightSlots;
    const before = sim.snapshot();
    expectRejects(() => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, batch, DEMO_BORROWER_SECRET), 'ASSET_INELIGIBLE');
    expectUnchanged(before, sim);
  });

  it('case 9: insufficient remaining term fails', () => {
    const { sim, facilityId } = setupFundedFacility();
    const batch = [
      signCredential(
        baseCredentialFields(0, facilityId, { maturityEpoch: DEMO_CURRENT_EPOCH + DEMO_MIN_REMAINING_EPOCHS - 1n }),
        DEMO_ATTESTOR,
        1n,
      ),
      ...eligibleBatch(facilityId).slice(1),
    ] as EightSlots;
    const before = sim.snapshot();
    expectRejects(() => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, batch, DEMO_BORROWER_SECRET), 'ASSET_INELIGIBLE');
    expectUnchanged(before, sim);
  });

  it('case 10: zero balance fails', () => {
    const { sim, facilityId } = setupFundedFacility();
    const batch = [
      signCredential(baseCredentialFields(0, facilityId, { outstandingMinor: 0n }), DEMO_ATTESTOR, 1n),
      ...eligibleBatch(facilityId).slice(1),
    ] as EightSlots;
    const before = sim.snapshot();
    expectRejects(() => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, batch, DEMO_BORROWER_SECRET), 'ASSET_INELIGIBLE');
    expectUnchanged(before, sim);
  });

  it('case 11: an all-empty eight-slot batch fails', () => {
    const { sim, facilityId } = setupFundedFacility();
    const allEmpty = [emptySlot(), emptySlot(), emptySlot(), emptySlot(), emptySlot(), emptySlot(), emptySlot(), emptySlot()] as EightSlots;
    const before = sim.snapshot();
    expectRejects(() => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, allEmpty, DEMO_BORROWER_SECRET), 'INSUFFICIENT_COLLATERAL');
    expectUnchanged(before, sim);
  });
});

describe('Phrim contract — borrowing base and capacity failures', () => {
  it('case 12: insufficient collateral fails (undercollateralized scenario)', () => {
    const { sim, facilityId } = setupFundedFacility();
    const before = sim.snapshot();
    expectRejects(
      () => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, undercollateralizedBatch(facilityId), DEMO_BORROWER_SECRET),
      'INSUFFICIENT_COLLATERAL',
    );
    expectUnchanged(before, sim);
  });

  it('case 13: credit limit exceeded fails', () => {
    const { sim, facilityId } = setupFundedFacility({ creditLimit: 1_000_000n });
    const before = sim.snapshot();
    expectRejects(
      () => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, eligibleBatch(facilityId), DEMO_BORROWER_SECRET),
      'CREDIT_LIMIT_EXCEEDED',
    );
    expectUnchanged(before, sim);
  });

  it('case 14: insufficient vault balance fails', () => {
    const sim = new PhrimSimulator();
    const facilityId = facilityIdBytes();
    sim.createFacility({
      facilityId,
      lenderSecret: DEMO_LENDER_SECRET,
      borrowerAuthorityHash: borrowerAuthorityHashFor(DEMO_BORROWER_SECRET),
      borrowerAddress: userAddress(1),
      attestorProviderId: DEMO_PROVIDER_ID,
      attestorPublicKeyX: DEMO_ATTESTOR.publicKey.x,
      attestorPublicKeyY: DEMO_ATTESTOR.publicKey.y,
      creditLimit: DEMO_CREDIT_LIMIT,
      advanceRateBps: DEMO_ADVANCE_RATE_BPS,
      maxDaysPastDue: DEMO_MAX_DAYS_PAST_DUE,
      minRiskScore: DEMO_MIN_RISK_SCORE,
      minRemainingEpochs: DEMO_MIN_REMAINING_EPOCHS,
      currentEpoch: DEMO_CURRENT_EPOCH,
    });
    sim.fundOrMintDemoToken(DEMO_LENDER_SECRET, 1_000_000n);
    const before = sim.snapshot();
    expectRejects(
      () => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, eligibleBatch(facilityId), DEMO_BORROWER_SECRET),
      'VAULT_INSUFFICIENT',
    );
    expectUnchanged(before, sim);
  });

  it('case 15: wrong borrower secret fails', () => {
    const { sim, facilityId } = setupFundedFacility();
    const before = sim.snapshot();
    expectRejects(
      () => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, eligibleBatch(facilityId), WRONG_SECRET),
      'UNAUTHORIZED',
    );
    expectUnchanged(before, sim);
  });
});

describe('Phrim contract — facility lifecycle', () => {
  it('case 16: a frozen facility rejects draws', () => {
    const { sim, facilityId } = setupFundedFacility();
    sim.freezeFacility(DEMO_LENDER_SECRET);
    const before = sim.snapshot();
    expectRejects(
      () => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, eligibleBatch(facilityId), DEMO_BORROWER_SECRET),
      'FACILITY_INACTIVE',
    );
    expectUnchanged(before, sim);
  });

  it('case 17: a closed facility rejects draws', () => {
    const { sim, facilityId } = setupFundedFacility();
    sim.closeFacility(DEMO_LENDER_SECRET);
    const before = sim.snapshot();
    expectRejects(
      () => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, eligibleBatch(facilityId), DEMO_BORROWER_SECRET),
      'FACILITY_INACTIVE',
    );
    expectUnchanged(before, sim);
  });
});

describe('Phrim contract — replay and duplicate protection', () => {
  it('case 18: the same asset nonce duplicated within one request fails, even on a fresh facility', () => {
    const { sim, facilityId } = setupFundedFacility();
    const batch = eligibleBatch(facilityId);
    const duplicated = [batch[0]!, batch[0]!, ...batch.slice(2)] as EightSlots;
    const before = sim.snapshot();
    expectRejects(() => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, duplicated, DEMO_BORROWER_SECRET), 'ASSET_ALREADY_USED');
    expectUnchanged(before, sim);
  });

  it('case 19: the nullifier a replayed asset would collide on is deterministic across separate requests (full cross-transaction replay is exercised against the deployed contract; see README rehearsal steps)', () => {
    const facilityId = facilityIdBytes();
    const assetNonce = assetNonceBytes(0);
    const first = pureCircuits.assetNullifier(facilityId, assetNonce);
    const second = pureCircuits.assetNullifier(facilityId, assetNonce);
    expect(Buffer.from(first).toString('hex')).toBe(Buffer.from(second).toString('hex'));
  });
});

describe('Phrim contract — boundary values', () => {
  it('days-past-due exactly at the limit passes; one past the limit fails', () => {
    const { sim, facilityId } = setupFundedFacility();
    const passBatch = [
      signCredential(baseCredentialFields(0, facilityId, { daysPastDue: DEMO_MAX_DAYS_PAST_DUE }), DEMO_ATTESTOR, 1n),
      ...eligibleBatch(facilityId).slice(1),
    ] as EightSlots;
    expectPassesEveryEligibilityRule(() => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, passBatch, DEMO_BORROWER_SECRET));

    const { sim: sim2, facilityId: fid2 } = setupFundedFacility();
    const failBatch = [
      signCredential(baseCredentialFields(0, fid2, { daysPastDue: DEMO_MAX_DAYS_PAST_DUE + 1n }), DEMO_ATTESTOR, 1n),
      ...eligibleBatch(fid2).slice(1),
    ] as EightSlots;
    expectRejects(() => sim2.requestDraw(fid2, DEMO_DRAW_AMOUNT, failBatch, DEMO_BORROWER_SECRET), 'ASSET_INELIGIBLE');
  });

  it('risk score exactly at the limit passes; one below the limit fails', () => {
    const { sim, facilityId } = setupFundedFacility();
    const passBatch = [
      signCredential(baseCredentialFields(0, facilityId, { riskScore: DEMO_MIN_RISK_SCORE }), DEMO_ATTESTOR, 1n),
      ...eligibleBatch(facilityId).slice(1),
    ] as EightSlots;
    expectPassesEveryEligibilityRule(() => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, passBatch, DEMO_BORROWER_SECRET));

    const { sim: sim2, facilityId: fid2 } = setupFundedFacility();
    const failBatch = [
      signCredential(baseCredentialFields(0, fid2, { riskScore: DEMO_MIN_RISK_SCORE - 1n }), DEMO_ATTESTOR, 1n),
      ...eligibleBatch(fid2).slice(1),
    ] as EightSlots;
    expectRejects(() => sim2.requestDraw(fid2, DEMO_DRAW_AMOUNT, failBatch, DEMO_BORROWER_SECRET), 'ASSET_INELIGIBLE');
  });

  it('remaining term exactly at the limit passes; one epoch short fails', () => {
    const boundaryMaturity = DEMO_CURRENT_EPOCH + DEMO_MIN_REMAINING_EPOCHS;
    const { sim, facilityId } = setupFundedFacility();
    const passBatch = [
      signCredential(baseCredentialFields(0, facilityId, { maturityEpoch: boundaryMaturity }), DEMO_ATTESTOR, 1n),
      ...eligibleBatch(facilityId).slice(1),
    ] as EightSlots;
    expectPassesEveryEligibilityRule(() => sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, passBatch, DEMO_BORROWER_SECRET));

    const { sim: sim2, facilityId: fid2 } = setupFundedFacility();
    const failBatch = [
      signCredential(baseCredentialFields(0, fid2, { maturityEpoch: boundaryMaturity - 1n }), DEMO_ATTESTOR, 1n),
      ...eligibleBatch(fid2).slice(1),
    ] as EightSlots;
    expectRejects(() => sim2.requestDraw(fid2, DEMO_DRAW_AMOUNT, failBatch, DEMO_BORROWER_SECRET), 'ASSET_INELIGIBLE');
  });

  it('a draw exactly at the credit limit passes; one minor unit over fails', () => {
    const { sim, facilityId } = setupFundedFacility({ creditLimit: DEMO_DRAW_AMOUNT });
    expectPassesEveryEligibilityRule(() =>
      sim.requestDraw(facilityId, DEMO_DRAW_AMOUNT, eligibleBatch(facilityId), DEMO_BORROWER_SECRET),
    );

    const { sim: sim2, facilityId: fid2 } = setupFundedFacility({ creditLimit: DEMO_DRAW_AMOUNT - 1n });
    expectRejects(
      () => sim2.requestDraw(fid2, DEMO_DRAW_AMOUNT, eligibleBatch(fid2), DEMO_BORROWER_SECRET),
      'CREDIT_LIMIT_EXCEEDED',
    );
  });

  it('maximum supported amounts do not overflow', () => {
    const MAX_UINT128 = 340282366920938463463374607431768211455n;
    const sim = new PhrimSimulator();
    const facilityId = facilityIdBytes(4);
    sim.createFacility({
      facilityId,
      lenderSecret: DEMO_LENDER_SECRET,
      borrowerAuthorityHash: borrowerAuthorityHashFor(DEMO_BORROWER_SECRET),
      borrowerAddress: userAddress(1),
      attestorProviderId: DEMO_PROVIDER_ID,
      attestorPublicKeyX: DEMO_ATTESTOR.publicKey.x,
      attestorPublicKeyY: DEMO_ATTESTOR.publicKey.y,
      creditLimit: MAX_UINT128,
      advanceRateBps: DEMO_ADVANCE_RATE_BPS,
      maxDaysPastDue: DEMO_MAX_DAYS_PAST_DUE,
      minRiskScore: DEMO_MIN_RISK_SCORE,
      minRemainingEpochs: DEMO_MIN_REMAINING_EPOCHS,
      currentEpoch: DEMO_CURRENT_EPOCH,
    });
    const before = sim.snapshot();
    expectRejects(
      () => sim.requestDraw(facilityId, MAX_UINT128, eligibleBatch(facilityId), DEMO_BORROWER_SECRET),
      'INSUFFICIENT_COLLATERAL',
    );
    expectUnchanged(before, sim);
  });
});

describe('Phrim contract — golden vectors (Schema Lock enforcement)', () => {
  it('credentialDigest reproduces this package\'s own recorded golden vector', () => {
    const fields = baseCredentialFields(0, facilityIdBytes());
    const digestOnce = pureCircuits.credentialDigest(
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
    const digestTwice = pureCircuits.credentialDigest(
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
    expect(Buffer.from(digestOnce).toString('hex')).toBe(Buffer.from(digestTwice).toString('hex'));
    expect(digestOnce.length).toBe(32);
  });

  it('a full signed credential built off-chain verifies inside requestDraw (signer/circuit parity)', () => {
    const { sim, facilityId } = setupFundedFacility();
    const credential = signCredential(baseCredentialFields(0, facilityId), DEMO_ATTESTOR, 77n);
    const batch = [credential, ...Array.from({ length: 7 }, () => emptySlot())] as EightSlots;
    expectPassesEveryEligibilityRule(() => sim.requestDraw(facilityId, 900_000n, batch, DEMO_BORROWER_SECRET));
  });
});
