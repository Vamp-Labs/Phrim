import { bytesToHex } from './bytes.js';

export const DOMAIN_SEPARATOR_WORD_LENGTH = 32;

export const DOMAIN_SEPARATOR_PADDING_DIRECTION: 'right' = 'right';

export interface DomainSeparator {
  readonly name: string;
  readonly ascii: string;
  readonly asciiByteLength: number;
  readonly padded: Uint8Array;
}

function buildDomainSeparator(name: string, ascii: string, expectedAsciiByteLength: number): DomainSeparator {
  const encoded = new TextEncoder().encode(ascii);
  if (encoded.length !== expectedAsciiByteLength) {
    throw new RangeError(
      `domain separator "${name}" expected ${expectedAsciiByteLength} ASCII bytes, got ${encoded.length}`,
    );
  }
  if (encoded.length > DOMAIN_SEPARATOR_WORD_LENGTH) {
    throw new RangeError(`domain separator "${name}" exceeds ${DOMAIN_SEPARATOR_WORD_LENGTH} bytes`);
  }
  const padded = new Uint8Array(DOMAIN_SEPARATOR_WORD_LENGTH);
  if (DOMAIN_SEPARATOR_PADDING_DIRECTION === 'right') {
    padded.set(encoded, 0);
  } else {
    padded.set(encoded, DOMAIN_SEPARATOR_WORD_LENGTH - encoded.length);
  }
  return { name, ascii, asciiByteLength: encoded.length, padded };
}

export const DS_CREDENTIAL = buildDomainSeparator('DS_CREDENTIAL', 'phrim:credential:v1', 19);
export const DS_ASSET_NULLIFIER = buildDomainSeparator('DS_ASSET_NULLIFIER', 'phrim:asset-nullifier:v1', 24);
export const DS_AUTHORITY = buildDomainSeparator('DS_AUTHORITY', 'phrim:authority:v1', 18);
export const DS_DRAW_ID = buildDomainSeparator('DS_DRAW_ID', 'phrim:draw-id:v1', 16);

export const DOMAIN_SEPARATORS = {
  DS_CREDENTIAL,
  DS_ASSET_NULLIFIER,
  DS_AUTHORITY,
  DS_DRAW_ID,
} as const;

export function domainSeparatorHex(separator: DomainSeparator): string {
  return bytesToHex(separator.padded);
}
