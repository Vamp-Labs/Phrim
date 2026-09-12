import { hash1, hash2 } from "../hash";
import type { AsciiCell, AsciiSampleContext, AsciiTheme } from "../types";

const RAW_GLYPHS = "01";
const MASKED_GLYPHS = "*·:X%▓░";

export const matrixStreamTheme: AsciiTheme = {
  id: "matrix-stream",
  label: "The Confidential Matrix Stream",
  glyphs: RAW_GLYPHS + MASKED_GLYPHS,
  sample(column, row, context: AsciiSampleContext): AsciiCell | null {
    const { rows, time } = context;
    const speed = 6 + hash1(column) * 10;
    const seedOffset = hash1(column * 3.1) * rows;
    const trail = 10;
    const head = ((time * speed + seedOffset) % (rows + trail)) - trail;
    const distanceBehindHead = head - row;

    if (distanceBehindHead < 0 || distanceBehindHead > trail) {
      return null;
    }

    const intensity = 1 - distanceBehindHead / trail;
    const isLeftLane = column % 2 === 0;
    const burst = Math.sin(time * 0.6 + column) > 0.985;

    if (isLeftLane && !burst) {
      const char = hash2(column, Math.floor(head)) > 0.5 ? RAW_GLYPHS.charAt(0) : RAW_GLYPHS.charAt(1);
      return { char, intensity: intensity * 0.7 };
    }

    const glyphIndex = Math.floor(hash2(column * 1.7, Math.floor(head) + (burst ? 99 : 0)) * MASKED_GLYPHS.length);
    return { char: MASKED_GLYPHS.charAt(glyphIndex % MASKED_GLYPHS.length), intensity };
  },
};
