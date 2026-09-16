import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FacilityStatus } from '@phrim/contract';
import { DEMO_VAULT_FUNDING_MINOR } from 'schema/fixtures';
import { HistoryView } from '../../ui/views';
import type { DrawReceiptVM, FacilityStatus as FacilityStatusVM, HistoryVM } from '../../viewmodels/types';
import { MOCK_HISTORY_ACTIVE_WITH_RECEIPTS } from '../../viewmodels/mocks';
import { WalletHeaderSlot } from '../components/WalletHeaderSlot';
import { getConfiguredContractAddress } from '../midnight/contractAddress';
import { readPhrimLedgerState } from '../midnight/contractClient';
import { resolveNetworkEndpoints } from '../midnight/network';
import { bytesToHex } from '../midnight/hex';
import { contractExplorerUrl } from '../midnight/explorer';

const PHRIM_DEMO_NETWORK_ID = 'preprod';

function facilityStatusToVm(status: FacilityStatus): FacilityStatusVM {
  if (status === FacilityStatus.Frozen) {
    return 'Frozen';
  }
  if (status === FacilityStatus.Closed) {
    return 'Closed';
  }
  return 'Active';
}

export function HistoryRoute() {
  const navigate = useNavigate();
  const [vm, setVm] = useState<HistoryVM | null>(null);

  useEffect(() => {
    const contractAddress = getConfiguredContractAddress(PHRIM_DEMO_NETWORK_ID);
    if (contractAddress === null) {
      return;
    }
    const endpoints = resolveNetworkEndpoints(PHRIM_DEMO_NETWORK_ID);
    const publicDataProvider = indexerPublicDataProvider(endpoints.indexerUrl, endpoints.indexerWsUrl);
    readPhrimLedgerState(publicDataProvider, contractAddress)
      .then((ledger) => {
        if (ledger === null || !ledger.facilityExists) {
          return;
        }
        const receipts: DrawReceiptVM[] = [];
        for (const [, receipt] of ledger.drawReceipts) {
          receipts.push({
            drawId: bytesToHex(receipt.drawId).slice(0, 12),
            epoch: Number(receipt.epoch),
            amountMinor: receipt.amount.toString(10),
            resultingOutstandingMinor: receipt.resultingOutstanding.toString(10),
            completed: receipt.completed,
          });
        }
        setVm({
          status: facilityStatusToVm(ledger.status),
          vaultMinor: (DEMO_VAULT_FUNDING_MINOR - ledger.outstanding).toString(10),
          outstandingMinor: ledger.outstanding.toString(10),
          capacityMinor: (ledger.creditLimit - ledger.outstanding).toString(10),
          receipts,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <HistoryView
      vm={vm ?? MOCK_HISTORY_ACTIVE_WITH_RECEIPTS}
      onNavigate={(id) => navigate(`/${id}`)}
      walletSlot={<WalletHeaderSlot />}
      contractExplorerUrl={contractExplorerUrl(
        PHRIM_DEMO_NETWORK_ID,
        getConfiguredContractAddress(PHRIM_DEMO_NETWORK_ID) ?? '',
      )}
    />
  );
}
