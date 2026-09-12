import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';

export const ZK_CONFIG_PATH = '/zk-config';

export type PhrimProvableCircuitId =
  | 'createFacility'
  | 'fundOrMintDemoToken'
  | 'freezeFacility'
  | 'closeFacility'
  | 'vaultBalance'
  | 'requestDraw';

export function resolveZkConfigBaseUrl(originUrl: string): string {
  return new URL(ZK_CONFIG_PATH, originUrl).toString();
}

export function createPhrimZkConfigProvider(originUrl: string): FetchZkConfigProvider<PhrimProvableCircuitId> {
  return new FetchZkConfigProvider<PhrimProvableCircuitId>(resolveZkConfigBaseUrl(originUrl));
}
