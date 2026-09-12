import type { PhrimNetworkId } from '@phrim/contract';

export const PHRIM_CONTRACT_ADDRESSES: Record<PhrimNetworkId, string | null> = {
  undeployed: null,
  preprod: null,
};

export function getConfiguredContractAddress(networkId: PhrimNetworkId): string | null {
  return PHRIM_CONTRACT_ADDRESSES[networkId];
}

export function isContractDeployed(networkId: PhrimNetworkId): boolean {
  return getConfiguredContractAddress(networkId) !== null;
}
