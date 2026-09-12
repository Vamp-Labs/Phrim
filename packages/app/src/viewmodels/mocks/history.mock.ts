import type { DrawReceiptVM, HistoryVM } from '../types';

const MOCK_RECEIPTS: DrawReceiptVM[] = [
  {
    drawId: 'DRAW-0001',
    epoch: 7,
    amountMinor: '7500000',
    resultingOutstandingMinor: '7500000',
    completed: true,
  },
];

export const MOCK_HISTORY_ACTIVE_WITH_RECEIPTS: HistoryVM = {
  status: 'Active',
  vaultMinor: '7500000',
  outstandingMinor: '7500000',
  capacityMinor: '12500000',
  receipts: MOCK_RECEIPTS,
};

export const MOCK_HISTORY_EMPTY: HistoryVM = {
  status: 'Active',
  vaultMinor: '15000000',
  outstandingMinor: '0',
  capacityMinor: '20000000',
  receipts: [],
};

export const MOCK_HISTORY_FROZEN: HistoryVM = {
  status: 'Frozen',
  vaultMinor: '7500000',
  outstandingMinor: '7500000',
  capacityMinor: '12500000',
  receipts: MOCK_RECEIPTS,
};

export const MOCK_HISTORY_CLOSED: HistoryVM = {
  status: 'Closed',
  vaultMinor: '0',
  outstandingMinor: '0',
  capacityMinor: '0',
  receipts: MOCK_RECEIPTS,
};
