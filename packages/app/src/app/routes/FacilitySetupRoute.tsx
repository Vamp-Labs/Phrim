import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacilitySetupView } from '../../ui/views';
import type { FacilitySetupVM } from '../../viewmodels/types';
import { MOCK_FACILITY_SETUP_IDLE } from '../../viewmodels/mocks';
import { getConfiguredContractAddress } from '../midnight/contractAddress';

const PHRIM_DEMO_NETWORK_ID = 'preprod';

export function FacilitySetupRoute() {
  const navigate = useNavigate();
  const [vm, setVm] = useState<FacilitySetupVM>(MOCK_FACILITY_SETUP_IDLE);

  const onFieldChange = useCallback((id: string, value: string) => {
    setVm((previous) => ({
      ...previous,
      fields: previous.fields.map((field) => (field.id === id ? { ...field, value } : field)),
    }));
  }, []);

  const onSubmit = useCallback(() => {
    if (getConfiguredContractAddress(PHRIM_DEMO_NETWORK_ID) === null) {
      setVm((previous) => ({ ...previous, submitState: 'error' }));
      return;
    }
    // TEMPORARY — wallet-connect UI is not wired yet; once a contract address is configured this branch needs createFacility/fundOrMintDemoToken called through a real ConnectedWallet and PhrimMainThreadProviders
  }, []);

  return (
    <FacilitySetupView
      vm={vm}
      onFieldChange={onFieldChange}
      onSubmit={onSubmit}
      onNavigate={(id) => navigate(`/${id}`)}
    />
  );
}
