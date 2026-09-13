import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

export var FacilityStatus;
(function (FacilityStatus) {
  FacilityStatus[FacilityStatus['Active'] = 0] = 'Active';
  FacilityStatus[FacilityStatus['Frozen'] = 1] = 'Frozen';
  FacilityStatus[FacilityStatus['Closed'] = 2] = 'Closed';
})(FacilityStatus || (FacilityStatus = {}));

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

const _descriptor_2 = __compactRuntime.CompactTypeBoolean;

const _descriptor_3 = new __compactRuntime.CompactTypeEnum(2, 1);

const _descriptor_4 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

const _descriptor_5 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

class _DrawReceipt_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_4.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment())))));
  }
  fromValue(value_0) {
    return {
      drawId: _descriptor_0.fromValue(value_0),
      facilityId: _descriptor_0.fromValue(value_0),
      epoch: _descriptor_4.fromValue(value_0),
      amount: _descriptor_1.fromValue(value_0),
      resultingOutstanding: _descriptor_1.fromValue(value_0),
      completed: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.drawId).concat(_descriptor_0.toValue(value_0.facilityId).concat(_descriptor_4.toValue(value_0.epoch).concat(_descriptor_1.toValue(value_0.amount).concat(_descriptor_1.toValue(value_0.resultingOutstanding).concat(_descriptor_2.toValue(value_0.completed))))));
  }
}

const _descriptor_7 = new _DrawReceipt_0();

class _UserAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_8 = new _UserAddress_0();

const _descriptor_9 = __compactRuntime.CompactTypeField;

const _descriptor_10 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_11 = __compactRuntime.CompactTypeJubjubPoint;

class _AssetCredential_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_10.alignment().concat(_descriptor_4.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_6.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment().concat(_descriptor_4.alignment().concat(_descriptor_4.alignment().concat(_descriptor_11.alignment().concat(_descriptor_9.alignment())))))))))));
  }
  fromValue(value_0) {
    return {
      slotOccupied: _descriptor_2.fromValue(value_0),
      schemaVersion: _descriptor_10.fromValue(value_0),
      providerId: _descriptor_4.fromValue(value_0),
      facilityId: _descriptor_0.fromValue(value_0),
      assetNonce: _descriptor_0.fromValue(value_0),
      outstandingMinor: _descriptor_6.fromValue(value_0),
      daysPastDue: _descriptor_5.fromValue(value_0),
      riskScore: _descriptor_5.fromValue(value_0),
      maturityEpoch: _descriptor_4.fromValue(value_0),
      snapshotEpoch: _descriptor_4.fromValue(value_0),
      signatureAnnouncement: _descriptor_11.fromValue(value_0),
      signatureResponse: _descriptor_9.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.slotOccupied).concat(_descriptor_10.toValue(value_0.schemaVersion).concat(_descriptor_4.toValue(value_0.providerId).concat(_descriptor_0.toValue(value_0.facilityId).concat(_descriptor_0.toValue(value_0.assetNonce).concat(_descriptor_6.toValue(value_0.outstandingMinor).concat(_descriptor_5.toValue(value_0.daysPastDue).concat(_descriptor_5.toValue(value_0.riskScore).concat(_descriptor_4.toValue(value_0.maturityEpoch).concat(_descriptor_4.toValue(value_0.snapshotEpoch).concat(_descriptor_11.toValue(value_0.signatureAnnouncement).concat(_descriptor_9.toValue(value_0.signatureResponse))))))))))));
  }
}

const _descriptor_12 = new _AssetCredential_0();

const _descriptor_13 = new __compactRuntime.CompactTypeVector(8, _descriptor_12);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_14 = new _ContractAddress_0();

const _descriptor_15 = new __compactRuntime.CompactTypeVector(1, _descriptor_9);

class _SchnorrSignature_0 {
  alignment() {
    return _descriptor_11.alignment().concat(_descriptor_9.alignment());
  }
  fromValue(value_0) {
    return {
      announcement: _descriptor_11.fromValue(value_0),
      response: _descriptor_9.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_11.toValue(value_0.announcement).concat(_descriptor_9.toValue(value_0.response));
  }
}

const _descriptor_16 = new _SchnorrSignature_0();

const _descriptor_17 = new __compactRuntime.CompactTypeUnsignedInteger(127n, 1);

const _descriptor_18 = new __compactRuntime.CompactTypeUnsignedInteger(452312848583266388373324160190187140051835877600158453279131187530910662655n, 31);

class _tuple_0 {
  alignment() {
    return _descriptor_17.alignment().concat(_descriptor_18.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_17.fromValue(value_0),
      _descriptor_18.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_17.toValue(value_0[0]).concat(_descriptor_18.toValue(value_0[1]));
  }
}

const _descriptor_19 = new _tuple_0();

const _descriptor_20 = new __compactRuntime.CompactTypeVector(4, _descriptor_0);

const _descriptor_21 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

const _descriptor_22 = new __compactRuntime.CompactTypeVector(3, _descriptor_0);

class _SchnorrHashInput_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_15.alignment()))));
  }
  fromValue(value_0) {
    return {
      ann_x: _descriptor_9.fromValue(value_0),
      ann_y: _descriptor_9.fromValue(value_0),
      pk_x: _descriptor_9.fromValue(value_0),
      pk_y: _descriptor_9.fromValue(value_0),
      msg: _descriptor_15.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.ann_x).concat(_descriptor_9.toValue(value_0.ann_y).concat(_descriptor_9.toValue(value_0.pk_x).concat(_descriptor_9.toValue(value_0.pk_y).concat(_descriptor_15.toValue(value_0.msg)))));
  }
}

const _descriptor_23 = new _SchnorrHashInput_0();

const _descriptor_24 = new __compactRuntime.CompactTypeVector(10, _descriptor_0);

class _ChallengeInput1_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_15.alignment()))));
  }
  fromValue(value_0) {
    return {
      ann_x: _descriptor_9.fromValue(value_0),
      ann_y: _descriptor_9.fromValue(value_0),
      pk_x: _descriptor_9.fromValue(value_0),
      pk_y: _descriptor_9.fromValue(value_0),
      msg: _descriptor_15.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.ann_x).concat(_descriptor_9.toValue(value_0.ann_y).concat(_descriptor_9.toValue(value_0.pk_x).concat(_descriptor_9.toValue(value_0.pk_y).concat(_descriptor_15.toValue(value_0.msg)))));
  }
}

const _descriptor_25 = new _ChallengeInput1_0();

class _Either_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_2.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_26 = new _Either_0();

class _Either_1 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_14.alignment().concat(_descriptor_8.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_2.fromValue(value_0),
      left: _descriptor_14.fromValue(value_0),
      right: _descriptor_8.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.is_left).concat(_descriptor_14.toValue(value_0.left).concat(_descriptor_8.toValue(value_0.right)));
  }
}

const _descriptor_27 = new _Either_1();

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.getSchnorrReduction) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getSchnorrReduction');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      credentialDigest(context, ...args_1) {
        return { result: pureCircuits.credentialDigest(...args_1), context };
      },
      assetNullifier(context, ...args_1) {
        return { result: pureCircuits.assetNullifier(...args_1), context };
      },
      computeChallenge1(context, ...args_1) {
        return { result: pureCircuits.computeChallenge1(...args_1), context };
      },
      deriveAuthorityHash(context, ...args_1) {
        return { result: pureCircuits.deriveAuthorityHash(...args_1), context };
      },
      createFacility: (...args_1) => {
        if (args_1.length !== 14) {
          throw new __compactRuntime.CompactError(`createFacility: expected 14 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const facilityIdIn_0 = args_1[1];
        const lenderSecret_0 = args_1[2];
        const borrowerAuthorityHashIn_0 = args_1[3];
        const borrowerAddressIn_0 = args_1[4];
        const attestorProviderIdIn_0 = args_1[5];
        const attestorPublicKeyXIn_0 = args_1[6];
        const attestorPublicKeyYIn_0 = args_1[7];
        const creditLimitIn_0 = args_1[8];
        const advanceRateBpsIn_0 = args_1[9];
        const maxDaysPastDueIn_0 = args_1[10];
        const minRiskScoreIn_0 = args_1[11];
        const minRemainingEpochsIn_0 = args_1[12];
        const currentEpochIn_0 = args_1[13];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('createFacility',
                                     'argument 1 (as invoked from Typescript)',
                                     'phrim.compact line 121 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(facilityIdIn_0.buffer instanceof ArrayBuffer && facilityIdIn_0.BYTES_PER_ELEMENT === 1 && facilityIdIn_0.length === 32)) {
          __compactRuntime.typeError('createFacility',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'phrim.compact line 121 char 1',
                                     'Bytes<32>',
                                     facilityIdIn_0)
        }
        if (!(lenderSecret_0.buffer instanceof ArrayBuffer && lenderSecret_0.BYTES_PER_ELEMENT === 1 && lenderSecret_0.length === 32)) {
          __compactRuntime.typeError('createFacility',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'phrim.compact line 121 char 1',
                                     'Bytes<32>',
                                     lenderSecret_0)
        }
        if (!(borrowerAuthorityHashIn_0.buffer instanceof ArrayBuffer && borrowerAuthorityHashIn_0.BYTES_PER_ELEMENT === 1 && borrowerAuthorityHashIn_0.length === 32)) {
          __compactRuntime.typeError('createFacility',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'phrim.compact line 121 char 1',
                                     'Bytes<32>',
                                     borrowerAuthorityHashIn_0)
        }
        if (!(typeof(borrowerAddressIn_0) === 'object' && borrowerAddressIn_0.bytes.buffer instanceof ArrayBuffer && borrowerAddressIn_0.bytes.BYTES_PER_ELEMENT === 1 && borrowerAddressIn_0.bytes.length === 32)) {
          __compactRuntime.typeError('createFacility',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'phrim.compact line 121 char 1',
                                     'struct UserAddress<bytes: Bytes<32>>',
                                     borrowerAddressIn_0)
        }
        if (!(typeof(attestorProviderIdIn_0) === 'bigint' && attestorProviderIdIn_0 >= 0n && attestorProviderIdIn_0 <= 4294967295n)) {
          __compactRuntime.typeError('createFacility',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'phrim.compact line 121 char 1',
                                     'Uint<0..4294967296>',
                                     attestorProviderIdIn_0)
        }
        if (!(typeof(attestorPublicKeyXIn_0) === 'bigint' && attestorPublicKeyXIn_0 >= 0 && attestorPublicKeyXIn_0 <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('createFacility',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'phrim.compact line 121 char 1',
                                     'Field',
                                     attestorPublicKeyXIn_0)
        }
        if (!(typeof(attestorPublicKeyYIn_0) === 'bigint' && attestorPublicKeyYIn_0 >= 0 && attestorPublicKeyYIn_0 <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('createFacility',
                                     'argument 7 (argument 8 as invoked from Typescript)',
                                     'phrim.compact line 121 char 1',
                                     'Field',
                                     attestorPublicKeyYIn_0)
        }
        if (!(typeof(creditLimitIn_0) === 'bigint' && creditLimitIn_0 >= 0n && creditLimitIn_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('createFacility',
                                     'argument 8 (argument 9 as invoked from Typescript)',
                                     'phrim.compact line 121 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     creditLimitIn_0)
        }
        if (!(typeof(advanceRateBpsIn_0) === 'bigint' && advanceRateBpsIn_0 >= 0n && advanceRateBpsIn_0 <= 65535n)) {
          __compactRuntime.typeError('createFacility',
                                     'argument 9 (argument 10 as invoked from Typescript)',
                                     'phrim.compact line 121 char 1',
                                     'Uint<0..65536>',
                                     advanceRateBpsIn_0)
        }
        if (!(typeof(maxDaysPastDueIn_0) === 'bigint' && maxDaysPastDueIn_0 >= 0n && maxDaysPastDueIn_0 <= 65535n)) {
          __compactRuntime.typeError('createFacility',
                                     'argument 10 (argument 11 as invoked from Typescript)',
                                     'phrim.compact line 121 char 1',
                                     'Uint<0..65536>',
                                     maxDaysPastDueIn_0)
        }
        if (!(typeof(minRiskScoreIn_0) === 'bigint' && minRiskScoreIn_0 >= 0n && minRiskScoreIn_0 <= 65535n)) {
          __compactRuntime.typeError('createFacility',
                                     'argument 11 (argument 12 as invoked from Typescript)',
                                     'phrim.compact line 121 char 1',
                                     'Uint<0..65536>',
                                     minRiskScoreIn_0)
        }
        if (!(typeof(minRemainingEpochsIn_0) === 'bigint' && minRemainingEpochsIn_0 >= 0n && minRemainingEpochsIn_0 <= 65535n)) {
          __compactRuntime.typeError('createFacility',
                                     'argument 12 (argument 13 as invoked from Typescript)',
                                     'phrim.compact line 121 char 1',
                                     'Uint<0..65536>',
                                     minRemainingEpochsIn_0)
        }
        if (!(typeof(currentEpochIn_0) === 'bigint' && currentEpochIn_0 >= 0n && currentEpochIn_0 <= 4294967295n)) {
          __compactRuntime.typeError('createFacility',
                                     'argument 13 (argument 14 as invoked from Typescript)',
                                     'phrim.compact line 121 char 1',
                                     'Uint<0..4294967296>',
                                     currentEpochIn_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(facilityIdIn_0).concat(_descriptor_0.toValue(lenderSecret_0).concat(_descriptor_0.toValue(borrowerAuthorityHashIn_0).concat(_descriptor_8.toValue(borrowerAddressIn_0).concat(_descriptor_4.toValue(attestorProviderIdIn_0).concat(_descriptor_9.toValue(attestorPublicKeyXIn_0).concat(_descriptor_9.toValue(attestorPublicKeyYIn_0).concat(_descriptor_1.toValue(creditLimitIn_0).concat(_descriptor_5.toValue(advanceRateBpsIn_0).concat(_descriptor_5.toValue(maxDaysPastDueIn_0).concat(_descriptor_5.toValue(minRiskScoreIn_0).concat(_descriptor_5.toValue(minRemainingEpochsIn_0).concat(_descriptor_4.toValue(currentEpochIn_0))))))))))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_8.alignment().concat(_descriptor_4.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_1.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment().concat(_descriptor_4.alignment()))))))))))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._createFacility_0(context,
                                                partialProofData,
                                                facilityIdIn_0,
                                                lenderSecret_0,
                                                borrowerAuthorityHashIn_0,
                                                borrowerAddressIn_0,
                                                attestorProviderIdIn_0,
                                                attestorPublicKeyXIn_0,
                                                attestorPublicKeyYIn_0,
                                                creditLimitIn_0,
                                                advanceRateBpsIn_0,
                                                maxDaysPastDueIn_0,
                                                minRiskScoreIn_0,
                                                minRemainingEpochsIn_0,
                                                currentEpochIn_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      fundOrMintDemoToken: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`fundOrMintDemoToken: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const lenderSecret_0 = args_1[1];
        const amount_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('fundOrMintDemoToken',
                                     'argument 1 (as invoked from Typescript)',
                                     'phrim.compact line 155 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(lenderSecret_0.buffer instanceof ArrayBuffer && lenderSecret_0.BYTES_PER_ELEMENT === 1 && lenderSecret_0.length === 32)) {
          __compactRuntime.typeError('fundOrMintDemoToken',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'phrim.compact line 155 char 1',
                                     'Bytes<32>',
                                     lenderSecret_0)
        }
        if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('fundOrMintDemoToken',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'phrim.compact line 155 char 1',
                                     'Uint<0..18446744073709551616>',
                                     amount_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(lenderSecret_0).concat(_descriptor_6.toValue(amount_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_6.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._fundOrMintDemoToken_0(context,
                                                     partialProofData,
                                                     lenderSecret_0,
                                                     amount_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      freezeFacility: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`freezeFacility: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const lenderSecret_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('freezeFacility',
                                     'argument 1 (as invoked from Typescript)',
                                     'phrim.compact line 166 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(lenderSecret_0.buffer instanceof ArrayBuffer && lenderSecret_0.BYTES_PER_ELEMENT === 1 && lenderSecret_0.length === 32)) {
          __compactRuntime.typeError('freezeFacility',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'phrim.compact line 166 char 1',
                                     'Bytes<32>',
                                     lenderSecret_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(lenderSecret_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._freezeFacility_0(context,
                                                partialProofData,
                                                lenderSecret_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      closeFacility: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`closeFacility: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const lenderSecret_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('closeFacility',
                                     'argument 1 (as invoked from Typescript)',
                                     'phrim.compact line 172 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(lenderSecret_0.buffer instanceof ArrayBuffer && lenderSecret_0.BYTES_PER_ELEMENT === 1 && lenderSecret_0.length === 32)) {
          __compactRuntime.typeError('closeFacility',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'phrim.compact line 172 char 1',
                                     'Bytes<32>',
                                     lenderSecret_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(lenderSecret_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._closeFacility_0(context,
                                               partialProofData,
                                               lenderSecret_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      vaultBalance: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`vaultBalance: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('vaultBalance',
                                     'argument 1 (as invoked from Typescript)',
                                     'phrim.compact line 178 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._vaultBalance_0(context, partialProofData);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      requestDraw: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`requestDraw: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const facilityIdIn_0 = args_1[1];
        const requestedAmountIn_0 = args_1[2];
        const credentials_0 = args_1[3];
        const borrowerSecret_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('requestDraw',
                                     'argument 1 (as invoked from Typescript)',
                                     'phrim.compact line 182 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(facilityIdIn_0.buffer instanceof ArrayBuffer && facilityIdIn_0.BYTES_PER_ELEMENT === 1 && facilityIdIn_0.length === 32)) {
          __compactRuntime.typeError('requestDraw',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'phrim.compact line 182 char 1',
                                     'Bytes<32>',
                                     facilityIdIn_0)
        }
        if (!(typeof(requestedAmountIn_0) === 'bigint' && requestedAmountIn_0 >= 0n && requestedAmountIn_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('requestDraw',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'phrim.compact line 182 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     requestedAmountIn_0)
        }
        if (!(Array.isArray(credentials_0) && credentials_0.length === 8 && credentials_0.every((t) => typeof(t) === 'object' && typeof(t.slotOccupied) === 'boolean' && typeof(t.schemaVersion) === 'bigint' && t.schemaVersion >= 0n && t.schemaVersion <= 255n && typeof(t.providerId) === 'bigint' && t.providerId >= 0n && t.providerId <= 4294967295n && t.facilityId.buffer instanceof ArrayBuffer && t.facilityId.BYTES_PER_ELEMENT === 1 && t.facilityId.length === 32 && t.assetNonce.buffer instanceof ArrayBuffer && t.assetNonce.BYTES_PER_ELEMENT === 1 && t.assetNonce.length === 32 && typeof(t.outstandingMinor) === 'bigint' && t.outstandingMinor >= 0n && t.outstandingMinor <= 18446744073709551615n && typeof(t.daysPastDue) === 'bigint' && t.daysPastDue >= 0n && t.daysPastDue <= 65535n && typeof(t.riskScore) === 'bigint' && t.riskScore >= 0n && t.riskScore <= 65535n && typeof(t.maturityEpoch) === 'bigint' && t.maturityEpoch >= 0n && t.maturityEpoch <= 4294967295n && typeof(t.snapshotEpoch) === 'bigint' && t.snapshotEpoch >= 0n && t.snapshotEpoch <= 4294967295n && true && typeof(t.signatureResponse) === 'bigint' && t.signatureResponse >= 0 && t.signatureResponse <= __compactRuntime.MAX_FIELD))) {
          __compactRuntime.typeError('requestDraw',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'phrim.compact line 182 char 1',
                                     'Vector<8, struct AssetCredential<slotOccupied: Boolean, schemaVersion: Uint<0..256>, providerId: Uint<0..4294967296>, facilityId: Bytes<32>, assetNonce: Bytes<32>, outstandingMinor: Uint<0..18446744073709551616>, daysPastDue: Uint<0..65536>, riskScore: Uint<0..65536>, maturityEpoch: Uint<0..4294967296>, snapshotEpoch: Uint<0..4294967296>, signatureAnnouncement: Opaque<"JubjubPoint">, signatureResponse: Field>>',
                                     credentials_0)
        }
        if (!(borrowerSecret_0.buffer instanceof ArrayBuffer && borrowerSecret_0.BYTES_PER_ELEMENT === 1 && borrowerSecret_0.length === 32)) {
          __compactRuntime.typeError('requestDraw',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'phrim.compact line 182 char 1',
                                     'Bytes<32>',
                                     borrowerSecret_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(facilityIdIn_0).concat(_descriptor_1.toValue(requestedAmountIn_0).concat(_descriptor_13.toValue(credentials_0).concat(_descriptor_0.toValue(borrowerSecret_0)))),
            alignment: _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_13.alignment().concat(_descriptor_0.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._requestDraw_0(context,
                                             partialProofData,
                                             facilityIdIn_0,
                                             requestedAmountIn_0,
                                             credentials_0,
                                             borrowerSecret_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      createFacility: this.circuits.createFacility,
      fundOrMintDemoToken: this.circuits.fundOrMintDemoToken,
      freezeFacility: this.circuits.freezeFacility,
      closeFacility: this.circuits.closeFacility,
      vaultBalance: this.circuits.vaultBalance,
      requestDraw: this.circuits.requestDraw
    };
    this.provableCircuits = {
      createFacility: this.circuits.createFacility,
      fundOrMintDemoToken: this.circuits.fundOrMintDemoToken,
      freezeFacility: this.circuits.freezeFacility,
      closeFacility: this.circuits.closeFacility,
      vaultBalance: this.circuits.vaultBalance,
      requestDraw: this.circuits.requestDraw
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    let stateValue_2 = __compactRuntime.StateValue.newArray();
    stateValue_2 = stateValue_2.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_2 = stateValue_2.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_2 = stateValue_2.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_2 = stateValue_2.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_2 = stateValue_2.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(stateValue_2);
    let stateValue_1 = __compactRuntime.StateValue.newArray();
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_1 = stateValue_1.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(stateValue_1);
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('createFacility', new __compactRuntime.ContractOperation());
    state_0.setOperation('fundOrMintDemoToken', new __compactRuntime.ContractOperation());
    state_0.setOperation('freezeFacility', new __compactRuntime.ContractOperation());
    state_0.setOperation('closeFacility', new __compactRuntime.ContractOperation());
    state_0.setOperation('vaultBalance', new __compactRuntime.ContractOperation());
    state_0.setOperation('requestDraw', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(0n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(0n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(false),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(0n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(1n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(0n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(2n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(0n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(3n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(0n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(4n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue({ bytes: new Uint8Array(32) }),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(0n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(0n),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(1n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(0n),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(2n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(0n),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(3n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(4n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(5n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(6n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(7n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(8n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(9n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(10n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(0n),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(11n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(12n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(13n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(0n),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(14n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _left_0(value_0) {
    return { is_left: true, left: value_0, right: { bytes: new Uint8Array(32) } };
  }
  _left_1(value_0) {
    return { is_left: true, left: value_0, right: new Uint8Array(32) };
  }
  _right_0(value_0) {
    return { is_left: false, left: { bytes: new Uint8Array(32) }, right: value_0 };
  }
  _tokenType_0(domain_sep_0, contractAddress_0) {
    return this._persistentCommit_0([domain_sep_0, contractAddress_0.bytes],
                                    new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 100, 101, 114, 105, 118, 101, 95, 116, 111, 107, 101, 110, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
  }
  _mintUnshieldedToken_0(context,
                         partialProofData,
                         domainSep_0,
                         amount_0,
                         recipient_0)
  {
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(5n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(domainSep_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { dup: { n: 1 } },
                                       { dup: { n: 1 } },
                                       'member',
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(amount_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { swap: { n: 0 } },
                                       'neg',
                                       { branch: { skip: 4 } },
                                       { dup: { n: 2 } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: true,
                                                pushPath: false,
                                                path: [ { tag: 'stack' }] } },
                                       'add',
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    const color_0 = this._tokenType_0(domainSep_0,
                                      _descriptor_14.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                 partialProofData,
                                                                                                 [
                                                                                                  { dup: { n: 2 } },
                                                                                                  { idx: { cached: true,
                                                                                                           pushPath: false,
                                                                                                           path: [
                                                                                                                  { tag: 'value',
                                                                                                                    value: { value: _descriptor_10.toValue(0n),
                                                                                                                             alignment: _descriptor_10.alignment() } }] } },
                                                                                                  { popeq: { cached: true,
                                                                                                             result: undefined } }]).value));
    const tmp_0 = this._left_1(color_0);
    const tmp_1 = amount_0;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(8n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell(__compactRuntime.alignedConcat(
                                                                                              { value: _descriptor_26.toValue(tmp_0),
                                                                                                alignment: _descriptor_26.alignment() },
                                                                                              { value: _descriptor_27.toValue(recipient_0),
                                                                                                alignment: _descriptor_27.alignment() }
                                                                                            )).encode() } },
                                       { dup: { n: 1 } },
                                       { dup: { n: 1 } },
                                       'member',
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_1),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { swap: { n: 0 } },
                                       'neg',
                                       { branch: { skip: 4 } },
                                       { dup: { n: 2 } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: true,
                                                pushPath: false,
                                                path: [ { tag: 'stack' }] } },
                                       'add',
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    if (recipient_0.is_left
        &&
        this._equal_0(recipient_0.left.bytes,
                      _descriptor_14.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                 partialProofData,
                                                                                 [
                                                                                  { dup: { n: 2 } },
                                                                                  { idx: { cached: true,
                                                                                           pushPath: false,
                                                                                           path: [
                                                                                                  { tag: 'value',
                                                                                                    value: { value: _descriptor_10.toValue(0n),
                                                                                                             alignment: _descriptor_10.alignment() } }] } },
                                                                                  { popeq: { cached: true,
                                                                                             result: undefined } }]).value).bytes))
    {
      const tmp_2 = this._left_1(color_0);
      const tmp_3 = amount_0;
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { swap: { n: 0 } },
                                         { idx: { cached: true,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_10.toValue(6n),
                                                                    alignment: _descriptor_10.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_26.toValue(tmp_2),
                                                                                                alignment: _descriptor_26.alignment() }).encode() } },
                                         { dup: { n: 1 } },
                                         { dup: { n: 1 } },
                                         'member',
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_3),
                                                                                                alignment: _descriptor_1.alignment() }).encode() } },
                                         { swap: { n: 0 } },
                                         'neg',
                                         { branch: { skip: 4 } },
                                         { dup: { n: 2 } },
                                         { dup: { n: 2 } },
                                         { idx: { cached: true,
                                                  pushPath: false,
                                                  path: [ { tag: 'stack' }] } },
                                         'add',
                                         { ins: { cached: true, n: 2 } },
                                         { swap: { n: 0 } }]);
    }
    return color_0;
  }
  _sendUnshielded_0(context, partialProofData, color_0, amount_0, recipient_0) {
    const tmp_0 = this._left_1(color_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(7n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_26.toValue(tmp_0),
                                                                                              alignment: _descriptor_26.alignment() }).encode() } },
                                       { dup: { n: 1 } },
                                       { dup: { n: 1 } },
                                       'member',
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(amount_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { swap: { n: 0 } },
                                       'neg',
                                       { branch: { skip: 4 } },
                                       { dup: { n: 2 } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: true,
                                                pushPath: false,
                                                path: [ { tag: 'stack' }] } },
                                       'add',
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    const tmp_1 = this._left_1(color_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(8n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell(__compactRuntime.alignedConcat(
                                                                                              { value: _descriptor_26.toValue(tmp_1),
                                                                                                alignment: _descriptor_26.alignment() },
                                                                                              { value: _descriptor_27.toValue(recipient_0),
                                                                                                alignment: _descriptor_27.alignment() }
                                                                                            )).encode() } },
                                       { dup: { n: 1 } },
                                       { dup: { n: 1 } },
                                       'member',
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(amount_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { swap: { n: 0 } },
                                       'neg',
                                       { branch: { skip: 4 } },
                                       { dup: { n: 2 } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: true,
                                                pushPath: false,
                                                path: [ { tag: 'stack' }] } },
                                       'add',
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    if (recipient_0.is_left
        &&
        this._equal_1(recipient_0.left.bytes,
                      _descriptor_14.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                 partialProofData,
                                                                                 [
                                                                                  { dup: { n: 2 } },
                                                                                  { idx: { cached: true,
                                                                                           pushPath: false,
                                                                                           path: [
                                                                                                  { tag: 'value',
                                                                                                    value: { value: _descriptor_10.toValue(0n),
                                                                                                             alignment: _descriptor_10.alignment() } }] } },
                                                                                  { popeq: { cached: true,
                                                                                             result: undefined } }]).value).bytes))
    {
      const tmp_2 = this._left_1(color_0);
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { swap: { n: 0 } },
                                         { idx: { cached: true,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_10.toValue(6n),
                                                                    alignment: _descriptor_10.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_26.toValue(tmp_2),
                                                                                                alignment: _descriptor_26.alignment() }).encode() } },
                                         { dup: { n: 1 } },
                                         { dup: { n: 1 } },
                                         'member',
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(amount_0),
                                                                                                alignment: _descriptor_1.alignment() }).encode() } },
                                         { swap: { n: 0 } },
                                         'neg',
                                         { branch: { skip: 4 } },
                                         { dup: { n: 2 } },
                                         { dup: { n: 2 } },
                                         { idx: { cached: true,
                                                  pushPath: false,
                                                  path: [ { tag: 'stack' }] } },
                                         'add',
                                         { ins: { cached: true, n: 2 } },
                                         { swap: { n: 0 } }]);
    }
    return [];
  }
  _unshieldedBalance_0(context, partialProofData, color_0) {
    const tmp_0 = this._left_1(color_0);
    return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 2 } },
                                                                      { idx: { cached: true,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_10.toValue(5n),
                                                                                                 alignment: _descriptor_10.alignment() } }] } },
                                                                      { dup: { n: 0 } },
                                                                      { push: { storage: false,
                                                                                value: __compactRuntime.StateValue.newCell({ value: _descriptor_26.toValue(tmp_0),
                                                                                                                             alignment: _descriptor_26.alignment() }).encode() } },
                                                                      'member',
                                                                      { branch: { skip: 3 } },
                                                                      'pop',
                                                                      { push: { storage: false,
                                                                                value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                             alignment: _descriptor_1.alignment() }).encode() } },
                                                                      { jmp: { skip: 1 } },
                                                                      { idx: { cached: true,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_26.toValue(tmp_0),
                                                                                                 alignment: _descriptor_26.alignment() } }] } },
                                                                      { popeq: { cached: true,
                                                                                 result: undefined } }]).value);
  }
  _unshieldedBalanceLt_0(context, partialProofData, color_0, amount_0) {
    const tmp_0 = this._left_1(color_0);
    return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 2 } },
                                                                      { idx: { cached: true,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_10.toValue(5n),
                                                                                                 alignment: _descriptor_10.alignment() } }] } },
                                                                      { dup: { n: 0 } },
                                                                      { push: { storage: false,
                                                                                value: __compactRuntime.StateValue.newCell({ value: _descriptor_26.toValue(tmp_0),
                                                                                                                             alignment: _descriptor_26.alignment() }).encode() } },
                                                                      'member',
                                                                      { branch: { skip: 3 } },
                                                                      'pop',
                                                                      { push: { storage: false,
                                                                                value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                             alignment: _descriptor_1.alignment() }).encode() } },
                                                                      { jmp: { skip: 1 } },
                                                                      { idx: { cached: true,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_26.toValue(tmp_0),
                                                                                                 alignment: _descriptor_26.alignment() } }] } },
                                                                      { push: { storage: false,
                                                                                value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(amount_0),
                                                                                                                             alignment: _descriptor_1.alignment() }).encode() } },
                                                                      'lt',
                                                                      { popeq: { cached: true,
                                                                                 result: undefined } }]).value);
  }
  _unshieldedBalanceGte_0(context, partialProofData, color_0, amount_0) {
    return !this._unshieldedBalanceLt_0(context,
                                        partialProofData,
                                        color_0,
                                        amount_0);
  }
  _transientHash_0(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_25, value_0);
    return result_0;
  }
  _transientHash_1(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_23, value_0);
    return result_0;
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_24, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_22, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_21, value_0);
    return result_0;
  }
  _persistentHash_3(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_20, value_0);
    return result_0;
  }
  _persistentCommit_0(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_21,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _degradeToTransient_0(x_0) {
    const result_0 = __compactRuntime.degradeToTransient(x_0);
    return result_0;
  }
  _jubjubPointX_0(np_0) {
    const result_0 = __compactRuntime.jubjubPointX(np_0);
    return result_0;
  }
  _jubjubPointY_0(np_0) {
    const result_0 = __compactRuntime.jubjubPointY(np_0);
    return result_0;
  }
  _ecAdd_0(a_0, b_0) {
    const result_0 = __compactRuntime.ecAdd(a_0, b_0);
    return result_0;
  }
  _ecMul_0(a_0, b_0) {
    const result_0 = __compactRuntime.ecMul(a_0, b_0);
    return result_0;
  }
  _ecMulGenerator_0(b_0) {
    const result_0 = __compactRuntime.ecMulGenerator(b_0);
    return result_0;
  }
  _constructJubjubPoint_0(x_0, y_0) {
    const result_0 = __compactRuntime.constructJubjubPoint(x_0, y_0);
    return result_0;
  }
  _getSchnorrReduction_0(context, partialProofData, challengeHash_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getSchnorrReduction(witnessContext_0,
                                                                              challengeHash_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(Array.isArray(result_0) && result_0.length === 2  && typeof(result_0[0]) === 'bigint' && result_0[0] >= 0n && result_0[0] <= 127n && typeof(result_0[1]) === 'bigint' && result_0[1] >= 0n && result_0[1] <= 452312848583266388373324160190187140051835877600158453279131187530910662655n)) {
      __compactRuntime.typeError('getSchnorrReduction',
                                 'return value',
                                 'schnorr.compact line 26 char 3',
                                 '[Uint<0..128>, Uint<0..452312848583266388373324160190187140051835877600158453279131187530910662656>]',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_19.toValue(result_0),
      alignment: _descriptor_19.alignment()
    });
    return result_0;
  }
  _schnorrVerify_0(context, partialProofData, msg_0, signature_0, pk_0) {
    const __compact_pattern_tmp2_0 = signature_0;
    const announcement_0 = __compact_pattern_tmp2_0.announcement;
    const response_0 = __compact_pattern_tmp2_0.response;
    const cFull_0 = this._transientHash_1({ ann_x:
                                              this._jubjubPointX_0(announcement_0),
                                            ann_y:
                                              this._jubjubPointY_0(announcement_0),
                                            pk_x: this._jubjubPointX_0(pk_0),
                                            pk_y: this._jubjubPointY_0(pk_0),
                                            msg: msg_0 });
    const TWO_248_0 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;
    const __compact_pattern_tmp1_0 = this._getSchnorrReduction_0(context,
                                                                 partialProofData,
                                                                 cFull_0);
    const q_0 = __compact_pattern_tmp1_0[0];
    const cTruncated_0 = __compact_pattern_tmp1_0[1];
    let t_0;
    __compactRuntime.assert((t_0 = q_0, t_0 < 116n),
                            'Schnorr quotient out of range');
    __compactRuntime.assert(__compactRuntime.addField(__compactRuntime.mulField(q_0,
                                                                                TWO_248_0),
                                                      cTruncated_0)
                            ===
                            cFull_0,
                            'Invalid challenge reduction');
    const c_0 = cTruncated_0;
    const lhs_0 = this._ecMulGenerator_0(response_0);
    const rhs_0 = this._ecAdd_0(announcement_0, this._ecMul_0(pk_0, c_0));
    __compactRuntime.assert(this._jubjubPointX_0(lhs_0)
                            ===
                            this._jubjubPointX_0(rhs_0)
                            &&
                            this._jubjubPointY_0(lhs_0)
                            ===
                            this._jubjubPointY_0(rhs_0),
                            'Invalid attestation signature');
    return [];
  }
  _credentialDigest_0(schemaVersion_0,
                      providerId_0,
                      facilityIdArg_0,
                      assetNonce_0,
                      outstandingMinor_0,
                      daysPastDue_0,
                      riskScore_0,
                      maturityEpoch_0,
                      snapshotEpoch_0)
  {
    return this._persistentHash_0([new Uint8Array([112, 104, 114, 105, 109, 58, 99, 114, 101, 100, 101, 110, 116, 105, 97, 108, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        schemaVersion_0,
                                                                        'phrim.compact line 76 char 5'),
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        providerId_0,
                                                                        'phrim.compact line 77 char 5'),
                                   facilityIdArg_0,
                                   assetNonce_0,
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        outstandingMinor_0,
                                                                        'phrim.compact line 80 char 5'),
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        daysPastDue_0,
                                                                        'phrim.compact line 81 char 5'),
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        riskScore_0,
                                                                        'phrim.compact line 82 char 5'),
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        maturityEpoch_0,
                                                                        'phrim.compact line 83 char 5'),
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        snapshotEpoch_0,
                                                                        'phrim.compact line 84 char 5')]);
  }
  _assetNullifier_0(facilityIdArg_0, assetNonce_0) {
    return this._persistentHash_1([new Uint8Array([112, 104, 114, 105, 109, 58, 97, 115, 115, 101, 116, 45, 110, 117, 108, 108, 105, 102, 105, 101, 114, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   facilityIdArg_0,
                                   assetNonce_0]);
  }
  _computeChallenge1_0(ann_x_0, ann_y_0, pk_x_0, pk_y_0, msg_0) {
    return this._transientHash_0({ ann_x: ann_x_0,
                                   ann_y: ann_y_0,
                                   pk_x: pk_x_0,
                                   pk_y: pk_y_0,
                                   msg: msg_0 });
  }
  _deriveAuthorityHash_0(secret_0) {
    return this._persistentHash_2([new Uint8Array([112, 104, 114, 105, 109, 58, 97, 117, 116, 104, 111, 114, 105, 116, 121, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   secret_0]);
  }
  _deriveDrawId_0(facilityIdArg_0, epoch_0, amount_0) {
    return this._persistentHash_3([new Uint8Array([112, 104, 114, 105, 109, 58, 100, 114, 97, 119, 45, 105, 100, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   facilityIdArg_0,
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        epoch_0,
                                                                        'phrim.compact line 116 char 5'),
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        amount_0,
                                                                        'phrim.compact line 117 char 5')]);
  }
  _createFacility_0(context,
                    partialProofData,
                    facilityIdIn_0,
                    lenderSecret_0,
                    borrowerAuthorityHashIn_0,
                    borrowerAddressIn_0,
                    attestorProviderIdIn_0,
                    attestorPublicKeyXIn_0,
                    attestorPublicKeyYIn_0,
                    creditLimitIn_0,
                    advanceRateBpsIn_0,
                    maxDaysPastDueIn_0,
                    minRiskScoreIn_0,
                    minRemainingEpochsIn_0,
                    currentEpochIn_0)
  {
    __compactRuntime.assert(!_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_10.toValue(0n),
                                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_10.toValue(0n),
                                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                                        { popeq: { cached: false,
                                                                                                   result: undefined } }]).value),
                            'UNAUTHORIZED');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(0n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(1n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(facilityIdIn_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_0 = this._deriveAuthorityHash_0(lenderSecret_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(0n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(2n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(0n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(3n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(borrowerAuthorityHashIn_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(0n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(4n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(borrowerAddressIn_0),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(0n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(attestorProviderIdIn_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(1n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(attestorPublicKeyXIn_0),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(2n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(attestorPublicKeyYIn_0),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(4n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(creditLimitIn_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_1 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(5n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_1),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(6n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(advanceRateBpsIn_0),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(7n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(maxDaysPastDueIn_0),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(8n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(minRiskScoreIn_0),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(9n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(minRemainingEpochsIn_0),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(10n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(currentEpochIn_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(11n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(0n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(0n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(true),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _fundOrMintDemoToken_0(context, partialProofData, lenderSecret_0, amount_0) {
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_10.toValue(0n),
                                                                                                                  alignment: _descriptor_10.alignment() } },
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_10.toValue(0n),
                                                                                                                  alignment: _descriptor_10.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value),
                            'FACILITY_INACTIVE');
    __compactRuntime.assert(this._equal_2(this._deriveAuthorityHash_0(lenderSecret_0),
                                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_10.toValue(0n),
                                                                                                                                alignment: _descriptor_10.alignment() } },
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_10.toValue(2n),
                                                                                                                                alignment: _descriptor_10.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'UNAUTHORIZED');
    const minted_0 = this._mintUnshieldedToken_0(context,
                                                 partialProofData,
                                                 new Uint8Array([112, 104, 114, 105, 109, 58, 109, 117, 115, 100, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                                 amount_0,
                                                 this._left_0(_descriptor_14.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                                         partialProofData,
                                                                                                                         [
                                                                                                                          { dup: { n: 2 } },
                                                                                                                          { idx: { cached: true,
                                                                                                                                   pushPath: false,
                                                                                                                                   path: [
                                                                                                                                          { tag: 'value',
                                                                                                                                            value: { value: _descriptor_10.toValue(0n),
                                                                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                                                                          { popeq: { cached: true,
                                                                                                                                     result: undefined } }]).value)));
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(3n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(minted_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _freezeFacility_0(context, partialProofData, lenderSecret_0) {
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_10.toValue(0n),
                                                                                                                  alignment: _descriptor_10.alignment() } },
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_10.toValue(0n),
                                                                                                                  alignment: _descriptor_10.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value),
                            'FACILITY_INACTIVE');
    __compactRuntime.assert(this._equal_3(this._deriveAuthorityHash_0(lenderSecret_0),
                                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_10.toValue(0n),
                                                                                                                                alignment: _descriptor_10.alignment() } },
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_10.toValue(2n),
                                                                                                                                alignment: _descriptor_10.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'UNAUTHORIZED');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(11n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(1),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _closeFacility_0(context, partialProofData, lenderSecret_0) {
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_10.toValue(0n),
                                                                                                                  alignment: _descriptor_10.alignment() } },
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_10.toValue(0n),
                                                                                                                  alignment: _descriptor_10.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value),
                            'FACILITY_INACTIVE');
    __compactRuntime.assert(this._equal_4(this._deriveAuthorityHash_0(lenderSecret_0),
                                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_10.toValue(0n),
                                                                                                                                alignment: _descriptor_10.alignment() } },
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_10.toValue(2n),
                                                                                                                                alignment: _descriptor_10.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'UNAUTHORIZED');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(11n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(2),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _vaultBalance_0(context, partialProofData) {
    return this._unshieldedBalance_0(context,
                                     partialProofData,
                                     _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                               partialProofData,
                                                                                               [
                                                                                                { dup: { n: 0 } },
                                                                                                { idx: { cached: false,
                                                                                                         pushPath: false,
                                                                                                         path: [
                                                                                                                { tag: 'value',
                                                                                                                  value: { value: _descriptor_10.toValue(1n),
                                                                                                                           alignment: _descriptor_10.alignment() } },
                                                                                                                { tag: 'value',
                                                                                                                  value: { value: _descriptor_10.toValue(3n),
                                                                                                                           alignment: _descriptor_10.alignment() } }] } },
                                                                                                { popeq: { cached: false,
                                                                                                           result: undefined } }]).value));
  }
  _requestDraw_0(context,
                 partialProofData,
                 facilityIdIn_0,
                 requestedAmountIn_0,
                 credentials_0,
                 borrowerSecret_0)
  {
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_10.toValue(0n),
                                                                                                                  alignment: _descriptor_10.alignment() } },
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_10.toValue(0n),
                                                                                                                  alignment: _descriptor_10.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value),
                            'FACILITY_INACTIVE');
    __compactRuntime.assert(_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_10.toValue(1n),
                                                                                                                  alignment: _descriptor_10.alignment() } },
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_10.toValue(11n),
                                                                                                                  alignment: _descriptor_10.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value)
                            ===
                            0,
                            'FACILITY_INACTIVE');
    __compactRuntime.assert(this._equal_5(this._deriveAuthorityHash_0(borrowerSecret_0),
                                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_10.toValue(0n),
                                                                                                                                alignment: _descriptor_10.alignment() } },
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_10.toValue(3n),
                                                                                                                                alignment: _descriptor_10.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'UNAUTHORIZED');
    const requestedAmount_0 = requestedAmountIn_0;
    __compactRuntime.assert(this._equal_6(facilityIdIn_0,
                                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_10.toValue(0n),
                                                                                                                                alignment: _descriptor_10.alignment() } },
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_10.toValue(1n),
                                                                                                                                alignment: _descriptor_10.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'WRONG_FACILITY');
    __compactRuntime.assert(requestedAmount_0 > 0n, 'INSUFFICIENT_COLLATERAL');
    let t_0;
    __compactRuntime.assert((t_0 = _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                             partialProofData,
                                                                                             [
                                                                                              { dup: { n: 0 } },
                                                                                              { idx: { cached: false,
                                                                                                       pushPath: false,
                                                                                                       path: [
                                                                                                              { tag: 'value',
                                                                                                                value: { value: _descriptor_10.toValue(1n),
                                                                                                                         alignment: _descriptor_10.alignment() } },
                                                                                                              { tag: 'value',
                                                                                                                value: { value: _descriptor_10.toValue(5n),
                                                                                                                         alignment: _descriptor_10.alignment() } }] } },
                                                                                              { popeq: { cached: false,
                                                                                                         result: undefined } }]).value)
                                   +
                                   requestedAmount_0,
                             t_0
                             <=
                             _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_10.toValue(4n),
                                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                                        { popeq: { cached: false,
                                                                                                   result: undefined } }]).value)),
                            'CREDIT_LIMIT_EXCEEDED');
    const pk_0 = this._constructJubjubPoint_0(_descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                        partialProofData,
                                                                                                        [
                                                                                                         { dup: { n: 0 } },
                                                                                                         { idx: { cached: false,
                                                                                                                  pushPath: false,
                                                                                                                  path: [
                                                                                                                         { tag: 'value',
                                                                                                                           value: { value: _descriptor_10.toValue(1n),
                                                                                                                                    alignment: _descriptor_10.alignment() } },
                                                                                                                         { tag: 'value',
                                                                                                                           value: { value: _descriptor_10.toValue(1n),
                                                                                                                                    alignment: _descriptor_10.alignment() } }] } },
                                                                                                         { popeq: { cached: false,
                                                                                                                    result: undefined } }]).value),
                                              _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                        partialProofData,
                                                                                                        [
                                                                                                         { dup: { n: 0 } },
                                                                                                         { idx: { cached: false,
                                                                                                                  pushPath: false,
                                                                                                                  path: [
                                                                                                                         { tag: 'value',
                                                                                                                           value: { value: _descriptor_10.toValue(1n),
                                                                                                                                    alignment: _descriptor_10.alignment() } },
                                                                                                                         { tag: 'value',
                                                                                                                           value: { value: _descriptor_10.toValue(2n),
                                                                                                                                    alignment: _descriptor_10.alignment() } }] } },
                                                                                                         { popeq: { cached: false,
                                                                                                                    result: undefined } }]).value));
    this._folder_0(context,
                   partialProofData,
                   ((context, partialProofData, t_1, i_0) =>
                    {
                      if (credentials_0[i_0].slotOccupied) {
                        __compactRuntime.assert(this._equal_7(credentials_0[i_0].providerId,
                                                              _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                                        partialProofData,
                                                                                                                        [
                                                                                                                         { dup: { n: 0 } },
                                                                                                                         { idx: { cached: false,
                                                                                                                                  pushPath: false,
                                                                                                                                  path: [
                                                                                                                                         { tag: 'value',
                                                                                                                                           value: { value: _descriptor_10.toValue(1n),
                                                                                                                                                    alignment: _descriptor_10.alignment() } },
                                                                                                                                         { tag: 'value',
                                                                                                                                           value: { value: _descriptor_10.toValue(0n),
                                                                                                                                                    alignment: _descriptor_10.alignment() } }] } },
                                                                                                                         { popeq: { cached: false,
                                                                                                                                    result: undefined } }]).value)),
                                                'WRONG_FACILITY');
                        __compactRuntime.assert(this._equal_8(credentials_0[i_0].facilityId,
                                                              _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                                        partialProofData,
                                                                                                                        [
                                                                                                                         { dup: { n: 0 } },
                                                                                                                         { idx: { cached: false,
                                                                                                                                  pushPath: false,
                                                                                                                                  path: [
                                                                                                                                         { tag: 'value',
                                                                                                                                           value: { value: _descriptor_10.toValue(0n),
                                                                                                                                                    alignment: _descriptor_10.alignment() } },
                                                                                                                                         { tag: 'value',
                                                                                                                                           value: { value: _descriptor_10.toValue(1n),
                                                                                                                                                    alignment: _descriptor_10.alignment() } }] } },
                                                                                                                         { popeq: { cached: false,
                                                                                                                                    result: undefined } }]).value)),
                                                'WRONG_FACILITY');
                        __compactRuntime.assert(this._equal_9(credentials_0[i_0].snapshotEpoch,
                                                              _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                                        partialProofData,
                                                                                                                        [
                                                                                                                         { dup: { n: 0 } },
                                                                                                                         { idx: { cached: false,
                                                                                                                                  pushPath: false,
                                                                                                                                  path: [
                                                                                                                                         { tag: 'value',
                                                                                                                                           value: { value: _descriptor_10.toValue(1n),
                                                                                                                                                    alignment: _descriptor_10.alignment() } },
                                                                                                                                         { tag: 'value',
                                                                                                                                           value: { value: _descriptor_10.toValue(10n),
                                                                                                                                                    alignment: _descriptor_10.alignment() } }] } },
                                                                                                                         { popeq: { cached: false,
                                                                                                                                    result: undefined } }]).value)),
                                                'STALE_EPOCH');
                        const digest_0 = this._credentialDigest_0(credentials_0[i_0].schemaVersion,
                                                                  credentials_0[i_0].providerId,
                                                                  credentials_0[i_0].facilityId,
                                                                  credentials_0[i_0].assetNonce,
                                                                  credentials_0[i_0].outstandingMinor,
                                                                  credentials_0[i_0].daysPastDue,
                                                                  credentials_0[i_0].riskScore,
                                                                  credentials_0[i_0].maturityEpoch,
                                                                  credentials_0[i_0].snapshotEpoch);
                        const msg_0 = [this._degradeToTransient_0(digest_0)];
                        const sig_0 = { announcement:
                                          credentials_0[i_0].signatureAnnouncement,
                                        response:
                                          credentials_0[i_0].signatureResponse };
                        this._schnorrVerify_0(context,
                                              partialProofData,
                                              msg_0,
                                              sig_0,
                                              pk_0);
                        let t_2;
                        __compactRuntime.assert((t_2 = credentials_0[i_0].outstandingMinor,
                                                 t_2 > 0n),
                                                'ASSET_INELIGIBLE');
                        let t_3;
                        __compactRuntime.assert((t_3 = credentials_0[i_0].daysPastDue,
                                                 t_3
                                                 <=
                                                 _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                           partialProofData,
                                                                                                           [
                                                                                                            { dup: { n: 0 } },
                                                                                                            { idx: { cached: false,
                                                                                                                     pushPath: false,
                                                                                                                     path: [
                                                                                                                            { tag: 'value',
                                                                                                                              value: { value: _descriptor_10.toValue(1n),
                                                                                                                                       alignment: _descriptor_10.alignment() } },
                                                                                                                            { tag: 'value',
                                                                                                                              value: { value: _descriptor_10.toValue(7n),
                                                                                                                                       alignment: _descriptor_10.alignment() } }] } },
                                                                                                            { popeq: { cached: false,
                                                                                                                       result: undefined } }]).value)),
                                                'ASSET_INELIGIBLE');
                        let t_4;
                        __compactRuntime.assert((t_4 = credentials_0[i_0].riskScore,
                                                 t_4
                                                 >=
                                                 _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                           partialProofData,
                                                                                                           [
                                                                                                            { dup: { n: 0 } },
                                                                                                            { idx: { cached: false,
                                                                                                                     pushPath: false,
                                                                                                                     path: [
                                                                                                                            { tag: 'value',
                                                                                                                              value: { value: _descriptor_10.toValue(1n),
                                                                                                                                       alignment: _descriptor_10.alignment() } },
                                                                                                                            { tag: 'value',
                                                                                                                              value: { value: _descriptor_10.toValue(8n),
                                                                                                                                       alignment: _descriptor_10.alignment() } }] } },
                                                                                                            { popeq: { cached: false,
                                                                                                                       result: undefined } }]).value)),
                                                'ASSET_INELIGIBLE');
                        let t_5;
                        __compactRuntime.assert((t_5 = credentials_0[i_0].maturityEpoch,
                                                 t_5
                                                 >=
                                                 _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                           partialProofData,
                                                                                                           [
                                                                                                            { dup: { n: 0 } },
                                                                                                            { idx: { cached: false,
                                                                                                                     pushPath: false,
                                                                                                                     path: [
                                                                                                                            { tag: 'value',
                                                                                                                              value: { value: _descriptor_10.toValue(1n),
                                                                                                                                       alignment: _descriptor_10.alignment() } },
                                                                                                                            { tag: 'value',
                                                                                                                              value: { value: _descriptor_10.toValue(10n),
                                                                                                                                       alignment: _descriptor_10.alignment() } }] } },
                                                                                                            { popeq: { cached: false,
                                                                                                                       result: undefined } }]).value)
                                                 +
                                                 _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                           partialProofData,
                                                                                                           [
                                                                                                            { dup: { n: 0 } },
                                                                                                            { idx: { cached: false,
                                                                                                                     pushPath: false,
                                                                                                                     path: [
                                                                                                                            { tag: 'value',
                                                                                                                              value: { value: _descriptor_10.toValue(1n),
                                                                                                                                       alignment: _descriptor_10.alignment() } },
                                                                                                                            { tag: 'value',
                                                                                                                              value: { value: _descriptor_10.toValue(9n),
                                                                                                                                       alignment: _descriptor_10.alignment() } }] } },
                                                                                                            { popeq: { cached: false,
                                                                                                                       result: undefined } }]).value)),
                                                'ASSET_INELIGIBLE');
                        const nul_0 = this._assetNullifier_0(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                                       partialProofData,
                                                                                                                       [
                                                                                                                        { dup: { n: 0 } },
                                                                                                                        { idx: { cached: false,
                                                                                                                                 pushPath: false,
                                                                                                                                 path: [
                                                                                                                                        { tag: 'value',
                                                                                                                                          value: { value: _descriptor_10.toValue(0n),
                                                                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                                                                        { tag: 'value',
                                                                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                                                                        { popeq: { cached: false,
                                                                                                                                   result: undefined } }]).value),
                                                             credentials_0[i_0].assetNonce);
                        __compactRuntime.assert(!_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                           partialProofData,
                                                                                                           [
                                                                                                            { dup: { n: 0 } },
                                                                                                            { idx: { cached: false,
                                                                                                                     pushPath: false,
                                                                                                                     path: [
                                                                                                                            { tag: 'value',
                                                                                                                              value: { value: _descriptor_10.toValue(1n),
                                                                                                                                       alignment: _descriptor_10.alignment() } },
                                                                                                                            { tag: 'value',
                                                                                                                              value: { value: _descriptor_10.toValue(14n),
                                                                                                                                       alignment: _descriptor_10.alignment() } }] } },
                                                                                                            { push: { storage: false,
                                                                                                                      value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nul_0),
                                                                                                                                                                   alignment: _descriptor_0.alignment() }).encode() } },
                                                                                                            'member',
                                                                                                            { popeq: { cached: true,
                                                                                                                       result: undefined } }]).value),
                                                'ASSET_ALREADY_USED');
                        __compactRuntime.queryLedgerState(context,
                                                          partialProofData,
                                                          [
                                                           { idx: { cached: false,
                                                                    pushPath: true,
                                                                    path: [
                                                                           { tag: 'value',
                                                                             value: { value: _descriptor_10.toValue(1n),
                                                                                      alignment: _descriptor_10.alignment() } },
                                                                           { tag: 'value',
                                                                             value: { value: _descriptor_10.toValue(14n),
                                                                                      alignment: _descriptor_10.alignment() } }] } },
                                                           { push: { storage: false,
                                                                     value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nul_0),
                                                                                                                  alignment: _descriptor_0.alignment() }).encode() } },
                                                           { push: { storage: true,
                                                                     value: __compactRuntime.StateValue.newNull().encode() } },
                                                           { ins: { cached: false,
                                                                    n: 1 } },
                                                           { ins: { cached: true,
                                                                    n: 2 } }]);
                      }
                      return t_1;
                    }),
                   [],
                   [0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n]);
    const occ0_0 = credentials_0[0].slotOccupied ? 1n : 0n;
    const occ1_0 = credentials_0[1].slotOccupied ? 1n : 0n;
    const occ2_0 = credentials_0[2].slotOccupied ? 1n : 0n;
    const occ3_0 = credentials_0[3].slotOccupied ? 1n : 0n;
    const occ4_0 = credentials_0[4].slotOccupied ? 1n : 0n;
    const occ5_0 = credentials_0[5].slotOccupied ? 1n : 0n;
    const occ6_0 = credentials_0[6].slotOccupied ? 1n : 0n;
    const occ7_0 = credentials_0[7].slotOccupied ? 1n : 0n;
    const selectedCount_0 = occ0_0 + occ1_0 + occ2_0 + occ3_0 + occ4_0 + occ5_0
                            +
                            occ6_0
                            +
                            occ7_0;
    __compactRuntime.assert(selectedCount_0 > 0n, 'INSUFFICIENT_COLLATERAL');
    const e0_0 = credentials_0[0].slotOccupied ?
                 credentials_0[0].outstandingMinor :
                 0n;
    const e1_0 = credentials_0[1].slotOccupied ?
                 credentials_0[1].outstandingMinor :
                 0n;
    const e2_0 = credentials_0[2].slotOccupied ?
                 credentials_0[2].outstandingMinor :
                 0n;
    const e3_0 = credentials_0[3].slotOccupied ?
                 credentials_0[3].outstandingMinor :
                 0n;
    const e4_0 = credentials_0[4].slotOccupied ?
                 credentials_0[4].outstandingMinor :
                 0n;
    const e5_0 = credentials_0[5].slotOccupied ?
                 credentials_0[5].outstandingMinor :
                 0n;
    const e6_0 = credentials_0[6].slotOccupied ?
                 credentials_0[6].outstandingMinor :
                 0n;
    const e7_0 = credentials_0[7].slotOccupied ?
                 credentials_0[7].outstandingMinor :
                 0n;
    const eligibleTotal_0 = e0_0 + e1_0 + e2_0 + e3_0 + e4_0 + e5_0 + e6_0
                            +
                            e7_0;
    const lhs_0 = eligibleTotal_0
                  *
                  _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                            partialProofData,
                                                                            [
                                                                             { dup: { n: 0 } },
                                                                             { idx: { cached: false,
                                                                                      pushPath: false,
                                                                                      path: [
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_10.toValue(1n),
                                                                                                        alignment: _descriptor_10.alignment() } },
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_10.toValue(6n),
                                                                                                        alignment: _descriptor_10.alignment() } }] } },
                                                                             { popeq: { cached: false,
                                                                                        result: undefined } }]).value);
    const rhs_0 = requestedAmount_0 * 10000n;
    __compactRuntime.assert(lhs_0 >= rhs_0, 'INSUFFICIENT_COLLATERAL');
    __compactRuntime.assert(this._unshieldedBalanceGte_0(context,
                                                         partialProofData,
                                                         _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                                   partialProofData,
                                                                                                                   [
                                                                                                                    { dup: { n: 0 } },
                                                                                                                    { idx: { cached: false,
                                                                                                                             pushPath: false,
                                                                                                                             path: [
                                                                                                                                    { tag: 'value',
                                                                                                                                      value: { value: _descriptor_10.toValue(1n),
                                                                                                                                               alignment: _descriptor_10.alignment() } },
                                                                                                                                    { tag: 'value',
                                                                                                                                      value: { value: _descriptor_10.toValue(3n),
                                                                                                                                               alignment: _descriptor_10.alignment() } }] } },
                                                                                                                    { popeq: { cached: false,
                                                                                                                               result: undefined } }]).value),
                                                         requestedAmount_0),
                            'VAULT_INSUFFICIENT');
    const nextOutstandingRaw_0 = _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                           partialProofData,
                                                                                           [
                                                                                            { dup: { n: 0 } },
                                                                                            { idx: { cached: false,
                                                                                                     pushPath: false,
                                                                                                     path: [
                                                                                                            { tag: 'value',
                                                                                                              value: { value: _descriptor_10.toValue(1n),
                                                                                                                       alignment: _descriptor_10.alignment() } },
                                                                                                            { tag: 'value',
                                                                                                              value: { value: _descriptor_10.toValue(5n),
                                                                                                                       alignment: _descriptor_10.alignment() } }] } },
                                                                                            { popeq: { cached: false,
                                                                                                       result: undefined } }]).value)
                                 +
                                 requestedAmount_0;
    __compactRuntime.assert(nextOutstandingRaw_0
                            <=
                            340282366920938463463374607431768211455n,
                            'CREDIT_LIMIT_EXCEEDED');
    const newOutstanding_0 = ((t1) => {
                               if (t1 > 340282366920938463463374607431768211455n) {
                                 throw new __compactRuntime.CompactError('phrim.compact line 259 char 35: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 340282366920938463463374607431768211455');
                               }
                               return t1;
                             })(nextOutstandingRaw_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(5n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(newOutstanding_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const drawId_0 = this._deriveDrawId_0(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_10.toValue(0n),
                                                                                                                                alignment: _descriptor_10.alignment() } },
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_10.toValue(1n),
                                                                                                                                alignment: _descriptor_10.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_10.toValue(1n),
                                                                                                                                alignment: _descriptor_10.alignment() } },
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_10.toValue(10n),
                                                                                                                                alignment: _descriptor_10.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          requestedAmount_0);
    const receipt_0 = { drawId: drawId_0,
                        facilityId:
                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                    partialProofData,
                                                                                    [
                                                                                     { dup: { n: 0 } },
                                                                                     { idx: { cached: false,
                                                                                              pushPath: false,
                                                                                              path: [
                                                                                                     { tag: 'value',
                                                                                                       value: { value: _descriptor_10.toValue(0n),
                                                                                                                alignment: _descriptor_10.alignment() } },
                                                                                                     { tag: 'value',
                                                                                                       value: { value: _descriptor_10.toValue(1n),
                                                                                                                alignment: _descriptor_10.alignment() } }] } },
                                                                                     { popeq: { cached: false,
                                                                                                result: undefined } }]).value),
                        epoch:
                          _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                    partialProofData,
                                                                                    [
                                                                                     { dup: { n: 0 } },
                                                                                     { idx: { cached: false,
                                                                                              pushPath: false,
                                                                                              path: [
                                                                                                     { tag: 'value',
                                                                                                       value: { value: _descriptor_10.toValue(1n),
                                                                                                                alignment: _descriptor_10.alignment() } },
                                                                                                     { tag: 'value',
                                                                                                       value: { value: _descriptor_10.toValue(10n),
                                                                                                                alignment: _descriptor_10.alignment() } }] } },
                                                                                     { popeq: { cached: false,
                                                                                                result: undefined } }]).value),
                        amount: requestedAmount_0,
                        resultingOutstanding: newOutstanding_0,
                        completed: true };
    const receiptIndex_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                     partialProofData,
                                                                                     [
                                                                                      { dup: { n: 0 } },
                                                                                      { idx: { cached: false,
                                                                                               pushPath: false,
                                                                                               path: [
                                                                                                      { tag: 'value',
                                                                                                        value: { value: _descriptor_10.toValue(1n),
                                                                                                                 alignment: _descriptor_10.alignment() } },
                                                                                                      { tag: 'value',
                                                                                                        value: { value: _descriptor_10.toValue(13n),
                                                                                                                 alignment: _descriptor_10.alignment() } }] } },
                                                                                      { popeq: { cached: true,
                                                                                                 result: undefined } }]).value);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(12n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(receiptIndex_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(receipt_0),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(13n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_5.toValue(tmp_0),
                                                                alignment: _descriptor_5.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 2 } }]);
    this._sendUnshielded_0(context,
                           partialProofData,
                           _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                     partialProofData,
                                                                                     [
                                                                                      { dup: { n: 0 } },
                                                                                      { idx: { cached: false,
                                                                                               pushPath: false,
                                                                                               path: [
                                                                                                      { tag: 'value',
                                                                                                        value: { value: _descriptor_10.toValue(1n),
                                                                                                                 alignment: _descriptor_10.alignment() } },
                                                                                                      { tag: 'value',
                                                                                                        value: { value: _descriptor_10.toValue(3n),
                                                                                                                 alignment: _descriptor_10.alignment() } }] } },
                                                                                      { popeq: { cached: false,
                                                                                                 result: undefined } }]).value),
                           requestedAmount_0,
                           this._right_0(_descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                   partialProofData,
                                                                                                   [
                                                                                                    { dup: { n: 0 } },
                                                                                                    { idx: { cached: false,
                                                                                                             pushPath: false,
                                                                                                             path: [
                                                                                                                    { tag: 'value',
                                                                                                                      value: { value: _descriptor_10.toValue(0n),
                                                                                                                               alignment: _descriptor_10.alignment() } },
                                                                                                                    { tag: 'value',
                                                                                                                      value: { value: _descriptor_10.toValue(4n),
                                                                                                                               alignment: _descriptor_10.alignment() } }] } },
                                                                                                    { popeq: { cached: false,
                                                                                                               result: undefined } }]).value)));
    return [];
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_6(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_7(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_8(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_9(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _folder_0(context, partialProofData, f, x, a0) {
    for (let i = 0; i < 8; i++) { x = f(context, partialProofData, x, a0[i]); }
    return x;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get facilityExists() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(0n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(0n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get facilityId() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(0n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lenderAuthorityHash() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(0n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(2n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get borrowerAuthorityHash() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(0n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(3n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get borrowerAddress() {
      return _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(0n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(4n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get attestorProviderId() {
      return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(0n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get attestorPublicKeyX() {
      return _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get attestorPublicKeyY() {
      return _descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(2n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get tokenColor() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(3n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get creditLimit() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(4n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get outstanding() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(5n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get advanceRateBps() {
      return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(6n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get maxDaysPastDue() {
      return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(7n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get minRiskScore() {
      return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(8n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get minRemainingEpochs() {
      return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(9n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get currentEpoch() {
      return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(10n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get status() {
      return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(11n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    drawReceipts: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(1n),
                                                                                                     alignment: _descriptor_10.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(12n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(0n),
                                                                                                                                 alignment: _descriptor_6.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(1n),
                                                                                                     alignment: _descriptor_10.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(12n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'phrim.compact line 59 char 1',
                                     'Uint<0..18446744073709551616>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(1n),
                                                                                                     alignment: _descriptor_10.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(12n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(key_0),
                                                                                                                                 alignment: _descriptor_6.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'phrim.compact line 59 char 1',
                                     'Uint<0..18446744073709551616>',
                                     key_0)
        }
        return _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(1n),
                                                                                                     alignment: _descriptor_10.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(12n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_6.toValue(key_0),
                                                                                                     alignment: _descriptor_6.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[12];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_6.fromValue(key.value),      _descriptor_7.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get drawCount() {
      return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                   alignment: _descriptor_10.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_10.toValue(13n),
                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    usedAssetNullifiers: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(1n),
                                                                                                     alignment: _descriptor_10.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(14n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(0n),
                                                                                                                                 alignment: _descriptor_6.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(1n),
                                                                                                     alignment: _descriptor_10.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(14n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'phrim.compact line 61 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(1n),
                                                                                                     alignment: _descriptor_10.alignment() } },
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(14n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1].asArray()[14];
        return self_0.asMap().keys().map((elem) => _descriptor_0.fromValue(elem.value))[Symbol.iterator]();
      }
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  getSchnorrReduction: (...args) => undefined
});
export const pureCircuits = {
  credentialDigest: (...args_0) => {
    if (args_0.length !== 9) {
      throw new __compactRuntime.CompactError(`credentialDigest: expected 9 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const schemaVersion_0 = args_0[0];
    const providerId_0 = args_0[1];
    const facilityIdArg_0 = args_0[2];
    const assetNonce_0 = args_0[3];
    const outstandingMinor_0 = args_0[4];
    const daysPastDue_0 = args_0[5];
    const riskScore_0 = args_0[6];
    const maturityEpoch_0 = args_0[7];
    const snapshotEpoch_0 = args_0[8];
    if (!(typeof(schemaVersion_0) === 'bigint' && schemaVersion_0 >= 0n && schemaVersion_0 <= 255n)) {
      __compactRuntime.typeError('credentialDigest',
                                 'argument 1',
                                 'phrim.compact line 63 char 1',
                                 'Uint<0..256>',
                                 schemaVersion_0)
    }
    if (!(typeof(providerId_0) === 'bigint' && providerId_0 >= 0n && providerId_0 <= 4294967295n)) {
      __compactRuntime.typeError('credentialDigest',
                                 'argument 2',
                                 'phrim.compact line 63 char 1',
                                 'Uint<0..4294967296>',
                                 providerId_0)
    }
    if (!(facilityIdArg_0.buffer instanceof ArrayBuffer && facilityIdArg_0.BYTES_PER_ELEMENT === 1 && facilityIdArg_0.length === 32)) {
      __compactRuntime.typeError('credentialDigest',
                                 'argument 3',
                                 'phrim.compact line 63 char 1',
                                 'Bytes<32>',
                                 facilityIdArg_0)
    }
    if (!(assetNonce_0.buffer instanceof ArrayBuffer && assetNonce_0.BYTES_PER_ELEMENT === 1 && assetNonce_0.length === 32)) {
      __compactRuntime.typeError('credentialDigest',
                                 'argument 4',
                                 'phrim.compact line 63 char 1',
                                 'Bytes<32>',
                                 assetNonce_0)
    }
    if (!(typeof(outstandingMinor_0) === 'bigint' && outstandingMinor_0 >= 0n && outstandingMinor_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('credentialDigest',
                                 'argument 5',
                                 'phrim.compact line 63 char 1',
                                 'Uint<0..18446744073709551616>',
                                 outstandingMinor_0)
    }
    if (!(typeof(daysPastDue_0) === 'bigint' && daysPastDue_0 >= 0n && daysPastDue_0 <= 65535n)) {
      __compactRuntime.typeError('credentialDigest',
                                 'argument 6',
                                 'phrim.compact line 63 char 1',
                                 'Uint<0..65536>',
                                 daysPastDue_0)
    }
    if (!(typeof(riskScore_0) === 'bigint' && riskScore_0 >= 0n && riskScore_0 <= 65535n)) {
      __compactRuntime.typeError('credentialDigest',
                                 'argument 7',
                                 'phrim.compact line 63 char 1',
                                 'Uint<0..65536>',
                                 riskScore_0)
    }
    if (!(typeof(maturityEpoch_0) === 'bigint' && maturityEpoch_0 >= 0n && maturityEpoch_0 <= 4294967295n)) {
      __compactRuntime.typeError('credentialDigest',
                                 'argument 8',
                                 'phrim.compact line 63 char 1',
                                 'Uint<0..4294967296>',
                                 maturityEpoch_0)
    }
    if (!(typeof(snapshotEpoch_0) === 'bigint' && snapshotEpoch_0 >= 0n && snapshotEpoch_0 <= 4294967295n)) {
      __compactRuntime.typeError('credentialDigest',
                                 'argument 9',
                                 'phrim.compact line 63 char 1',
                                 'Uint<0..4294967296>',
                                 snapshotEpoch_0)
    }
    return _dummyContract._credentialDigest_0(schemaVersion_0,
                                              providerId_0,
                                              facilityIdArg_0,
                                              assetNonce_0,
                                              outstandingMinor_0,
                                              daysPastDue_0,
                                              riskScore_0,
                                              maturityEpoch_0,
                                              snapshotEpoch_0);
  },
  assetNullifier: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`assetNullifier: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const facilityIdArg_0 = args_0[0];
    const assetNonce_0 = args_0[1];
    if (!(facilityIdArg_0.buffer instanceof ArrayBuffer && facilityIdArg_0.BYTES_PER_ELEMENT === 1 && facilityIdArg_0.length === 32)) {
      __compactRuntime.typeError('assetNullifier',
                                 'argument 1',
                                 'phrim.compact line 88 char 1',
                                 'Bytes<32>',
                                 facilityIdArg_0)
    }
    if (!(assetNonce_0.buffer instanceof ArrayBuffer && assetNonce_0.BYTES_PER_ELEMENT === 1 && assetNonce_0.length === 32)) {
      __compactRuntime.typeError('assetNullifier',
                                 'argument 2',
                                 'phrim.compact line 88 char 1',
                                 'Bytes<32>',
                                 assetNonce_0)
    }
    return _dummyContract._assetNullifier_0(facilityIdArg_0, assetNonce_0);
  },
  computeChallenge1: (...args_0) => {
    if (args_0.length !== 5) {
      throw new __compactRuntime.CompactError(`computeChallenge1: expected 5 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const ann_x_0 = args_0[0];
    const ann_y_0 = args_0[1];
    const pk_x_0 = args_0[2];
    const pk_y_0 = args_0[3];
    const msg_0 = args_0[4];
    if (!(typeof(ann_x_0) === 'bigint' && ann_x_0 >= 0 && ann_x_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('computeChallenge1',
                                 'argument 1',
                                 'phrim.compact line 96 char 1',
                                 'Field',
                                 ann_x_0)
    }
    if (!(typeof(ann_y_0) === 'bigint' && ann_y_0 >= 0 && ann_y_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('computeChallenge1',
                                 'argument 2',
                                 'phrim.compact line 96 char 1',
                                 'Field',
                                 ann_y_0)
    }
    if (!(typeof(pk_x_0) === 'bigint' && pk_x_0 >= 0 && pk_x_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('computeChallenge1',
                                 'argument 3',
                                 'phrim.compact line 96 char 1',
                                 'Field',
                                 pk_x_0)
    }
    if (!(typeof(pk_y_0) === 'bigint' && pk_y_0 >= 0 && pk_y_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('computeChallenge1',
                                 'argument 4',
                                 'phrim.compact line 96 char 1',
                                 'Field',
                                 pk_y_0)
    }
    if (!(Array.isArray(msg_0) && msg_0.length === 1 && msg_0.every((t) => typeof(t) === 'bigint' && t >= 0 && t <= __compactRuntime.MAX_FIELD))) {
      __compactRuntime.typeError('computeChallenge1',
                                 'argument 5',
                                 'phrim.compact line 96 char 1',
                                 'Vector<1, Field>',
                                 msg_0)
    }
    return _dummyContract._computeChallenge1_0(ann_x_0,
                                               ann_y_0,
                                               pk_x_0,
                                               pk_y_0,
                                               msg_0);
  },
  deriveAuthorityHash: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`deriveAuthorityHash: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const secret_0 = args_0[0];
    if (!(secret_0.buffer instanceof ArrayBuffer && secret_0.BYTES_PER_ELEMENT === 1 && secret_0.length === 32)) {
      __compactRuntime.typeError('deriveAuthorityHash',
                                 'argument 1',
                                 'phrim.compact line 108 char 1',
                                 'Bytes<32>',
                                 secret_0)
    }
    return _dummyContract._deriveAuthorityHash_0(secret_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
