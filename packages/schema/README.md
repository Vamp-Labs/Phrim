# packages/schema

Canonical types, domain separators, the byte-exact credential preimage serialiser, the nullifier
preimage builder, the error-code table, and the five deterministic demo scenarios. Owned by Role 02.
See `docs/handoffs/02-attestation-schema.md` and `docs/handoffs/00-overview.md` §5 for the frozen
contracts this package implements.

## Install and test

From the repository root:

```
pnpm install
pnpm --filter schema test
pnpm --filter schema run typecheck
```

Requires `packages/contract/managed/phrim/**` to exist first (`pnpm --filter @phrim/contract run
compile`, or `--skip-zk` for fast iteration) — the real Schnorr signer and the golden-vector script
import `pureCircuits` from the compiled contract, per R3a/R4/R6.

## Regenerating demo values

`scripts/derive-demo-values.mjs` derives every demo asset nonce and the two demo facility ids by
SHA-256 of a documented ASCII label (`phrim:demo-asset-nonce:v1:<scenario>:<index>`,
`FACILITY_DEMO_001`, `OTHER_FACILITY_DEMO_999`). Run it to see the formula in action:

```
pnpm derive-demo-values
```

Its output is embedded as literal hex constants in `src/fixtures/demoValues.ts`. This keeps
`demoValues.ts` free of any runtime crypto dependency (so it stays safe to import from a browser
bundle) while keeping the derivation auditable and regenerable. Re-running the script twice produces
byte-identical output, and regenerating the constants file from that output is a mechanical copy —
no `Math.random`, no `Date.now`, nothing environment-dependent anywhere in this pipeline.

These nonces are **not** the Compact `persistentHash` — they are just opaque, deterministic 32-byte
labels standing in for values a real attestor would assign. The credential digest and nullifier
hashes themselves are computed by the compiled contract's pure circuits, never reimplemented here; see
"Schema Lock wiring" below. `DEMO_ATTESTOR_SECRET_SEED` is derived the same way and reduced to a Jubjub
scalar by `scalarFromSeed` — it is the fixed, deterministic signing key used only for golden vectors
and fixtures, distinct from the attestation service's own randomly-generated, persisted demo key.

## The `undercollateralized` fixture's nonce reasoning

PRD §21 and `00-overview.md` §5.7 describe `undercollateralized` as "the eligible batch, freshly
signed at the current epoch, with two assets now delinquent." Taken literally that means reusing
`eligible`'s exact asset nonces. **This package does not do that, deliberately.**

The canonical demo sequence (§5.7's notes, PRD §21) runs `eligible → undercollateralized → replay`
against one facility deployment in a single rehearsal. `eligible` succeeds first and commits its eight
nullifiers into `usedAssetNullifiers`. The contract's Stage 2 order (PRD §14.2) checks nullifier
uniqueness (Stage 2.6) for every occupied slot *before* Stage 3's borrowing-base/advance-rate check.
If `undercollateralized`'s six occupied slots reused `eligible`'s already-consumed nonces, the circuit
would reject at Stage 2.6 with `ASSET_ALREADY_USED` — not `INSUFFICIENT_COLLATERAL` — breaking the
exact failure PRD §21 promises and Role 02's own acceptance criterion 9.

So `UNDERCOLLATERALIZED_OCCUPIED_ASSETS` (`src/fixtures/assets.ts`) uses six **freshly derived, never
reused** asset nonces (`phrim:demo-asset-nonce:v1:undercollateralized:0..5`), shaped identically to
what "the same portfolio, two assets later gone delinquent" would look like: same total-minus-$15,000
math ($100,000 → $85,000), same epoch, same provider and facility id, all six independently
policy-eligible. The two conceptually-delinquent assets are represented only as
`UNDERCOLLATERALIZED_DESELECTED_NOTES` — narrative metadata (a label, a notional balance, a notional
`daysPastDue`) for Role 03/04's copy, never as real slot data, because per `00-overview.md` §5.5 an
unoccupied slot is zero-constrained in-circuit and must not carry a real nonce or field values.

A test in `test/fixtures.test.ts` (`does not reuse any eligible-scenario asset nonce`) guards this
choice mechanically so it cannot regress silently.

**This is flagged as a resolved ambiguity, not a unilateral rewrite of the handoff** — see the PM
report for the full reasoning. If Role 01's actual demo rehearsal procedure resets the facility (fresh
deployment or fresh `facilityId`) between every scenario rather than running all three against one
deployment, nonce reuse would be safe and this choice would only be defensive; either way it is
correct and never breaks the intended failure code.

## Schema Lock wiring (R6/R8/R12 — now unblocked)

`docs/handoffs/SCHEMA-LOCK.md` is countersigned. Per R3a/R4/§5.11.2, this package **never
reimplements `persistentHash`, `transientHash`, or Jubjub curve arithmetic in TypeScript.** Instead it
calls the real compiled circuits and the real `@midnight-ntwrk/compact-runtime` functions:

- `src/canonical.ts` — `bindCredentialDigestCircuit(circuit)` / `computeCredentialDigest(credential)`.
- `src/nullifier.ts` — `bindAssetNullifierCircuit(circuit)` / `computeAssetNullifier(facilityId, assetNonce)`.
- `src/schnorr.ts` — `bindComputeChallenge1Circuit(circuit)` / `signDigest(digest, keypair, nonce)`, plus
  `makeAttestorKeypair`, `scalarFromSeed`, both built on `ecMulGenerator` / `jubjubPointX` /
  `jubjubPointY` / `degradeToTransient` from `@midnight-ntwrk/compact-runtime`.
- `src/attestorSigner.ts` — `createCredentialSigner(keypair)`, combining the two above into "sign a
  full credential."
- `src/wireContract.ts` — `bindPhrimPureCircuits(pureCircuits)`, one call that binds all three circuit
  seams at once. Any consumer (the golden-vector script, the attestation service, a test) calls this
  once at startup:

```ts
import { phrimPureCircuits } from '@phrim/contract';
import { bindPhrimPureCircuits } from 'schema';

bindPhrimPureCircuits(phrimPureCircuits);
```

`packages/attestation/src/server.ts` does exactly this at boot. Nothing throws `PENDING_SCHEMA_LOCK`
any more once `@phrim/contract`'s `managed/` output exists.

### Two corrections from SCHEMA-LOCK §4.5, both applied

1. **Little-endian, not big-endian.** `encodeUnsignedIntWord` in `src/canonical.ts` now zero-extends
   each numeric word least-significant-byte-first, matching the compiled contract's native
   `Uint<N> as Bytes<32>` cast. `test/canonical.test.ts` has a dedicated test pinning this
   (`0x0102` → `[0x02, 0x01, 0, 0, ...]`). This only affects what the golden vectors print for a human
   to eyeball — it was never a functional bug, because the real digest is always computed by the bound
   pure circuit (see R3a's own reasoning), never from these words.
2. **`response` is reduced modulo the Jubjub scalar field order.** `signDigest` in `src/schnorr.ts`
   returns `(nonce + remainder · secretKey) % JUBJUB_SCALAR_FIELD_ORDER`, not the raw unreduced sum —
   an unreduced value intermittently fails to decode as the runtime's `EmbeddedFr` scalar type.

### How signing works here

`createCredentialSigner(keypair).sign(unsigned)` computes the real `credentialDigest` via the bound
pure circuit, derives a deterministic per-credential nonce with `scalarFromSeed(digest)` (every
distinct credential has a distinct digest, so no two different messages are ever signed with the same
nonce under the same key — the classical Schnorr nonce-reuse hazard), and calls `signDigest`. This
means signing the same credential twice always produces the same signature — deterministic by design,
which is what makes golden vectors reproducible and is not a weakness here, since neither the digest
nor the signature is ever disclosed on the public ledger (PRD Table 11.4).

The demo attestor key used for fixtures/golden vectors is fixed and deterministic
(`DEMO_ATTESTOR_SECRET_SEED`, above) — **do not confuse this with the attestation service's own
key**, which `packages/attestation`'s `AttestorKeyStore` generates randomly once per install and
persists (see `packages/attestation/README.md`). The two are unrelated key material serving different
purposes: one produces reproducible committed fixtures, the other is the actual demo trust root.

## Golden vectors (R8)

```
pnpm --filter schema run generate-golden-vectors
```

Writes `test/vectors/{facility,attestor,eligible,undercollateralized,stale,tampered,replay}.json`.
Each scenario file's `credentials[]` entries carry, per PRD/handoff requirement: the exact signed
input, the ten canonical words in hex, the credential digest in hex, the three-word nullifier preimage
in hex, the derived nullifier in hex, and `signatureExpectedValid` (`false` only for `tampered`'s
mutated slot — its signature is the *original* pre-mutation signature, deliberately left unchanged, so
a verifier recomputing the digest from the submitted fields gets a mismatch). Regenerating twice
produces byte-identical files (`diff -rq` verified). `test/goldenVectors.test.ts` reproduces every
vector's digest and nullifier from its own recorded input against the real `pureCircuits` and asserts
they match what was published — this package's own half of "the lock holds."

**Role 01: these vectors are ready for your in-circuit test** (your acceptance criterion 4). They are
also what `test/goldenVectors.test.ts` already exercises from this side.

## Padding direction — confirmed, not provisional

`SCHEMA-LOCK.md` §1.1 confirms empirically (compiled `pad(32, "AB")` and inspected the generated
constant) that `pad(32, s)` right-pads. `src/domain.ts`'s `DOMAIN_SEPARATOR_PADDING_DIRECTION = 'right'`
needed no change.
