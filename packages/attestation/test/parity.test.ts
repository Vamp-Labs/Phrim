import { afterEach, describe, expect, it } from 'vitest';
import { buildCanonicalWords, credentialFromJson, unsignedCredentialFromJson } from 'schema';
import { createTestServer, type TestServerHandle } from './testServer.js';

let handle: TestServerHandle;

afterEach(() => {
  handle.close();
});

const unsignedCredentialJson = {
  schemaVersion: 1,
  providerId: 1,
  facilityId: `0x${'11'.repeat(32)}`,
  assetNonce: `0x${'22'.repeat(32)}`,
  outstandingMinor: '2500000',
  daysPastDue: 3,
  riskScore: 715,
  maturityEpoch: 14,
  snapshotEpoch: 7,
};

describe('attestation service and schema package agree on the canonical message (R12)', () => {
  it('the canonical words the service implicitly signs over equal the ones packages/schema computes locally', async () => {
    handle = createTestServer();
    const response = await handle.context.app.inject({
      method: 'POST',
      url: '/v1/credentials/sign',
      payload: { credentials: [unsignedCredentialJson] },
    });
    expect(response.statusCode).toBe(200);
    const signedJson = response.json().credentials[0];

    const localUnsigned = unsignedCredentialFromJson(unsignedCredentialJson);
    const localWords = buildCanonicalWords(localUnsigned);

    const returnedSigned = credentialFromJson(signedJson);
    const returnedWords = buildCanonicalWords(returnedSigned);

    expect(returnedWords.map((word) => Buffer.from(word).toString('hex'))).toEqual(
      localWords.map((word) => Buffer.from(word).toString('hex')),
    );
  });

  it('the service never alters a non-signature field of the credential it signs', async () => {
    handle = createTestServer();
    const response = await handle.context.app.inject({
      method: 'POST',
      url: '/v1/credentials/sign',
      payload: { credentials: [unsignedCredentialJson] },
    });
    const signedJson = response.json().credentials[0];
    expect(signedJson.schemaVersion).toBe(unsignedCredentialJson.schemaVersion);
    expect(signedJson.providerId).toBe(unsignedCredentialJson.providerId);
    expect(signedJson.facilityId).toBe(unsignedCredentialJson.facilityId);
    expect(signedJson.assetNonce).toBe(unsignedCredentialJson.assetNonce);
    expect(signedJson.outstandingMinor).toBe(unsignedCredentialJson.outstandingMinor);
    expect(signedJson.daysPastDue).toBe(unsignedCredentialJson.daysPastDue);
    expect(signedJson.riskScore).toBe(unsignedCredentialJson.riskScore);
    expect(signedJson.maturityEpoch).toBe(unsignedCredentialJson.maturityEpoch);
    expect(signedJson.snapshotEpoch).toBe(unsignedCredentialJson.snapshotEpoch);
  });

  it('two different credentials produce two different canonical digests and two different signatures', async () => {
    handle = createTestServer();
    const other = { ...unsignedCredentialJson, outstandingMinor: '2500001' };
    const response = await handle.context.app.inject({
      method: 'POST',
      url: '/v1/credentials/sign',
      payload: { credentials: [unsignedCredentialJson, other] },
    });
    const [first, second] = response.json().credentials;
    expect(first.signatureS).not.toBe(second.signatureS);
  });
});
