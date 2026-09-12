import { extractPhrimErrorCode } from '@phrim/contract';
import { synthesizeDrawProof } from './circuitBinding';
import { EXPECTED_SLOT_COUNT } from './protocol';
import type { ProveRequestMessage, WorkerInboundMessage, WorkerOutboundMessage } from './protocol';

interface WorkerScope {
  postMessage: (message: WorkerOutboundMessage) => void;
  onmessage: ((event: MessageEvent<WorkerInboundMessage>) => void) | null;
}

const scope = self as unknown as WorkerScope;

function isValidProveRequest(message: WorkerInboundMessage): message is ProveRequestMessage {
  return message.type === 'prove' && message.slots.length === EXPECTED_SLOT_COUNT;
}

async function handleProveRequest(message: ProveRequestMessage): Promise<void> {
  const startedAt = performance.now();
  scope.postMessage({ type: 'progress', requestId: message.requestId, stage: 'preparing' });
  scope.postMessage({ type: 'progress', requestId: message.requestId, stage: 'proving' });
  try {
    const artifact = await synthesizeDrawProof(message);
    scope.postMessage({
      type: 'success',
      requestId: message.requestId,
      provenTransactionHex: artifact.provenTransactionHex,
      durationMs: performance.now() - startedAt,
    });
  } catch (error) {
    scope.postMessage({
      type: 'failure',
      requestId: message.requestId,
      code: extractPhrimErrorCode(error) ?? null,
      durationMs: performance.now() - startedAt,
    });
  }
}

scope.onmessage = (event) => {
  const message = event.data;
  if (!isValidProveRequest(message)) {
    return;
  }
  void handleProveRequest(message);
};
