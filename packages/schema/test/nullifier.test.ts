import { describe, expect, it } from 'vitest';
import { bytesToHex } from '../src/bytes.js';
import { DOMAIN_SEPARATORS } from '../src/domain.js';
import { buildNullifierPreimageWords, NULLIFIER_PREIMAGE_WORD_COUNT, NULLIFIER_PREIMAGE_WORD_LENGTH } from '../src/nullifier.js';
import { FACILITY_DEMO_001_ID } from '../src/fixtures/constants.js';
import { ELIGIBLE_ASSETS } from '../src/fixtures/assets.js';

describe('nullifier preimage', () => {
  it('produces exactly three 32-byte words', () => {
    const words = buildNullifierPreimageWords(FACILITY_DEMO_001_ID, ELIGIBLE_ASSETS[0]!.assetNonce);
    expect(words.length).toBe(NULLIFIER_PREIMAGE_WORD_COUNT);
    for (const word of words) {
      expect(word.length).toBe(NULLIFIER_PREIMAGE_WORD_LENGTH);
    }
  });

  it('orders the preimage as DS_ASSET_NULLIFIER, facilityId, assetNonce', () => {
    const words = buildNullifierPreimageWords(FACILITY_DEMO_001_ID, ELIGIBLE_ASSETS[0]!.assetNonce);
    expect(bytesToHex(words[0])).toBe(bytesToHex(DOMAIN_SEPARATORS.DS_ASSET_NULLIFIER.padded));
    expect(bytesToHex(words[1])).toBe(bytesToHex(FACILITY_DEMO_001_ID));
    expect(bytesToHex(words[2])).toBe(bytesToHex(ELIGIBLE_ASSETS[0]!.assetNonce));
  });

  it('takes facilityId from the caller-supplied ledger value, not from the credential', () => {
    const wordsA = buildNullifierPreimageWords(FACILITY_DEMO_001_ID, ELIGIBLE_ASSETS[0]!.assetNonce);
    const wordsB = buildNullifierPreimageWords(ELIGIBLE_ASSETS[1]!.assetNonce, ELIGIBLE_ASSETS[0]!.assetNonce);
    expect(bytesToHex(wordsA[1])).not.toBe(bytesToHex(wordsB[1]));
  });
});
