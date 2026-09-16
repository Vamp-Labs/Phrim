import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import type { WalletProvider, MidnightProvider } from '@midnight-ntwrk/midnight-js-types';
import {
  createPhrimCompiledContract,
  createPhrimInitialPrivateState,
  PHRIM_PRIVATE_STATE_ID,
  phrimPureCircuits,
} from '../src/index.js';
import { readDeployEnv } from './deploy.js';

const FACILITY_DEMO_001_ID_HEX = '2db1e5752a144cc7f7fae5bfd3b038c73a64d0ecfce2ce8591f5fbd8b05b8f5a';
const DEMO_ATTESTOR_PROVIDER_ID = 1n;
const DEMO_CREDIT_LIMIT_MINOR = 20_000_000n;
const DEMO_ADVANCE_RATE_BPS = 8_000n;
const DEMO_MAX_DAYS_PAST_DUE = 30n;
const DEMO_MIN_RISK_SCORE = 600n;
const DEMO_MIN_REMAINING_EPOCHS = 2n;
const DEMO_CURRENT_EPOCH = 7n;
const DEMO_VAULT_FUNDING_MINOR = 15_000_000n;

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (clean.length !== 64) {
    throw new Error(`expected a 32-byte hex string (64 chars), got ${clean.length} chars`);
  }
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i += 1) {
    bytes[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function main(): Promise<void> {
  const contractAddress = process.argv[2];
  if (contractAddress === undefined || contractAddress.length === 0) {
    throw new Error('usage: tsx scripts/create-facility.ts <contractAddress>');
  }

  const borrowerSecretHex = process.env['PHRIM_BORROWER_SECRET_HEX'];
  const lenderSecretHex = process.env['PHRIM_LENDER_SECRET_HEX'];
  const attestorPublicKeyXDec = process.env['PHRIM_ATTESTOR_PUBLIC_KEY_X'];
  const attestorPublicKeyYDec = process.env['PHRIM_ATTESTOR_PUBLIC_KEY_Y'];
  if (borrowerSecretHex === undefined || lenderSecretHex === undefined) {
    throw new Error('PHRIM_BORROWER_SECRET_HEX and PHRIM_LENDER_SECRET_HEX must be set.');
  }
  if (attestorPublicKeyXDec === undefined || attestorPublicKeyYDec === undefined) {
    throw new Error('PHRIM_ATTESTOR_PUBLIC_KEY_X and PHRIM_ATTESTOR_PUBLIC_KEY_Y must be set.');
  }

  const walletModulePath = process.env['PHRIM_WALLET_MODULE'];
  if (walletModulePath === undefined || walletModulePath.length === 0) {
    throw new Error('PHRIM_WALLET_MODULE is not set.');
  }
  const walletModule = (await import(walletModulePath)) as {
    walletProvider: WalletProvider;
    midnightProvider: MidnightProvider;
    deployerUnshieldedAddressHex: string;
  };

  const env = readDeployEnv();
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

  const found = await findDeployedContract(
    {
      privateStateProvider,
      publicDataProvider,
      zkConfigProvider,
      proofProvider,
      walletProvider: walletModule.walletProvider,
      midnightProvider: walletModule.midnightProvider,
    },
    {
      contractAddress,
      compiledContract,
      privateStateId: PHRIM_PRIVATE_STATE_ID,
      initialPrivateState,
    },
  );

  const borrowerSecret = hexToBytes(borrowerSecretHex);
  const lenderSecret = hexToBytes(lenderSecretHex);
  const borrowerAuthorityHash = phrimPureCircuits.deriveAuthorityHash(borrowerSecret);
  const borrowerAddressBytes = ledger.encodeUserAddress(walletModule.deployerUnshieldedAddressHex);

  const createResult = await found.callTx.createFacility(
    hexToBytes(FACILITY_DEMO_001_ID_HEX),
    lenderSecret,
    borrowerAuthorityHash,
    { bytes: borrowerAddressBytes },
    DEMO_ATTESTOR_PROVIDER_ID,
    BigInt(attestorPublicKeyXDec),
    BigInt(attestorPublicKeyYDec),
    DEMO_CREDIT_LIMIT_MINOR,
    DEMO_ADVANCE_RATE_BPS,
    DEMO_MAX_DAYS_PAST_DUE,
    DEMO_MIN_RISK_SCORE,
    DEMO_MIN_REMAINING_EPOCHS,
    DEMO_CURRENT_EPOCH,
  );

  process.stdout.write(
    `${JSON.stringify(
      {
        step: 'createFacility',
        contractAddress,
        borrowerAuthorityHash: bytesToHex(borrowerAuthorityHash),
        borrowerAddressHex: walletModule.deployerUnshieldedAddressHex,
        txId: createResult.public.txId,
        txHash: createResult.public.txHash,
        status: createResult.public.status,
      },
      null,
      2,
    )}\n`,
  );

  const fundResult = await found.callTx.fundOrMintDemoToken(lenderSecret, DEMO_VAULT_FUNDING_MINOR);

  process.stdout.write(
    `${JSON.stringify(
      {
        step: 'fundOrMintDemoToken',
        contractAddress,
        amountMinor: DEMO_VAULT_FUNDING_MINOR.toString(),
        txId: fundResult.public.txId,
        txHash: fundResult.public.txHash,
        status: fundResult.public.status,
      },
      null,
      2,
    )}\n`,
  );
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    process.stderr.write(`${String(error instanceof Error ? (error.stack ?? error.message) : error)}\n`);
    process.exit(1);
  });
