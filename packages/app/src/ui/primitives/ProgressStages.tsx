import "./primitives.css";

export type ProgressStageId = "preparing" | "proving" | "awaiting-wallet" | "submitting";

export interface ProgressStagesProps {
  activeStage: ProgressStageId | "confirmed" | "failed" | "idle";
}

const STAGES: { id: ProgressStageId; label: string }[] = [
  { id: "preparing", label: "Preparing inputs" },
  { id: "proving", label: "Generating proof" },
  { id: "awaiting-wallet", label: "Wallet approval" },
  { id: "submitting", label: "Submitting" },
];

function stateFor(stageIndex: number, activeStage: ProgressStagesProps["activeStage"]): "pending" | "active" | "done" {
  const activeIndex = STAGES.findIndex((stage) => stage.id === activeStage);
  if (activeStage === "confirmed" || activeStage === "failed") {
    return "done";
  }
  if (activeIndex === -1) {
    return "pending";
  }
  if (stageIndex < activeIndex) {
    return "done";
  }
  if (stageIndex === activeIndex) {
    return "active";
  }
  return "pending";
}

export function ProgressStages({ activeStage }: ProgressStagesProps) {
  return (
    <ol className="progress-stages" aria-label="Proof progress" aria-live="polite">
      {STAGES.map((stage, index) => {
        const state = stateFor(index, activeStage);
        return (
          <li
            key={stage.id}
            className={`progress-stage progress-stage--${state}`}
            aria-current={state === "active" ? "step" : undefined}
          >
            <span className="progress-stage__bar">
              <span className="progress-stage__bar-fill" />
            </span>
            <span className="progress-stage__label">
              {state === "done" ? "done — " : null}
              {stage.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
