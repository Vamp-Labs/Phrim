import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AttestorKeyStore } from '../src/key.js';

let tempDir: string;

afterEach(() => {
  if (tempDir !== undefined) {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

describe('AttestorKeyStore', () => {
  it('generates a key on first load and persists it', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'phrim-key-test-'));
    const keyFilePath = join(tempDir, 'attestor.json');
    const store = new AttestorKeyStore(keyFilePath, 1);
    const first = store.loadOrCreate();
    expect(first.created).toBe(true);
    expect(first.seed.length).toBe(32);
  });

  it('returns the same seed across restarts', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'phrim-key-test-'));
    const keyFilePath = join(tempDir, 'attestor.json');
    const first = new AttestorKeyStore(keyFilePath, 1).loadOrCreate();
    const second = new AttestorKeyStore(keyFilePath, 1).loadOrCreate();
    const third = new AttestorKeyStore(keyFilePath, 1).loadOrCreate();
    expect(second.created).toBe(false);
    expect(third.created).toBe(false);
    expect(Array.from(second.seed)).toEqual(Array.from(first.seed));
    expect(Array.from(third.seed)).toEqual(Array.from(first.seed));
  });

  it('never writes the seed in plaintext outside the key file itself', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'phrim-key-test-'));
    const keyFilePath = join(tempDir, 'attestor.json');
    const { seed } = new AttestorKeyStore(keyFilePath, 1).loadOrCreate();
    const seedHex = Array.from(seed, (byte) => byte.toString(16).padStart(2, '0')).join('');
    const raw = readFileSync(keyFilePath, 'utf8');
    expect(raw).toContain(seedHex);
  });

  it('rejects a persisted key whose providerId does not match', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'phrim-key-test-'));
    const keyFilePath = join(tempDir, 'attestor.json');
    new AttestorKeyStore(keyFilePath, 1).loadOrCreate();
    expect(() => new AttestorKeyStore(keyFilePath, 2).loadOrCreate()).toThrow();
  });
});
