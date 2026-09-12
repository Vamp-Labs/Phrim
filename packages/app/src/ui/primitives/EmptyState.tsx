import "./primitives.css";

export interface EmptyStateProps {
  glyph: string;
  message: string;
}

export function EmptyState({ glyph, message }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state__glyph" aria-hidden="true">
        {glyph}
      </span>
      <span>{message}</span>
    </div>
  );
}
