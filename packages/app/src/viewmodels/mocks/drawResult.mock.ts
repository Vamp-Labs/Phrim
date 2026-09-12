import { ALL_PHRIM_ERROR_CODES, buildPhrimError } from '../errors';
import type { DrawResultVM, PhrimErrorCode } from '../types';

const MOCK_CONTRACT_ADDRESS = 'mn_shield-addr_test1_MOCKCONTRACTADDRESSNOTREAL';

export const MOCK_DRAW_RESULT_FUNDED: DrawResultVM = {
  outcome: 'funded',
  amountMinor: '7500000',
  priorOutstandingMinor: '0',
  newOutstandingMinor: '7500000',
  availableCreditMinor: '12500000',
  walletBalanceMinor: '7500000',
  nullifiersConsumed: 8,
  contractAddress: MOCK_CONTRACT_ADDRESS,
  txId: 'MOCKTX0000000000000000000000000000000000000000',
  error: null,
};

function buildRejectedMock(code: PhrimErrorCode): DrawResultVM {
  return {
    outcome: 'rejected',
    amountMinor: '0',
    priorOutstandingMinor: '0',
    newOutstandingMinor: '0',
    availableCreditMinor: '20000000',
    walletBalanceMinor: '0',
    nullifiersConsumed: 0,
    contractAddress: MOCK_CONTRACT_ADDRESS,
    txId: '',
    error: buildPhrimError(code),
  };
}

export const MOCK_DRAW_RESULT_REJECTED_BY_CODE: Record<PhrimErrorCode, DrawResultVM> = Object.fromEntries(
  ALL_PHRIM_ERROR_CODES.map((code) => [code, buildRejectedMock(code)]),
) as Record<PhrimErrorCode, DrawResultVM>;

export const MOCK_DRAW_RESULT_REJECTED_INSUFFICIENT_COLLATERAL =
  MOCK_DRAW_RESULT_REJECTED_BY_CODE.INSUFFICIENT_COLLATERAL;
