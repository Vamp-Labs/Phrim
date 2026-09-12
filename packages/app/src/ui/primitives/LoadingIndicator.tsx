import { useEffect, useState } from "react";
import "./primitives.css";

const SPIN_GLYPHS = ["|", "/", "-", "\\"];

export interface LoadingInlineProps {
  label: string;
}

export function LoadingInline({ label }: LoadingInlineProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const interval = window.setInterval(() => {
      setFrame((value) => (value + 1) % SPIN_GLYPHS.length);
    }, 120);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <span className="loading-inline" role="status" aria-live="polite">
      <span className="loading-inline__glyph" aria-hidden="true">
        {SPIN_GLYPHS[frame]}
      </span>
      {label}
    </span>
  );
}

export interface LoadingSkeletonProps {
  label: string;
}

export function LoadingSkeleton({ label }: LoadingSkeletonProps) {
  return <div className="loading-skeleton" role="status" aria-label={label} />;
}
