import { bindCredentialDigestCircuit, type CredentialDigestCircuit } from './canonical.js';
import { bindAssetNullifierCircuit, type AssetNullifierCircuit } from './nullifier.js';
import { bindComputeChallenge1Circuit, type ComputeChallenge1Circuit } from './schnorr.js';

export type PhrimPureCircuits = CredentialDigestCircuit & AssetNullifierCircuit & ComputeChallenge1Circuit;

export function bindPhrimPureCircuits(circuits: PhrimPureCircuits): void {
  bindCredentialDigestCircuit(circuits);
  bindAssetNullifierCircuit(circuits);
  bindComputeChallenge1Circuit(circuits);
}
