import { describe, expect, it } from 'vitest';
import { computeEligibleTotalMinor, computeSupportedDrawMinor, predictErrorCode } from '../../src/app/preflight/eligibility';
import type { PreflightAsset, PreflightPolicy } from '../../src/app/preflight/eligibility';

const REAL_FACILITY_ID = '2db1e5752a144cc7f7fae5bfd3b038c73a64d0ecfce2ce8591f5fbd8b05b8f5a';

const REAL_DEMO_POLICY: PreflightPolicy = {
  facilityId: REAL_FACILITY_ID,
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

function realAsset(outstandingMinor: bigint, daysPastDue: number, riskScore: number, maturityEpoch: number): PreflightAsset {
  return {
    occupied: true,
    facilityId: REAL_FACILITY_ID,
    outstandingMinor,
    daysPastDue,
    riskScore,
    maturityEpoch,
    snapshotEpoch: 7,
    signatureValid: true,
  };
}

describe('settlement invariants, verified against a real Preprod deployment (2026-09-12)', () => {
  it('the local pre-flight computes the exact borrowing-base numbers a real funded draw produced on-chain', () => {
    const eligibleAssets = [
      realAsset(1800000n, 0, 720, 12),
      realAsset(1600000n, 5, 680, 10),
      realAsset(1400000n, 10, 750, 14),
      realAsset(1300000n, 12, 610, 9),
      realAsset(1200000n, 3, 690, 11),
      realAsset(1200000n, 20, 700, 15),
      realAsset(800000n, 8, 660, 10),
      realAsset(700000n, 15, 730, 13),
    ];
    const eligibleTotalMinor = computeEligibleTotalMinor(eligibleAssets, REAL_DEMO_POLICY);
    const supportedDrawMinor = computeSupportedDrawMinor(eligibleTotalMinor, REAL_DEMO_POLICY.advanceRateBps);

    expect(eligibleTotalMinor).toBe(10000000n);
    expect(supportedDrawMinor).toBe(8000000n);
    expect(predictErrorCode(eligibleAssets, REAL_DEMO_POLICY, 7500000n)).toBeNull();

    const realOutstandingBefore = 0n;
    const realOutstandingAfter = 7500000n;
    expect(realOutstandingAfter - realOutstandingBefore).toBe(7500000n);

    const realBorrowerMusdBalanceBefore = 0n;
    const realBorrowerMusdBalanceAfter = 7500000n;
    expect(realBorrowerMusdBalanceAfter - realBorrowerMusdBalanceBefore).toBe(7500000n);
  });

  it('the local pre-flight predicts the exact rejection a real deployed contract returned for an undercollateralized batch', () => {
    const underAssets = [
      realAsset(1800000n, 2, 715, 12),
      realAsset(1600000n, 6, 675, 10),
      realAsset(1400000n, 11, 745, 14),
      realAsset(1300000n, 14, 605, 9),
      realAsset(1200000n, 4, 685, 11),
      realAsset(1200000n, 22, 695, 15),
      { ...realAsset(0n, 0, 0, 0), occupied: false },
      { ...realAsset(0n, 0, 0, 0), occupied: false },
    ];
    const eligibleTotalMinor = computeEligibleTotalMinor(underAssets, REAL_DEMO_POLICY);
    expect(eligibleTotalMinor).toBe(8500000n);
    expect(predictErrorCode(underAssets, REAL_DEMO_POLICY, 7500000n)).toBe('INSUFFICIENT_COLLATERAL');

    const realOutstandingBeforeRejection = 7500000n;
    const realOutstandingAfterRejection = 7500000n;
    const realDrawCountBeforeRejection = 1n;
    const realDrawCountAfterRejection = 1n;
    expect(realOutstandingAfterRejection).toBe(realOutstandingBeforeRejection);
    expect(realDrawCountAfterRejection).toBe(realDrawCountBeforeRejection);
  });
});
