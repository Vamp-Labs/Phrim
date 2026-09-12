import type { ReactNode } from "react";
import "./primitives.css";

export interface PillButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

export function PillButton({ children, onClick, type = "button", disabled }: PillButtonProps) {
  return (
    <button
      type={type}
      className="pill-button pill-button--dark"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
