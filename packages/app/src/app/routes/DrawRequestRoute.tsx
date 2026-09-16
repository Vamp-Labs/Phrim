import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DrawRequestView } from '../../ui/views';
import { buildPhrimError } from '../../viewmodels/errors';
import type { DrawRequestVM, ProofStage } from '../../viewmodels/types';
import { MOCK_DRAW_REQUEST_IDLE } from '../../viewmodels/mocks';
import { isDrawFlowAvailable } from '../state/drawFlow';
import { settleDraw } from '../state/drawSettlement';
import { useWalletSession } from '../state/walletSession';
import { useDrawSession } from '../state/drawSession';
import { buildWitnessCredentialSlots } from '../midnight/witnessSlots';
import { PHRIM_DEMO_BORROWER_SECRET_HEX } from '../midnight/demoSecrets';
import { WalletHeaderSlot } from '../components/WalletHeaderSlot';

const PHRIM_DEMO_NETWORK_ID = 'preprod';

function isDecimalMinorString(value: string): boolean {
  return /^[0-9]+$/.test(value);
}

export function DrawRequestRoute() {
  const navigate = useNavigate();
  const [vm, setVm] = useState<DrawRequestVM>(MOCK_DRAW_REQUEST_IDLE);
  const { wallet, connect } = useWalletSession();
  const { fixture, setLastResult } = useDrawSession();

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
    if (fixture === null) {
      setVm((previous) => ({ ...previous, stage: 'failed', error: buildPhrimError('NETWORK_UNAVAILABLE') }));
      return;
    }
    const facilityIdHex = fixture.credentials[0]?.facilityId;
    if (facilityIdHex === undefined) {
      setVm((previous) => ({ ...previous, stage: 'failed', error: buildPhrimError('NETWORK_UNAVAILABLE') }));
      return;
    }

    const proceedWithWallet = async (): Promise<void> => {
      const activeWallet = wallet;
      if (activeWallet === null) {
        connect();
        return;
      }
      const onStage = (stage: ProofStage) => {
        setVm((previous) => ({ ...previous, stage }));
      };
      const result = await settleDraw(
        {
          networkId: PHRIM_DEMO_NETWORK_ID,
          wallet: activeWallet,
          facilityIdHex,
          requestedMinor: vm.requestedMinor,
          borrowerSecretHex: PHRIM_DEMO_BORROWER_SECRET_HEX,
          slots: buildWitnessCredentialSlots(fixture.credentials),
          nullifiersConsumed: fixture.occupiedSlotCount,
        },
        onStage,
      );
      setLastResult(result);
      navigate('/result');
    };

    void proceedWithWallet();
  }, [connect, fixture, navigate, setLastResult, vm.requestedMinor, wallet]);

  return (
    <DrawRequestView
      vm={vm}
      onAmountChange={onAmountChange}
      onSubmit={onSubmit}
      onNavigate={(id) => navigate(`/${id}`)}
      walletSlot={<WalletHeaderSlot />}
    />
  );
}
