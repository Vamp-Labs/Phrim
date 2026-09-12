import { AsciiMorph } from "./asciiMorph";
import { THEMES } from "./themes";
import type { AsciiTheme, ThemeId } from "./types";

const MAX_DEVICE_PIXEL_RATIO = 1.5;
const BASE_CELL_WIDTH = 9;
const BASE_CELL_HEIGHT = 16;
const SLOW_FRAME_MS = 24;
const SLOW_FRAME_TOLERANCE = 40;
const MAX_QUALITY_STEP = 2;

export interface AsciiEngineMetrics {
  fps: number;
  frameTimeMs: number;
  columns: number;
  rows: number;
  qualityStep: number;
}

export class AsciiEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private theme: AsciiTheme;
  private rafHandle: number | null = null;
  private running = false;
  private visible = true;
  private reducedMotion: boolean;
  private readonly reducedMotionQuery: MediaQueryList;
  private mouseX = 0.5;
  private mouseY = 0.5;
  private qualityStep = 0;
  private slowFrameStreak = 0;
  private lastFpsSampleTime = 0;
  private fpsFrameCount = 0;
  private metrics: AsciiEngineMetrics = { fps: 0, frameTimeMs: 0, columns: 0, rows: 0, qualityStep: 0 };
  private readonly morph = new AsciiMorph();
  private startTime = 0;

  constructor(canvas: HTMLCanvasElement, initialThemeId: ThemeId) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("2d context unavailable");
    }
    this.ctx = context;
    this.theme = THEMES[initialThemeId];
    this.reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.reducedMotionQuery.matches;
    this.reducedMotionQuery.addEventListener("change", this.handleReducedMotionChange);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  private handleReducedMotionChange = (event: MediaQueryListEvent) => {
    this.reducedMotion = event.matches;
    this.renderFrame(0);
  };

  private handleVisibilityChange = () => {
    this.visible = document.visibilityState === "visible";
  };

  setTheme(themeId: ThemeId): void {
    if (this.theme.id === themeId) {
      return;
    }
    this.theme = THEMES[themeId];
    this.morph.trigger(performance.now());
    if (this.reducedMotion) {
      this.renderFrame(0);
    }
  }

  setPointer(normalizedX: number, normalizedY: number): void {
    this.mouseX = normalizedX;
    this.mouseY = normalizedY;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  getMetrics(): AsciiEngineMetrics {
    return this.metrics;
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.reducedMotion) {
      this.renderFrame(0);
    }
  }

  start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.startTime = performance.now();
    if (this.reducedMotion) {
      this.renderFrame(0);
      return;
    }
    this.rafHandle = requestAnimationFrame(this.loop);
  }

  stop(): void {
    this.running = false;
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
  }

  destroy(): void {
    this.stop();
    this.reducedMotionQuery.removeEventListener("change", this.handleReducedMotionChange);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
  }

  private loop = (now: number) => {
    if (!this.running) {
      return;
    }
    if (!this.visible) {
      this.rafHandle = requestAnimationFrame(this.loop);
      return;
    }

    const frameStart = now;
    const elapsedSeconds = (now - this.startTime) / 1000;
    this.renderFrame(elapsedSeconds);

    const frameTime = performance.now() - frameStart;
    this.recordFrameMetrics(now, frameTime);
    this.adjustQuality(frameTime);

    this.rafHandle = requestAnimationFrame(this.loop);
  };

  private recordFrameMetrics(now: number, frameTime: number): void {
    this.fpsFrameCount += 1;
    if (now - this.lastFpsSampleTime >= 1000) {
      this.metrics = {
        ...this.metrics,
        fps: this.fpsFrameCount,
        frameTimeMs: Math.round(frameTime * 100) / 100,
      };
      this.fpsFrameCount = 0;
      this.lastFpsSampleTime = now;
    }
  }

  private adjustQuality(frameTime: number): void {
    if (frameTime > SLOW_FRAME_MS) {
      this.slowFrameStreak += 1;
    } else {
      this.slowFrameStreak = 0;
    }
    if (this.slowFrameStreak > SLOW_FRAME_TOLERANCE && this.qualityStep < MAX_QUALITY_STEP) {
      this.qualityStep += 1;
      this.slowFrameStreak = 0;
    }
  }

  private renderFrame(time: number): void {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    const cssWidth = this.canvas.width / dpr;
    const cssHeight = this.canvas.height / dpr;
    const cellWidth = BASE_CELL_WIDTH * (1 + this.qualityStep * 0.4);
    const cellHeight = BASE_CELL_HEIGHT * (1 + this.qualityStep * 0.4);
    const columns = Math.max(1, Math.floor(cssWidth / cellWidth));
    const rows = Math.max(1, Math.floor(cssHeight / cellHeight));

    this.metrics = { ...this.metrics, columns, rows, qualityStep: this.qualityStep };

    const ctx = this.ctx;
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.font = `${Math.floor(cellHeight * 0.82)}px "GeistPixelCircle", monospace`;
    ctx.textBaseline = "top";

    const now = performance.now();
    const morphing = this.morph.isActive(now);
    const morphProgress = this.morph.progress(now);

    const context = { columns, rows, time, mouseX: this.mouseX, mouseY: this.mouseY };

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        let char: string | null = null;
        let intensity = 0;

        if (morphing && Math.random() > morphProgress) {
          char = this.morph.randomGlyph();
          intensity = 0.3 + Math.random() * 0.5;
        } else {
          const cell = this.theme.sample(column, row, context);
          if (cell) {
            char = cell.char;
            intensity = cell.intensity;
          }
        }

        if (!char || intensity <= 0) {
          continue;
        }

        const alpha = Math.min(1, Math.max(0.08, intensity));
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.fillText(char, column * cellWidth, row * cellHeight);
      }
    }
  }
}
