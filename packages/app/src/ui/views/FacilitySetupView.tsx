import type { FacilitySetupVM } from "../../viewmodels/types";
import { formatMinorToDisplay } from "../format";
import { GlowCta } from "../primitives/GlowCta";
import { InputField } from "../primitives/InputField";
import { LoadingInline } from "../primitives/LoadingIndicator";
import { MetricCard } from "../primitives/MetricCard";
import { PageShell } from "../primitives/PageShell";
import { buildNavItems } from "./navItems";

export interface FacilitySetupViewProps {
  vm: FacilitySetupVM;
  onFieldChange?: (id: string, value: string) => void;
  onSubmit?: () => void;
  onNavigate?: (id: string) => void;
}

export function FacilitySetupView({ vm, onFieldChange, onSubmit, onNavigate }: FacilitySetupViewProps) {
  const busy = vm.submitState === "busy";

  return (
    <PageShell themeId="vault" title="Facility Setup" navItems={buildNavItems("facility")} onNavigate={onNavigate} dense>
      {vm.fields.map((field) => (
        <InputField
          key={field.id}
          label={field.label}
          hint={field.hint}
          kind={field.kind}
          value={field.value}
          error={field.error}
          disabled={busy}
          onChange={(value) => onFieldChange?.(field.id, value)}
        />
      ))}
      <div className="view-footer-actions view-footer-actions--full-span">
        {vm.vaultBalanceMinor !== null ? (
          <MetricCard label="Vault balance" value={formatMinorToDisplay(vm.vaultBalanceMinor)} />
        ) : null}
        {vm.submitState === "error" ? (
          <p role="alert" className="view-caveat">
            Facility could not be created. Check the fields above and try again.
          </p>
        ) : null}
        <GlowCta onClick={onSubmit} disabled={busy} busy={busy}>
          {busy ? <LoadingInline label="Creating facility" /> : "Create and Fund Facility"}
        </GlowCta>
      </div>
    </PageShell>
  );
}
