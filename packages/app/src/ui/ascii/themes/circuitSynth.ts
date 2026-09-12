import { hash2 } from "../hash";
import type { AsciiCell, AsciiSampleContext, AsciiTheme } from "../types";

const GLYPHS = "~^-+=*#<";
const LATTICE_SPACING = 5;

export const circuitSynthTheme: AsciiTheme = {
  id: "circuit-synth",
  label: "The ZK Circuit Synthesizer",
  glyphs: GLYPHS,
  sample(column, row, context: AsciiSampleContext): AsciiCell | null {
    const { columns, rows, time } = context;
    const cx = columns / 2;
    const cy = rows / 2;
    const dx = column - cx;
    const dy = (row - cy) * 2.1;
    const radius = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = Math.sqrt(cx * cx + (cy * 2.1) * (cy * 2.1));

    const onLattice = column % LATTICE_SPACING === 0 || row % LATTICE_SPACING === 0;
    if (!onLattice) {
      return null;
    }

    const isNode = column % LATTICE_SPACING === 0 && row % LATTICE_SPACING === 0;
    const wavePhase = Math.sin(time * 1.6 - (radius / maxRadius) * 9);
    const pulse = (wavePhase + 1) / 2;

    if (isNode) {
      if (pulse < 0.25) {
        return null;
      }
      const glyphIndex = Math.floor(pulse * (GLYPHS.length - 1));
      return { char: GLYPHS.charAt(glyphIndex), intensity: 0.4 + pulse * 0.6 };
    }

    if (pulse < 0.55) {
      return null;
    }

    const horizontal = row % LATTICE_SPACING !== 0;
    const flicker = hash2(column * 0.3, row * 0.7) > 0.4;
    if (!flicker) {
      return null;
    }
    return { char: horizontal ? "-" : "|", intensity: 0.2 + pulse * 0.4 };
  },
};
