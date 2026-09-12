import type { FastifyInstance } from 'fastify';
import { isScenarioId, unsignedCredentialToJson, credentialToJson } from 'schema';
import { UNSIGNED_SCENARIOS, materializeScenarioBatch } from 'schema/fixtures';
import type { AttestorSigner } from '../signer.js';

export interface FixturesRouteOptions {
  readonly getSigner: () => AttestorSigner | null;
}

export function registerFixturesRoute(app: FastifyInstance, options: FixturesRouteOptions): void {
  app.get<{ Params: { scenario: string } }>('/v1/fixtures/:scenario', async (request, reply) => {
    const { scenario } = request.params;
    if (!isScenarioId(scenario)) {
      request.categoricalError = 'UNKNOWN_SCENARIO';
      return reply.status(400).send({
        error: 'UNKNOWN_SCENARIO',
        message: 'scenario must be one of eligible, undercollateralized, stale, tampered, replay',
      });
    }
    request.scenarioId = scenario;
    const fixture = UNSIGNED_SCENARIOS[scenario];
    const signer = options.getSigner();
    if (signer === null) {
      return reply.status(200).send({
        scenarioId: fixture.id,
        description: fixture.description,
        requestedDrawMinor: fixture.requestedDrawMinor.toString(10),
        eligibleTotalMinor: fixture.eligibleTotalMinor.toString(10),
        expectedOutcome: fixture.expectedOutcome,
        expectedErrorCode: fixture.expectedErrorCode,
        occupiedSlotCount: fixture.occupiedAssets.length,
        signaturesPending: true,
        credentials: fixture.occupiedAssets.map((asset) => unsignedCredentialToJson(asset)),
      });
    }
    const batch = materializeScenarioBatch(fixture);
    const credentials = batch
      .filter((slot) => slot.slotOccupied)
      .map((slot) => credentialToJson(slot.credential));
    return reply.status(200).send({
      scenarioId: fixture.id,
      description: fixture.description,
      requestedDrawMinor: fixture.requestedDrawMinor.toString(10),
      eligibleTotalMinor: fixture.eligibleTotalMinor.toString(10),
      expectedOutcome: fixture.expectedOutcome,
      expectedErrorCode: fixture.expectedErrorCode,
      occupiedSlotCount: fixture.occupiedAssets.length,
      signaturesPending: false,
      credentials,
    });
  });
}
