// TEMPORARY — returns view-model mocks until R3/R6/R7 real wiring lands; delete once each route reads live state
import {
  MOCK_COLLATERAL_ELIGIBLE,
  MOCK_DRAW_REQUEST_IDLE,
  MOCK_DRAW_RESULT_FUNDED,
  MOCK_FACILITY_SETUP_IDLE,
  MOCK_HISTORY_EMPTY,
} from '../../viewmodels/mocks';
import type { CollateralVM, DrawRequestVM, DrawResultVM, FacilitySetupVM, HistoryVM } from '../../viewmodels/types';

export function readFacilitySetupState(): FacilitySetupVM {
  return MOCK_FACILITY_SETUP_IDLE;
}

export function readCollateralState(): CollateralVM {
  return MOCK_COLLATERAL_ELIGIBLE;
}

export function readDrawRequestState(): DrawRequestVM {
  return MOCK_DRAW_REQUEST_IDLE;
}

export function readDrawResultState(): DrawResultVM {
  return MOCK_DRAW_RESULT_FUNDED;
}

export function readHistoryState(): HistoryVM {
  return MOCK_HISTORY_EMPTY;
}
