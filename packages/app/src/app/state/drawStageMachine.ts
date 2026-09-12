import type { ProofStage } from '../../viewmodels/types';

export type DrawStageEvent =
  | { type: 'SUBMIT' }
  | { type: 'WITNESS_READY' }
  | { type: 'PROVEN' }
  | { type: 'WALLET_APPROVED' }
  | { type: 'SUBMITTED' }
  | { type: 'CONFIRMED' }
  | { type: 'FAILED' }
  | { type: 'RESET' };

const TRANSITIONS: Record<ProofStage, Partial<Record<DrawStageEvent['type'], ProofStage>>> = {
  idle: { SUBMIT: 'preparing' },
  preparing: { WITNESS_READY: 'proving', FAILED: 'failed' },
  proving: { PROVEN: 'awaiting-wallet', FAILED: 'failed' },
  'awaiting-wallet': { WALLET_APPROVED: 'submitting', FAILED: 'failed' },
  submitting: { SUBMITTED: 'submitting', CONFIRMED: 'confirmed', FAILED: 'failed' },
  confirmed: { RESET: 'idle' },
  failed: { RESET: 'idle' },
};

export function nextDrawStage(current: ProofStage, event: DrawStageEvent): ProofStage {
  return TRANSITIONS[current][event.type] ?? current;
}
