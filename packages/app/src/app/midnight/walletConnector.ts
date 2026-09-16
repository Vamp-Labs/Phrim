import '@midnight-ntwrk/dapp-connector-api';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import type { NetworkId } from './network';

export interface ConnectedWallet {
  api: ConnectedAPI;
  unshieldedAddress: string;
  shieldedCoinPublicKey: string;
  shieldedEncryptionPublicKey: string;
}

function listInjectedWalletKeys(): string[] {
  const midnight = window.midnight;
  if (midnight === undefined) {
    return [];
  }
  return Object.keys(midnight);
}

async function waitForInjectedWallet(timeoutMs: number): Promise<string[]> {
  const deadline = Date.now() + timeoutMs;
  let keys = listInjectedWalletKeys();
  while (keys.length === 0 && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    keys = listInjectedWalletKeys();
  }
  return keys;
}

export async function connectWallet(networkId: NetworkId, preferredKey?: string): Promise<ConnectedWallet> {
  const keys = await waitForInjectedWallet(2000);
  if (keys.length === 0) {
    throw new Error(
      'No Midnight wallet detected. Install the Lace extension, enable its Midnight network, unlock it, then reload this page.',
    );
  }
  const midnight = window.midnight;
  if (midnight === undefined) {
    throw new Error('No Midnight wallet detected after injection check.');
  }
  const key = preferredKey !== undefined && keys.includes(preferredKey) ? preferredKey : keys[0];
  if (key === undefined) {
    throw new Error(`No usable wallet connector among: ${keys.join(', ')}`);
  }
  const initialApi = midnight[key];
  if (initialApi === undefined) {
    throw new Error(`Wallet connector "${key}" is present but exposes no API.`);
  }
  if (typeof initialApi.connect !== 'function') {
    throw new Error(
      `Wallet connector "${key}" has no connect() method; found: ${Object.keys(initialApi).join(', ')}`,
    );
  }
  const api = await initialApi.connect(networkId);
  const { unshieldedAddress } = await api.getUnshieldedAddress();
  const { shieldedCoinPublicKey, shieldedEncryptionPublicKey } = await api.getShieldedAddresses();
  return { api, unshieldedAddress, shieldedCoinPublicKey, shieldedEncryptionPublicKey };
}

export async function getUnshieldedMUsdBalanceMinor(wallet: ConnectedWallet, tokenColor: string): Promise<string> {
  const balances = await wallet.api.getUnshieldedBalances();
  const balance = balances[tokenColor];
  return (balance ?? 0n).toString();
}
