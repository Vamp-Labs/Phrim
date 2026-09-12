import type { AttestedAssetCredentialJson, PhrimErrorCode, ScenarioId } from 'schema';
import { ATTESTATION_BASE_URL } from './attestationConfig';

export interface ScenarioFixtureResponse {
  scenarioId: ScenarioId;
  description: string;
  requestedDrawMinor: string;
  eligibleTotalMinor: string;
  expectedOutcome: 'funded' | 'rejected';
  expectedErrorCode: PhrimErrorCode | null;
  occupiedSlotCount: number;
  signaturesPending: boolean;
  credentials: readonly AttestedAssetCredentialJson[];
}

export async function fetchScenarioFixture(scenario: ScenarioId): Promise<ScenarioFixtureResponse> {
  const response = await fetch(`${ATTESTATION_BASE_URL}/v1/fixtures/${scenario}`);
  if (!response.ok) {
    throw new Error('NETWORK_UNAVAILABLE');
  }
  return (await response.json()) as ScenarioFixtureResponse;
}
