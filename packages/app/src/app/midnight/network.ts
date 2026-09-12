export type NetworkId = 'undeployed' | 'preview' | 'preprod' | 'mainnet';

export interface NetworkEndpoints {
  networkId: NetworkId;
  nodeRpcUrl: string;
  indexerUrl: string;
  indexerWsUrl: string;
  proofServerUrl: string;
}

const LOCAL_ENDPOINTS: NetworkEndpoints = {
  networkId: 'undeployed',
  nodeRpcUrl: 'http://localhost:9944',
  indexerUrl: 'http://localhost:8088/api/v4/graphql',
  indexerWsUrl: 'ws://localhost:8088/api/v4/graphql/ws',
  proofServerUrl: 'http://localhost:6300',
};

const PREPROD_ENDPOINTS: NetworkEndpoints = {
  networkId: 'preprod',
  nodeRpcUrl: 'https://rpc.preprod.midnight.network',
  indexerUrl: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWsUrl: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  proofServerUrl: 'http://localhost:6300',
};

const ENDPOINTS_BY_NETWORK: Record<NetworkId, NetworkEndpoints | null> = {
  undeployed: LOCAL_ENDPOINTS,
  preview: null,
  preprod: PREPROD_ENDPOINTS,
  mainnet: null,
};

export function resolveNetworkEndpoints(networkId: NetworkId): NetworkEndpoints {
  const endpoints = ENDPOINTS_BY_NETWORK[networkId];
  if (endpoints === null) {
    throw new Error(`no endpoint configuration recorded for network "${networkId}"`);
  }
  return endpoints;
}

export function defaultNetworkId(mode: string): NetworkId {
  return mode === 'local' ? 'undeployed' : 'preprod';
}
