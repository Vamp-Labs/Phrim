import { makeAttestorKeypair, scalarFromSeed, type AttestorKeypair } from 'schema';

export type { AttestorKeypair };

export function deriveAttestorKeypair(seed: Uint8Array): AttestorKeypair {
  return makeAttestorKeypair(scalarFromSeed(seed));
}
