import type { ProveRequestMessage, ProvingStage, WorkerOutboundMessage } from './protocol';

export interface ProveDrawCallbacks {
  onStage: (stage: ProvingStage) => void;
}

export interface ProveDrawResult {
  provenTransactionHex: string;
  durationMs: number;
}

export function createProvingWorker(): Worker {
  return new Worker(new URL('./proving.worker.ts', import.meta.url), { type: 'module' });
}

export function proveDraw(
  worker: Worker,
  request: ProveRequestMessage,
  callbacks: ProveDrawCallbacks,
): Promise<ProveDrawResult> {
  return new Promise((resolve, reject) => {
    function onMessage(event: MessageEvent<WorkerOutboundMessage>): void {
      const message = event.data;
      if (message.requestId !== request.requestId) {
        return;
      }
      if (message.type === 'progress') {
        callbacks.onStage(message.stage);
        return;
      }
      worker.removeEventListener('message', onMessage);
      if (message.type === 'success') {
        resolve({ provenTransactionHex: message.provenTransactionHex, durationMs: message.durationMs });
        return;
      }
      reject(message.code ?? 'NETWORK_UNAVAILABLE');
    }
    worker.addEventListener('message', onMessage);
    worker.postMessage(request);
  });
}
