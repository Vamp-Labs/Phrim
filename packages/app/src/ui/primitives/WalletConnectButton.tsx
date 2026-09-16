import "./primitives.css";

export type WalletConnectButtonStatus = "idle" | "connecting" | "connected" | "error";

export interface WalletConnectButtonProps {
  status: WalletConnectButtonStatus;
  addressLabel?: string;
  errorMessage?: string | null;
  onConnect?: () => void;
}

function truncateAddress(address: string): string {
  if (address.length <= 16) {
    return address;
  }
  return `${address.slice(0, 10)}…${address.slice(-6)}`;
}

export function WalletConnectButton({
  status,
  addressLabel,
  errorMessage,
  onConnect,
}: WalletConnectButtonProps) {
  if (status === "connected" && addressLabel !== undefined) {
    return (
      <span className="wallet-connect wallet-connect--connected mono">
        <span className="live-dot" aria-hidden="true" />
        {truncateAddress(addressLabel)}
      </span>
    );
  }

  const label =
    status === "connecting" ? "Connecting…" : status === "error" ? "Retry connect" : "Connect Wallet";

  return (
    <span className="wallet-connect-group">
      <button
        type="button"
        className="wallet-connect pill-button pill-button--dark"
        onClick={onConnect}
        disabled={status === "connecting"}
        title={status === "error" && errorMessage ? errorMessage : undefined}
      >
        {label}
      </button>
      {status === "error" && errorMessage ? (
        <span role="alert" className="wallet-connect__error">
          {errorMessage}
        </span>
      ) : null}
    </span>
  );
}
