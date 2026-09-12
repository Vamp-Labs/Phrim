function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function maskAssetRef(assetNonceHex: string, slot: number): string {
  const tag = fnv1a(`phrim:display-mask:v1:${slot}:${assetNonceHex}`)
    .toString(16)
    .padStart(8, '0')
    .slice(-4);
  return `∎∎∎∎-${tag}`;
}

export function maskOutstandingMinor(): string {
  return '$••,•••.••';
}

export function maskDaysPastDue(): string {
  return '•• days';
}

export function maskRiskScore(): string {
  return '•••';
}
