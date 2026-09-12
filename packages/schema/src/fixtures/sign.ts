import { buildCredentialBatch, type AttestedAssetCredential, type CredentialBatch, type UnsignedAttestedAssetCredential } from '../types.js';
import type { UnsignedScenarioFixture } from './scenarios.js';

export interface FixtureSigner {
  sign(unsigned: UnsignedAttestedAssetCredential): AttestedAssetCredential;
}

let boundFixtureSigner: FixtureSigner | null = null;

export function bindFixtureSigner(signer: FixtureSigner): void {
  boundFixtureSigner = signer;
}

export function unbindFixtureSigner(): void {
  boundFixtureSigner = null;
}

export function materializeScenarioBatch(scenario: UnsignedScenarioFixture): CredentialBatch {
  if (boundFixtureSigner === null) {
    throw new Error(
      'PENDING_SCHEMA_LOCK: fixture signer is not bound. Call bindFixtureSigner(signer) once R6 ' +
        '(the Schnorr-over-Jubjub signer built against docs/handoffs/SCHEMA-LOCK.md) ships.',
    );
  }
  const signer = boundFixtureSigner;
  const signedOccupied = scenario.occupiedAssets.map((asset) => signer.sign(asset));
  const submitted =
    scenario.tamperedField === null
      ? signedOccupied
      : signedOccupied.map((credential, index) => {
          if (index !== scenario.tamperedField!.slotIndex) {
            return credential;
          }
          return { ...credential, outstandingMinor: scenario.tamperedField!.outstandingMinor };
        });
  return buildCredentialBatch(submitted);
}
