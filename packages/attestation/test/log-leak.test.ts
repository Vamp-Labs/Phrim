import { afterEach, describe, expect, it } from 'vitest';
import { createTestServer, type TestServerHandle } from './testServer.js';

let handle: TestServerHandle;

afterEach(() => {
  handle.close();
});

const SENTINEL_OUTSTANDING_MINOR = '133713371337';

describe('access log privacy', () => {
  it('never logs a credential field value from a sign request', async () => {
    handle = createTestServer();
    await handle.context.app.inject({
      method: 'POST',
      url: '/v1/credentials/sign',
      payload: {
        credentials: [
          {
            schemaVersion: 1,
            providerId: 1,
            facilityId: `0x${'ab'.repeat(32)}`,
            assetNonce: `0x${'cd'.repeat(32)}`,
            outstandingMinor: SENTINEL_OUTSTANDING_MINOR,
            daysPastDue: 5,
            riskScore: 700,
            maturityEpoch: 12,
            snapshotEpoch: 7,
          },
        ],
      },
    });
    const serialized = JSON.stringify(handle.logs);
    expect(serialized).not.toContain(SENTINEL_OUTSTANDING_MINOR);
    expect(serialized).not.toContain('ab'.repeat(32));
    expect(serialized).not.toContain('cd'.repeat(32));
  });

  it('logs exactly the whitelisted fields for every request', async () => {
    handle = createTestServer();
    await handle.context.app.inject({ method: 'GET', url: '/v1/fixtures/eligible' });
    expect(handle.logs.length).toBe(1);
    const entry = handle.logs[0]!;
    expect(Object.keys(entry).sort()).toEqual(
      ['categoricalError', 'durationMs', 'method', 'path', 'scenarioId', 'statusCode'].sort(),
    );
    expect(entry.scenarioId).toBe('eligible');
  });

  it('never writes the attestor key file path or seed into log output', async () => {
    handle = createTestServer();
    await handle.context.app.inject({ method: 'GET', url: '/health' });
    const serialized = JSON.stringify(handle.logs);
    expect(serialized).not.toMatch(/attestor\.json|privateScalar/);
  });
});
