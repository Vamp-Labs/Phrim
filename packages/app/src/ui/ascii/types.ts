export type ThemeId = "vault" | "matrix-stream" | "circuit-synth" | "settlement" | "merkle-dag";

export interface AsciiSampleContext {
  columns: number;
  rows: number;
  time: number;
  mouseX: number;
  mouseY: number;
}

export interface AsciiCell {
  char: string;
  intensity: number;
}

export interface AsciiTheme {
  id: ThemeId;
  label: string;
  glyphs: string;
  sample(column: number, row: number, context: AsciiSampleContext): AsciiCell | null;
}
