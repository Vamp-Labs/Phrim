import { afterEach, describe, expect, it } from 'vitest';
import { createTestServer, type TestServerHandle } from './testServer.js';

let handle: TestServerHandle;

afterEach(() => {
  handle.close();
});

describe('GET /v1/fixtures/:scenario', () => {
  it('returns the eligible scenario fully signed', async () => {
    handle = createTestServer();
    const response = await handle.context.app.inject({ method: 'GET', url: '/v1/fixtures/eligible' });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.scenarioId).toBe('eligible');
    expect(body.occupiedSlotCount).toBe(8);
    expect(body.eligibleTotalMinor).toBe('10000000');
    expect(body.signaturesPending).toBe(false);
    expect(Array.isArray(body.credentials)).toBe(true);
    expect(body.credentials.length).toBe(8);
    for (const credential of body.credentials) {
      expect(() => BigInt(credential.signatureR8x)).not.toThrow();
      expect(() => BigInt(credential.signatureR8y)).not.toThrow();
      expect(() => BigInt(credential.signatureS)).not.toThrow();
      expect(BigInt(credential.signatureS)).not.toBe(0n);
    }
  });

  it('rejects an id outside the five-scenario allowlist with 400', async () => {
    handle = createTestServer();
    const response = await handle.context.app.inject({ method: 'GET', url: '/v1/fixtures/not-a-scenario' });
    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('UNKNOWN_SCENARIO');
  });

  it('rejects a path-traversal attempt with 400 and never touches the filesystem', async () => {
    handle = createTestServer();
    const response = await handle.context.app.inject({
      method: 'GET',
      url: '/v1/fixtures/' + encodeURIComponent('../../../etc/passwd'),
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('UNKNOWN_SCENARIO');
  });

  it('reports the undercollateralized scenario with six occupied slots totalling $85,000', async () => {
    handle = createTestServer();
    const response = await handle.context.app.inject({ method: 'GET', url: '/v1/fixtures/undercollateralized' });
    const body = response.json();
    expect(body.occupiedSlotCount).toBe(6);
    expect(body.eligibleTotalMinor).toBe('8500000');
    expect(body.expectedErrorCode).toBe('INSUFFICIENT_COLLATERAL');
  });
});
