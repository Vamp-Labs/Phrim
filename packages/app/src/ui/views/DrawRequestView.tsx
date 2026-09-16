import type { DrawRequestVM } from "../../viewmodels/types";
import { formatMinorToDisplay } from "../format";
import { ErrorPanel } from "../primitives/ErrorPanel";
import { GlowCta } from "../primitives/GlowCta";
import { InputField } from "../primitives/InputField";
import { MetricCard } from "../primitives/MetricCard";
import { PageShell } from "../primitives/PageShell";
import { PrivacyTag } from "../primitives/PrivacyTag";
import { ProgressStages } from "../primitives/ProgressStages";
import { buildNavItems } from "./navItems";

export interface DrawRequestViewProps {
  vm: DrawRequestVM;
  onAmountChange?: (rawValue: string) => void;
  onSubmit?: () => void;
  onNavigate?: (id: string) => void;
}

function isProofInFlight(stage: DrawRequestVM["stage"]): boolean {
  return (
    stage === "preparing" || stage === "proving" || stage === "awaiting-wallet" || stage === "submitting"
  );
}

export function DrawRequestView({ vm, onAmountChange, onSubmit, onNavigate }: DrawRequestViewProps) {
  const isBusy = isProofInFlight(vm.stage);

  return (
    <PageShell themeId="circuit-synth" title="Draw Request" navItems={buildNavItems("draw")} onNavigate={onNavigate}>
      <div className="view-section">
        <p className="view-section__title">Requested draw</p>
        <InputField
          label="Draw amount"
          kind="money"
          value={formatMinorToDisplay(vm.requestedMinor)}
          onChange={onAmountChange}
          disabled={isBusy}
        />
      </div>

      <div className="view-section">
        <p className="view-section__title">
          Public disclosure <PrivacyTag visibility="public" />
        </p>
        <div className="metric-row grid-hairline">
          <MetricCard label="Facility" value={vm.publicDisclosure.facilityIdShort} />
          <MetricCard label="Epoch" value={String(vm.publicDisclosure.epoch)} />
          <MetricCard
            label="Requested amount"
            value={formatMinorToDisplay(vm.publicDisclosure.requestedMinor)}
          />
        </div>
      </div>

      <div className="view-section">
        <p className="view-section__title">Private summary</p>
        <div className="credential-cell">
          <MetricCard label="Pledged assets" value={String(vm.privateSummary.pledgedCount)} />
          <PrivacyTag visibility="private" />
        </div>
      </div>

      <div className="view-section">
        <p className="view-section__title">Proof progress</p>
        <ProgressStages activeStage={vm.stage} />
      </div>

      {vm.error !== null ? (
        <ErrorPanel code={vm.error.code} message={vm.error.message} recovery={vm.error.recovery} />
      ) : null}

      <div className="view-footer-actions">
        <GlowCta onClick={onSubmit} disabled={isBusy} busy={isBusy}>
          {isBusy ? "Proof in progress" : "Prove and Request Draw"}
        </GlowCta>
      </div>
    </PageShell>
  );
}
