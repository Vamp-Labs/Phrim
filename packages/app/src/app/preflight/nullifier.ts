import { asBytes32, bindAssetNullifierCircuit, computeAssetNullifier } from 'schema';
import { phrimPureCircuits } from '@phrim/contract';
import { bytesToHex, hexToBytes } from '../midnight/hex';

export { unbindAssetNullifierCircuit } from 'schema';
export type { AssetNullifierCircuit } from 'schema';

export function bindRealAssetNullifierCircuit(): void {
  bindAssetNullifierCircuit(phrimPureCircuits);
}

export function predictAssetAlreadyUsed(
  facilityIdHex: string,
  assetNonceHexes: readonly string[],
  usedNullifierHexes: ReadonlySet<string>,
): boolean {
  const facilityId = asBytes32(hexToBytes(facilityIdHex), 'facilityId');
  const nullifierHexes: string[] = [];
  for (const assetNonceHex of assetNonceHexes) {
    try {
      const assetNonce = asBytes32(hexToBytes(assetNonceHex), 'assetNonce');
      const nullifier = computeAssetNullifier(facilityId, assetNonce);
      nullifierHexes.push(bytesToHex(nullifier));
    } catch {
      return false;
    }
  }
  if (nullifierHexes.some((nullifierHex) => usedNullifierHexes.has(nullifierHex))) {
    return true;
  }
  return new Set(nullifierHexes).size !== nullifierHexes.length;
}
