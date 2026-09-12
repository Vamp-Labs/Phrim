export * from './eligibility';
export * from './nullifier';
export * from './masking';

import type { PhrimErrorCode } from '../../viewmodels/types';
import { computeEligibleTotalMinor, computeSupportedDrawMinor, predictErrorCode } from './eligibility';
import type { PreflightAsset, PreflightPolicy } from './eligibility';
import { predictAssetAlreadyUsed } from './nullifier';

export interface PreflightResult {
  eligibleTotalMinor: bigint;
  supportedDrawMinor: bigint;
  predictedError: PhrimErrorCode | null;
}

export function runPreflight(
  assets: readonly PreflightAsset[],
  policy: PreflightPolicy,
  requestedMinor: bigint,
  assetNonces: readonly string[],
  usedNullifiers: ReadonlySet<string>,
): PreflightResult {
  const eligibleTotalMinor = computeEligibleTotalMinor(assets, policy);
  const supportedDrawMinor = computeSupportedDrawMinor(eligibleTotalMinor, policy.advanceRateBps);
  const circuitOrderedError = predictErrorCode(assets, policy, requestedMinor);
  if (circuitOrderedError !== null) {
    return { eligibleTotalMinor, supportedDrawMinor, predictedError: circuitOrderedError };
  }
  if (predictAssetAlreadyUsed(policy.facilityId, assetNonces, usedNullifiers)) {
    return { eligibleTotalMinor, supportedDrawMinor, predictedError: 'ASSET_ALREADY_USED' };
  }
  return { eligibleTotalMinor, supportedDrawMinor, predictedError: null };
}
