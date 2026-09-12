import { afterEach, describe, expect, it } from 'vitest';
import { createTestServer, type TestServerHandle } from './testServer.js';

let handle: TestServerHandle;

afterEach(() => {
  handle.close();
});

const validUnsignedCredential = {
  schemaVersion: 1,
  providerId: 1,
  facilityId: `0x${'ab'.repeat(32)}`,
  assetNonce: `0x${'cd'.repeat(32)}`,
  outstandingMinor: '1000000',
  daysPastDue: 5,
  riskScore: 700,
  maturityEpoch: 12,
  snapshotEpoch: 7,
};

describe('POST /v1/credentials/sign', () => {
  it('rejects nine records', async () => {
    handle = createTestServer();
    const response = await handle.context.app.inject({
      method: 'POST',
      url: '/v1/credentials/sign',
      payload: { credentials: Array.from({ length: 9 }, () => validUnsignedCredential) },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('INVALID_BATCH_SIZE');
  });

  it('rejects an empty batch', async () => {
    handle = createTestServer();
    const response = await handle.context.app.inject({
      method: 'POST',
      url: '/v1/credentials/sign',
      payload: { credentials: [] },
    });
    expect(response.statusCode).toBe(400);
  });

  it('rejects schemaVersion other than 1', async () => {
    handle = createTestServer();
    const response = await handle.context.app.inject({
      method: 'POST',
      url: '/v1/credentials/sign',
      payload: { credentials: [{ ...validUnsignedCredential, schemaVersion: 2 }] },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('UNSUPPORTED_SCHEMA_VERSION');
  });

  it('rejects a malformed facilityId', async () => {
    handle = createTestServer();
    const response = await handle.context.app.inject({
      method: 'POST',
      url: '/v1/credentials/sign',
      payload: { credentials: [{ ...validUnsignedCredential, facilityId: '0xnot-hex' }] },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('MALFORMED_CREDENTIAL_FIELD');
  });

  it('rejects an out-of-range daysPastDue', async () => {
    handle = createTestServer();
    const response = await handle.context.app.inject({
      method: 'POST',
      url: '/v1/credentials/sign',
      payload: { credentials: [{ ...validUnsignedCredential, daysPastDue: 2 ** 16 }] },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('MALFORMED_CREDENTIAL_FIELD');
  });

  it('signs a valid batch and returns real, verifiable-shaped signature components', async () => {
    handle = createTestServer();
    const response = await handle.context.app.inject({
      method: 'POST',
      url: '/v1/credentials/sign',
      payload: { credentials: [validUnsignedCredential] },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.credentials.length).toBe(1);
    const signed = body.credentials[0];
    expect(signed.outstandingMinor).toBe(validUnsignedCredential.outstandingMinor);
    expect(() => BigInt(signed.signatureR8x)).not.toThrow();
    expect(() => BigInt(signed.signatureR8y)).not.toThrow();
    expect(() => BigInt(signed.signatureS)).not.toThrow();
    expect(BigInt(signed.signatureS)).not.toBe(0n);
  });

  it('signs the same credential deterministically across two requests', async () => {
    handle = createTestServer();
    const first = await handle.context.app.inject({
      method: 'POST',
      url: '/v1/credentials/sign',
      payload: { credentials: [validUnsignedCredential] },
    });
    const second = await handle.context.app.inject({
      method: 'POST',
      url: '/v1/credentials/sign',
      payload: { credentials: [validUnsignedCredential] },
    });
    expect(first.json().credentials[0].signatureS).toBe(second.json().credentials[0].signatureS);
    expect(first.json().credentials[0].signatureR8x).toBe(second.json().credentials[0].signatureR8x);
  });
});
