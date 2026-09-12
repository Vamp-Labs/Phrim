import { buildPhrimError } from '../errors';
import type { DrawRequestVM, ProofStage } from '../types';

const BASE_DISCLOSURE = {
  facilityIdShort: 'FACI…0001',
  epoch: 7,
  requestedMinor: '7500000',
};

function withStage(stage: ProofStage, error: DrawRequestVM['error'] = null): DrawRequestVM {
  return {
    requestedMinor: '7500000',
    publicDisclosure: BASE_DISCLOSURE,
    privateSummary: { pledgedCount: 8 },
    stage,
    error,
  };
}

export const MOCK_DRAW_REQUEST_IDLE = withStage('idle');
export const MOCK_DRAW_REQUEST_PREPARING = withStage('preparing');
export const MOCK_DRAW_REQUEST_PROVING = withStage('proving');
export const MOCK_DRAW_REQUEST_AWAITING_WALLET = withStage('awaiting-wallet');
export const MOCK_DRAW_REQUEST_SUBMITTING = withStage('submitting');
export const MOCK_DRAW_REQUEST_CONFIRMED = withStage('confirmed');
export const MOCK_DRAW_REQUEST_FAILED = withStage('failed', buildPhrimError('INSUFFICIENT_COLLATERAL'));

export const MOCK_DRAW_REQUEST_BY_STAGE: Record<ProofStage, DrawRequestVM> = {
  idle: MOCK_DRAW_REQUEST_IDLE,
  preparing: MOCK_DRAW_REQUEST_PREPARING,
  proving: MOCK_DRAW_REQUEST_PROVING,
  'awaiting-wallet': MOCK_DRAW_REQUEST_AWAITING_WALLET,
  submitting: MOCK_DRAW_REQUEST_SUBMITTING,
  confirmed: MOCK_DRAW_REQUEST_CONFIRMED,
  failed: MOCK_DRAW_REQUEST_FAILED,
};
