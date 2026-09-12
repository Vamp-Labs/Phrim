import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { PHRIM_PRIVATE_STATE_ID, type PhrimPrivateState } from '@phrim/contract';
import { createPhrimZkConfigProvider, type PhrimProvableCircuitId } from './zkConfig';
import { createPublicKeyOnlyWalletProvider, type WalletPublicKeys } from './publicKeyWalletProvider';
import { createMidnightProvider, createWalletProvider } from './walletProviderAdapter';
import type { ConnectedWallet } from './walletConnector';
import type { NetworkEndpoints } from './network';

let sessionPassword: string | null = null;

function sessionOnlyPassword(): string {
  if (sessionPassword !== null) {
    return sessionPassword;
  }
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  sessionPassword = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return sessionPassword;
}

function createPrivateStateProvider(accountId: string) {
  return levelPrivateStateProvider<typeof PHRIM_PRIVATE_STATE_ID, PhrimPrivateState>({
    privateStoragePasswordProvider: () => sessionOnlyPassword(),
    accountId,
  });
}

export type PhrimProvingProviders = Pick<
  MidnightProviders<PhrimProvableCircuitId, typeof PHRIM_PRIVATE_STATE_ID, PhrimPrivateState>,
  'privateStateProvider' | 'publicDataProvider' | 'zkConfigProvider' | 'proofProvider' | 'walletProvider'
>;

export function buildPhrimProvingProviders(
  endpoints: NetworkEndpoints,
  originUrl: string,
  accountId: string,
  walletKeys: WalletPublicKeys,
): PhrimProvingProviders {
  const zkConfigProvider = createPhrimZkConfigProvider(originUrl);
  return {
    privateStateProvider: createPrivateStateProvider(accountId),
    publicDataProvider: indexerPublicDataProvider(endpoints.indexerUrl, endpoints.indexerWsUrl),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(endpoints.proofServerUrl, zkConfigProvider),
    walletProvider: createPublicKeyOnlyWalletProvider(walletKeys),
  };
}

export type PhrimMainThreadProviders = MidnightProviders<
  PhrimProvableCircuitId,
  typeof PHRIM_PRIVATE_STATE_ID,
  PhrimPrivateState
>;

export function buildPhrimMainThreadProviders(
  endpoints: NetworkEndpoints,
  originUrl: string,
  wallet: ConnectedWallet,
): PhrimMainThreadProviders {
  const zkConfigProvider = createPhrimZkConfigProvider(originUrl);
  return {
    privateStateProvider: createPrivateStateProvider(wallet.unshieldedAddress),
    publicDataProvider: indexerPublicDataProvider(endpoints.indexerUrl, endpoints.indexerWsUrl),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(endpoints.proofServerUrl, zkConfigProvider),
    walletProvider: createWalletProvider(wallet),
    midnightProvider: createMidnightProvider(wallet),
  };
}
