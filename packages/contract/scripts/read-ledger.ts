import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { phrimLedger } from '../src/index.js';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function main(): Promise<void> {
  const contractAddress = process.argv[2];
  if (contractAddress === undefined || contractAddress.length === 0) {
    throw new Error('usage: tsx scripts/read-ledger.ts <contractAddress>');
  }
  const networkId = process.env['PHRIM_NETWORK_ID'] ?? 'preprod';
  setNetworkId(networkId as never);
  const indexerUrl = process.env['PHRIM_INDEXER_URL'] ?? 'https://indexer.preprod.midnight.network/api/v4/graphql';
  const indexerWsUrl =
    process.env['PHRIM_INDEXER_WS_URL'] ?? 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws';

  const publicDataProvider = indexerPublicDataProvider(indexerUrl, indexerWsUrl);
  const contractState = await publicDataProvider.queryContractState(contractAddress);
  if (contractState === null) {
    process.stdout.write(JSON.stringify({ contractAddress, found: false }, null, 2) + '\n');
    return;
  }
  const ledger = phrimLedger(contractState.data);
  const replacer = (_key: string, value: unknown): unknown => (typeof value === 'bigint' ? value.toString() : value);
  process.stdout.write(
    JSON.stringify(
      {
        contractAddress,
        found: true,
        facilityExists: ledger.facilityExists,
        facilityId: bytesToHex(ledger.facilityId),
        lenderAuthorityHash: bytesToHex(ledger.lenderAuthorityHash),
        borrowerAuthorityHash: bytesToHex(ledger.borrowerAuthorityHash),
        borrowerAddress: ledger.borrowerAddress,
        attestorProviderId: ledger.attestorProviderId.toString(),
        attestorPublicKeyX: ledger.attestorPublicKeyX.toString(),
        attestorPublicKeyY: ledger.attestorPublicKeyY.toString(),
        tokenColor: bytesToHex(ledger.tokenColor),
        creditLimit: ledger.creditLimit.toString(),
        outstanding: ledger.outstanding.toString(),
        advanceRateBps: ledger.advanceRateBps.toString(),
        maxDaysPastDue: ledger.maxDaysPastDue.toString(),
        minRiskScore: ledger.minRiskScore.toString(),
        minRemainingEpochs: ledger.minRemainingEpochs.toString(),
        currentEpoch: ledger.currentEpoch.toString(),
        status: ledger.status,
        drawCount: ledger.drawCount.toString(),
        usedAssetNullifiersSize: ledger.usedAssetNullifiers.size(),
      },
      replacer,
      2,
    ) + '\n',
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
