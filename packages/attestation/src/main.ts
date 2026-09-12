import { buildServer } from './server.js';

const PORT = Number.parseInt(process.env.PHRIM_ATTESTATION_PORT ?? '4300', 10);
const HOST = process.env.PHRIM_ATTESTATION_HOST ?? '127.0.0.1';

const { app, signerError } = buildServer();

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
