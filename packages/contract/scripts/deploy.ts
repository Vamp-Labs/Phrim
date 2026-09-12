import type { WalletProvider, MidnightProvider } from '@midnight-ntwrk/midnight-js-types';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  createPhrimCompiledContract,
  createPhrimInitialPrivateState,
  PHRIM_PRIVATE_STATE_ID,
  PHRIM_NETWORK_IDS,
  type PhrimNetworkId,
} from '../src/index.js';

export type DeployEnv = {
  networkId: PhrimNetworkId;
  indexerUrl: string;
  indexerWsUrl: string;
  proofServerUrl: string;
  midnightDbName: string;
  accountId: string;
  privateStoragePassword: string;
};

export function readDeployEnv(): DeployEnv {
  const networkIdRaw = process.env['PHRIM_NETWORK_ID'] ?? PHRIM_NETWORK_IDS.local;
  const accountId = process.env['PHRIM_ACCOUNT_ID'];
  const privateStoragePassword = process.env['PHRIM_PRIVATE_STORAGE_PASSWORD'];
  if (accountId === undefined || accountId.length === 0) {
    throw new Error('PHRIM_ACCOUNT_ID is not set (use the deployer wallet address).');
  }
  if (privateStoragePassword === undefined || privateStoragePassword.length === 0) {
    throw new Error(
      'PHRIM_PRIVATE_STORAGE_PASSWORD is not set. This script never fabricates or stores a password; ' +
        'set a strong secret in your own environment.',
    );
  }
  return {
    networkId: networkIdRaw as PhrimNetworkId,
    indexerUrl: process.env['PHRIM_INDEXER_URL'] ?? 'http://localhost:8088/api/v4/graphql',
    indexerWsUrl: process.env['PHRIM_INDEXER_WS_URL'] ?? 'ws://localhost:8088/api/v4/graphql/ws',
    proofServerUrl: process.env['PHRIM_PROOF_SERVER_URL'] ?? 'http://localhost:6300',
    midnightDbName:
      process.env['PHRIM_PRIVATE_STATE_DB'] ??
      new URL('../../../.keys/midnight-level-db', import.meta.url).pathname,
    accountId,
    privateStoragePassword,
  };
}

export async function deployPhrim(env: DeployEnv, walletProvider: WalletProvider, midnightProvider: MidnightProvider) {
  setNetworkId(env.networkId);

  const zkConfigProvider = new NodeZkConfigProvider<
    'createFacility' | 'fundOrMintDemoToken' | 'requestDraw' | 'freezeFacility' | 'closeFacility' | 'vaultBalance'
  >(new URL('../managed/phrim', import.meta.url).pathname);
  const proofProvider = httpClientProofProvider(env.proofServerUrl, zkConfigProvider);
  const publicDataProvider = indexerPublicDataProvider(env.indexerUrl, env.indexerWsUrl);
  const privateStateProvider = levelPrivateStateProvider<typeof PHRIM_PRIVATE_STATE_ID>({
    midnightDbName: env.midnightDbName,
    accountId: env.accountId,
    privateStoragePasswordProvider: () => env.privateStoragePassword,
  });

  const compiledContract = createPhrimCompiledContract(new URL('../managed/phrim', import.meta.url).pathname);
  const initialPrivateState = createPhrimInitialPrivateState();

  const deployed = await deployContract(
    {
      privateStateProvider,
      publicDataProvider,
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
    },
    {
      privateStateId: PHRIM_PRIVATE_STATE_ID,
      compiledContract,
      initialPrivateState,
    },
  );

  return {
    contractAddress: deployed.deployTxData.public.contractAddress,
    txId: deployed.deployTxData.public.txId,
    txHash: deployed.deployTxData.public.txHash,
    blockHash: deployed.deployTxData.public.blockHash,
  };
}

async function main(): Promise<void> {
  const walletModulePath = process.env['PHRIM_WALLET_MODULE'];
  if (walletModulePath === undefined || walletModulePath.length === 0) {
    throw new Error(
      'PHRIM_WALLET_MODULE is not set. This script never fabricates or stores a wallet seed. Point it at a ' +
        'local, gitignored module exporting `walletProvider` and `midnightProvider` built from a funded ' +
        'wallet for the target network (see README "Deployment" section for the wiring pattern).',
    );
  }
  const walletModule = (await import(walletModulePath)) as {
    walletProvider: WalletProvider;
    midnightProvider: MidnightProvider;
  };
  const env = readDeployEnv();
  const result = await deployPhrim(env, walletModule.walletProvider, walletModule.midnightProvider);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${String(error instanceof Error ? (error.stack ?? error.message) : error)}\n`);
  process.exitCode = 1;
});
