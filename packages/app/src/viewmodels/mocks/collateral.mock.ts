import { maskAssetRef, maskDaysPastDue, maskOutstandingMinor, maskRiskScore } from '../../app/preflight/masking';
import type { CollateralVM, CredentialRowVM, ScenarioId, SignatureStatus } from '../types';

function buildRow(
  slot: CredentialRowVM['slot'],
  occupied: boolean,
  signatureStatus: SignatureStatus,
  scenario: string,
): CredentialRowVM {
  return {
    slot,
    occupied,
    maskedAssetRef: occupied ? maskAssetRef(`mock-nonce-${scenario}-${slot}`, slot) : '—',
    outstandingMinorMasked: occupied ? maskOutstandingMinor() : '—',
    daysPastDueMasked: occupied ? maskDaysPastDue() : '—',
    riskScoreMasked: occupied ? maskRiskScore() : '—',
    signatureStatus: occupied ? signatureStatus : 'unchecked',
  };
}

const SLOTS: CredentialRowVM['slot'][] = [0, 1, 2, 3, 4, 5, 6, 7];

export const MOCK_COLLATERAL_ELIGIBLE: CollateralVM = {
  rows: SLOTS.map((slot) => buildRow(slot, true, 'valid', 'eligible')),
  scenario: 'eligible',
  previewTotalMinor: '10000000',
  previewSupportsMinor: '8000000',
  allSignaturesValid: true,
};

export const MOCK_COLLATERAL_UNDERCOLLATERALIZED: CollateralVM = {
  rows: SLOTS.map((slot) =>
    buildRow(slot, slot !== 6 && slot !== 7, 'valid', 'undercollateralized'),
  ),
  scenario: 'undercollateralized',
  previewTotalMinor: '8500000',
  previewSupportsMinor: '6800000',
  allSignaturesValid: true,
};

export const MOCK_COLLATERAL_STALE: CollateralVM = {
  rows: SLOTS.map((slot) => buildRow(slot, true, 'valid', 'stale')),
  scenario: 'stale',
  previewTotalMinor: '10000000',
  previewSupportsMinor: '8000000',
  allSignaturesValid: true,
};

export const MOCK_COLLATERAL_TAMPERED: CollateralVM = {
  rows: SLOTS.map((slot) => buildRow(slot, true, slot === 0 ? 'invalid' : 'valid', 'tampered')),
  scenario: 'tampered',
  previewTotalMinor: '10000000',
  previewSupportsMinor: '8000000',
  allSignaturesValid: false,
};

export const MOCK_COLLATERAL_REPLAY: CollateralVM = {
  rows: SLOTS.map((slot) => buildRow(slot, true, 'valid', 'replay')),
  scenario: 'replay',
  previewTotalMinor: '10000000',
  previewSupportsMinor: '8000000',
  allSignaturesValid: true,
};

export const MOCK_COLLATERAL_EMPTY: CollateralVM = {
  rows: SLOTS.map((slot) => buildRow(slot, false, 'unchecked', 'empty')),
  scenario: 'eligible',
  previewTotalMinor: '0',
  previewSupportsMinor: '0',
  allSignaturesValid: false,
};

export const MOCK_COLLATERAL_BY_SCENARIO: Record<ScenarioId, CollateralVM> = {
  eligible: MOCK_COLLATERAL_ELIGIBLE,
  undercollateralized: MOCK_COLLATERAL_UNDERCOLLATERALIZED,
  stale: MOCK_COLLATERAL_STALE,
  tampered: MOCK_COLLATERAL_TAMPERED,
  replay: MOCK_COLLATERAL_REPLAY,
};
