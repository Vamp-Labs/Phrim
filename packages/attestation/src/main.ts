import { buildServer } from './server.js';

const PORT = Number.parseInt(process.env['PORT'] ?? process.env['PHRIM_ATTESTATION_PORT'] ?? '4300', 10);
const HOST = process.env['PHRIM_ATTESTATION_HOST'] ?? '0.0.0.0';
const CORS_ORIGIN = process.env['PHRIM_ATTESTATION_CORS_ORIGIN'];
const KEY_FILE_PATH = process.env['PHRIM_ATTESTOR_KEY_PATH'];

const { app, signerError } = buildServer({
  ...(CORS_ORIGIN !== undefined && CORS_ORIGIN.length > 0 ? { corsOrigin: CORS_ORIGIN } : {}),
  ...(KEY_FILE_PATH !== undefined && KEY_FILE_PATH.length > 0 ? { keyFilePath: KEY_FILE_PATH } : {}),
});

if (signerError !== null) {
  process.stderr.write(`attestation: signer unavailable — ${signerError.message}\n`);
}

app
  .listen({ port: PORT, host: HOST })
  .then(() => {
    process.stdout.write(`attestation: listening on http://${HOST}:${PORT}\n`);
  })
  .catch((error: unknown) => {
    process.stderr.write(`attestation: failed to start — ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
