import type { FastifyInstance } from 'fastify';
import {
  buildCanonicalWords,
  credentialToJson,
  unsignedCredentialFromJson,
  CREDENTIAL_SLOT_COUNT,
  SCHEMA_VERSION,
  type UnsignedAttestedAssetCredentialJson,
} from 'schema';
import type { AttestorSigner } from '../signer.js';

export interface SignRouteOptions {
  readonly getSigner: () => AttestorSigner | null;
}

interface SignRequestBody {
  readonly credentials: readonly UnsignedAttestedAssetCredentialJson[];
}

export function registerSignRoute(app: FastifyInstance, options: SignRouteOptions): void {
  app.post<{ Body: SignRequestBody }>('/v1/credentials/sign', async (request, reply) => {
    const body = request.body;
    if (body === undefined || body === null || !Array.isArray(body.credentials)) {
      request.categoricalError = 'MALFORMED_REQUEST';
      return reply.status(400).send({ error: 'MALFORMED_REQUEST', message: 'credentials must be an array' });
    }
    if (body.credentials.length === 0 || body.credentials.length > CREDENTIAL_SLOT_COUNT) {
      request.categoricalError = 'INVALID_BATCH_SIZE';
      return reply.status(400).send({
        error: 'INVALID_BATCH_SIZE',
        message: `credentials must contain between 1 and ${CREDENTIAL_SLOT_COUNT} records`,
      });
    }

    const unsigned = [];
    for (const entry of body.credentials) {
      if (entry.schemaVersion !== SCHEMA_VERSION) {
        request.categoricalError = 'UNSUPPORTED_SCHEMA_VERSION';
        return reply
          .status(400)
          .send({ error: 'UNSUPPORTED_SCHEMA_VERSION', message: `schemaVersion must equal ${SCHEMA_VERSION}` });
      }
      try {
        const credential = unsignedCredentialFromJson(entry);
        buildCanonicalWords(credential);
        unsigned.push(credential);
      } catch (error) {
        request.categoricalError = 'MALFORMED_CREDENTIAL_FIELD';
        return reply.status(400).send({
          error: 'MALFORMED_CREDENTIAL_FIELD',
          message: error instanceof Error ? error.message : 'invalid credential field',
        });
      }
    }

    const signer = options.getSigner();
    if (signer === null) {
      request.categoricalError = 'PENDING_SCHEMA_LOCK';
      return reply.status(501).send({
        error: 'PENDING_SCHEMA_LOCK',
        message: 'Signing is blocked until docs/handoffs/SCHEMA-LOCK.md exists and the pure circuits are wired.',
      });
    }

    const signed = unsigned.map((credential) => credentialToJson(signer.sign(credential)));
    return reply.status(200).send({ credentials: signed });
  });
}
