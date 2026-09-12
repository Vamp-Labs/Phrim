import { findDeployedContract, type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { PublicDataProvider } from '@midnight-ntwrk/midnight-js-types';
import {
  PHRIM_PRIVATE_STATE_ID,
  createPhrimCompiledContract,
  createPhrimInitialPrivateState,
  phrimLedger,
  type Ledger as PhrimLedger,
  type PhrimContractInstance,
} from '@phrim/contract';
import { ZK_CONFIG_PATH } from './zkConfig';
import type { PhrimMainThreadProviders } from './providers';

export async function connectToDeployedPhrimContract(
  providers: PhrimMainThreadProviders,
  contractAddress: string,
): Promise<FoundContract<PhrimContractInstance>> {
  const compiledContract = createPhrimCompiledContract(ZK_CONFIG_PATH);
  return findDeployedContract(providers, {
    compiledContract,
    contractAddress,
    privateStateId: PHRIM_PRIVATE_STATE_ID,
    initialPrivateState: createPhrimInitialPrivateState(),
  });
}

export async function readPhrimLedgerState(
  publicDataProvider: PublicDataProvider,
  contractAddress: string,
): Promise<PhrimLedger | null> {
  const contractState = await publicDataProvider.queryContractState(contractAddress);
  if (contractState === null) {
    return null;
  }
  return phrimLedger(contractState.data);
}
