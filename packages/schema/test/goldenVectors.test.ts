import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { phrimPureCircuits } from '@phrim/contract';
import { bindPhrimPureCircuits } from '../src/wireContract.js';
import { hexToBytes } from '../src/bytes.js';
import { computeAssetNullifier } from '../src/nullifier.js';
import { computeCredentialDigest } from '../src/canonical.js';
import { credentialFromJson, type AttestedAssetCredentialJson } from '../src/types.js';

const here = dirname(fileURLToPath(import.meta.url));
const vectorsDir = join(here, 'vectors');

const SCENARIO_IDS = ['eligible', 'undercollateralized', 'stale', 'tampered', 'replay'] as const;

interface VectorFile {
  scenarioId: string;
  expectedOutcome: 'funded' | 'rejected';
  expectedErrorCode: string | null;
  credentials: Array<{
    input: AttestedAssetCredentialJson;
    canonicalWordsHex: string[];
    credentialDigestHex: string;
    nullifierPreimageWordsHex: string[];
    nullifierHex: string;
    signatureExpectedValid: boolean;
  }>;
}

function loadVector(scenarioId: string): VectorFile {
  return JSON.parse(readFileSync(join(vectorsDir, `${scenarioId}.json`), 'utf8')) as VectorFile;
}

beforeAll(() => {
  bindPhrimPureCircuits(phrimPureCircuits);
});

describe('golden vectors (R8)', () => {
  it('exist for every scenario', () => {
    for (const id of SCENARIO_IDS) {
      expect(() => loadVector(id)).not.toThrow();
    }
  });

  it('reproduce their own recorded credentialDigest and nullifier when recomputed from the input', () => {
    for (const id of SCENARIO_IDS) {
      const vector = loadVector(id);
      for (const entry of vector.credentials) {
        const credential = credentialFromJson(entry.input);
        const digest = computeCredentialDigest(credential);
        expect(Buffer.from(digest).toString('hex')).toBe(entry.credentialDigestHex);
        const nullifier = computeAssetNullifier(credential.facilityId, credential.assetNonce);
        expect(Buffer.from(nullifier).toString('hex')).toBe(entry.nullifierHex);
      }
    }
  });

  it('carry canonical words that are exactly ten 32-byte hex words', () => {
    for (const id of SCENARIO_IDS) {
      const vector = loadVector(id);
      for (const entry of vector.credentials) {
        expect(entry.canonicalWordsHex.length).toBe(10);
        for (const word of entry.canonicalWordsHex) {
          expect(hexToBytes(word).length).toBe(32);
        }
      }
    }
  });

  it('flag exactly one credential as signature-invalid, in the tampered scenario only', () => {
    for (const id of SCENARIO_IDS) {
      const vector = loadVector(id);
      const invalidCount = vector.credentials.filter((c) => !c.signatureExpectedValid).length;
      if (id === 'tampered') {
        expect(invalidCount).toBe(1);
      } else {
        expect(invalidCount).toBe(0);
      }
    }
  });

  it('eligible and replay are byte-identical vectors', () => {
    const eligible = loadVector('eligible');
    const replay = loadVector('replay');
    expect(replay.credentials.map((c) => c.input)).toEqual(eligible.credentials.map((c) => c.input));
  });

  it('undercollateralized carries six credentials with fresh nullifiers not present in eligible', () => {
    const eligible = loadVector('eligible');
    const under = loadVector('undercollateralized');
    expect(under.credentials.length).toBe(6);
    const eligibleNullifiers = new Set(eligible.credentials.map((c) => c.nullifierHex));
    for (const credential of under.credentials) {
      expect(eligibleNullifiers.has(credential.nullifierHex)).toBe(false);
    }
  });
});
