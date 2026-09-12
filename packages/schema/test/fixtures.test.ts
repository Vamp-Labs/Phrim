import { describe, expect, it } from 'vitest';
import { bytesToHex } from '../src/bytes.js';
import {
  DEMO_ADVANCE_RATE_BPS,
  DEMO_CURRENT_EPOCH,
  DEMO_DRAW_AMOUNT_MINOR,
  DEMO_STALE_EPOCH,
} from '../src/fixtures/constants.js';
import {
  ELIGIBLE_ASSETS,
  INELIGIBILITY_VARIANTS,
  STALE_ASSETS,
  TAMPERED_MUTATED_OUTSTANDING_MINOR,
  TAMPERED_ORIGINAL_OUTSTANDING_MINOR,
  UNDERCOLLATERALIZED_OCCUPIED_ASSETS,
} from '../src/fixtures/assets.js';
import {
  ELIGIBLE_SCENARIO,
  REPLAY_SCENARIO,
  STALE_SCENARIO,
  TAMPERED_SCENARIO,
  UNDERCOLLATERALIZED_SCENARIO,
} from '../src/fixtures/scenarios.js';

function sum(values: readonly bigint[]): bigint {
  return values.reduce((total, value) => total + value, 0n);
}

describe('eligible scenario', () => {
  it('has eight occupied slots totalling exactly $100,000 in minor units', () => {
    expect(ELIGIBLE_ASSETS.length).toBe(8);
    expect(sum(ELIGIBLE_ASSETS.map((asset) => asset.outstandingMinor))).toBe(10_000_000n);
  });

  it('satisfies the advance-rate inequality for a $75,000 draw', () => {
    const eligibleTotal = 10_000_000n;
    const draw = DEMO_DRAW_AMOUNT_MINOR;
    expect(eligibleTotal * BigInt(DEMO_ADVANCE_RATE_BPS)).toBeGreaterThanOrEqual(draw * 10_000n);
    expect(eligibleTotal * BigInt(DEMO_ADVANCE_RATE_BPS)).toBe(80_000_000_000n);
    expect(draw * 10_000n).toBe(75_000_000_000n);
  });

  it('every asset is individually policy-eligible at the demo thresholds', () => {
    for (const asset of ELIGIBLE_ASSETS) {
      expect(asset.outstandingMinor).toBeGreaterThan(0n);
      expect(asset.daysPastDue).toBeLessThanOrEqual(30);
      expect(asset.riskScore).toBeGreaterThanOrEqual(600);
      expect(asset.maturityEpoch).toBeGreaterThanOrEqual(DEMO_CURRENT_EPOCH + 2);
      expect(asset.snapshotEpoch).toBe(DEMO_CURRENT_EPOCH);
      expect(asset.providerId).toBe(1);
    }
  });

  it('is marked as expected to fund with no error code', () => {
    expect(ELIGIBLE_SCENARIO.expectedOutcome).toBe('funded');
    expect(ELIGIBLE_SCENARIO.expectedErrorCode).toBeNull();
  });
});

describe('undercollateralized scenario', () => {
  it('carries exactly six occupied slots totalling $85,000', () => {
    expect(UNDERCOLLATERALIZED_OCCUPIED_ASSETS.length).toBe(6);
    expect(sum(UNDERCOLLATERALIZED_OCCUPIED_ASSETS.map((asset) => asset.outstandingMinor))).toBe(8_500_000n);
  });

  it('is signed at the current epoch, not a stale one', () => {
    for (const asset of UNDERCOLLATERALIZED_OCCUPIED_ASSETS) {
      expect(asset.snapshotEpoch).toBe(DEMO_CURRENT_EPOCH);
    }
  });

  it('every occupied asset independently satisfies policy so the failure is collateral, not eligibility', () => {
    for (const asset of UNDERCOLLATERALIZED_OCCUPIED_ASSETS) {
      expect(asset.daysPastDue).toBeLessThanOrEqual(30);
      expect(asset.riskScore).toBeGreaterThanOrEqual(600);
      expect(asset.maturityEpoch).toBeGreaterThanOrEqual(DEMO_CURRENT_EPOCH + 2);
    }
  });

  it('fails the advance-rate inequality for a $75,000 draw, supporting only $68,000', () => {
    const eligibleTotal = 8_500_000n;
    const draw = DEMO_DRAW_AMOUNT_MINOR;
    expect(eligibleTotal * BigInt(DEMO_ADVANCE_RATE_BPS)).toBeLessThan(draw * 10_000n);
    expect(eligibleTotal * BigInt(DEMO_ADVANCE_RATE_BPS)).toBe(68_000_000_000n);
    expect((eligibleTotal * BigInt(DEMO_ADVANCE_RATE_BPS)) / 10_000n).toBe(6_800_000n);
  });

  it('does not reuse any eligible-scenario asset nonce', () => {
    const eligibleHex = new Set(ELIGIBLE_ASSETS.map((asset) => bytesToHex(asset.assetNonce)));
    for (const asset of UNDERCOLLATERALIZED_OCCUPIED_ASSETS) {
      expect(eligibleHex.has(bytesToHex(asset.assetNonce))).toBe(false);
    }
  });

  it('expects INSUFFICIENT_COLLATERAL, not STALE_EPOCH or ASSET_INELIGIBLE', () => {
    expect(UNDERCOLLATERALIZED_SCENARIO.expectedErrorCode).toBe('INSUFFICIENT_COLLATERAL');
  });
});

describe('stale scenario', () => {
  it('differs from eligible only in snapshotEpoch', () => {
    expect(STALE_ASSETS.length).toBe(ELIGIBLE_ASSETS.length);
    for (let i = 0; i < ELIGIBLE_ASSETS.length; i += 1) {
      const eligible = ELIGIBLE_ASSETS[i]!;
      const stale = STALE_ASSETS[i]!;
      expect(stale.snapshotEpoch).toBe(DEMO_STALE_EPOCH);
      expect(stale.snapshotEpoch).not.toBe(eligible.snapshotEpoch);
      expect(stale.outstandingMinor).toBe(eligible.outstandingMinor);
      expect(bytesToHex(stale.assetNonce)).toBe(bytesToHex(eligible.assetNonce));
      expect(stale.daysPastDue).toBe(eligible.daysPastDue);
      expect(stale.riskScore).toBe(eligible.riskScore);
      expect(stale.maturityEpoch).toBe(eligible.maturityEpoch);
    }
  });

  it('expects STALE_EPOCH', () => {
    expect(STALE_SCENARIO.expectedErrorCode).toBe('STALE_EPOCH');
  });
});

describe('tampered scenario', () => {
  it('mutates exactly one documented field relative to eligible', () => {
    expect(TAMPERED_SCENARIO.tamperedField).not.toBeNull();
    expect(TAMPERED_MUTATED_OUTSTANDING_MINOR).not.toBe(TAMPERED_ORIGINAL_OUTSTANDING_MINOR);
    expect(TAMPERED_SCENARIO.occupiedAssets.length).toBe(ELIGIBLE_ASSETS.length);
    for (let i = 0; i < ELIGIBLE_ASSETS.length; i += 1) {
      expect(bytesToHex(TAMPERED_SCENARIO.occupiedAssets[i]!.assetNonce)).toBe(bytesToHex(ELIGIBLE_ASSETS[i]!.assetNonce));
    }
  });

  it('expects INVALID_SIGNATURE', () => {
    expect(TAMPERED_SCENARIO.expectedErrorCode).toBe('INVALID_SIGNATURE');
  });
});

describe('replay scenario', () => {
  it('is byte-identical to the eligible batch', () => {
    expect(REPLAY_SCENARIO.occupiedAssets.length).toBe(ELIGIBLE_ASSETS.length);
    for (let i = 0; i < ELIGIBLE_ASSETS.length; i += 1) {
      const eligible = ELIGIBLE_ASSETS[i]!;
      const replay = REPLAY_SCENARIO.occupiedAssets[i]!;
      expect(bytesToHex(replay.assetNonce)).toBe(bytesToHex(eligible.assetNonce));
      expect(replay.outstandingMinor).toBe(eligible.outstandingMinor);
      expect(replay.snapshotEpoch).toBe(eligible.snapshotEpoch);
    }
  });

  it('requires the eligible draw to have succeeded first', () => {
    expect(REPLAY_SCENARIO.requiresPriorEligibleSuccess).toBe(true);
  });

  it('expects ASSET_ALREADY_USED', () => {
    expect(REPLAY_SCENARIO.expectedErrorCode).toBe('ASSET_ALREADY_USED');
  });
});

describe('ineligibility variants', () => {
  it('provides an at-threshold pass and a one-past-threshold fail for each of the four policy rules', () => {
    const rules = ['daysPastDue', 'riskScore', 'maturityEpoch', 'outstandingMinor'] as const;
    for (const rule of rules) {
      const variants = INELIGIBILITY_VARIANTS.filter((variant) => variant.violatedRule === rule);
      expect(variants.some((variant) => variant.expectPass)).toBe(true);
      expect(variants.some((variant) => !variant.expectPass)).toBe(true);
    }
  });

  it('provides a wrong-provider and a wrong-facility variant', () => {
    expect(INELIGIBILITY_VARIANTS.some((variant) => variant.violatedRule === 'providerId')).toBe(true);
    expect(INELIGIBILITY_VARIANTS.some((variant) => variant.violatedRule === 'facilityId')).toBe(true);
  });
});
