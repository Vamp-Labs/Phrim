import type { ReactNode } from "react";
import type { DrawReceiptVM, HistoryVM } from "../../viewmodels/types";
import { formatMinorToDisplay } from "../format";
import { DataTable, type DataTableColumn } from "../primitives/DataTable";
import { EmptyState } from "../primitives/EmptyState";
import { MetricCard } from "../primitives/MetricCard";
import { PageShell } from "../primitives/PageShell";
import { StatusBadge } from "../primitives/StatusBadge";
import { buildNavItems } from "./navItems";

export interface HistoryViewProps {
  vm: HistoryVM;
  onNavigate?: (id: string) => void;
  walletSlot?: ReactNode;
  contractExplorerUrl?: string | null;
}

function statusGlyph(status: HistoryVM["status"]): string {
  if (status === "Active") {
    return "*";
  }
  if (status === "Frozen") {
    return "#";
  }
  return "X";
}

const COLUMNS: DataTableColumn<DrawReceiptVM>[] = [
  { key: "drawId", label: "Draw", render: (row) => row.drawId },
  { key: "epoch", label: "Epoch", render: (row) => row.epoch },
  {
    key: "amount",
    label: "Amount",
    numeric: true,
    render: (row) => formatMinorToDisplay(row.amountMinor),
  },
  {
    key: "resultingOutstanding",
    label: "Resulting outstanding",
    numeric: true,
    render: (row) => formatMinorToDisplay(row.resultingOutstandingMinor),
  },
  {
    key: "completed",
    label: "Status",
    render: (row) =>
      row.completed ? (
        <StatusBadge glyph="✓" label="Completed" />
      ) : (
        <StatusBadge glyph="✕" label="Incomplete" />
      ),
  },
];

export function HistoryView({ vm, onNavigate, walletSlot, contractExplorerUrl }: HistoryViewProps) {
  return (
    <PageShell
      themeId="merkle-dag"
      title="Facility History"
      navItems={buildNavItems("history")}
      onNavigate={onNavigate}
      headerExtra={walletSlot}
    >
      <div className="view-section">
        <StatusBadge glyph={statusGlyph(vm.status)} label={vm.status} />
      </div>

      <div className="view-section">
        <p className="view-section__title">Balances</p>
        <div className="metric-row grid-hairline">
          <MetricCard label="Vault liquidity" value={formatMinorToDisplay(vm.vaultMinor)} />
          <MetricCard label="Outstanding drawn" value={formatMinorToDisplay(vm.outstandingMinor)} />
          <MetricCard label="Remaining capacity" value={formatMinorToDisplay(vm.capacityMinor)} />
        </div>
      </div>

      <div className="view-section">
        <p className="view-section__title">Draw receipts</p>
        {vm.receipts.length === 0 ? (
          <EmptyState glyph="." message="No draws recorded yet for this facility." />
        ) : (
          <DataTable
            caption="Chronological draw receipts"
            columns={COLUMNS}
            rows={vm.receipts}
            rowKey={(row) => row.drawId}
            emptyLabel="No draws recorded yet"
          />
        )}
        <p className="view-caveat">No private customer-level collateral record is shown on this page.</p>
        {contractExplorerUrl ? (
          <p className="view-caveat">
            <a
              className="metric-card__link"
              href={contractExplorerUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              Verify this facility on Midnight Explorer ↗
            </a>
          </p>
        ) : null}
      </div>
    </PageShell>
  );
}
