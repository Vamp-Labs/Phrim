import { useEffect, useRef, useState } from "react";
import { AsciiEngine, type AsciiEngineMetrics } from "./engine";
import type { ThemeId } from "./types";

export interface AsciiBackgroundProps {
  theme: ThemeId;
  debug?: boolean;
}

export function AsciiBackground({ theme, debug = false }: AsciiBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<AsciiEngine | null>(null);
  const [metrics, setMetrics] = useState<AsciiEngineMetrics | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const engine = new AsciiEngine(canvas, theme);
    engineRef.current = engine;
    engine.resize();
    engine.start();

    const handleResize = () => engine.resize();
    window.addEventListener("resize", handleResize);

    const handlePointerMove = (event: PointerEvent) => {
      engine.setPointer(event.clientX / window.innerWidth, event.clientY / window.innerHeight);
    };
    window.addEventListener("pointermove", handlePointerMove);

    let metricsInterval: number | undefined;
    if (debug) {
      metricsInterval = window.setInterval(() => {
        setMetrics(engine.getMetrics());
      }, 500);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      if (metricsInterval !== undefined) {
        window.clearInterval(metricsInterval);
      }
      engine.destroy();
      engineRef.current = null;
    };
  }, [debug, theme]);

  useEffect(() => {
    engineRef.current?.setTheme(theme);
  }, [theme]);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="phrim-ascii-bg"
        className="page__ascii"
        aria-hidden="true"
      />
      {debug && metrics ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 999,
            fontFamily: "monospace",
            fontSize: 11,
            color: "#0f0",
            background: "rgba(0,0,0,0.6)",
            padding: "4px 6px",
            pointerEvents: "none",
          }}
        >
          {metrics.fps}fps {metrics.frameTimeMs}ms {metrics.columns}x{metrics.rows} q{metrics.qualityStep}
        </div>
      ) : null}
    </>
  );
}
