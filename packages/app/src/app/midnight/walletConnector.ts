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

export async function connectWallet(networkId: NetworkId, preferredKey?: string): Promise<ConnectedWallet> {
  const midnight = window.midnight;
  if (midnight === undefined) {
    throw new Error('NETWORK_UNAVAILABLE');
  }
  const keys = listInjectedWalletKeys();
  const key = preferredKey !== undefined && keys.includes(preferredKey) ? preferredKey : keys[0];
  if (key === undefined) {
    throw new Error('NETWORK_UNAVAILABLE');
  }
  const initialApi = midnight[key];
  if (initialApi === undefined) {
    throw new Error('NETWORK_UNAVAILABLE');
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
