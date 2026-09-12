export const SCRAMBLE_GLYPHS = "@#*%&!";
export const MORPH_DURATION_MS = 300;

export class AsciiMorph {
  private startedAt: number | null = null;

  trigger(now: number): void {
    this.startedAt = now;
  }

  isActive(now: number): boolean {
    if (this.startedAt === null) {
      return false;
    }
    if (now - this.startedAt >= MORPH_DURATION_MS) {
      this.startedAt = null;
      return false;
    }
    return true;
  }

  progress(now: number): number {
    if (this.startedAt === null) {
      return 1;
    }
    return Math.min(1, (now - this.startedAt) / MORPH_DURATION_MS);
  }

  randomGlyph(): string {
    return SCRAMBLE_GLYPHS.charAt(Math.floor(Math.random() * SCRAMBLE_GLYPHS.length));
  }
}
