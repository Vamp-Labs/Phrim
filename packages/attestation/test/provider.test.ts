import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildServer } from '../src/server.js';
import { createTestServer, type TestServerHandle } from './testServer.js';

let handle: TestServerHandle;
let extraTempDir: string | undefined;

afterEach(() => {
  handle.close();
  if (extraTempDir !== undefined) {
    rmSync(extraTempDir, { recursive: true, force: true });
    extraTempDir = undefined;
  }
});

describe('GET /v1/provider', () => {
  it('returns the provider id and public key coordinates as decimal strings, never a key', async () => {
    handle = createTestServer();
    const response = await handle.context.app.inject({ method: 'GET', url: '/v1/provider' });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.providerId).toBe(1);
    expect(typeof body.publicKeyX).toBe('string');
    expect(typeof body.publicKeyY).toBe('string');
    expect(() => BigInt(body.publicKeyX)).not.toThrow();
    expect(() => BigInt(body.publicKeyY)).not.toThrow();
    expect(JSON.stringify(body)).not.toMatch(/privateScalar|seed|secretKey/i);
  });

  it('returns the same public key across restarts on the same persisted key', async () => {
    extraTempDir = mkdtempSync(join(tmpdir(), 'phrim-attestation-restart-test-'));
    const keyFilePath = join(extraTempDir, 'attestor.json');
    const noopSink = (): void => undefined;
    const first = buildServer({ keyFilePath, accessLogSink: noopSink });
    const firstResponse = await first.app.inject({ method: 'GET', url: '/v1/provider' });
    const second = buildServer({ keyFilePath, accessLogSink: noopSink });
    const secondResponse = await second.app.inject({ method: 'GET', url: '/v1/provider' });
    expect(secondResponse.json().publicKeyX).toBe(firstResponse.json().publicKeyX);
    expect(secondResponse.json().publicKeyY).toBe(firstResponse.json().publicKeyY);
    handle = createTestServer();
  });
});
