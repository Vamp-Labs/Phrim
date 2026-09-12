import { ecMulGenerator, jubjubPointX, jubjubPointY, degradeToTransient, type JubjubPoint } from '@midnight-ntwrk/compact-runtime';
import type { Bytes32 } from './types.js';

export type { JubjubPoint };

export const JUBJUB_SCALAR_FIELD_ORDER = 6554484396890773809930967563523245729705921265872317281365359162392183254199n;

const CHALLENGE_REMAINDER_MODULUS = 1n << 248n;
const CHALLENGE_QUOTIENT_BOUND = 116n;

export interface AttestorKeypair {
  readonly secretKey: bigint;
  readonly publicKey: JubjubPoint;
}

export interface SchnorrSignature {
  readonly announcement: JubjubPoint;
  readonly response: bigint;
}

export function makeAttestorKeypair(secretKey: bigint): AttestorKeypair {
  return { secretKey, publicKey: ecMulGenerator(secretKey) };
}

export function scalarFromSeed(seed: Uint8Array): bigint {
  if (seed.length !== 32) {
    throw new RangeError(`a Jubjub scalar seed must be exactly 32 bytes, got ${seed.length}`);
  }
  let value = 0n;
  for (let i = 0; i < seed.length; i += 1) {
    value = (value << 8n) | BigInt(seed[i]!);
  }
  const reduced = value % JUBJUB_SCALAR_FIELD_ORDER;
  return reduced === 0n ? 1n : reduced;
}

export interface ComputeChallenge1Circuit {
  computeChallenge1(annX: bigint, annY: bigint, pkX: bigint, pkY: bigint, msg: readonly bigint[]): bigint;
}

let boundComputeChallenge1Circuit: ComputeChallenge1Circuit | null = null;

export function bindComputeChallenge1Circuit(circuit: ComputeChallenge1Circuit): void {
  boundComputeChallenge1Circuit = circuit;
}

export function unbindComputeChallenge1Circuit(): void {
  boundComputeChallenge1Circuit = null;
}

export function isComputeChallenge1CircuitBound(): boolean {
  return boundComputeChallenge1Circuit !== null;
}

export class UnluckySchnorrNonceError extends Error {
  constructor() {
    super('unlucky nonce produced an out-of-range Schnorr quotient; choose a different nonce');
    this.name = 'UnluckySchnorrNonceError';
  }
}

export function signDigest(digest: Bytes32, keypair: AttestorKeypair, nonce: bigint): SchnorrSignature {
  if (boundComputeChallenge1Circuit === null) {
    throw new Error(
      'PENDING_SCHEMA_LOCK: computeChallenge1 pure circuit is not bound. Call bindComputeChallenge1Circuit ' +
        'with pureCircuits from packages/contract.',
    );
  }
  const announcement = ecMulGenerator(nonce);
  const msgField = degradeToTransient(digest);
  const challenge = boundComputeChallenge1Circuit.computeChallenge1(
    jubjubPointX(announcement),
    jubjubPointY(announcement),
    jubjubPointX(keypair.publicKey),
    jubjubPointY(keypair.publicKey),
    [msgField],
  );
  const quotient = challenge / CHALLENGE_REMAINDER_MODULUS;
  if (quotient >= CHALLENGE_QUOTIENT_BOUND) {
    throw new UnluckySchnorrNonceError();
  }
  const remainder = challenge % CHALLENGE_REMAINDER_MODULUS;
  const response = (nonce + remainder * keypair.secretKey) % JUBJUB_SCALAR_FIELD_ORDER;
  return { announcement, response };
}
