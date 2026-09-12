import type { ReactNode } from "react";
import "./primitives.css";

export interface GlowCtaProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
}

export function GlowCta({ children, href, onClick, disabled = false, busy = false }: GlowCtaProps) {
  if (href) {
    return (
      <a className="glow-cta" href={href} onClick={onClick} aria-busy={busy}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className="glow-cta" onClick={onClick} disabled={disabled} aria-busy={busy}>
      {children}
    </button>
  );
}
