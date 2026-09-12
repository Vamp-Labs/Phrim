import "./primitives.css";

export interface ErrorPanelProps {
  code: string;
  message: string;
  recovery: string;
  integrityNote?: string;
}

export function ErrorPanel({ code, message, recovery, integrityNote }: ErrorPanelProps) {
  return (
    <div className="error-panel" role="alert">
      <div className="error-panel__title">
        <span aria-hidden="true">X</span>
        {code}
      </div>
      <p className="error-panel__message">{message}</p>
      <p className="error-panel__recovery">{recovery}</p>
      {integrityNote ? <p className="error-panel__integrity">{integrityNote}</p> : null}
    </div>
  );
}
