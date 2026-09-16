import { getConfiguredContractAddress } from '../midnight/contractAddress';
import { contractExplorerUrl } from '../midnight/explorer';

const PHRIM_DEMO_NETWORK_ID = 'preprod';

export function ExplorerHeaderLink() {
  const address = getConfiguredContractAddress(PHRIM_DEMO_NETWORK_ID);
  if (address === null) {
    return null;
  }
  const href = contractExplorerUrl(PHRIM_DEMO_NETWORK_ID, address);
  if (href === null) {
    return null;
  }
  return (
    <a
      className="explorer-header-link"
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      title="Open this facility's contract on the Midnight preprod block explorer"
    >
      <span className="explorer-header-link__full">Verify onchain</span>
      <span className="explorer-header-link__short" aria-hidden="true">
        Verify
      </span>
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}
