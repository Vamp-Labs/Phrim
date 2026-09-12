import { useId } from "react";
import "./primitives.css";

export type InputFieldKind = "text" | "number" | "bps" | "money" | "hash";

export interface InputFieldProps {
  label: string;
  value: string;
  kind: InputFieldKind;
  hint?: string | null;
  error?: string | null;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

function affixFor(kind: InputFieldKind): { prefix?: string; suffix?: string } {
  if (kind === "money") {
    return { prefix: "$" };
  }
  if (kind === "bps") {
    return { suffix: "%" };
  }
  return {};
}

export function InputField({ label, value, kind, hint, error, disabled, onChange }: InputFieldProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const { prefix, suffix } = affixFor(kind);
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="field">
      <label className="field__label" htmlFor={inputId}>
        {label}
      </label>
      <div className={`field__control-row${error ? " field__control-row--error" : ""}`}>
        {prefix ? (
          <span className="field__affix" aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <input
          id={inputId}
          className={`field__input field__input--${kind}`}
          type="text"
          inputMode={kind === "number" || kind === "bps" || kind === "money" ? "numeric" : "text"}
          value={value}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(event) => onChange?.(event.target.value)}
        />
        {suffix ? (
          <span className="field__affix" aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? (
        <span className="field__hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="field__error" id={errorId} role="alert">
          <span aria-hidden="true">!</span>
          {error}
        </span>
      ) : null}
    </div>
  );
}
