import type { PhrimNetworkId } from '@phrim/contract';

export const PHRIM_CONTRACT_ADDRESSES: Record<PhrimNetworkId, string | null> = {
  undeployed: null,
  preprod: 'f64afd02c9ec83f9121d1c01850bb91d71b57fc73e56e17e68620931c0a748df',
};

export function getConfiguredContractAddress(networkId: PhrimNetworkId): string | null {
  return PHRIM_CONTRACT_ADDRESSES[networkId];
}

export function isContractDeployed(networkId: PhrimNetworkId): boolean {
  return getConfiguredContractAddress(networkId) !== null;
}
