import { hash1, hash2 } from "../hash";
import type { AsciiCell, AsciiSampleContext, AsciiTheme } from "../types";

const PARTICLE_GLYPHS = "^/\\|()$o*";

const SCALE_PATTERN = ["   ^   ", "  /|\\  ", " (   ) ", "o     o"];

export const settlementTheme: AsciiTheme = {
  id: "settlement",
  label: "Atomic Settlement & Token Beam",
  glyphs: PARTICLE_GLYPHS,
  sample(column, row, context: AsciiSampleContext): AsciiCell | null {
    const { columns, rows, time } = context;
    const firstPatternRow = SCALE_PATTERN[0] ?? "";
    const scaleWidth = firstPatternRow.length;
    const scaleLeft = Math.floor(columns / 2 - scaleWidth / 2);
    const scaleTop = rows - SCALE_PATTERN.length - 1;

    if (row >= scaleTop && row < scaleTop + SCALE_PATTERN.length) {
      const localCol = column - scaleLeft;
      const patternRow = SCALE_PATTERN[row - scaleTop] ?? "";
      if (localCol >= 0 && localCol < patternRow.length) {
        const char = patternRow.charAt(localCol);
        if (char !== " " && char !== "") {
          return { char, intensity: 0.75 };
        }
      }
    }

    if (row >= scaleTop) {
      return null;
    }

    const columnActive = hash1(column * 2.3) > 0.62;
    if (!columnActive) {
      return null;
    }

    const speed = 4 + hash1(column * 5.1) * 6;
    const seed = hash1(column * 7.7) * scaleTop;
    const head = scaleTop - ((time * speed + seed) % scaleTop);
    const trail = 6;
    const distanceBehindHead = row - head;

    if (distanceBehindHead < 0 || distanceBehindHead > trail) {
      return null;
    }

    const intensity = 1 - distanceBehindHead / trail;
    const glyphIndex = Math.floor(hash2(column, Math.floor(head)) * PARTICLE_GLYPHS.length);
    return { char: PARTICLE_GLYPHS.charAt(glyphIndex % PARTICLE_GLYPHS.length), intensity };
  },
};
