import '@midnight-ntwrk/dapp-connector-api';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import type { NetworkId } from './network';

export interface ConnectedWallet {
  api: ConnectedAPI;
  unshieldedAddress: string;
  shieldedCoinPublicKey: string;
  shieldedEncryptionPublicKey: string;
}

const CHANNEL_LOST_ADVICE =
  'Your wallet extension closed its connection to this page. This usually means Lace was reloaded or updated, ' +
  'or its background worker went idle while this tab sat open. Reload this page, unlock Lace, then connect again.';

function describeError(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

function isChannelLostError(detail: string): boolean {
  const lower = detail.toLowerCase();
  return (
    lower.includes('was shutdown') ||
    lower.includes('can no longer be used') ||
    lower.includes('proxy has been released') ||
    lower.includes('extension context invalidated') ||
    lower.includes('message port closed') ||
    lower.includes('receiving end does not exist')
  );
}

function isUserRejectionError(detail: string): boolean {
  const lower = detail.toLowerCase();
  return lower.includes('reject') || lower.includes('denied') || lower.includes('declined');
}

function mentionsNetwork(detail: string): boolean {
  return detail.toLowerCase().includes('network');
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

async function requestConnection(key: string, networkId: NetworkId): Promise<ConnectedAPI> {
  const connector = window.midnight?.[key];
  if (connector === undefined || typeof connector.connect !== 'function') {
    throw new Error(`Wallet connector "${key}" is no longer available on this page.`);
  }
  return connector.connect(networkId);
}

async function connectWithRecovery(key: string, networkId: NetworkId): Promise<ConnectedAPI> {
  try {
    return await requestConnection(key, networkId);
  } catch (cause: unknown) {
    const detail = describeError(cause);
    if (isChannelLostError(detail)) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      try {
        return await requestConnection(key, networkId);
      } catch (retryCause: unknown) {
        throw new Error(`${CHANNEL_LOST_ADVICE} Wallet reported: ${describeError(retryCause)}`);
      }
    }
    if (isUserRejectionError(detail)) {
      throw new Error(
        `You declined the connection request in your wallet. Click Connect again and approve it to continue. ` +
          `Wallet reported: ${detail}`,
      );
    }
    if (mentionsNetwork(detail)) {
      throw new Error(
        `Your wallet could not connect on the "${networkId}" network. Phrim's demo contract is deployed on ` +
          `Preprod, so switch your wallet's Midnight network to Preprod and reconnect. Wallet reported: ${detail}`,
      );
    }
    throw new Error(`Your wallet refused the connection request. Wallet reported: ${detail}`);
  }
}

async function readWalletDetail<T>(read: () => Promise<T>): Promise<T> {
  try {
    return await read();
  } catch (cause: unknown) {
    const detail = describeError(cause);
    if (isChannelLostError(detail)) {
      throw new Error(`${CHANNEL_LOST_ADVICE} Wallet reported: ${detail}`);
    }
    throw cause;
  }
}

export async function connectWallet(networkId: NetworkId, preferredKey?: string): Promise<ConnectedWallet> {
  const keys = await waitForInjectedWallet(2000);
  if (keys.length === 0) {
    throw new Error(
      'No Midnight wallet detected. Install the Lace extension, enable its Midnight network, unlock it, then reload this page.',
    );
  }
  const key = preferredKey !== undefined && keys.includes(preferredKey) ? preferredKey : keys[0];
  if (key === undefined) {
    throw new Error(`No usable wallet connector among: ${keys.join(', ')}`);
  }

  const api = await connectWithRecovery(key, networkId);

  const configuration = await readWalletDetail(() => api.getConfiguration());
  if (configuration.networkId !== networkId) {
    throw new Error(
      `Wallet is connected to "${configuration.networkId}" but Phrim's demo contract is deployed on ` +
        `"${networkId}". Switch your wallet's Midnight network to ${networkId} and reconnect.`,
    );
  }

  const { unshieldedAddress } = await readWalletDetail(() => api.getUnshieldedAddress());
  const { shieldedCoinPublicKey, shieldedEncryptionPublicKey } = await readWalletDetail(() =>
    api.getShieldedAddresses(),
  );
  return { api, unshieldedAddress, shieldedCoinPublicKey, shieldedEncryptionPublicKey };
}

export async function getUnshieldedMUsdBalanceMinor(wallet: ConnectedWallet, tokenColor: string): Promise<string> {
  const balances = await readWalletDetail(() => wallet.api.getUnshieldedBalances());
  const balance = balances[tokenColor];
  return (balance ?? 0n).toString();
}
