import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FacilitySetupView } from '../../ui/views';
import type { FacilitySetupVM } from '../../viewmodels/types';
import { MOCK_FACILITY_SETUP_IDLE } from '../../viewmodels/mocks';
import { getConfiguredContractAddress } from '../midnight/contractAddress';
import { readPhrimLedgerState } from '../midnight/contractClient';
import { resolveNetworkEndpoints } from '../midnight/network';
import { formatMinorToDisplay } from '../../ui/format';
import { WalletHeaderSlot } from '../components/WalletHeaderSlot';

const PHRIM_DEMO_NETWORK_ID = 'preprod';

export function FacilitySetupRoute() {
  const navigate = useNavigate();
  const [vm, setVm] = useState<FacilitySetupVM>(MOCK_FACILITY_SETUP_IDLE);
  const [facilityIsActive, setFacilityIsActive] = useState(false);

  useEffect(() => {
    const contractAddress = getConfiguredContractAddress(PHRIM_DEMO_NETWORK_ID);
    if (contractAddress === null) {
      return;
    }
    const endpoints = resolveNetworkEndpoints(PHRIM_DEMO_NETWORK_ID);
    const publicDataProvider = indexerPublicDataProvider(endpoints.indexerUrl, endpoints.indexerWsUrl);
    readPhrimLedgerState(publicDataProvider, contractAddress)
      .then((ledger) => {
        if (ledger === null || !ledger.facilityExists) {
          return;
        }
        setFacilityIsActive(true);
        setVm((previous) => ({
          ...previous,
          vaultBalanceMinor: formatMinorToDisplay((ledger.creditLimit - ledger.outstanding).toString(10)),
        }));
      })
      .catch(() => {});
  }, []);

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
    if (facilityIsActive) {
      navigate('/collateral');
      return;
    }
    setVm((previous) => ({ ...previous, submitState: 'error' }));
  }, [facilityIsActive, navigate]);

  return (
    <FacilitySetupView
      vm={vm}
      onFieldChange={onFieldChange}
      onSubmit={onSubmit}
      onNavigate={(id) => navigate(`/${id}`)}
      walletSlot={<WalletHeaderSlot />}
    />
  );
}
