import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { Ledger, Witnesses } from '../managed/phrim/contract/index.js';

export type PhrimPrivateState = Record<string, never>;

export const createPhrimPrivateState = (): PhrimPrivateState => ({});

const SCHNORR_CHALLENGE_TRUNCATION_BITS = 248n;
const SCHNORR_TRUNCATION_MODULUS = 1n << SCHNORR_CHALLENGE_TRUNCATION_BITS;

export const phrimWitnesses: Witnesses<PhrimPrivateState> = {
  getSchnorrReduction(
    context: WitnessContext<Ledger, PhrimPrivateState>,
    challengeHash: bigint,
  ): [PhrimPrivateState, [bigint, bigint]] {
    const quotient = challengeHash / SCHNORR_TRUNCATION_MODULUS;
    const remainder = challengeHash % SCHNORR_TRUNCATION_MODULUS;
    return [context.privateState, [quotient, remainder]];
  },
};
