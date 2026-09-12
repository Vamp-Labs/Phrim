import { deployPhrim, readDeployEnv } from './deploy.js';
import type { WalletProvider, MidnightProvider } from '@midnight-ntwrk/midnight-js-types';

async function main(): Promise<void> {
  const walletModulePath = process.env['PHRIM_WALLET_MODULE'];
  if (walletModulePath === undefined || walletModulePath.length === 0) {
    throw new Error(
      'PHRIM_WALLET_MODULE is not set. The rehearsal reset redeploys a fresh Phrim instance so its ' +
        'facility and nullifier set start empty; it needs the same wallet wiring as scripts/deploy.ts.',
    );
  }
  const walletModule = (await import(walletModulePath)) as {
    walletProvider: WalletProvider;
    midnightProvider: MidnightProvider;
  };
  const env = readDeployEnv();
  const result = await deployPhrim(env, walletModule.walletProvider, walletModule.midnightProvider);
  process.stdout.write(
    `${JSON.stringify({ rehearsalContractAddress: result.contractAddress }, null, 2)}\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(`${String(error instanceof Error ? (error.stack ?? error.message) : error)}\n`);
  process.exitCode = 1;
});
