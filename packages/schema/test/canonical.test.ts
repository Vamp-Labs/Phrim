import { describe, expect, it } from 'vitest';
import { buildCanonicalWords, CANONICAL_WORD_COUNT, CANONICAL_WORD_LENGTH } from '../src/canonical.js';
import type { Bytes32 } from '../src/types.js';
import { ELIGIBLE_ASSETS } from '../src/fixtures/assets.js';

const sample = ELIGIBLE_ASSETS[0]!;

describe('canonical serialiser', () => {
  it('produces exactly ten 32-byte words', () => {
    const words = buildCanonicalWords(sample);
    expect(words.length).toBe(CANONICAL_WORD_COUNT);
    for (const word of words) {
      expect(word.length).toBe(CANONICAL_WORD_LENGTH);
    }
  });

  it('rejects a schemaVersion other than 1', () => {
    expect(() => buildCanonicalWords({ ...sample, schemaVersion: 2 })).toThrow();
  });

  it('rejects outstandingMinor exceeding Uint64', () => {
    expect(() => buildCanonicalWords({ ...sample, outstandingMinor: 2n ** 64n })).toThrow();
  });

  it('rejects a negative outstandingMinor', () => {
    expect(() => buildCanonicalWords({ ...sample, outstandingMinor: -1n })).toThrow();
  });

  it('rejects daysPastDue exceeding Uint16', () => {
    expect(() => buildCanonicalWords({ ...sample, daysPastDue: 2 ** 16 })).toThrow();
  });

  it('rejects riskScore exceeding Uint16', () => {
    expect(() => buildCanonicalWords({ ...sample, riskScore: 2 ** 16 })).toThrow();
  });

  it('rejects a facilityId that is not exactly 32 bytes', () => {
    const shortFacilityId = new Uint8Array(31) as unknown as Bytes32;
    expect(() => buildCanonicalWords({ ...sample, facilityId: shortFacilityId })).toThrow();
  });

  it('never truncates: the ten-word preimage changes when any field changes', () => {
    const base = buildCanonicalWords(sample);
    const mutated = buildCanonicalWords({ ...sample, outstandingMinor: sample.outstandingMinor + 1n });
    expect(mutated[5]).not.toEqual(base[5]);
  });

  it('zero-extends numeric words little-endian, matching the compiled circuit\'s native Uint<N> as Bytes<32> cast (SCHEMA-LOCK §4.5.1)', () => {
    const words = buildCanonicalWords({ ...sample, providerId: 0x0102 });
    const providerIdWord = words[2];
    expect(providerIdWord[0]).toBe(0x02);
    expect(providerIdWord[1]).toBe(0x01);
    for (let i = 2; i < CANONICAL_WORD_LENGTH; i += 1) {
      expect(providerIdWord[i]).toBe(0);
    }
  });
});
