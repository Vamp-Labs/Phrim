export type PhrimErrorCode =
  | 'INVALID_SIGNATURE'
  | 'WRONG_FACILITY'
  | 'STALE_EPOCH'
  | 'ASSET_INELIGIBLE'
  | 'INSUFFICIENT_COLLATERAL'
  | 'ASSET_ALREADY_USED'
  | 'CREDIT_LIMIT_EXCEEDED'
  | 'VAULT_INSUFFICIENT'
  | 'FACILITY_INACTIVE'
  | 'UNAUTHORIZED'
  | 'NETWORK_UNAVAILABLE';

export interface PhrimError {
  readonly code: PhrimErrorCode;
  readonly message: string;
  readonly recovery: string;
}

export const PHRIM_ERROR_TABLE: Readonly<Record<PhrimErrorCode, { readonly message: string; readonly recovery: string }>> = {
  INVALID_SIGNATURE: {
    message: 'One or more credentials are not authentic',
    recovery: 'Request a new signed credential batch',
  },
  WRONG_FACILITY: {
    message: 'Credentials belong to another facility',
    recovery: 'Load credentials issued for this facility',
  },
  STALE_EPOCH: {
    message: 'Credentials are from an earlier reporting period',
    recovery: 'Refresh from the servicer',
  },
  ASSET_INELIGIBLE: {
    message: 'One or more selected assets do not meet the facility policy',
    recovery: 'Select a valid signed batch',
  },
  INSUFFICIENT_COLLATERAL: {
    message: 'Eligible collateral does not support this draw',
    recovery: 'Lower the draw or add eligible assets',
  },
  ASSET_ALREADY_USED: {
    message: 'One or more assets already funded a draw',
    recovery: 'Use unpledged assets',
  },
  CREDIT_LIMIT_EXCEEDED: {
    message: 'The draw exceeds remaining facility capacity',
    recovery: 'Lower the draw',
  },
  VAULT_INSUFFICIENT: {
    message: 'The contract vault cannot fund the request',
    recovery: 'Lender funds the vault',
  },
  FACILITY_INACTIVE: {
    message: 'The facility is frozen or closed',
    recovery: 'Contact the lender',
  },
  UNAUTHORIZED: {
    message: 'The current user cannot perform this action',
    recovery: 'Connect the correct role',
  },
  NETWORK_UNAVAILABLE: {
    message: 'The request could not reach Midnight',
    recovery: 'Retry or use the prepared local fallback',
  },
};

export function buildPhrimError(code: PhrimErrorCode): PhrimError {
  const entry = PHRIM_ERROR_TABLE[code];
  return { code, message: entry.message, recovery: entry.recovery };
}

export const ALL_PHRIM_ERROR_CODES: readonly PhrimErrorCode[] = [
  'INVALID_SIGNATURE',
  'WRONG_FACILITY',
  'STALE_EPOCH',
  'ASSET_INELIGIBLE',
  'INSUFFICIENT_COLLATERAL',
  'ASSET_ALREADY_USED',
  'CREDIT_LIMIT_EXCEEDED',
  'VAULT_INSUFFICIENT',
  'FACILITY_INACTIVE',
  'UNAUTHORIZED',
  'NETWORK_UNAVAILABLE',
];
