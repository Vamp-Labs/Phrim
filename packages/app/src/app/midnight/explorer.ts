import type { PhrimNetworkId } from '@phrim/contract';

const EXPLORER_BASE_BY_NETWORK: Record<PhrimNetworkId, string | null> = {
  undeployed: null,
  preprod: 'https://preprod.midnightexplorer.com',
};

export function contractExplorerUrl(networkId: PhrimNetworkId, contractAddress: string): string | null {
  const base = EXPLORER_BASE_BY_NETWORK[networkId];
  if (base === null || contractAddress.length === 0) {
    return null;
  }
  return `${base}/contracts/${contractAddress}`;
}
