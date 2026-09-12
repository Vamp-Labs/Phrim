import { describe, expect, it } from 'vitest';
import { ALL_PHRIM_ERROR_CODES, buildPhrimError, PHRIM_ERROR_TABLE } from '../src/errors.js';

describe('error table', () => {
  it('contains exactly the eleven codes from PRD §17', () => {
    expect(ALL_PHRIM_ERROR_CODES.length).toBe(11);
    expect(new Set(ALL_PHRIM_ERROR_CODES).size).toBe(11);
  });

  it('has a table entry for every code', () => {
    for (const code of ALL_PHRIM_ERROR_CODES) {
      expect(PHRIM_ERROR_TABLE[code]).toBeDefined();
    }
  });

  it('reproduces the verbatim PRD §17 message and recovery text', () => {
    expect(PHRIM_ERROR_TABLE.INVALID_SIGNATURE.message).toBe('One or more credentials are not authentic');
    expect(PHRIM_ERROR_TABLE.INVALID_SIGNATURE.recovery).toBe('Request a new signed credential batch');
    expect(PHRIM_ERROR_TABLE.INSUFFICIENT_COLLATERAL.message).toBe('Eligible collateral does not support this draw');
    expect(PHRIM_ERROR_TABLE.INSUFFICIENT_COLLATERAL.recovery).toBe('Lower the draw or add eligible assets');
    expect(PHRIM_ERROR_TABLE.ASSET_ALREADY_USED.message).toBe('One or more assets already funded a draw');
    expect(PHRIM_ERROR_TABLE.NETWORK_UNAVAILABLE.recovery).toBe('Retry or use the prepared local fallback');
  });

  it('builds a full PhrimError from a code', () => {
    const error = buildPhrimError('STALE_EPOCH');
    expect(error).toEqual({
      code: 'STALE_EPOCH',
      message: 'Credentials are from an earlier reporting period',
      recovery: 'Refresh from the servicer',
    });
  });
});
