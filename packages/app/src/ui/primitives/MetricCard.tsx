import "./primitives.css";

export interface MetricCardProps {
  label: string;
  value: string;
  sublabel?: string;
}

export function MetricCard({ label, value, sublabel }: MetricCardProps) {
  return (
    <div className="metric-card">
      <span className="metric-card__label">{label}</span>
      <span className="metric-card__value">{value}</span>
      {sublabel ? <span className="metric-card__sublabel">{sublabel}</span> : null}
    </div>
  );
}
