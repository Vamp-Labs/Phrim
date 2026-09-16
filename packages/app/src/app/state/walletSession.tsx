import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { connectWallet, type ConnectedWallet } from '../midnight/walletConnector';
import type { PhrimNetworkId } from '@phrim/contract';

export type WalletConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface WalletSessionValue {
  status: WalletConnectionStatus;
  wallet: ConnectedWallet | null;
  errorMessage: string | null;
  connect: () => void;
}

const WalletSessionContext = createContext<WalletSessionValue | null>(null);

export interface WalletSessionProviderProps {
  networkId: PhrimNetworkId;
  children: ReactNode;
}

export function WalletSessionProvider({ networkId, children }: WalletSessionProviderProps) {
  const [status, setStatus] = useState<WalletConnectionStatus>('idle');
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (networkId === 'undeployed') {
      setStatus('error');
      setErrorMessage('NETWORK_UNAVAILABLE');
      return;
    }
    setStatus('connecting');
    setErrorMessage(null);
    connectWallet(networkId)
      .then((connected) => {
        setWallet(connected);
        setStatus('connected');
      })
      .catch((error: unknown) => {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'NETWORK_UNAVAILABLE');
      });
  }, [networkId]);

  const value = useMemo<WalletSessionValue>(
    () => ({ status, wallet, errorMessage, connect }),
    [status, wallet, errorMessage, connect],
  );

  return <WalletSessionContext.Provider value={value}>{children}</WalletSessionContext.Provider>;
}

export function useWalletSession(): WalletSessionValue {
  const value = useContext(WalletSessionContext);
  if (value === null) {
    throw new Error('useWalletSession must be used within a WalletSessionProvider');
  }
  return value;
}
