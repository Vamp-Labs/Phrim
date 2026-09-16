import { WalletConnectButton } from '../../ui/primitives/WalletConnectButton';
import { useWalletSession } from '../state/walletSession';
import { ExplorerHeaderLink } from './ExplorerHeaderLink';

export function WalletHeaderSlot() {
  const { status, wallet, errorMessage, connect } = useWalletSession();
  return (
    <>
      <ExplorerHeaderLink />
      <WalletConnectButton
        status={status}
        addressLabel={wallet?.unshieldedAddress}
        errorMessage={errorMessage}
        onConnect={connect}
      />
    </>
  );
}
