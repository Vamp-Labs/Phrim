import "./primitives.css";

export type WalletConnectButtonStatus = "idle" | "connecting" | "connected" | "error";

export interface WalletConnectButtonProps {
  status: WalletConnectButtonStatus;
  addressLabel?: string;
  onConnect?: () => void;
}

function truncateAddress(address: string): string {
  if (address.length <= 16) {
    return address;
  }
  return `${address.slice(0, 10)}…${address.slice(-6)}`;
}

export function WalletConnectButton({ status, addressLabel, onConnect }: WalletConnectButtonProps) {
  if (status === "connected" && addressLabel !== undefined) {
    return (
      <span className="wallet-connect wallet-connect--connected mono">
        <span className="live-dot" aria-hidden="true" />
        {truncateAddress(addressLabel)}
      </span>
    );
  }

  return (
    <button
      type="button"
      className="wallet-connect pill-button pill-button--dark"
      onClick={onConnect}
      disabled={status === "connecting"}
    >
      {status === "connecting" ? "Connecting…" : status === "error" ? "Retry connect" : "Connect Wallet"}
    </button>
  );
}
