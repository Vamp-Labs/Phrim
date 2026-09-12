import { DS_ASSET_NULLIFIER } from './domain.js';
import { asBytes32, type Bytes32 } from './types.js';

export const NULLIFIER_PREIMAGE_WORD_LENGTH = 32;
export const NULLIFIER_PREIMAGE_WORD_COUNT = 3;

export type NullifierPreimageWords = readonly [Bytes32, Bytes32, Bytes32];

export function buildNullifierPreimageWords(facilityId: Bytes32, assetNonce: Bytes32): NullifierPreimageWords {
  const words: Bytes32[] = [
    asBytes32(DS_ASSET_NULLIFIER.padded, 'DS_ASSET_NULLIFIER'),
    asBytes32(facilityId, 'facilityId'),
    asBytes32(assetNonce, 'assetNonce'),
  ];
  if (words.length !== NULLIFIER_PREIMAGE_WORD_COUNT) {
    throw new Error('internal: nullifier preimage must contain exactly three words');
  }
  for (const word of words) {
    if (word.length !== NULLIFIER_PREIMAGE_WORD_LENGTH) {
      throw new Error('internal: every nullifier preimage word must be exactly 32 bytes');
    }
  }
  return words as unknown as NullifierPreimageWords;
}

export interface AssetNullifierCircuit {
  assetNullifier(facilityId: Uint8Array, assetNonce: Uint8Array): Uint8Array;
}

let boundAssetNullifierCircuit: AssetNullifierCircuit | null = null;

export function bindAssetNullifierCircuit(circuit: AssetNullifierCircuit): void {
  boundAssetNullifierCircuit = circuit;
}

export function unbindAssetNullifierCircuit(): void {
  boundAssetNullifierCircuit = null;
}

export function computeAssetNullifier(facilityId: Bytes32, assetNonce: Bytes32): Bytes32 {
  buildNullifierPreimageWords(facilityId, assetNonce);
  if (boundAssetNullifierCircuit === null) {
    throw new Error(
      'PENDING_SCHEMA_LOCK: assetNullifier pure circuit is not bound. ' +
        'Call bindAssetNullifierCircuit(pureCircuits) with the compiled contract from packages/contract once Role 01 ships it.',
    );
  }
  const nullifier = boundAssetNullifierCircuit.assetNullifier(facilityId, assetNonce);
  return asBytes32(nullifier, 'assetNullifier');
}
