import { existsSync, unlinkSync } from 'node:fs';
import { AttestorKeyStore, resolveDefaultKeyFilePath } from '../src/key.js';

const providerId = Number.parseInt(process.env.PHRIM_ATTESTATION_PROVIDER_ID ?? '1', 10);
const keyFilePath = resolveDefaultKeyFilePath();

if (existsSync(keyFilePath)) {
  unlinkSync(keyFilePath);
  process.stdout.write(`attestation: removed existing key at ${keyFilePath}\n`);
}

new AttestorKeyStore(keyFilePath, providerId).loadOrCreate();
process.stdout.write(
  `attestation: generated a NEW attestor key at ${keyFilePath}; all previously issued credentials are now invalid\n`,
);
