import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computeEligibleTotalMinor, predictErrorCode } from '../../src/app/preflight/eligibility';
import type { PreflightAsset, PreflightPolicy } from '../../src/app/preflight/eligibility';
import { readCollateralState, readDrawRequestState, readDrawResultState, readHistoryState } from '../../src/app/state/mockViewState';

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
    facilityId: 'FACILITY_DEMO_001',
    outstandingMinor: 1250000n,
    daysPastDue: 0,
    riskScore: 750,
    maturityEpoch: 12,
    snapshotEpoch: 7,
    signatureValid: true,
  };
}

describe('no credential field reaches an outbound request during a simulated draw flow', () => {
  const fetchSpy = vi.fn(async () => new Response('{}'));

  beforeEach(() => {
    fetchSpy.mockClear();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('touches no fetch call carrying the sentinel while walking facility, collateral, draw, result and history state', () => {
    const assets = Array.from({ length: 8 }, () => assetCarryingSentinel());
    computeEligibleTotalMinor(assets, POLICY);
    predictErrorCode(assets, POLICY, 7500000n);

    readCollateralState();
    readDrawRequestState();
    readDrawResultState();
    readHistoryState();

    for (const call of fetchSpy.mock.calls) {
      for (const argument of call) {
        expect(JSON.stringify(argument)).not.toContain(SENTINEL);
      }
    }
  });
});
