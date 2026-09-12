import type { CoinPublicKey, EncPublicKey, FinalizedTransaction } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { UnboundTransaction, WalletProvider } from '@midnight-ntwrk/midnight-js-types';

export interface WalletPublicKeys {
  coinPublicKey: CoinPublicKey;
  encryptionPublicKey: EncPublicKey;
}

export function createPublicKeyOnlyWalletProvider(keys: WalletPublicKeys): WalletProvider {
  return {
    getCoinPublicKey(): CoinPublicKey {
      return keys.coinPublicKey;
    },
    getEncryptionPublicKey(): EncPublicKey {
      return keys.encryptionPublicKey;
    },
    balanceTx(_tx: UnboundTransaction): Promise<FinalizedTransaction> {
      return Promise.reject(
        new Error('this restricted WalletProvider only exposes public keys; balancing needs the live wallet extension on the main thread'),
      );
    },
  };
}
