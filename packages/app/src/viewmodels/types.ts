import type { PhrimError } from './errors';

export type ActionState = 'idle' | 'busy' | 'done' | 'error';

export type ProofStage =
  | 'idle'
  | 'preparing'
  | 'proving'
  | 'awaiting-wallet'
  | 'submitting'
  | 'confirmed'
  | 'failed';

export type ScenarioId = 'eligible' | 'undercollateralized' | 'stale' | 'tampered' | 'replay';

export type PolicyFieldKind = 'text' | 'number' | 'bps' | 'money' | 'hash';

export interface PolicyFieldVM {
  id: string;
  label: string;
  hint: string;
  value: string;
  kind: PolicyFieldKind;
  error: string | null;
}

export interface FacilitySetupVM {
  fields: PolicyFieldVM[];
  submitState: ActionState;
  vaultBalanceMinor: string | null;
}

export type SignatureStatus = 'valid' | 'invalid' | 'unchecked';

export interface CredentialRowVM {
  slot: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  occupied: boolean;
  maskedAssetRef: string;
  outstandingMinorMasked: string;
  daysPastDueMasked: string;
  riskScoreMasked: string;
  signatureStatus: SignatureStatus;
}

export interface CollateralVM {
  rows: CredentialRowVM[];
  scenario: ScenarioId;
  previewTotalMinor: string;
  previewSupportsMinor: string;
  allSignaturesValid: boolean;
}

export interface DrawPublicDisclosureVM {
  facilityIdShort: string;
  epoch: number;
  requestedMinor: string;
}

export interface DrawPrivateSummaryVM {
  pledgedCount: number;
}

export interface DrawRequestVM {
  requestedMinor: string;
  publicDisclosure: DrawPublicDisclosureVM;
  privateSummary: DrawPrivateSummaryVM;
  stage: ProofStage;
  error: PhrimError | null;
}

export type DrawOutcome = 'funded' | 'rejected';

export interface DrawResultVM {
  outcome: DrawOutcome;
  amountMinor: string;
  priorOutstandingMinor: string;
  newOutstandingMinor: string;
  availableCreditMinor: string;
  walletBalanceMinor: string;
  nullifiersConsumed: number;
  contractAddress: string;
  txId: string;
  error: PhrimError | null;
}

export type FacilityStatus = 'Active' | 'Frozen' | 'Closed';

export interface DrawReceiptVM {
  drawId: string;
  epoch: number;
  amountMinor: string;
  resultingOutstandingMinor: string;
  completed: boolean;
}

export interface HistoryVM {
  status: FacilityStatus;
  vaultMinor: string;
  outstandingMinor: string;
  capacityMinor: string;
  receipts: DrawReceiptVM[];
}

export type { PhrimError, PhrimErrorCode } from './errors';
