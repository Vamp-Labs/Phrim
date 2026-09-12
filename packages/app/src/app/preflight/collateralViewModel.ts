import type { AttestedAssetCredentialJson } from 'schema';
import type { CollateralVM, CredentialRowVM } from '../../viewmodels/types';
import type { ScenarioFixtureResponse } from '../midnight/attestationClient';
import { maskAssetRef, maskDaysPastDue, maskOutstandingMinor, maskRiskScore } from './masking';
import { computeEligibleTotalMinor, computeSupportedDrawMinor } from './eligibility';
import type { PreflightAsset, PreflightPolicy } from './eligibility';
import {
  DEMO_ADVANCE_RATE_BPS,
  DEMO_CREDIT_LIMIT_MINOR,
  DEMO_CURRENT_EPOCH,
  DEMO_MAX_DAYS_PAST_DUE,
  DEMO_MIN_REMAINING_EPOCHS,
  DEMO_MIN_RISK_SCORE,
  DEMO_VAULT_FUNDING_MINOR,
} from './demoConstants';

const EMPTY_ROW: Omit<CredentialRowVM, 'slot'> = {
  occupied: false,
  maskedAssetRef: '—',
  outstandingMinorMasked: '—',
  daysPastDueMasked: '—',
  riskScoreMasked: '—',
  signatureStatus: 'unchecked',
};

function toPreflightAsset(credential: AttestedAssetCredentialJson): PreflightAsset {
  return {
    occupied: true,
    facilityId: credential.facilityId,
    outstandingMinor: BigInt(credential.outstandingMinor),
    daysPastDue: credential.daysPastDue,
    riskScore: credential.riskScore,
    maturityEpoch: credential.maturityEpoch,
    snapshotEpoch: credential.snapshotEpoch,
    signatureValid: true,
  };
}

export function buildDemoPolicy(facilityId: string): PreflightPolicy {
  return {
    facilityId,
    status: 'Active',
    advanceRateBps: DEMO_ADVANCE_RATE_BPS,
    maxDaysPastDue: DEMO_MAX_DAYS_PAST_DUE,
    minRiskScore: DEMO_MIN_RISK_SCORE,
    minRemainingEpochs: DEMO_MIN_REMAINING_EPOCHS,
    currentEpoch: DEMO_CURRENT_EPOCH,
    creditLimitMinor: DEMO_CREDIT_LIMIT_MINOR,
    outstandingMinor: 0n,
    vaultBalanceMinor: DEMO_VAULT_FUNDING_MINOR,
  };
}

export function buildCollateralVM(fixture: ScenarioFixtureResponse): CollateralVM {
  const rows: CredentialRowVM[] = [0, 1, 2, 3, 4, 5, 6, 7].map((slot) => {
    const credential = fixture.credentials[slot];
    if (credential === undefined) {
      return { slot: slot as CredentialRowVM['slot'], ...EMPTY_ROW };
    }
    return {
      slot: slot as CredentialRowVM['slot'],
      occupied: true,
      maskedAssetRef: maskAssetRef(credential.assetNonce, slot),
      outstandingMinorMasked: maskOutstandingMinor(),
      daysPastDueMasked: maskDaysPastDue(),
      riskScoreMasked: maskRiskScore(),
      signatureStatus: fixture.signaturesPending ? 'unchecked' : 'valid',
    };
  });

  const policy = buildDemoPolicy(fixture.credentials[0]?.facilityId ?? '');
  const assets = fixture.credentials.map(toPreflightAsset);
  const eligibleTotalMinor = computeEligibleTotalMinor(assets, policy);
  const supportedDrawMinor = computeSupportedDrawMinor(eligibleTotalMinor, policy.advanceRateBps);

  return {
    rows,
    scenario: fixture.scenarioId,
    previewTotalMinor: eligibleTotalMinor.toString(),
    previewSupportsMinor: supportedDrawMinor.toString(),
    allSignaturesValid: !fixture.signaturesPending,
  };
}
