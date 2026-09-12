import { describe, expect, it } from 'vitest';
import {
  computeEligibleTotalMinor,
  computeSupportedDrawMinor,
  predictErrorCode,
} from '../../src/app/preflight/eligibility';
import type { PreflightAsset, PreflightPolicy } from '../../src/app/preflight/eligibility';

const POLICY: PreflightPolicy = {
  facilityId: 'FACILITY_DEMO_001',
  status: 'Active',
  advanceRateBps: 8000n,
  maxDaysPastDue: 30,
  minRiskScore: 600,
  minRemainingEpochs: 2,
  currentEpoch: 7,
  creditLimitMinor: 20000000n,
  outstandingMinor: 0n,
  vaultBalanceMinor: 15000000n,
};

function eligibleAsset(outstandingMinor: bigint): PreflightAsset {
  return {
    occupied: true,
    facilityId: 'FACILITY_DEMO_001',
    outstandingMinor,
    daysPastDue: 0,
    riskScore: 750,
    maturityEpoch: 12,
    snapshotEpoch: 7,
    signatureValid: true,
  };
}

describe('eligibility arithmetic', () => {
  it('computes the eligible scenario totals from PRD section 5.7', () => {
    const assets = Array.from({ length: 8 }, () => eligibleAsset(1250000n));
    const eligibleTotalMinor = computeEligibleTotalMinor(assets, POLICY);
    expect(eligibleTotalMinor).toBe(10000000n);
    expect(computeSupportedDrawMinor(eligibleTotalMinor, POLICY.advanceRateBps)).toBe(8000000n);
  });

  it('predicts INSUFFICIENT_COLLATERAL for the undercollateralized scenario', () => {
    const assets = [
      ...Array.from({ length: 6 }, () => eligibleAsset(1416666n)),
      { ...eligibleAsset(0n), occupied: false },
      { ...eligibleAsset(0n), occupied: false },
    ];
    const code = predictErrorCode(assets, POLICY, 7500000n);
    expect(code).toBe('INSUFFICIENT_COLLATERAL');
  });

  it('predicts INVALID_SIGNATURE when any occupied slot fails signature verification', () => {
    const assets = [
      { ...eligibleAsset(1250000n), signatureValid: false },
      ...Array.from({ length: 7 }, () => eligibleAsset(1250000n)),
    ];
    expect(predictErrorCode(assets, POLICY, 7500000n)).toBe('INVALID_SIGNATURE');
  });

  it('predicts STALE_EPOCH when snapshotEpoch trails the facility epoch', () => {
    const assets = Array.from({ length: 8 }, () => ({ ...eligibleAsset(1250000n), snapshotEpoch: 6 }));
    expect(predictErrorCode(assets, POLICY, 7500000n)).toBe('STALE_EPOCH');
  });

  it('never predicts a false pass when no asset is occupied', () => {
    const assets = Array.from({ length: 8 }, () => ({ ...eligibleAsset(0n), occupied: false }));
    expect(predictErrorCode(assets, POLICY, 7500000n)).toBe('ASSET_INELIGIBLE');
  });
});
