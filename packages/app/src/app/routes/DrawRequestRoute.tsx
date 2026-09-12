import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DrawRequestView } from '../../ui/views';
import { buildPhrimError } from '../../viewmodels/errors';
import type { DrawRequestVM } from '../../viewmodels/types';
import { MOCK_DRAW_REQUEST_IDLE } from '../../viewmodels/mocks';
import { isDrawFlowAvailable } from '../state/drawFlow';

const PHRIM_DEMO_NETWORK_ID = 'preprod';

function isDecimalMinorString(value: string): boolean {
  return /^[0-9]+$/.test(value);
}

export function DrawRequestRoute() {
  const navigate = useNavigate();
  const [vm, setVm] = useState<DrawRequestVM>(MOCK_DRAW_REQUEST_IDLE);

  const onAmountChange = useCallback((rawValue: string) => {
    if (!isDecimalMinorString(rawValue) && rawValue !== '') {
      return;
    }
    setVm((previous) => ({
      ...previous,
      requestedMinor: rawValue === '' ? '0' : rawValue,
      publicDisclosure: { ...previous.publicDisclosure, requestedMinor: rawValue === '' ? '0' : rawValue },
    }));
  }, []);

  const onSubmit = useCallback(() => {
    if (!isDrawFlowAvailable(PHRIM_DEMO_NETWORK_ID)) {
      setVm((previous) => ({ ...previous, stage: 'failed', error: buildPhrimError('NETWORK_UNAVAILABLE') }));
      return;
    }
    // TEMPORARY — wallet-connect UI and credential hand-off from /collateral are not wired yet; once a contract address is configured this branch needs runDrawFlow wired to a real ConnectedWallet
  }, []);

  return (
    <DrawRequestView
      vm={vm}
      onAmountChange={onAmountChange}
      onSubmit={onSubmit}
      onNavigate={(id) => navigate(`/${id}`)}
    />
  );
}
