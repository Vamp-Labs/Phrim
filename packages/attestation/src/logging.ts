export interface AccessLogEntry {
  readonly method: string;
  readonly path: string;
  readonly statusCode: number;
  readonly durationMs: number;
  readonly scenarioId: string | null;
  readonly categoricalError: string | null;
}

export type AccessLogSink = (entry: AccessLogEntry) => void;

export function defaultAccessLogSink(entry: AccessLogEntry): void {
  process.stdout.write(`${JSON.stringify(entry)}\n`);
}
