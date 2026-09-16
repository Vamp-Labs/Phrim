import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ScenarioId } from 'schema';
import { CollateralView } from '../../ui/views';
import type { CollateralVM } from '../../viewmodels/types';
import { MOCK_COLLATERAL_ELIGIBLE } from '../../viewmodels/mocks';
import { fetchScenarioFixture } from '../midnight/attestationClient';
import { buildCollateralVM } from '../preflight/collateralViewModel';
import { WalletHeaderSlot } from '../components/WalletHeaderSlot';
import { useDrawSession } from '../state/drawSession';

export function CollateralRoute() {
  const navigate = useNavigate();
  const [vm, setVm] = useState<CollateralVM>(MOCK_COLLATERAL_ELIGIBLE);
  const { setFixture } = useDrawSession();

  const loadScenario = useCallback(
    (scenario: ScenarioId) => {
      fetchScenarioFixture(scenario)
        .then((fixture) => {
          setVm(buildCollateralVM(fixture));
          setFixture(fixture);
        })
        .catch(() => {});
    },
    [setFixture],
  );

  useEffect(() => {
    loadScenario('eligible');
  }, [loadScenario]);

  return (
    <CollateralView
      vm={vm}
      onScenarioSelect={loadScenario}
      onContinue={() => navigate('/draw')}
      onNavigate={(id) => navigate(`/${id}`)}
      walletSlot={<WalletHeaderSlot />}
    />
  );
}
