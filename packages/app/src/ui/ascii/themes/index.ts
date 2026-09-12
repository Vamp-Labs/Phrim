import { circuitSynthTheme } from "./circuitSynth";
import { matrixStreamTheme } from "./matrixStream";
import { merkleDagTheme } from "./merkleDag";
import { settlementTheme } from "./settlement";
import { vaultTheme } from "./vault";
import type { AsciiTheme, ThemeId } from "../types";

export const THEMES: Record<ThemeId, AsciiTheme> = {
  vault: vaultTheme,
  "matrix-stream": matrixStreamTheme,
  "circuit-synth": circuitSynthTheme,
  settlement: settlementTheme,
  "merkle-dag": merkleDagTheme,
};

export {
  circuitSynthTheme,
  matrixStreamTheme,
  merkleDagTheme,
  settlementTheme,
  vaultTheme,
};
