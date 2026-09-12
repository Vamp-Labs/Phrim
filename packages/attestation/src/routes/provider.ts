import type { FastifyInstance } from 'fastify';
import type { AttestorSigner } from '../signer.js';

export interface ProviderRouteOptions {
  readonly providerId: number;
  readonly getSigner: () => AttestorSigner | null;
  readonly getSignerError: () => Error | null;
}

export function registerProviderRoute(app: FastifyInstance, options: ProviderRouteOptions): void {
  app.get('/v1/provider', async (request, reply) => {
    const signer = options.getSigner();
    if (signer === null) {
      request.categoricalError = 'PENDING_SCHEMA_LOCK';
      return reply.status(501).send({
        error: 'PENDING_SCHEMA_LOCK',
        message: 'Attestor public key is not derivable until the Schnorr-over-Jubjub signer is wired.',
      });
    }
    const publicKey = signer.publicKey();
    return reply.status(200).send({
      providerId: options.providerId,
      publicKeyX: publicKey.x.toString(10),
      publicKeyY: publicKey.y.toString(10),
    });
  });
}
