import type { FastifyInstance } from 'fastify';

export interface HealthRouteOptions {
  readonly providerId: number;
  readonly keyLoaded: boolean;
  readonly version: string;
}

export function registerHealthRoute(app: FastifyInstance, options: HealthRouteOptions): void {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'attestation',
    version: options.version,
    providerId: options.providerId,
    keyLoaded: options.keyLoaded,
  }));
}
