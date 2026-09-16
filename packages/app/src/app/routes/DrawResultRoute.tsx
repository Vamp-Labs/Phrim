import { useNavigate } from 'react-router-dom';
import { DrawResultView } from '../../ui/views';
import { MOCK_DRAW_RESULT_FUNDED } from '../../viewmodels/mocks';
import { WalletHeaderSlot } from '../components/WalletHeaderSlot';
import { useDrawSession } from '../state/drawSession';

export function DrawResultRoute() {
  const navigate = useNavigate();
  const { lastResult } = useDrawSession();

  return (
    <DrawResultView
      vm={lastResult ?? MOCK_DRAW_RESULT_FUNDED}
      onViewHistory={() => navigate('/history')}
      onNavigate={(id) => navigate(`/${id}`)}
      walletSlot={<WalletHeaderSlot />}
    />
  );
}
