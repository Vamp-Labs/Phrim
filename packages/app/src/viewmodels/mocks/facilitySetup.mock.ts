import type { ActionState, FacilitySetupVM, PolicyFieldVM } from '../types';

export const MOCK_POLICY_FIELDS: PolicyFieldVM[] = [
  {
    id: 'facilityId',
    label: 'Facility identifier',
    hint: 'Unique label for this credit facility',
    value: 'FACILITY_DEMO_001',
    kind: 'text',
    error: null,
  },
  {
    id: 'borrowerAuthorityHash',
    label: 'Borrower authority hash',
    hint: 'Hash commitment of the borrower authorization credential',
    value: '',
    kind: 'hash',
    error: null,
  },
  {
    id: 'attestorProviderIdAndKey',
    label: 'Provider identifier and public verification key',
    hint: 'Registered servicer identifier and its signature verification key',
    value: '1',
    kind: 'hash',
    error: null,
  },
  {
    id: 'creditLimit',
    label: 'Credit limit ($)',
    hint: 'Maximum allowable facility debt',
    value: '20000000',
    kind: 'money',
    error: null,
  },
  {
    id: 'advanceRateBps',
    label: 'Advance rate (bps)',
    hint: 'Haircut multiplier, e.g. 8000 = 80.00%',
    value: '8000',
    kind: 'bps',
    error: null,
  },
  {
    id: 'maxDaysPastDue',
    label: 'Maximum days past due cutoff',
    hint: 'Receivables overdue past this threshold are ineligible',
    value: '30',
    kind: 'number',
    error: null,
  },
  {
    id: 'minRiskScore',
    label: 'Minimum acceptable credit risk score',
    hint: 'Receivables below this score are ineligible',
    value: '600',
    kind: 'number',
    error: null,
  },
  {
    id: 'minRemainingEpochs',
    label: 'Minimum remaining term (epochs)',
    hint: 'Minimum remaining duration before asset maturity',
    value: '2',
    kind: 'number',
    error: null,
  },
  {
    id: 'currentEpoch',
    label: 'Active snapshot epoch',
    hint: 'Active reporting cycle counter',
    value: '7',
    kind: 'number',
    error: null,
  },
  {
    id: 'tokenColorAndVaultFunding',
    label: 'Token color and vault funding deposit',
    hint: 'Contract-derived mUSD token color and the initial vault deposit',
    value: '15000000',
    kind: 'money',
    error: null,
  },
];

function withSubmitState(submitState: ActionState, vaultBalanceMinor: string | null): FacilitySetupVM {
  return {
    fields: MOCK_POLICY_FIELDS,
    submitState,
    vaultBalanceMinor,
  };
}

export const MOCK_FACILITY_SETUP_IDLE = withSubmitState('idle', null);
export const MOCK_FACILITY_SETUP_BUSY = withSubmitState('busy', null);
export const MOCK_FACILITY_SETUP_DONE = withSubmitState('done', '15000000');
export const MOCK_FACILITY_SETUP_ERROR = withSubmitState('error', null);

export const MOCK_FACILITY_SETUP_BY_STATE: Record<ActionState, FacilitySetupVM> = {
  idle: MOCK_FACILITY_SETUP_IDLE,
  busy: MOCK_FACILITY_SETUP_BUSY,
  done: MOCK_FACILITY_SETUP_DONE,
  error: MOCK_FACILITY_SETUP_ERROR,
};
