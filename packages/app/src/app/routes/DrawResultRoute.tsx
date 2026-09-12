import { useNavigate } from 'react-router-dom';
import { DrawResultView } from '../../ui/views';
import { MOCK_DRAW_RESULT_FUNDED } from '../../viewmodels/mocks';

export function DrawResultRoute() {
  const navigate = useNavigate();

  return (
    <DrawResultView
      vm={MOCK_DRAW_RESULT_FUNDED}
      onViewHistory={() => navigate('/history')}
      onNavigate={(id) => navigate(`/${id}`)}
    />
  );
}
