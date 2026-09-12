import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { maskAssetRef, maskDaysPastDue, maskOutstandingMinor, maskRiskScore } from '../../src/app/preflight/masking';
import { computeEligibleTotalMinor, computeSupportedDrawMinor, predictErrorCode } from '../../src/app/preflight/eligibility';
import type { PreflightAsset, PreflightPolicy } from '../../src/app/preflight/eligibility';

const SENTINEL = 'PHRIM_PRIVACY_SENTINEL_9f2c7ab1';

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

function assetCarryingSentinel(): PreflightAsset {
  return {
    occupied: true,
    facilityId: `${SENTINEL}-facility`,
    outstandingMinor: 1250000n,
    daysPastDue: 0,
    riskScore: 750,
    maturityEpoch: 12,
    snapshotEpoch: 7,
    signatureValid: true,
  };
}

describe('sentinel credential value never reaches console output', () => {
  const consoleSpies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((method) =>
    vi.spyOn(console, method),
  );

  beforeEach(() => {
    consoleSpies.forEach((spy) => spy.mockClear());
  });

  afterEach(() => {
    consoleSpies.forEach((spy) => spy.mockRestore());
  });

  it('runs the local pre-flight pipeline over a sentinel-bearing batch without any console output containing it', () => {
    const assets = [assetCarryingSentinel(), ...Array.from({ length: 7 }, () => ({ ...assetCarryingSentinel(), facilityId: 'FACILITY_DEMO_001' }))];
    const eligibleTotalMinor = computeEligibleTotalMinor(assets, POLICY);
    computeSupportedDrawMinor(eligibleTotalMinor, POLICY.advanceRateBps);
    predictErrorCode(assets, POLICY, 7500000n);

    const maskedRef = maskAssetRef(`${SENTINEL}-nonce`, 0);
    const maskedBalance = maskOutstandingMinor();
    const maskedDays = maskDaysPastDue();
    const maskedRisk = maskRiskScore();

    expect(maskedRef).not.toContain(SENTINEL);
    expect(maskedBalance).not.toContain(SENTINEL);
    expect(maskedDays).not.toContain(SENTINEL);
    expect(maskedRisk).not.toContain(SENTINEL);

    for (const spy of consoleSpies) {
      for (const call of spy.mock.calls) {
        for (const argument of call) {
          expect(String(argument)).not.toContain(SENTINEL);
        }
      }
    }
  });
});
