export const ATTESTATION_BASE_URL: string =
  typeof import.meta.env['VITE_ATTESTATION_BASE_URL'] === 'string' &&
  import.meta.env['VITE_ATTESTATION_BASE_URL'].length > 0
    ? import.meta.env['VITE_ATTESTATION_BASE_URL']
    : 'http://127.0.0.1:4300';
