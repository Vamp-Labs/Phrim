import "./primitives.css";

export interface MetricCardProps {
  label: string;
  value: string;
  sublabel?: string;
  href?: string;
  hrefLabel?: string;
}

export function MetricCard({ label, value, sublabel, href, hrefLabel }: MetricCardProps) {
  return (
    <div className="metric-card">
      <span className="metric-card__label">{label}</span>
      <span className="metric-card__value">{value}</span>
      {href !== undefined ? (
        <a className="metric-card__link" href={href} target="_blank" rel="noreferrer noopener">
          {hrefLabel ?? "Verify on explorer"} ↗
        </a>
      ) : null}
      {sublabel ? <span className="metric-card__sublabel">{sublabel}</span> : null}
    </div>
  );
}
