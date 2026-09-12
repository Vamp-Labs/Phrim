import "./primitives.css";

export type ScenarioId = "eligible" | "undercollateralized" | "stale" | "tampered" | "replay";

const SCENARIOS: { id: ScenarioId; label: string }[] = [
  { id: "eligible", label: "Eligible" },
  { id: "undercollateralized", label: "Undercollateralized" },
  { id: "stale", label: "Stale" },
  { id: "tampered", label: "Tampered" },
  { id: "replay", label: "Replay" },
];

export interface ScenarioSelectorProps {
  selected: ScenarioId;
  onSelect: (id: ScenarioId) => void;
}

export function ScenarioSelector({ selected, onSelect }: ScenarioSelectorProps) {
  return (
    <div className="scenario-selector" role="radiogroup" aria-label="Demo scenario">
      {SCENARIOS.map((scenario) => (
        <button
          key={scenario.id}
          type="button"
          className="scenario-selector__option"
          role="radio"
          aria-checked={selected === scenario.id}
          onClick={() => onSelect(scenario.id)}
        >
          {scenario.label}
        </button>
      ))}
    </div>
  );
}
