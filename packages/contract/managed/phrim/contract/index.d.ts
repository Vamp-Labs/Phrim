import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum FacilityStatus { Active = 0, Frozen = 1, Closed = 2 }

export type DrawReceipt = { drawId: Uint8Array;
                            facilityId: Uint8Array;
                            epoch: bigint;
                            amount: bigint;
                            resultingOutstanding: bigint;
                            completed: boolean
                          };

export type AssetCredential = { slotOccupied: boolean;
                                schemaVersion: bigint;
                                providerId: bigint;
                                facilityId: Uint8Array;
                                assetNonce: Uint8Array;
                                outstandingMinor: bigint;
                                daysPastDue: bigint;
                                riskScore: bigint;
                                maturityEpoch: bigint;
                                snapshotEpoch: bigint;
                                signatureAnnouncement: __compactRuntime.JubjubPoint;
                                signatureResponse: bigint
                              };

export type Schnorr_SchnorrSignature = { announcement: __compactRuntime.JubjubPoint;
                                         response: bigint
                                       };

export type Witnesses<PS> = {
  getSchnorrReduction(context: __compactRuntime.WitnessContext<Ledger, PS>,
                      challengeHash_0: bigint): [PS, [bigint, bigint]];
}

export type ImpureCircuits<PS> = {
  createFacility(context: __compactRuntime.CircuitContext<PS>,
                 facilityIdIn_0: Uint8Array,
                 lenderSecret_0: Uint8Array,
                 borrowerAuthorityHashIn_0: Uint8Array,
                 borrowerAddressIn_0: { bytes: Uint8Array },
                 attestorProviderIdIn_0: bigint,
                 attestorPublicKeyXIn_0: bigint,
                 attestorPublicKeyYIn_0: bigint,
                 creditLimitIn_0: bigint,
                 advanceRateBpsIn_0: bigint,
                 maxDaysPastDueIn_0: bigint,
                 minRiskScoreIn_0: bigint,
                 minRemainingEpochsIn_0: bigint,
                 currentEpochIn_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  fundOrMintDemoToken(context: __compactRuntime.CircuitContext<PS>,
                      lenderSecret_0: Uint8Array,
                      amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  freezeFacility(context: __compactRuntime.CircuitContext<PS>,
                 lenderSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeFacility(context: __compactRuntime.CircuitContext<PS>,
                lenderSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  vaultBalance(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  requestDraw(context: __compactRuntime.CircuitContext<PS>,
              facilityIdIn_0: Uint8Array,
              requestedAmountIn_0: bigint,
              credentials_0: AssetCredential[],
              borrowerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  createFacility(context: __compactRuntime.CircuitContext<PS>,
                 facilityIdIn_0: Uint8Array,
                 lenderSecret_0: Uint8Array,
                 borrowerAuthorityHashIn_0: Uint8Array,
                 borrowerAddressIn_0: { bytes: Uint8Array },
                 attestorProviderIdIn_0: bigint,
                 attestorPublicKeyXIn_0: bigint,
                 attestorPublicKeyYIn_0: bigint,
                 creditLimitIn_0: bigint,
                 advanceRateBpsIn_0: bigint,
                 maxDaysPastDueIn_0: bigint,
                 minRiskScoreIn_0: bigint,
                 minRemainingEpochsIn_0: bigint,
                 currentEpochIn_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  fundOrMintDemoToken(context: __compactRuntime.CircuitContext<PS>,
                      lenderSecret_0: Uint8Array,
                      amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  freezeFacility(context: __compactRuntime.CircuitContext<PS>,
                 lenderSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeFacility(context: __compactRuntime.CircuitContext<PS>,
                lenderSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  vaultBalance(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  requestDraw(context: __compactRuntime.CircuitContext<PS>,
              facilityIdIn_0: Uint8Array,
              requestedAmountIn_0: bigint,
              credentials_0: AssetCredential[],
              borrowerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  credentialDigest(schemaVersion_0: bigint,
                   providerId_0: bigint,
                   facilityIdArg_0: Uint8Array,
                   assetNonce_0: Uint8Array,
                   outstandingMinor_0: bigint,
                   daysPastDue_0: bigint,
                   riskScore_0: bigint,
                   maturityEpoch_0: bigint,
                   snapshotEpoch_0: bigint): Uint8Array;
  assetNullifier(facilityIdArg_0: Uint8Array, assetNonce_0: Uint8Array): Uint8Array;
  computeChallenge1(ann_x_0: bigint,
                    ann_y_0: bigint,
                    pk_x_0: bigint,
                    pk_y_0: bigint,
                    msg_0: bigint[]): bigint;
  deriveAuthorityHash(secret_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  credentialDigest(context: __compactRuntime.CircuitContext<PS>,
                   schemaVersion_0: bigint,
                   providerId_0: bigint,
                   facilityIdArg_0: Uint8Array,
                   assetNonce_0: Uint8Array,
                   outstandingMinor_0: bigint,
                   daysPastDue_0: bigint,
                   riskScore_0: bigint,
                   maturityEpoch_0: bigint,
                   snapshotEpoch_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  assetNullifier(context: __compactRuntime.CircuitContext<PS>,
                 facilityIdArg_0: Uint8Array,
                 assetNonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  computeChallenge1(context: __compactRuntime.CircuitContext<PS>,
                    ann_x_0: bigint,
                    ann_y_0: bigint,
                    pk_x_0: bigint,
                    pk_y_0: bigint,
                    msg_0: bigint[]): __compactRuntime.CircuitResults<PS, bigint>;
  deriveAuthorityHash(context: __compactRuntime.CircuitContext<PS>,
                      secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  createFacility(context: __compactRuntime.CircuitContext<PS>,
                 facilityIdIn_0: Uint8Array,
                 lenderSecret_0: Uint8Array,
                 borrowerAuthorityHashIn_0: Uint8Array,
                 borrowerAddressIn_0: { bytes: Uint8Array },
                 attestorProviderIdIn_0: bigint,
                 attestorPublicKeyXIn_0: bigint,
                 attestorPublicKeyYIn_0: bigint,
                 creditLimitIn_0: bigint,
                 advanceRateBpsIn_0: bigint,
                 maxDaysPastDueIn_0: bigint,
                 minRiskScoreIn_0: bigint,
                 minRemainingEpochsIn_0: bigint,
                 currentEpochIn_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  fundOrMintDemoToken(context: __compactRuntime.CircuitContext<PS>,
                      lenderSecret_0: Uint8Array,
                      amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  freezeFacility(context: __compactRuntime.CircuitContext<PS>,
                 lenderSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeFacility(context: __compactRuntime.CircuitContext<PS>,
                lenderSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  vaultBalance(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  requestDraw(context: __compactRuntime.CircuitContext<PS>,
              facilityIdIn_0: Uint8Array,
              requestedAmountIn_0: bigint,
              credentials_0: AssetCredential[],
              borrowerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly facilityExists: boolean;
  readonly facilityId: Uint8Array;
  readonly lenderAuthorityHash: Uint8Array;
  readonly borrowerAuthorityHash: Uint8Array;
  readonly borrowerAddress: { bytes: Uint8Array };
  readonly attestorProviderId: bigint;
  readonly attestorPublicKeyX: bigint;
  readonly attestorPublicKeyY: bigint;
  readonly tokenColor: Uint8Array;
  readonly creditLimit: bigint;
  readonly outstanding: bigint;
  readonly advanceRateBps: bigint;
  readonly maxDaysPastDue: bigint;
  readonly minRiskScore: bigint;
  readonly minRemainingEpochs: bigint;
  readonly currentEpoch: bigint;
  readonly status: FacilityStatus;
  drawReceipts: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): DrawReceipt;
    [Symbol.iterator](): Iterator<[bigint, DrawReceipt]>
  };
  readonly drawCount: bigint;
  usedAssetNullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
