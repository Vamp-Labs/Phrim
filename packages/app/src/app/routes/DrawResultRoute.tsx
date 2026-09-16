import { useNavigate } from 'react-router-dom';
import { DrawResultView } from '../../ui/views';
import { MOCK_DRAW_RESULT_FUNDED } from '../../viewmodels/mocks';
import { WalletHeaderSlot } from '../components/WalletHeaderSlot';
import { useDrawSession } from '../state/drawSession';
import { contractExplorerUrl } from '../midnight/explorer';
import { getConfiguredContractAddress } from '../midnight/contractAddress';

const PHRIM_DEMO_NETWORK_ID = 'preprod';

export function DrawResultRoute() {
  const navigate = useNavigate();
  const { lastResult } = useDrawSession();
  const address = lastResult?.contractAddress ?? getConfiguredContractAddress(PHRIM_DEMO_NETWORK_ID) ?? '';
  const explorerUrl = contractExplorerUrl(PHRIM_DEMO_NETWORK_ID, address);

  return (
    <DrawResultView
      vm={lastResult ?? MOCK_DRAW_RESULT_FUNDED}
      onViewHistory={() => navigate('/history')}
      onNavigate={(id) => navigate(`/${id}`)}
      walletSlot={<WalletHeaderSlot />}
      contractExplorerUrl={explorerUrl}
    />
  );
}
