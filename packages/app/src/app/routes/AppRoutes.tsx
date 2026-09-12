import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { FacilitySetupRoute } from './FacilitySetupRoute';
import { CollateralRoute } from './CollateralRoute';
import { DrawRequestRoute } from './DrawRequestRoute';
import { DrawResultRoute } from './DrawResultRoute';
import { HistoryRoute } from './HistoryRoute';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/facility" replace />} />
        <Route path="/facility" element={<FacilitySetupRoute />} />
        <Route path="/collateral" element={<CollateralRoute />} />
        <Route path="/draw" element={<DrawRequestRoute />} />
        <Route path="/result" element={<DrawResultRoute />} />
        <Route path="/history" element={<HistoryRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
