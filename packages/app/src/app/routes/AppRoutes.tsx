import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { FacilitySetupRoute } from './FacilitySetupRoute';
import { CollateralRoute } from './CollateralRoute';
import { DrawRequestRoute } from './DrawRequestRoute';
import { DrawResultRoute } from './DrawResultRoute';
import { HistoryRoute } from './HistoryRoute';
import { WalletSessionProvider } from '../state/walletSession';
import { DrawSessionProvider } from '../state/drawSession';

const PHRIM_DEMO_NETWORK_ID = 'preprod';

export function AppRoutes() {
  return (
    <WalletSessionProvider networkId={PHRIM_DEMO_NETWORK_ID}>
      <DrawSessionProvider>
        <BrowserRouter basename="/app">
          <Routes>
            <Route path="/" element={<Navigate to="/facility" replace />} />
            <Route path="/facility" element={<FacilitySetupRoute />} />
            <Route path="/collateral" element={<CollateralRoute />} />
            <Route path="/draw" element={<DrawRequestRoute />} />
            <Route path="/result" element={<DrawResultRoute />} />
            <Route path="/history" element={<HistoryRoute />} />
          </Routes>
        </BrowserRouter>
      </DrawSessionProvider>
    </WalletSessionProvider>
  );
}
