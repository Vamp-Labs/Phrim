import { useNavigate } from 'react-router-dom';
import { HistoryView } from '../../ui/views';
import { MOCK_HISTORY_ACTIVE_WITH_RECEIPTS } from '../../viewmodels/mocks';

export function HistoryRoute() {
  const navigate = useNavigate();

  return <HistoryView vm={MOCK_HISTORY_ACTIVE_WITH_RECEIPTS} onNavigate={(id) => navigate(`/${id}`)} />;
}
