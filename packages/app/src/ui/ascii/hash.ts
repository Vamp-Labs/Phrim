export function hash2(a: number, b: number): number {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function hash1(a: number): number {
  const x = Math.sin(a * 78.233) * 43758.5453;
  return x - Math.floor(x);
}
