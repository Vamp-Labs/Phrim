import type { PhrimErrorCode } from '../errors.js';
import {
  buildUnsignedCredentialBatch,
  CREDENTIAL_SLOT_COUNT,
  type ScenarioId,
  type UnsignedAttestedAssetCredential,
  type UnsignedCredentialBatch,
} from '../types.js';
import {
  DEMO_DRAW_AMOUNT_MINOR,
  DEMO_ELIGIBLE_TOTAL_MINOR,
  DEMO_UNDERCOLLATERALIZED_TOTAL_MINOR,
} from './constants.js';
import {
  ELIGIBLE_ASSETS,
  REPLAY_ASSETS,
  STALE_ASSETS,
  TAMPERED_MUTATED_OUTSTANDING_MINOR,
  TAMPERED_ORIGINAL_OUTSTANDING_MINOR,
  TAMPERED_SLOT_INDEX,
  UNDERCOLLATERALIZED_DESELECTED_NOTES,
  UNDERCOLLATERALIZED_OCCUPIED_ASSETS,
  type DeselectedDelinquentAssetNote,
} from './assets.js';

export interface UnsignedScenarioFixture {
  readonly id: ScenarioId;
  readonly description: string;
  readonly occupiedAssets: readonly UnsignedAttestedAssetCredential[];
  readonly tamperedField: { readonly slotIndex: number; readonly outstandingMinor: bigint } | null;
  readonly deselectedNotes: readonly DeselectedDelinquentAssetNote[];
  readonly requestedDrawMinor: bigint;
  readonly eligibleTotalMinor: bigint;
  readonly requiresPriorEligibleSuccess: boolean;
  readonly expectedOutcome: 'funded' | 'rejected';
  readonly expectedErrorCode: PhrimErrorCode | null;
}

function sumOutstanding(assets: readonly UnsignedAttestedAssetCredential[]): bigint {
  return assets.reduce((total, asset) => total + asset.outstandingMinor, 0n);
}

const eligibleTotal = sumOutstanding(ELIGIBLE_ASSETS);
if (eligibleTotal !== DEMO_ELIGIBLE_TOTAL_MINOR) {
  throw new Error(
    `eligible fixture total ${eligibleTotal} does not match the frozen demo constant ${DEMO_ELIGIBLE_TOTAL_MINOR}`,
  );
}

const undercollateralizedTotal = sumOutstanding(UNDERCOLLATERALIZED_OCCUPIED_ASSETS);
if (undercollateralizedTotal !== DEMO_UNDERCOLLATERALIZED_TOTAL_MINOR) {
  throw new Error(
    `undercollateralized fixture total ${undercollateralizedTotal} does not match the frozen demo constant ${DEMO_UNDERCOLLATERALIZED_TOTAL_MINOR}`,
  );
}

if (UNDERCOLLATERALIZED_OCCUPIED_ASSETS.length !== 6) {
  throw new Error('undercollateralized fixture must carry exactly six occupied slots');
}

export const ELIGIBLE_SCENARIO: UnsignedScenarioFixture = {
  id: 'eligible',
  description: 'Eight occupied slots totalling $100,000 of eligible collateral; a $75,000 draw passes at 80% advance rate.',
  occupiedAssets: ELIGIBLE_ASSETS,
  tamperedField: null,
  deselectedNotes: [],
  requestedDrawMinor: DEMO_DRAW_AMOUNT_MINOR,
  eligibleTotalMinor: eligibleTotal,
  requiresPriorEligibleSuccess: false,
  expectedOutcome: 'funded',
  expectedErrorCode: null,
};

export const UNDERCOLLATERALIZED_SCENARIO: UnsignedScenarioFixture = {
  id: 'undercollateralized',
  description:
    'Six occupied slots totalling $85,000 after two delinquent assets are freshly re-signed and deselected as unoccupied; the same $75,000 draw fails the advance-rate check.',
  occupiedAssets: UNDERCOLLATERALIZED_OCCUPIED_ASSETS,
  tamperedField: null,
  deselectedNotes: UNDERCOLLATERALIZED_DESELECTED_NOTES,
  requestedDrawMinor: DEMO_DRAW_AMOUNT_MINOR,
  eligibleTotalMinor: undercollateralizedTotal,
  requiresPriorEligibleSuccess: false,
  expectedOutcome: 'rejected',
  expectedErrorCode: 'INSUFFICIENT_COLLATERAL',
};

export const STALE_SCENARIO: UnsignedScenarioFixture = {
  id: 'stale',
  description: 'The eligible batch re-signed one epoch behind the facility current epoch.',
  occupiedAssets: STALE_ASSETS,
  tamperedField: null,
  deselectedNotes: [],
  requestedDrawMinor: DEMO_DRAW_AMOUNT_MINOR,
  eligibleTotalMinor: sumOutstanding(STALE_ASSETS),
  requiresPriorEligibleSuccess: false,
  expectedOutcome: 'rejected',
  expectedErrorCode: 'STALE_EPOCH',
};

export const TAMPERED_SCENARIO: UnsignedScenarioFixture = {
  id: 'tampered',
  description: `The eligible batch with slot ${TAMPERED_SLOT_INDEX}'s outstandingMinor mutated from ${TAMPERED_ORIGINAL_OUTSTANDING_MINOR} to ${TAMPERED_MUTATED_OUTSTANDING_MINOR} after signing.`,
  occupiedAssets: ELIGIBLE_ASSETS,
  tamperedField: { slotIndex: TAMPERED_SLOT_INDEX, outstandingMinor: TAMPERED_MUTATED_OUTSTANDING_MINOR },
  deselectedNotes: [],
  requestedDrawMinor: DEMO_DRAW_AMOUNT_MINOR,
  eligibleTotalMinor: eligibleTotal,
  requiresPriorEligibleSuccess: false,
  expectedOutcome: 'rejected',
  expectedErrorCode: 'INVALID_SIGNATURE',
};

export const REPLAY_SCENARIO: UnsignedScenarioFixture = {
  id: 'replay',
  description: 'Byte-identical to the eligible batch already funded once; its nullifiers are already consumed.',
  occupiedAssets: REPLAY_ASSETS,
  tamperedField: null,
  deselectedNotes: [],
  requestedDrawMinor: DEMO_DRAW_AMOUNT_MINOR,
  eligibleTotalMinor: sumOutstanding(REPLAY_ASSETS),
  requiresPriorEligibleSuccess: true,
  expectedOutcome: 'rejected',
  expectedErrorCode: 'ASSET_ALREADY_USED',
};

export const UNSIGNED_SCENARIOS: Readonly<Record<ScenarioId, UnsignedScenarioFixture>> = {
  eligible: ELIGIBLE_SCENARIO,
  undercollateralized: UNDERCOLLATERALIZED_SCENARIO,
  stale: STALE_SCENARIO,
  tampered: TAMPERED_SCENARIO,
  replay: REPLAY_SCENARIO,
};

for (const scenario of Object.values(UNSIGNED_SCENARIOS)) {
  if (scenario.occupiedAssets.length > CREDENTIAL_SLOT_COUNT) {
    throw new Error(`scenario "${scenario.id}" exceeds ${CREDENTIAL_SLOT_COUNT} occupied slots`);
  }
}

export function buildAssetsToSignBatch(scenario: UnsignedScenarioFixture): UnsignedCredentialBatch {
  return buildUnsignedCredentialBatch(scenario.occupiedAssets);
}
