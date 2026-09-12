import "./primitives.css";

export type StatusBadgeTone = "neutral" | "outcome-positive" | "outcome-negative";

export interface StatusBadgeProps {
  glyph: string;
  label: string;
  tone?: StatusBadgeTone;
}

export function StatusBadge({ glyph, label, tone = "neutral" }: StatusBadgeProps) {
  const toneClass = tone === "neutral" ? "" : ` status-badge--${tone}`;
  return (
    <span className={`status-badge${toneClass}`}>
      <span className="status-badge__glyph" aria-hidden="true">
        {glyph}
      </span>
      {label}
    </span>
  );
}
