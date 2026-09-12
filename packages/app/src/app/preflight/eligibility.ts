import type { FacilityStatus, PhrimErrorCode } from '../../viewmodels/types';

export interface PreflightAsset {
  occupied: boolean;
  facilityId: string;
  outstandingMinor: bigint;
  daysPastDue: number;
  riskScore: number;
  maturityEpoch: number;
  snapshotEpoch: number;
  signatureValid: boolean;
}

export interface PreflightPolicy {
  facilityId: string;
  status: FacilityStatus;
  advanceRateBps: bigint;
  maxDaysPastDue: number;
  minRiskScore: number;
  minRemainingEpochs: number;
  currentEpoch: number;
  creditLimitMinor: bigint;
  outstandingMinor: bigint;
  vaultBalanceMinor: bigint;
}

const BPS_DENOMINATOR = 10000n;

export function isAssetPolicyEligible(asset: PreflightAsset, policy: PreflightPolicy): boolean {
  if (!asset.occupied) {
    return true;
  }
  if (asset.outstandingMinor <= 0n) {
    return false;
  }
  if (asset.daysPastDue > policy.maxDaysPastDue) {
    return false;
  }
  if (asset.riskScore < policy.minRiskScore) {
    return false;
  }
  if (asset.maturityEpoch - policy.currentEpoch < policy.minRemainingEpochs) {
    return false;
  }
  return true;
}

export function isAssetEpochFresh(asset: PreflightAsset, policy: PreflightPolicy): boolean {
  return !asset.occupied || asset.snapshotEpoch === policy.currentEpoch;
}

export function computeEligibleTotalMinor(assets: readonly PreflightAsset[], policy: PreflightPolicy): bigint {
  return assets.reduce((total, asset) => {
    if (!asset.occupied || !asset.signatureValid) {
      return total;
    }
    if (!isAssetEpochFresh(asset, policy) || !isAssetPolicyEligible(asset, policy)) {
      return total;
    }
    return total + asset.outstandingMinor;
  }, 0n);
}

export function computeSupportedDrawMinor(eligibleTotalMinor: bigint, advanceRateBps: bigint): bigint {
  return (eligibleTotalMinor * advanceRateBps) / BPS_DENOMINATOR;
}

export function predictErrorCode(
  assets: readonly PreflightAsset[],
  policy: PreflightPolicy,
  requestedMinor: bigint,
): PhrimErrorCode | null {
  if (policy.status !== 'Active') {
    return 'FACILITY_INACTIVE';
  }
  const occupied = assets.filter((asset) => asset.occupied);
  if (occupied.length === 0) {
    return 'ASSET_INELIGIBLE';
  }
  if (occupied.some((asset) => !asset.signatureValid)) {
    return 'INVALID_SIGNATURE';
  }
  if (occupied.some((asset) => asset.facilityId !== policy.facilityId)) {
    return 'WRONG_FACILITY';
  }
  if (occupied.some((asset) => !isAssetEpochFresh(asset, policy))) {
    return 'STALE_EPOCH';
  }
  if (occupied.some((asset) => !isAssetPolicyEligible(asset, policy))) {
    return 'ASSET_INELIGIBLE';
  }
  const eligibleTotalMinor = computeEligibleTotalMinor(assets, policy);
  const supportedDrawMinor = computeSupportedDrawMinor(eligibleTotalMinor, policy.advanceRateBps);
  if (requestedMinor <= 0n) {
    return 'ASSET_INELIGIBLE';
  }
  if (supportedDrawMinor < requestedMinor) {
    return 'INSUFFICIENT_COLLATERAL';
  }
  if (policy.outstandingMinor + requestedMinor > policy.creditLimitMinor) {
    return 'CREDIT_LIMIT_EXCEEDED';
  }
  if (policy.vaultBalanceMinor < requestedMinor) {
    return 'VAULT_INSUFFICIENT';
  }
  return null;
}
