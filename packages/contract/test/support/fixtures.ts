import { pureCircuits } from '../../managed/phrim/contract/index.js';
import { makeAttestorKeypair } from './sign.js';

export const DEMO_ATTESTOR = makeAttestorKeypair(42n);
export const WRONG_ATTESTOR = makeAttestorKeypair(11n);

export const DEMO_PROVIDER_ID = 1n;
export const DEMO_CREDIT_LIMIT = 20_000_000n;
export const DEMO_ADVANCE_RATE_BPS = 8000n;
export const DEMO_MAX_DAYS_PAST_DUE = 30n;
export const DEMO_MIN_RISK_SCORE = 600n;
export const DEMO_MIN_REMAINING_EPOCHS = 2n;
export const DEMO_CURRENT_EPOCH = 7n;
export const DEMO_VAULT_FUNDING = 15_000_000n;
export const DEMO_DRAW_AMOUNT = 7_500_000n;
export const DEMO_SCHEMA_VERSION = 1n;

function bytes32(seed: number): Uint8Array {
  const out = new Uint8Array(32);
  out[31] = seed & 0xff;
  out[30] = (seed >> 8) & 0xff;
  return out;
}

export function facilityIdBytes(seed = 1): Uint8Array {
  return bytes32(1000 + seed);
}

export function assetNonceBytes(seed: number): Uint8Array {
  return bytes32(2000 + seed);
}

export function secretBytes(seed: number): Uint8Array {
  return bytes32(3000 + seed);
}

export function tokenColorBytes(): Uint8Array {
  return bytes32(4000);
}

export function userAddress(seed: number): { bytes: Uint8Array } {
  return { bytes: bytes32(5000 + seed) };
}

export function borrowerAuthorityHashFor(secret: Uint8Array): Uint8Array {
  return pureCircuits.deriveAuthorityHash(secret);
}

export const DEMO_BORROWER_SECRET = secretBytes(1);
export const DEMO_LENDER_SECRET = secretBytes(2);
export const WRONG_SECRET = secretBytes(99);
