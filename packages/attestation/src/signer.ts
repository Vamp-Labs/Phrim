import { createCredentialSigner, publicKeyCoordinates, type AttestedAssetCredential, type UnsignedAttestedAssetCredential } from 'schema';
import { deriveAttestorKeypair } from './keypair.js';

export interface AttestorSigner {
  publicKey(): { x: bigint; y: bigint };
  sign(unsigned: UnsignedAttestedAssetCredential): AttestedAssetCredential;
}

export function createAttestorSigner(seed: Uint8Array): AttestorSigner {
  const keypair = deriveAttestorKeypair(seed);
  const credentialSigner = createCredentialSigner(keypair);
  return {
    publicKey: () => publicKeyCoordinates(keypair),
    sign: (unsigned) => credentialSigner.sign(unsigned),
  };
}
