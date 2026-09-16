import type { ReactNode } from "react";
import type { CollateralVM, CredentialRowVM } from "../../viewmodels/types";
import type { ScenarioId } from "../primitives/ScenarioSelector";
import { formatMinorToDisplay } from "../format";
import { DataTable, type DataTableColumn } from "../primitives/DataTable";
import { GlowCta } from "../primitives/GlowCta";
import { MetricCard } from "../primitives/MetricCard";
import { PageShell } from "../primitives/PageShell";
import { PrivacyTag } from "../primitives/PrivacyTag";
import { ScenarioSelector } from "../primitives/ScenarioSelector";
import { StatusBadge } from "../primitives/StatusBadge";
import { buildNavItems } from "./navItems";

export interface CollateralViewProps {
  vm: CollateralVM;
  onScenarioSelect?: (id: ScenarioId) => void;
  onContinue?: () => void;
  onNavigate?: (id: string) => void;
  walletSlot?: ReactNode;
}

function signatureBadge(row: CredentialRowVM) {
  if (row.signatureStatus === "valid") {
    return <StatusBadge glyph="✓" label="Signature valid" />;
  }
  if (row.signatureStatus === "invalid") {
    return <StatusBadge glyph="✕" label="Signature invalid" />;
  }
  return <StatusBadge glyph="-" label="Unchecked" />;
}

const COLUMNS: DataTableColumn<CredentialRowVM>[] = [
  {
    key: "slot",
    label: "Slot",
    render: (row) => row.slot,
  },
  {
    key: "assetRef",
    label: "Asset reference",
    render: (row) => (
      <span className="credential-cell mono-value">
        {row.maskedAssetRef}
        {row.occupied ? <PrivacyTag visibility="private" /> : null}
      </span>
    ),
  },
  {
    key: "outstanding",
    label: "Outstanding",
    render: (row) => (
      <span className="credential-cell mono-value">
        {row.outstandingMinorMasked}
        {row.occupied ? <PrivacyTag visibility="private" /> : null}
      </span>
    ),
  },
  {
    key: "daysPastDue",
    label: "Days past due",
    render: (row) => (
      <span className="credential-cell mono-value">
        {row.daysPastDueMasked}
        {row.occupied ? <PrivacyTag visibility="private" /> : null}
      </span>
    ),
  },
  {
    key: "riskScore",
    label: "Risk score",
    render: (row) => (
      <span className="credential-cell mono-value">
        {row.riskScoreMasked}
        {row.occupied ? <PrivacyTag visibility="private" /> : null}
      </span>
    ),
  },
  {
    key: "signature",
    label: "Signature",
    render: signatureBadge,
  },
];

export function CollateralView({
  vm,
  onScenarioSelect,
  onContinue,
  onNavigate,
  walletSlot,
}: CollateralViewProps) {
  return (
    <PageShell
      themeId="matrix-stream"
      title="Private Collateral"
      navItems={buildNavItems("collateral")}
      onNavigate={onNavigate}
      headerExtra={walletSlot}
    >
      <div className="view-section">
        <p className="view-section__title">Demo scenario</p>
        <ScenarioSelector selected={vm.scenario} onSelect={(id) => onScenarioSelect?.(id)} />
      </div>

      <div className="view-section">
        <p className="view-section__title">Imported credentials</p>
        <DataTable
          caption="Eight signed credential slots"
          columns={COLUMNS}
          rows={vm.rows}
          rowKey={(row) => String(row.slot)}
          emptyLabel="No credentials imported"
        />
      </div>

      <div className="view-section">
        <p className="view-section__title">Local preview</p>
        <div className="metric-row grid-hairline">
          <MetricCard label="Eligible total" value={formatMinorToDisplay(vm.previewTotalMinor)} />
          <MetricCard label="Supportable draw" value={formatMinorToDisplay(vm.previewSupportsMinor)} />
          <MetricCard
            label="Signatures"
            value={vm.allSignaturesValid ? "All valid" : "Invalid present"}
          />
        </div>
        <p className="view-caveat">Calculated locally; contract proof is authoritative</p>
      </div>

      <div className="view-footer-actions">
        <GlowCta onClick={onContinue}>Continue to Draw Request</GlowCta>
      </div>
    </PageShell>
  );
}
