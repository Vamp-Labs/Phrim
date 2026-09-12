import { describe, expect, it } from 'vitest';
import { nextDrawStage } from '../../src/app/state/drawStageMachine';

describe('draw stage machine', () => {
  it('walks the full happy path in order', () => {
    let stage = nextDrawStage('idle', { type: 'SUBMIT' });
    expect(stage).toBe('preparing');
    stage = nextDrawStage(stage, { type: 'WITNESS_READY' });
    expect(stage).toBe('proving');
    stage = nextDrawStage(stage, { type: 'PROVEN' });
    expect(stage).toBe('awaiting-wallet');
    stage = nextDrawStage(stage, { type: 'WALLET_APPROVED' });
    expect(stage).toBe('submitting');
    stage = nextDrawStage(stage, { type: 'CONFIRMED' });
    expect(stage).toBe('confirmed');
  });

  it('moves to failed from any in-flight stage on FAILED', () => {
    expect(nextDrawStage('preparing', { type: 'FAILED' })).toBe('failed');
    expect(nextDrawStage('proving', { type: 'FAILED' })).toBe('failed');
    expect(nextDrawStage('awaiting-wallet', { type: 'FAILED' })).toBe('failed');
    expect(nextDrawStage('submitting', { type: 'FAILED' })).toBe('failed');
  });

  it('ignores an event that has no transition for the current stage', () => {
    expect(nextDrawStage('idle', { type: 'CONFIRMED' })).toBe('idle');
    expect(nextDrawStage('confirmed', { type: 'SUBMIT' })).toBe('confirmed');
  });

  it('resets terminal stages back to idle', () => {
    expect(nextDrawStage('confirmed', { type: 'RESET' })).toBe('idle');
    expect(nextDrawStage('failed', { type: 'RESET' })).toBe('idle');
  });
});
