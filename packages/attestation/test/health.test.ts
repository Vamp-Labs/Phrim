import { afterEach, describe, expect, it } from 'vitest';
import { createTestServer, type TestServerHandle } from './testServer.js';

let handle: TestServerHandle;

afterEach(() => {
  handle.close();
});

describe('GET /health', () => {
  it('returns status, version, providerId and keyLoaded without the key', async () => {
    handle = createTestServer();
    const response = await handle.context.app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('attestation');
    expect(typeof body.version).toBe('string');
    expect(body.providerId).toBe(1);
    expect(typeof body.keyLoaded).toBe('boolean');
    expect(JSON.stringify(body)).not.toMatch(/seed/i);
  });
});
