import type { DrawResultVM } from "../../viewmodels/types";
import { formatMinorToDisplay, truncateMiddle } from "../format";
import { ErrorPanel } from "../primitives/ErrorPanel";
import { MetricCard } from "../primitives/MetricCard";
import { PageShell } from "../primitives/PageShell";
import { PillButton } from "../primitives/PillButton";
import { StatusBadge } from "../primitives/StatusBadge";
import { buildNavItems } from "./navItems";

export interface DrawResultViewProps {
  vm: DrawResultVM;
  onViewHistory?: () => void;
  onNavigate?: (id: string) => void;
}

export function DrawResultView({ vm, onViewHistory, onNavigate }: DrawResultViewProps) {
  const funded = vm.outcome === "funded";

  return (
    <PageShell themeId="settlement" title="Draw Result" navItems={buildNavItems("result")} onNavigate={onNavigate}>
      <div className="view-section">
        {funded ? (
          <StatusBadge glyph="✓" label="Draw funded" tone="outcome-positive" />
        ) : (
          <StatusBadge glyph="✕" label="Draw rejected" tone="outcome-negative" />
        )}
      </div>

      {funded ? (
        <>
          <div className="view-section">
            <p className="view-section__title">Settlement</p>
            <div className="metric-row">
              <MetricCard label="Amount funded" value={formatMinorToDisplay(vm.amountMinor)} />
              <MetricCard label="Prior outstanding" value={formatMinorToDisplay(vm.priorOutstandingMinor)} />
              <MetricCard label="New outstanding" value={formatMinorToDisplay(vm.newOutstandingMinor)} />
              <MetricCard label="Available credit" value={formatMinorToDisplay(vm.availableCreditMinor)} />
              <MetricCard label="Wallet balance" value={formatMinorToDisplay(vm.walletBalanceMinor)} />
              <MetricCard label="Nullifiers consumed" value={String(vm.nullifiersConsumed)} />
            </div>
          </div>
          <div className="view-section">
            <p className="view-section__title">Onchain reference</p>
            <div className="metric-row">
              <MetricCard label="Contract address" value={truncateMiddle(vm.contractAddress)} />
              <MetricCard label="Transaction id" value={truncateMiddle(vm.txId)} />
            </div>
          </div>
          <div className="view-footer-actions">
            <PillButton onClick={onViewHistory}>View Facility History</PillButton>
          </div>
        </>
      ) : (
        <div className="view-section">
          {vm.error !== null ? (
            <ErrorPanel
              code={vm.error.code}
              message={vm.error.message}
              recovery={vm.error.recovery}
              integrityNote="Zero funds moved. Facility state remained unmodified."
            />
          ) : null}
        </div>
      )}
    </PageShell>
  );
}
