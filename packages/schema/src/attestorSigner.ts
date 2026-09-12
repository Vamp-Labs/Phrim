import { jubjubPointX, jubjubPointY } from '@midnight-ntwrk/compact-runtime';
import { computeCredentialDigest } from './canonical.js';
import { scalarFromSeed, signDigest, type AttestorKeypair } from './schnorr.js';
import type { AttestedAssetCredential, UnsignedAttestedAssetCredential } from './types.js';

export interface CredentialSigner {
  sign(unsigned: UnsignedAttestedAssetCredential): AttestedAssetCredential;
}

export interface AttestorPublicKeyCoordinates {
  readonly x: bigint;
  readonly y: bigint;
}

export function publicKeyCoordinates(keypair: AttestorKeypair): AttestorPublicKeyCoordinates {
  return { x: jubjubPointX(keypair.publicKey), y: jubjubPointY(keypair.publicKey) };
}

export function createCredentialSigner(keypair: AttestorKeypair): CredentialSigner {
  return {
    sign(unsigned: UnsignedAttestedAssetCredential): AttestedAssetCredential {
      const digest = computeCredentialDigest(unsigned);
      const nonce = scalarFromSeed(digest);
      const signature = signDigest(digest, keypair, nonce);
      return {
        ...unsigned,
        signatureR8x: jubjubPointX(signature.announcement),
        signatureR8y: jubjubPointY(signature.announcement),
        signatureS: signature.response,
      };
    },
  };
}
