import type { UnsignedAttestedAssetCredential } from '../types.js';
import {
  DEMO_ATTESTOR_PROVIDER_ID,
  DEMO_CURRENT_EPOCH,
  DEMO_SCHEMA_VERSION,
  DEMO_STALE_EPOCH,
  DEMO_WRONG_PROVIDER_ID,
  FACILITY_DEMO_001_ID,
  OTHER_FACILITY_DEMO_999_ID,
} from './constants.js';
import {
  BOUNDARY_NONCES,
  ELIGIBLE_ASSET_NONCES,
  UNDERCOLLATERALIZED_ASSET_NONCES,
  WRONG_FACILITY_ASSET_NONCE,
  WRONG_PROVIDER_ASSET_NONCE,
} from './demoValues.js';

interface EligibleAssetSeed {
  readonly outstandingMinor: bigint;
  readonly daysPastDue: number;
  readonly riskScore: number;
  readonly maturityEpoch: number;
}

const ELIGIBLE_ASSET_SEEDS: readonly EligibleAssetSeed[] = [
  { outstandingMinor: 1_800_000n, daysPastDue: 0, riskScore: 720, maturityEpoch: 12 },
  { outstandingMinor: 1_600_000n, daysPastDue: 5, riskScore: 680, maturityEpoch: 10 },
  { outstandingMinor: 1_400_000n, daysPastDue: 10, riskScore: 750, maturityEpoch: 14 },
  { outstandingMinor: 1_300_000n, daysPastDue: 12, riskScore: 610, maturityEpoch: 9 },
  { outstandingMinor: 1_200_000n, daysPastDue: 3, riskScore: 690, maturityEpoch: 11 },
  { outstandingMinor: 1_200_000n, daysPastDue: 20, riskScore: 700, maturityEpoch: 15 },
  { outstandingMinor: 800_000n, daysPastDue: 8, riskScore: 660, maturityEpoch: 10 },
  { outstandingMinor: 700_000n, daysPastDue: 15, riskScore: 730, maturityEpoch: 13 },
];

export const ELIGIBLE_ASSETS: readonly UnsignedAttestedAssetCredential[] = ELIGIBLE_ASSET_SEEDS.map(
  (seed, index) => ({
    schemaVersion: DEMO_SCHEMA_VERSION,
    providerId: DEMO_ATTESTOR_PROVIDER_ID,
    facilityId: FACILITY_DEMO_001_ID,
    assetNonce: ELIGIBLE_ASSET_NONCES[index]!,
    outstandingMinor: seed.outstandingMinor,
    daysPastDue: seed.daysPastDue,
    riskScore: seed.riskScore,
    maturityEpoch: seed.maturityEpoch,
    snapshotEpoch: DEMO_CURRENT_EPOCH,
  }),
);

interface UndercollateralizedAssetSeed {
  readonly outstandingMinor: bigint;
  readonly daysPastDue: number;
  readonly riskScore: number;
  readonly maturityEpoch: number;
}

const UNDERCOLLATERALIZED_OCCUPIED_SEEDS: readonly UndercollateralizedAssetSeed[] = [
  { outstandingMinor: 1_800_000n, daysPastDue: 2, riskScore: 715, maturityEpoch: 12 },
  { outstandingMinor: 1_600_000n, daysPastDue: 6, riskScore: 675, maturityEpoch: 10 },
  { outstandingMinor: 1_400_000n, daysPastDue: 11, riskScore: 745, maturityEpoch: 14 },
  { outstandingMinor: 1_300_000n, daysPastDue: 14, riskScore: 605, maturityEpoch: 9 },
  { outstandingMinor: 1_200_000n, daysPastDue: 4, riskScore: 685, maturityEpoch: 11 },
  { outstandingMinor: 1_200_000n, daysPastDue: 22, riskScore: 695, maturityEpoch: 15 },
];

export const UNDERCOLLATERALIZED_OCCUPIED_ASSETS: readonly UnsignedAttestedAssetCredential[] =
  UNDERCOLLATERALIZED_OCCUPIED_SEEDS.map((seed, index) => ({
    schemaVersion: DEMO_SCHEMA_VERSION,
    providerId: DEMO_ATTESTOR_PROVIDER_ID,
    facilityId: FACILITY_DEMO_001_ID,
    assetNonce: UNDERCOLLATERALIZED_ASSET_NONCES[index]!,
    outstandingMinor: seed.outstandingMinor,
    daysPastDue: seed.daysPastDue,
    riskScore: seed.riskScore,
    maturityEpoch: seed.maturityEpoch,
    snapshotEpoch: DEMO_CURRENT_EPOCH,
  }));

export interface DeselectedDelinquentAssetNote {
  readonly label: string;
  readonly notionalOutstandingMinor: bigint;
  readonly daysPastDue: number;
}

export const UNDERCOLLATERALIZED_DESELECTED_NOTES: readonly DeselectedDelinquentAssetNote[] = [
  { label: 'deselected-delinquent-1', notionalOutstandingMinor: 800_000n, daysPastDue: 45 },
  { label: 'deselected-delinquent-2', notionalOutstandingMinor: 700_000n, daysPastDue: 60 },
];

export const STALE_ASSETS: readonly UnsignedAttestedAssetCredential[] = ELIGIBLE_ASSETS.map((asset) => ({
  ...asset,
  snapshotEpoch: DEMO_STALE_EPOCH,
}));

export const TAMPERED_SLOT_INDEX = 0;
export const TAMPERED_ORIGINAL_OUTSTANDING_MINOR = ELIGIBLE_ASSET_SEEDS[TAMPERED_SLOT_INDEX]!.outstandingMinor;
export const TAMPERED_MUTATED_OUTSTANDING_MINOR = TAMPERED_ORIGINAL_OUTSTANDING_MINOR + 500_000n;

export const REPLAY_ASSETS: readonly UnsignedAttestedAssetCredential[] = ELIGIBLE_ASSETS;

const BASE_ASSET_FOR_VARIANTS: Omit<UnsignedAttestedAssetCredential, 'assetNonce'> = {
  schemaVersion: DEMO_SCHEMA_VERSION,
  providerId: DEMO_ATTESTOR_PROVIDER_ID,
  facilityId: FACILITY_DEMO_001_ID,
  outstandingMinor: 1_000_000n,
  daysPastDue: 5,
  riskScore: 700,
  maturityEpoch: 12,
  snapshotEpoch: DEMO_CURRENT_EPOCH,
};

export interface IneligibilityVariant {
  readonly name: string;
  readonly violatedRule:
    | 'daysPastDue'
    | 'riskScore'
    | 'maturityEpoch'
    | 'outstandingMinor'
    | 'providerId'
    | 'facilityId';
  readonly expectPass: boolean;
  readonly asset: UnsignedAttestedAssetCredential;
}

export const INELIGIBILITY_VARIANTS: readonly IneligibilityVariant[] = [
  {
    name: 'daysPastDue-at-threshold-passes',
    violatedRule: 'daysPastDue',
    expectPass: true,
    asset: { ...BASE_ASSET_FOR_VARIANTS, assetNonce: BOUNDARY_NONCES.daysPastDuePass, daysPastDue: 30 },
  },
  {
    name: 'daysPastDue-one-past-threshold-fails',
    violatedRule: 'daysPastDue',
    expectPass: false,
    asset: { ...BASE_ASSET_FOR_VARIANTS, assetNonce: BOUNDARY_NONCES.daysPastDueFail, daysPastDue: 31 },
  },
  {
    name: 'riskScore-at-threshold-passes',
    violatedRule: 'riskScore',
    expectPass: true,
    asset: { ...BASE_ASSET_FOR_VARIANTS, assetNonce: BOUNDARY_NONCES.riskScorePass, riskScore: 600 },
  },
  {
    name: 'riskScore-one-past-threshold-fails',
    violatedRule: 'riskScore',
    expectPass: false,
    asset: { ...BASE_ASSET_FOR_VARIANTS, assetNonce: BOUNDARY_NONCES.riskScoreFail, riskScore: 599 },
  },
  {
    name: 'maturityEpoch-at-threshold-passes',
    violatedRule: 'maturityEpoch',
    expectPass: true,
    asset: { ...BASE_ASSET_FOR_VARIANTS, assetNonce: BOUNDARY_NONCES.maturityEpochPass, maturityEpoch: 9 },
  },
  {
    name: 'maturityEpoch-one-past-threshold-fails',
    violatedRule: 'maturityEpoch',
    expectPass: false,
    asset: { ...BASE_ASSET_FOR_VARIANTS, assetNonce: BOUNDARY_NONCES.maturityEpochFail, maturityEpoch: 8 },
  },
  {
    name: 'outstandingMinor-one-above-zero-passes',
    violatedRule: 'outstandingMinor',
    expectPass: true,
    asset: { ...BASE_ASSET_FOR_VARIANTS, assetNonce: BOUNDARY_NONCES.outstandingMinorPass, outstandingMinor: 1n },
  },
  {
    name: 'outstandingMinor-zero-fails',
    violatedRule: 'outstandingMinor',
    expectPass: false,
    asset: { ...BASE_ASSET_FOR_VARIANTS, assetNonce: BOUNDARY_NONCES.outstandingMinorFail, outstandingMinor: 0n },
  },
  {
    name: 'wrong-provider-key-fails',
    violatedRule: 'providerId',
    expectPass: false,
    asset: { ...BASE_ASSET_FOR_VARIANTS, assetNonce: WRONG_PROVIDER_ASSET_NONCE, providerId: DEMO_WRONG_PROVIDER_ID },
  },
  {
    name: 'wrong-facility-id-fails',
    violatedRule: 'facilityId',
    expectPass: false,
    asset: {
      ...BASE_ASSET_FOR_VARIANTS,
      assetNonce: WRONG_FACILITY_ASSET_NONCE,
      facilityId: OTHER_FACILITY_DEMO_999_ID,
    },
  },
];
