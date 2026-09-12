import type { AsciiCell, AsciiSampleContext, AsciiTheme } from "../types";

const UNIT = "[#]--->";

export const merkleDagTheme: AsciiTheme = {
  id: "merkle-dag",
  label: "The Merkle DAG & Block Lattice",
  glyphs: "[#]--->|+:.",
  sample(column, row, context: AsciiSampleContext): AsciiCell | null {
    const { rows, time } = context;
    const laneCount = 3;
    const laneSpacing = Math.floor(rows / (laneCount + 1));
    const laneIndex = Math.round(row / laneSpacing) - 1;

    if (laneIndex < 0 || laneIndex >= laneCount || row % laneSpacing !== 0) {
      return null;
    }

    const drift = Math.floor(time * (2 + laneIndex));
    const localPhase = (((column + drift) % UNIT.length) + UNIT.length) % UNIT.length;
    const char = UNIT.charAt(localPhase);

    if (char === " ") {
      return null;
    }

    const isNode = char === "#";
    return { char, intensity: isNode ? 0.85 : 0.4 };
  },
};
