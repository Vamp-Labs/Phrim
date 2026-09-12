import Fastify, { type FastifyInstance } from 'fastify';
import { bindFixtureSigner } from 'schema/fixtures';
import { bindPhrimPureCircuits } from 'schema';
import { phrimPureCircuits } from '@phrim/contract';
import { AttestorKeyStore, resolveDefaultKeyFilePath } from './key.js';
import { createAttestorSigner, type AttestorSigner } from './signer.js';
import { defaultAccessLogSink, type AccessLogSink } from './logging.js';
import { registerHealthRoute } from './routes/health.js';
import { registerProviderRoute } from './routes/provider.js';
import { registerFixturesRoute } from './routes/fixtures.js';
import { registerSignRoute } from './routes/sign.js';

export const SERVICE_VERSION = '0.1.0';
export const DEMO_ATTESTOR_PROVIDER_ID = 1;

declare module 'fastify' {
  interface FastifyRequest {
    scenarioId: string | null;
    categoricalError: string | null;
  }
}

export interface BuildServerOptions {
  readonly keyFilePath?: string;
  readonly providerId?: number;
  readonly accessLogSink?: AccessLogSink;
  readonly corsOrigin?: string;
}

export interface AttestationServerContext {
  readonly app: FastifyInstance;
  readonly signer: AttestorSigner | null;
  readonly signerError: Error | null;
  readonly providerId: number;
  readonly keyCreated: boolean;
}

export function buildServer(options: BuildServerOptions = {}): AttestationServerContext {
  const providerId = options.providerId ?? DEMO_ATTESTOR_PROVIDER_ID;
  const keyFilePath = options.keyFilePath ?? resolveDefaultKeyFilePath();
  const accessLogSink = options.accessLogSink ?? defaultAccessLogSink;
  const corsOrigin = options.corsOrigin ?? 'http://localhost:5173';

  bindPhrimPureCircuits(phrimPureCircuits);

  const keyStore = new AttestorKeyStore(keyFilePath, providerId);
  const loadedKey = keyStore.loadOrCreate();
  if (loadedKey.created) {
    process.stderr.write(
      `attestation: generated a NEW attestor key at ${keyFilePath}; all previously issued credentials are now invalid\n`,
    );
  }

  let signer: AttestorSigner | null = null;
  let signerError: Error | null = null;
  try {
    signer = createAttestorSigner(loadedKey.seed);
    bindFixtureSigner({ sign: (unsigned) => signer!.sign(unsigned) });
  } catch (error) {
    signerError = error instanceof Error ? error : new Error(String(error));
  }

  const app = Fastify({ logger: false });

  app.decorateRequest('scenarioId', null);
  app.decorateRequest('categoricalError', null);

  app.addHook('onRequest', async (request) => {
    (request as unknown as { startedAt: bigint }).startedAt = process.hrtime.bigint();
  });

  app.addHook('onResponse', async (request, reply) => {
    const startedAt = (request as unknown as { startedAt?: bigint }).startedAt;
    const durationNs = startedAt === undefined ? 0n : process.hrtime.bigint() - startedAt;
    accessLogSink({
      method: request.method,
      path: request.url,
      statusCode: reply.statusCode,
      durationMs: Number(durationNs) / 1_000_000,
      scenarioId: request.scenarioId,
      categoricalError: request.categoricalError,
    });
  });

  app.addHook('onSend', async (request, reply, payload) => {
    reply.header('access-control-allow-origin', corsOrigin);
    return payload;
  });

  app.options('/*', async (_request, reply) => {
    reply.header('access-control-allow-origin', corsOrigin);
    reply.header('access-control-allow-methods', 'GET,POST,OPTIONS');
    reply.header('access-control-allow-headers', 'content-type');
    return reply.status(204).send();
  });

  registerHealthRoute(app, { providerId, keyLoaded: signerError === null, version: SERVICE_VERSION });
  registerProviderRoute(app, { providerId, getSigner: () => signer, getSignerError: () => signerError });
  registerFixturesRoute(app, { getSigner: () => signer });
  registerSignRoute(app, { getSigner: () => signer });

  return { app, signer, signerError, providerId, keyCreated: loadedKey.created };
}
