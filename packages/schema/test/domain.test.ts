import { describe, expect, it } from 'vitest';
import { DOMAIN_SEPARATORS, DS_ASSET_NULLIFIER } from '../src/domain.js';

describe('domain separators', () => {
  it('matches the frozen ASCII byte lengths from 00-overview.md §5.2', () => {
    expect(DOMAIN_SEPARATORS.DS_CREDENTIAL.asciiByteLength).toBe(19);
    expect(DOMAIN_SEPARATORS.DS_ASSET_NULLIFIER.asciiByteLength).toBe(24);
    expect(DOMAIN_SEPARATORS.DS_AUTHORITY.asciiByteLength).toBe(18);
    expect(DOMAIN_SEPARATORS.DS_DRAW_ID.asciiByteLength).toBe(16);
  });

  it('pads every separator to exactly 32 bytes', () => {
    for (const separator of Object.values(DOMAIN_SEPARATORS)) {
      expect(separator.padded.length).toBe(32);
    }
  });

  it('spells DS_ASSET_NULLIFIER exactly as quoted from PRD §14.2 Stage 2.6', () => {
    expect(DS_ASSET_NULLIFIER.ascii).toBe('phrim:asset-nullifier:v1');
  });

  it('right-pads ASCII bytes first, zero bytes after', () => {
    const separator = DOMAIN_SEPARATORS.DS_AUTHORITY;
    const asciiBytes = new TextEncoder().encode(separator.ascii);
    for (let i = 0; i < asciiBytes.length; i += 1) {
      expect(separator.padded[i]).toBe(asciiBytes[i]);
    }
    for (let i = asciiBytes.length; i < 32; i += 1) {
      expect(separator.padded[i]).toBe(0);
    }
  });
});
