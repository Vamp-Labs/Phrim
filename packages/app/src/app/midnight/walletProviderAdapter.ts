import { Transaction } from '@midnight-ntwrk/ledger-v8';
import type {
  CoinPublicKey,
  EncPublicKey,
  FinalizedTransaction,
  TransactionId,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { MidnightProvider, UnboundTransaction, WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import type { ConnectedWallet } from './walletConnector';
import { bytesToHex, hexToBytes } from './hex';

export function createWalletProvider(wallet: ConnectedWallet): WalletProvider {
  return {
    async balanceTx(tx: UnboundTransaction): Promise<FinalizedTransaction> {
      const { tx: balancedHex } = await wallet.api.balanceUnsealedTransaction(bytesToHex(tx.serialize()));
      return Transaction.deserialize('signature', 'proof', 'binding', hexToBytes(balancedHex));
    },
    getCoinPublicKey(): CoinPublicKey {
      return wallet.shieldedCoinPublicKey;
    },
    getEncryptionPublicKey(): EncPublicKey {
      return wallet.shieldedEncryptionPublicKey;
    },
  };
}

export function createMidnightProvider(wallet: ConnectedWallet): MidnightProvider {
  return {
    async submitTx(tx: FinalizedTransaction): Promise<TransactionId> {
      await wallet.api.submitTransaction(bytesToHex(tx.serialize()));
      const [firstIdentifier] = tx.identifiers();
      if (firstIdentifier === undefined) {
        throw new Error('submitted transaction carries no identifier');
      }
      return firstIdentifier;
    },
  };
}
