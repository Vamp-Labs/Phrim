import type { AsciiCell, AsciiSampleContext, AsciiTheme } from "../types";

const RING_GLYPHS = "+-|/\\[]O#";

export const vaultTheme: AsciiTheme = {
  id: "vault",
  label: "The Cryptographic Vault",
  glyphs: RING_GLYPHS,
  sample(column, row, context: AsciiSampleContext): AsciiCell | null {
    const { columns, rows, time } = context;
    const cx = columns / 2;
    const cy = rows / 2;
    const dx = column - cx;
    const dy = (row - cy) * 2.1;
    const radius = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const maxRadius = Math.min(columns, rows * 2.1) * 0.46;

    if (radius > maxRadius) {
      const pillarSpacing = Math.max(6, Math.floor(columns / 7));
      if (column % pillarSpacing === 0 && Math.abs(dx) > maxRadius * 0.55) {
        return { char: "|", intensity: 0.28 };
      }
      return null;
    }

    if (radius < maxRadius * 0.1) {
      return { char: "O", intensity: 0.95 };
    }

    const ringIndex = Math.floor((radius / maxRadius) * 6);
    const direction = ringIndex % 2 === 0 ? 1 : -1;
    const angularSpeed = 0.12 + ringIndex * 0.05;
    const rotated = angle + time * angularSpeed * direction;
    const notchCount = 10 + ringIndex * 5;
    const notch = Math.cos(rotated * notchCount);

    if (notch > 0.55) {
      const glyphIndex = Math.floor(((rotated + Math.PI) / (2 * Math.PI)) * RING_GLYPHS.length);
      const char = RING_GLYPHS.charAt(((glyphIndex % RING_GLYPHS.length) + RING_GLYPHS.length) % RING_GLYPHS.length);
      return { char, intensity: 0.45 + ringIndex * 0.08 };
    }

    return null;
  },
};
