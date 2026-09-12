import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

export interface PersistedAttestorKeyFile {
  readonly providerId: number;
  readonly seedHex: string;
}

export interface LoadedAttestorKey {
  readonly providerId: number;
  readonly seed: Uint8Array;
  readonly created: boolean;
}

export function resolveDefaultKeyFilePath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, '..', '..', '..', '.keys', 'attestor.json');
}

function seedToHex(seed: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < seed.length; i += 1) {
    hex += seed[i]!.toString(16).padStart(2, '0');
  }
  return hex;
}

function seedFromHex(hex: string): Uint8Array {
  if (hex.length !== 64) {
    throw new RangeError('persisted attestor seed must be exactly 32 bytes of hex');
  }
  const seed = new Uint8Array(32);
  for (let i = 0; i < 32; i += 1) {
    seed[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return seed;
}

export class AttestorKeyStore {
  private readonly keyFilePath: string;

  private readonly providerId: number;

  constructor(keyFilePath: string, providerId: number) {
    this.keyFilePath = keyFilePath;
    this.providerId = providerId;
  }

  loadOrCreate(): LoadedAttestorKey {
    if (existsSync(this.keyFilePath)) {
      const raw = readFileSync(this.keyFilePath, 'utf8');
      const parsed = JSON.parse(raw) as PersistedAttestorKeyFile;
      if (parsed.providerId !== this.providerId) {
        throw new Error('persisted attestor key providerId does not match the configured providerId');
      }
      return { providerId: parsed.providerId, seed: seedFromHex(parsed.seedHex), created: false };
    }
    const seed = randomBytes(32);
    const record: PersistedAttestorKeyFile = { providerId: this.providerId, seedHex: seedToHex(seed) };
    mkdirSync(dirname(this.keyFilePath), { recursive: true });
    writeFileSync(this.keyFilePath, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600 });
    return { providerId: this.providerId, seed, created: true };
  }
}
