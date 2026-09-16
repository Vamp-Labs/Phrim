import { WalletConnectButton } from '../../ui/primitives/WalletConnectButton';
import { useWalletSession } from '../state/walletSession';

export function WalletHeaderSlot() {
  const { status, wallet, connect } = useWalletSession();
  return (
    <WalletConnectButton
      status={status}
      addressLabel={wallet?.unshieldedAddress}
      onConnect={connect}
    />
  );
}
