import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildServer, type AttestationServerContext } from '../src/server.js';
import type { AccessLogEntry } from '../src/logging.js';

export interface TestServerHandle {
  readonly context: AttestationServerContext;
  readonly logs: AccessLogEntry[];
  readonly tempDir: string;
  close(): void;
}

export function createTestServer(): TestServerHandle {
  const tempDir = mkdtempSync(join(tmpdir(), 'phrim-attestation-test-'));
  const logs: AccessLogEntry[] = [];
  const context = buildServer({
    keyFilePath: join(tempDir, 'attestor.json'),
    accessLogSink: (entry) => logs.push(entry),
  });
  return {
    context,
    logs,
    tempDir,
    close: () => rmSync(tempDir, { recursive: true, force: true }),
  };
}
