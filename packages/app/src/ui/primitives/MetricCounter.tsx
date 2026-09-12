import { useEffect, useRef, useState } from "react";
import "./primitives.css";

export interface MetricCounterProps {
  glyph: string;
  targetValue: number;
  prefix?: string;
  suffix?: string;
  label: string;
  index: number;
  decimals?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function MetricCounter({
  glyph,
  targetValue,
  prefix = "",
  suffix = "",
  label,
  index,
  decimals = 0,
}: MetricCounterProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const runCounter = () => {
      if (startedRef.current) {
        return;
      }
      startedRef.current = true;

      if (reduceMotion) {
        setDisplayValue(targetValue);
        return;
      }

      const duration = 1500 + index * 80;
      const delay = 480 + index * 90;
      const startTime = performance.now() + delay;
      let frame = 0;

      const tick = (now: number) => {
        if (now < startTime) {
          frame = requestAnimationFrame(tick);
          return;
        }
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setDisplayValue(targetValue * easeOutCubic(progress));
        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        }
      };

      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            runCounter();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [index, targetValue]);

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();

  return (
    <div className="metric-counter" ref={ref}>
      <span className="metric-counter__glyph" aria-hidden="true">
        {glyph}
      </span>
      <span className="metric-counter__value">
        {prefix}
        {formatted}
        {suffix}
      </span>
      <span className="metric-counter__label">{label}</span>
    </div>
  );
}
