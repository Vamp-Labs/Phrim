import {
  CostModel,
  QueryContext,
  createConstructorContext,
  sampleContractAddress,
  type CircuitContext,
} from '@midnight-ntwrk/compact-runtime';
import {
  Contract,
  type Ledger,
  ledger,
  type AssetCredential,
} from '../../managed/phrim/contract/index.js';
import { phrimWitnesses, createPhrimPrivateState, type PhrimPrivateState } from '../../src/witnesses.js';

export type EightSlots = [
  AssetCredential, AssetCredential, AssetCredential, AssetCredential,
  AssetCredential, AssetCredential, AssetCredential, AssetCredential,
];

export class PhrimSimulator {
  readonly contract: Contract<PhrimPrivateState>;
  circuitContext: CircuitContext<PhrimPrivateState>;

  constructor() {
    this.contract = new Contract<PhrimPrivateState>(phrimWitnesses);
    const { currentContractState, currentPrivateState, currentZswapLocalState } = this.contract.initialState(
      createConstructorContext(createPhrimPrivateState(), '0'.repeat(64)),
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      costModel: CostModel.initialCostModel(),
      currentQueryContext: new QueryContext(currentContractState.data, sampleContractAddress()),
    };
  }

  getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  createFacility(args: {
    facilityId: Uint8Array;
    lenderSecret: Uint8Array;
    borrowerAuthorityHash: Uint8Array;
    borrowerAddress: { bytes: Uint8Array };
    attestorProviderId: bigint;
    attestorPublicKeyX: bigint;
    attestorPublicKeyY: bigint;
    creditLimit: bigint;
    advanceRateBps: bigint;
    maxDaysPastDue: bigint;
    minRiskScore: bigint;
    minRemainingEpochs: bigint;
    currentEpoch: bigint;
  }): void {
    this.circuitContext = this.contract.impureCircuits.createFacility(
      this.circuitContext,
      args.facilityId,
      args.lenderSecret,
      args.borrowerAuthorityHash,
      args.borrowerAddress,
      args.attestorProviderId,
      args.attestorPublicKeyX,
      args.attestorPublicKeyY,
      args.creditLimit,
      args.advanceRateBps,
      args.maxDaysPastDue,
      args.minRiskScore,
      args.minRemainingEpochs,
      args.currentEpoch,
    ).context;
  }

  fundOrMintDemoToken(lenderSecret: Uint8Array, amount: bigint): void {
    this.circuitContext = this.contract.impureCircuits.fundOrMintDemoToken(
      this.circuitContext,
      lenderSecret,
      amount,
    ).context;
  }

  freezeFacility(lenderSecret: Uint8Array): void {
    this.circuitContext = this.contract.impureCircuits.freezeFacility(this.circuitContext, lenderSecret).context;
  }

  closeFacility(lenderSecret: Uint8Array): void {
    this.circuitContext = this.contract.impureCircuits.closeFacility(this.circuitContext, lenderSecret).context;
  }

  vaultBalance(): bigint {
    const result = this.contract.impureCircuits.vaultBalance(this.circuitContext);
    this.circuitContext = result.context;
    return result.result;
  }

  requestDraw(
    facilityId: Uint8Array,
    requestedAmount: bigint,
    credentials: EightSlots,
    borrowerSecret: Uint8Array,
  ): void {
    this.circuitContext = this.contract.impureCircuits.requestDraw(
      this.circuitContext,
      facilityId,
      requestedAmount,
      credentials,
      borrowerSecret,
    ).context;
  }

  snapshot(): {
    outstanding: bigint;
    vaultBalance: bigint;
    receiptCount: bigint;
    nullifierCount: bigint;
  } {
    const l = this.getLedger();
    return {
      outstanding: l.outstanding,
      vaultBalance: this.vaultBalance(),
      receiptCount: l.drawCount,
      nullifierCount: l.usedAssetNullifiers.size(),
    };
  }
}
