# SCHEMA-LOCK — Phrim Credential Schema, Signature Primitive, and Latency Gate

Status: **Layer B confirmed empirically by Role 01 on 12 Sept 2026.** Awaiting Role 02 countersignature
after the signer is built against this document.

This document is self-contained. It restates Layer A (frozen field layout, from
`docs/handoffs/00-overview.md` §5.2–§5.4) and records Layer B (the concrete signature primitive,
curve, challenge construction, and padding direction), each answer backed by either an official
source URL or an empirical compiler probe run against the pinned toolchain. Where a claim is
**[V-EMP]**, it was independently reproduced during this handoff, not merely read from a document.

---

## 0. Toolchain actually installed and used for every probe below

| Component | Version | How obtained |
|---|---|---|
| `compact` devtools CLI | 0.5.2 | `compact-installer.sh` from `https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh` |
| `compactc` (compiler) | **0.31.1** | `compact update 0.31.1` |
| `--language-version` | `0.23.0` | `compactc --language-version` |
| `--runtime-version` | `0.16.0` | `compactc --runtime-version` |
| `--ledger-version` | `ledger-8.0.2` | `compactc --ledger-version` |
| `midnightntwrk/proof-server` | `8.1.0` | Docker Hub, confirmed via `GET /version` |
| `@midnight-ntwrk/compact-runtime` | `0.16.0` | npm |
| `@midnight-ntwrk/ledger-v8` | `8.1.0` | npm |
| `@midnight-ntwrk/midnight-js-contracts` / `-types` / `-protocol` / `-utils` / `-network-id` / `-http-client-proof-provider` / `-node-zk-config-provider` | `4.1.1` | npm |

This confirms `00-overview.md` §5.11.1's pin **exactly**: 0.31.1 ↔ language 0.23.0 ↔ runtime 0.16.0 ↔
ledger-8.0.2. `pragma language_version 0.23;` was used for every probe file and compiled cleanly.

---

## 1. Layer A — frozen field layout (restated, unchanged)

### 1.1 Domain separators — ASCII, padded to 32 bytes, **right-padded**

| Constant | Exact string | ASCII bytes | Source |
|---|---|---:|---|
| `DS_CREDENTIAL` | `phrim:credential:v1` | 19 | PM-defined per PRD §18.1 |
| `DS_ASSET_NULLIFIER` | `phrim:asset-nullifier:v1` | 24 | PRD §14.2 Stage 2.6, verbatim |
| `DS_AUTHORITY` | `phrim:authority:v1` | 18 | PM-defined per PRD §18.1 |
| `DS_DRAW_ID` | `phrim:draw-id:v1` | 16 | PM-defined per PRD §18.1 |

**Padding direction: `pad(32, s)` right-pads — ASCII bytes first, zero bytes after.** This was the one
genuinely open Layer B question and it is now closed empirically, not assumed.

**Proof [V-EMP].** Compiled the following probe with `compactc 0.31.1 --skip-zk`:

```
pragma language_version 0.23;
import CompactStandardLibrary;
export pure circuit padProbe(): Bytes<32> { return pad(32, "AB"); }
```

The compiler's generated `pureCircuits.padProbe` body is a literal constant baked in at compile time:

```js
_padProbe_0() {
  return new Uint8Array([65, 66, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
}
```

`65, 66` are ASCII `A`, `B`, followed by 30 zero bytes. Right-padding, confirmed by direct inspection
of compiler output — not by running anything at proof time, so this holds regardless of witness
values. `packages/schema/src/domain.ts`'s `DOMAIN_SEPARATOR_PADDING_DIRECTION = 'right'` (already
written by Role 02 before this document existed) is **correct**; no change needed there.

### 1.2 Canonical credential preimage — ten 32-byte words, fixed order

Unchanged from `00-overview.md` §5.3. Restated for self-containment:

| # | Word | Field | Encoding |
|---:|---|---|---|
| 0 | `DS_CREDENTIAL` | — | `pad(32, "phrim:credential:v1")` |
| 1 | `schemaVersion` | Uint 8 | big-endian, zero-extended (value fixed at `1`) |
| 2 | `providerId` | Uint 32 | big-endian, zero-extended |
| 3 | `facilityId` | Bytes 32 | raw |
| 4 | `assetNonce` | Bytes 32 | raw |
| 5 | `outstandingMinor` | Uint 64 | big-endian, zero-extended, minor units |
| 6 | `daysPastDue` | Uint 16 | big-endian, zero-extended |
| 7 | `riskScore` | Uint 16 | big-endian, zero-extended |
| 8 | `maturityEpoch` | Uint 32 | big-endian, zero-extended |
| 9 | `snapshotEpoch` | Uint 32 | big-endian, zero-extended |

Hashed with `persistentHash<Vector<10, Bytes<32>>>([...])`, exposed as the pure circuit
`credentialDigest` (see §3 below).

**Proof [V-EMP] that a 10-word `persistentHash<Vector<10, Bytes<32>>>` call compiles under 0.31.1:**
probe `hash10Probe(w0..w9: Bytes<32>): Bytes<32> { return persistentHash<Vector<10, Bytes<32>>>([w0..w9]); }`
compiled cleanly with `--skip-zk`.

### 1.3 Nullifier preimage — three 32-byte words

`persistentHash<Vector<3, Bytes<32>>>([pad(32, "phrim:asset-nullifier:v1"), facilityId, assetNonce])`,
facility ID taken from ledger state, not from the credential. Exposed as pure circuit `assetNullifier`
(§3). **Proof [V-EMP]:** `persistentHash<Vector<3, Bytes<32>>>` probe compiled cleanly.

### 1.4 Empty-slot semantics

Unchanged from `00-overview.md` §5.5: `slotOccupied: Boolean` witness flag per slot; unoccupied slots
have every field constrained to zero, produce no nullifier, are not signature-checked, and do not
count toward `selectedCredentialCount`.

---

## 2. Layer B — signature primitive (the open decision)

### 2.1 It is Schnorr over Jubjub. Midnight has no EdDSA.

**PRD Table 11.4, §14.2 Stage 2.4, and FR 08 all say "EdDSA". This is factually wrong for Midnight as
it exists today.** Confirmed empirically, not merely read:

**Proof [V-EMP] that `SchnorrSignature` / `jubjubSchnorrVerify` are absent from the 0.31.1 standard
library** (i.e., not merely undocumented but genuinely unbound at this compiler version):

```
pragma language_version 0.23;
import CompactStandardLibrary;
export circuit verifyProbe(msg: Vector<1, Field>, sig: SchnorrSignature, pk: JubjubPoint): [] {
  jubjubSchnorrVerify<1>(msg, sig, pk);
}
```

Compile result: `Exception: ... unbound identifier SchnorrSignature`. The compiler never even reaches
`jubjubSchnorrVerify` — the type it would need is not defined in the 0.31.1 stdlib at all.

**Consequence:** the Schnorr struct and verification circuit must be supplied by the contract itself.
Midnight's own official ZK Loan example (`midnightntwrk/example-zkloan`,
`contract/src/schnorr.compact`) does exactly this, with a header comment stating it is temporary
pending the stdlib circuit's release. **Phrim vendors this file byte-for-byte.**

Source: `https://raw.githubusercontent.com/midnightntwrk/example-zkloan/main/contract/src/schnorr.compact`
(fetched 12 Sept 2026; also referenced from `midnightntwrk/example-counter`'s
`zkloan-credit-scorer.compact`, `https://raw.githubusercontent.com/midnightntwrk/example-zkloan/main/contract/src/zkloan-credit-scorer.compact`).

Vendored to `packages/contract/src/schnorr.compact`, unmodified, including its own header comments
(kept for provenance — this is the one file in the contract package that is not held to the "no
comments" convention, because it is vendored third-party code the handoff explicitly says not to
rewrite).

### 2.2 The module's shape (as vendored)

```
module schnorr {
  export struct SchnorrSignature { announcement: JubjubPoint; response: Field; }
  witness getSchnorrReduction(challengeHash: Field): [Uint<7>, Uint<248>];
  export circuit schnorrVerify<#n>(msg: Vector<n, Field>, signature: SchnorrSignature, pk: JubjubPoint): [];
  export pure circuit schnorrChallenge(ann_x: Field, ann_y: Field, pk_x: Field, pk_y: Field, msg: Vector<4, Field>): Field;
}
```

Verification: `ecMulGenerator(response) == ecAdd(announcement, ecMul(pk, c))` where `c` is the
challenge, truncated to 248 bits via a **witness-assisted division**: `getSchnorrReduction(cFull)`
returns `(q, r)` with `cFull == q·2²⁴⁸ + r`, and the circuit asserts `q < 116` — this bound is
soundness-critical (without it a prover could pick an unconstrained `q` and any `r`, forging a
signature). This is exactly why the file is vendored rather than reimplemented; getting this one
assertion subtly wrong is invisible until an adversarial test specifically probes it.

**Field mapping onto PRD Table 11.4** (names kept for PRD traceability; scheme corrected):

| Table 11.4 field | Maps onto |
|---|---|
| `signatureR8x` | `SchnorrSignature.announcement.x` (Jubjub affine X) |
| `signatureR8y` | `SchnorrSignature.announcement.y` (Jubjub affine Y) |
| `signatureS` | `SchnorrSignature.response` (Field) |
| `attestorPublicKeyX` / `attestorPublicKeyY` | affine X/Y of the `JubjubPoint` public key (Table 11.1) — unchanged from the PRD, since the PRD already modeled the key as an EC point pair |

### 2.3 Message construction: `Vector<1, Field>` via `degradeToTransient`

The credential message signed is **not** the raw 32-byte digest; it is a one-element field vector
derived from it:

```
msg: Vector<1, Field> = [degradeToTransient(credentialDigest(...))]
```

`degradeToTransient(Bytes<32>) -> Field` is a stdlib builtin, confirmed present and callable at
0.31.1 **[V-EMP]** (probe: `transientProbe(x: Bytes<32>): Field { return degradeToTransient(x); }`
compiled cleanly, no `disclose()` needed since it is a pure value transform, not a stdlib circuit
call with a disclosure obligation).

**Proof [V-EMP] that `schnorrVerify<1>` is satisfiable** with this exact construction — not just that
it compiles, but that it **verifies a real signature and rejects a forged one** — is in §4 below.

### 2.4 Public-key encoding

`attestorPublicKeyX` / `attestorPublicKeyY` (PRD Table 11.1) are the affine coordinates of a
`JubjubPoint`, read via the stdlib builtins `jubjubPointX(pt): Field` / `jubjubPointY(pt): Field`,
both confirmed callable at 0.31.1 **[V-EMP]** (used directly in the vendored `schnorrVerify`, and
independently in the latency-spike harness, §4). Role 02 constructs the attestor keypair off-chain
using `ecMulGenerator(sk)` — also confirmed present and directly usable from
`@midnight-ntwrk/compact-runtime` in Node/TypeScript, **not only inside a circuit**:

```ts
import { ecMulGenerator, ecAdd, ecMul, jubjubPointX, jubjubPointY, degradeToTransient } from '@midnight-ntwrk/compact-runtime';
```

These are plain JS function exports, empirically confirmed by direct import and use in the latency
harness (§4). Role 02's signer should use these same functions rather than reimplementing Jubjub
arithmetic, for exactly the same reason `credentialDigest`/`assetNullifier` are consumed as compiled
`pureCircuits` rather than reimplemented (`00-overview.md` §5.3.1): identical implementation removes
an entire class of "signer and circuit disagree" bugs.

**Signing procedure** (standard Schnorr, matching the vendored `schnorrVerify` equation):

1. `pk = ecMulGenerator(sk)`.
2. Sample nonce `k`. `announcement = ecMulGenerator(k)`.
3. `cFull = schnorrChallenge-equivalent transientHash` over
   `{ann_x, ann_y, pk_x, pk_y, msg}` (see §4's `computeChallenge1` for the exact generic-arity
   version used for Phrim's `Vector<1, Field>` message — the module's own exported
   `schnorrChallenge` pure circuit is hardcoded to `Vector<4, Field>` in the vendored file, matching
   ZK Loan's own 4-field applicant message, so Phrim's contract additionally exports its own
   `computeChallenge1` for its `Vector<1, Field>` message shape, calling the **same** internal
   `transientHash` construction with a locally-declared, structurally-identical hash-input struct).
4. `q = cFull >> 248`, `r = cFull mod 2^248` (the same split `getSchnorrReduction` performs on-chain).
5. `response = k + r·sk` (plain integer arithmetic — deliberately **not** reduced through the BLS
   scalar field before use, because `Field`-mod reduction and `JUBJUB_ORDER`-mod reduction are
   different moduli, and reducing through the wrong one first would break the EC identity unless the
   unreduced value already fits under the field prime; see the worked correctness argument in the
   Day-1 spike notes below).
6. Signature is `{announcement, response}`.

### 2.5 Never use `ownPublicKey()` for authorization

Confirmed unchanged from `00-overview.md` §5.11.3 and the ZK Loan source's own comment: it is a
prover-claimed value with no cryptographic binding to the transaction signer. `ownPublicKey().bytes`
was probed and does compile syntactically **[V-EMP]** — the prohibition is semantic, not a compiler
error, which is exactly why it is easy to misuse. Phrim derives lender/borrower authority from a
domain-separated `persistentHash` of a private secret (`DS_AUTHORITY`), never from `ownPublicKey()`.

---

## 3. Pure circuits shipped for Role 02 and Role 03 (R2a)

`packages/contract/src/phrim.compact` exports, ahead of the rest of the contract:

```
export pure circuit credentialDigest(
  schemaVersion: Uint<8>, providerId: Uint<32>, facilityId: Bytes<32>, assetNonce: Bytes<32>,
  outstandingMinor: Uint<64>, daysPastDue: Uint<16>, riskScore: Uint<16>,
  maturityEpoch: Uint<32>, snapshotEpoch: Uint<32>
): Bytes<32>

export pure circuit assetNullifier(facilityId: Bytes<32>, assetNonce: Bytes<32>): Bytes<32>

export pure circuit computeChallenge1(
  ann_x: Field, ann_y: Field, pk_x: Field, pk_y: Field, msg: Vector<1, Field>
): Field
```

The compiler emits a `pureCircuits` TypeScript binding for each. Role 02's signer imports these from
the compiled contract (`packages/contract/managed/phrim/contract/index.js`, re-exported by
`packages/contract/src/index.ts`) rather than reimplementing `persistentHash`/`transientHash` in
TypeScript — this is the mechanism that makes signer/circuit parity structural, per
`00-overview.md` §5.3.1.

`computeChallenge1` exists because the vendored module's own `schnorrChallenge` is hardcoded to
`Vector<4, Field>` (ZK Loan's applicant-message shape); Phrim's message is `Vector<1, Field>` and
needs its own arity. It calls the stdlib `transientHash` directly over a locally-declared struct with
the same field shape as the vendored module's internal (unexported) `SchnorrHashInput<#n>` — this is
safe because Compact's hash builtins encode structurally (by declared field type and order), not by
struct name, which was confirmed by cross-checking that `computeChallenge1`'s output, used as the
challenge input to `getSchnorrReduction`, produces signatures that verify correctly against the
vendored `schnorrVerify<1>` in the empirical harness below — i.e., the two independently-declared
struct types produce hash-compatible encodings in practice.

---

## 4. Latency gate — measured, not promised

**This is PRD §25's top-rated technical risk and the PRD §24 Day-1 exit criterion.** Measured on the
actual pinned toolchain end-to-end: real circuit execution via `@midnight-ntwrk/compact-runtime`,
real proving keys from `compactc 0.31.1` (not `--skip-zk`), and a **real proof** generated by the
official `midnightntwrk/proof-server:8.1.0` over its documented `/prove` HTTP API — the same API
`@midnight-ntwrk/midnight-js-http-client-proof-provider@4.1.1` uses in production. No shortcuts, no
proof-server mocking.

### 4.1 Method

1. Compiled two probe circuits with real proving-key generation (`compactc 0.31.1`, no `--skip-zk`):
   - `verifyOneSignature()` — one `schnorrVerify<1>` call.
   - `verifyEightSignatures()` — a `for (const i of 0..8)` loop, eight `schnorrVerify<1>` calls,
     matching `requestDraw` Stage 2's per-slot signature check.
2. Ran the `proof-server:8.1.0` Docker image locally (`http://localhost:6300`), confirmed via
   `GET /version` → `8.1.0`.
3. Signed real, valid Schnorr-over-Jubjub signatures **entirely off-chain in Node**, using
   `@midnight-ntwrk/compact-runtime`'s exported `ecMulGenerator`/`jubjubPointX`/`jubjubPointY` and the
   compiled `computeChallenge1` pure circuit (§2.4's procedure) — not synthetic/mocked witnesses.
   **Sanity check:** the same harness, given a deliberately wrong public key, was confirmed to fail
   local circuit execution with `CompactError: failed assert: Invalid attestation signature` — proving
   the positive measurements below exercise a genuinely-verifying signature path, not a vacuous pass.
4. Executed the compiled circuit locally via `compact-runtime` to obtain the real proof transcript
   (`{input, output, publicTranscript, privateTranscriptOutputs}`).
5. Converted it to a proof preimage with `@midnight-ntwrk/ledger-v8`'s
   `proofDataIntoSerializedPreimage(...)` (the same function `midnight-js-contracts` uses internally).
6. Sent it to the real proof server via `httpClientProvingProvider(...).prove(...)` from
   `@midnight-ntwrk/midnight-js-http-client-proof-provider@4.1.1` — the actual production client
   library, unmodified — and timed the round trip.

### 4.2 Machine

AMD Ryzen 5 5500U (6 cores / 12 threads), 14 GiB RAM, Linux, Docker `proof-server:8.1.0` running
locally on the same machine. This is a mid-range laptop-class CPU, not dedicated server hardware.

### 4.3 Results (three runs each, proof-server `/prove` call only, local circuit execution shown separately)

| Circuit | Local exec (ms) | Real proof-server latency (ms) |
|---|---:|---:|
| `verifyOneSignature` (1 signature) | 12 – 18 | **403 – 434** |
| `verifyEightSignatures` (8 signatures) | 66 – 75 | **1 987 – 2 530** |

Compile-time proving-key generation (a one-time setup cost, not part of per-draw latency): 1-signature
circuit 3.6 s (prover key 687 KB); 8-signature circuit 17.3 s (prover key 5.3 MB).

### 4.4 Decision

**Eight active credential slots meets the PRD §19 60-second budget with roughly 24–30× headroom** on
mid-range laptop hardware (≈2.0–2.5 s vs. a 60 s budget). **The four-plus-four contingency (PRD §28's
own default) is not triggered.** Phrim proceeds with the primary path: eight active credential slots,
no padding required for the `eligible` scenario's headline numbers.

This is reported to the PM as a measured number per `00-overview.md` §5.1's Layer B procedure, not as
a judgement call requiring further sign-off — the gate was pre-authorized to resolve either way based
on the measurement.

---

## 4.5 Two corrections found while implementing the contract (post-dating §1–§4, both empirical)

These were found after this document's first draft, while building `packages/contract/src/phrim.compact`
against it. Both are **corrections to `00-overview.md` §5.3's Layer A text**, found by compiling and
running real code, not by inspection. Role 02 must account for both.

### 4.5.1 The native `Uint<N> as Bytes<32>` cast is little-endian, not big-endian

`00-overview.md` §5.3 states the ten canonical words are "Big-endian, zero-extended to 32 bytes" and
lists this as a **binding** rule (not a Layer B open item, unlike the padding direction). It is wrong
for the compiler as it actually exists at 0.31.1.

**Proof [V-EMP].** Compiled `castU32(x: Uint<32>): Bytes<32> { return x as Bytes<32>; }` and ran the
generated `pureCircuits.castU32(258n)` (258 = `0x0102`). Result:
`Uint8Array [2, 1, 0, 0, ..., 0]` — the least-significant byte first. This is little-endian. The
generated code calls `__compactRuntime.convertFieldToBytes(32, x, ...)`, which is little-endian by
construction; there is no big-endian variant in the stdlib.

**Why this does not create a signer/circuit mismatch (the risk the whole Schema Lock exists to kill):**
`credentialDigest` and `assetNullifier` are **pure circuits Role 01 ships and Role 02 calls directly**
(`00-overview.md` §5.3.1). The byte-encoding of each numeric field happens **inside the compiled
circuit**, using whatever cast Role 01 wrote. Role 02's signer never independently encodes these words
for the purpose of computing a digest — `packages/schema/src/canonical.ts`'s `computeCredentialDigest`
calls `buildCanonicalWords(credential)` only to range-check the input (its return value is discarded),
then computes the real digest by calling `boundCredentialDigestCircuit.credentialDigest(...)` with the
**raw field values**, not pre-encoded bytes. The actual byte layout inside `credentialDigest` is
therefore Role 01's implementation detail, and it is internally consistent by construction — there is
only one implementation, so there is nothing for it to disagree with.

**What Role 01 actually shipped:** `packages/contract/src/phrim.compact`'s `credentialDigest` uses the
native little-endian cast (`schemaVersion as Bytes<32>`, etc.) for all seven numeric words. No
manual byte-reversal was implemented, because doing so would require a division/modulo-based byte
decomposition, which conflicts with the project's own "no division inside the circuit" constraint
(`00-overview.md` §7, PRD §14.3) for no security benefit — endianness is not a security property here.

**Action for Role 02:** `packages/schema/src/canonical.ts`'s `buildCanonicalWords` /
`encodeUnsignedIntWord` currently produce big-endian words. Since their return value is never used to
compute the real digest (confirmed above), this is **not a functional bug** in the signer. It is a
documentation-accuracy issue only: if these words are surfaced in golden-vector fixtures or debug
output as "the words that get hashed," they will not byte-match what the circuit actually hashes.
Recommend switching `encodeUnsignedIntWord` to little-endian (reverse the byte-fill loop direction) so
golden-vector documentation stays honest, but this is not blocking.

### 4.5.2 Off-chain Schnorr signing must reduce `response` modulo the Jubjub scalar field order

`00-overview.md` §5.11.2 and this document's §2.4 (first draft) described computing
`response = k + r·sk` as **plain, unreduced integer arithmetic**, reasoning that `ecMulGenerator`
would reduce any bare integer modulo the curve's group order internally. **This is wrong and was
caught by the test suite, not by inspection.**

**Proof [V-EMP].** Building real signatures with `response` left unreduced, across a range of
credential digests, intermittently failed inside `compact-runtime` with
`failed to decode for built-in type EmbeddedFr after successful typecheck`. The runtime's Jubjub
scalar type (`EmbeddedFr`) requires the encoded value to be **canonically less than the Jubjub scalar
field's prime order**, not merely "any integer, reduced conceptually." A `response` that exceeds that
order — easily reached, since `r` can be up to `2²⁴⁸` and even a modest `sk` pushes the product past
the order — fails to decode as a valid scalar and the call throws before any signature check runs.

**The exact modulus, from public Jubjub parameters (Zcash Sapling's Jubjub curve, cofactor 8):**

```
JUBJUB_SCALAR_FIELD_ORDER = 6554484396890773809930967563523245729705921265872317281365359162392183254199
```

**Corrected signing procedure, step 5 (replaces the version in §2.4):**

```
response = (k + r · sk) mod JUBJUB_SCALAR_FIELD_ORDER
```

This is still correct per the verification equation (`ecMulGenerator(response) == announcement + c·pk`
holds mod the group's own order regardless of which representative of the residue class is used), and
it additionally satisfies the runtime's canonical-encoding requirement. Implemented in
`packages/contract/test/support/sign.ts`; Role 02's production signer must do the same reduction.
Source: Jubjub curve parameters are public — see
`https://github.com/zkcrypto/jubjub` and `https://eips.ethereum.org/EIPS/eip-2494` (Baby Jubjub,
related family) for independent confirmation of Jubjub-family scalar order magnitudes; the exact
constant above was cross-checked against the same value published across multiple independent Jubjub
implementations.

## 5. Countersignature

| Role | Confirmation | Date |
|---|---|---|
| 01 — Contract & Circuit Engineer | Authored this document; all `[V-EMP]` claims independently reproduced against `compactc 0.31.1` and `proof-server:8.1.0` on 12 Sept 2026. | 12 Sept 2026 |
| 02 — Attestation & Canonical Schema Engineer | Signer (`packages/schema/src/schnorr.ts`, `attestorSigner.ts`) built against this document, including both §4.5 corrections: `canonical.ts` now zero-extends little-endian and `signDigest` reduces `response` modulo `JUBJUB_SCALAR_FIELD_ORDER` before returning it. Golden vectors published at `packages/schema/test/vectors/{eligible,undercollateralized,stale,tampered,replay,facility,attestor}.json`, regenerable via `pnpm --filter schema run generate-golden-vectors`, verified byte-identical across two regenerations. `packages/schema/test/goldenVectors.test.ts` reproduces every vector's `credentialDigest` and `assetNullifier` from its recorded input against the real `pureCircuits`. Role 01: these are ready for your in-circuit test (your acceptance criterion 4) — every vector file's `credentials[]` entries carry `input`, `canonicalWordsHex`, `credentialDigestHex`, `nullifierHex`, and full signature components, keyed to the public key in `attestor.json`. | 12 Sept 2026 |
| 01 — Contract & Circuit Engineer | Closed the loop: `packages/contract/test/goldenVectors.test.ts` reads every file in §5's list **directly from `packages/schema/test/vectors/`** (no copy, no re-derivation) and (a) reproduces every recorded `credentialDigestHex`/`nullifierHex` byte-for-byte via the real `pureCircuits`, and (b) runs a full `requestDraw` circuit call for `eligible` (recorded signatures pass every Stage 1–3 check, blocked only by the documented vault-balance simulator limitation — see README), `tampered` (`Invalid attestation signature`), `stale` (`STALE_EPOCH`), and `undercollateralized` (`INSUFFICIENT_COLLATERAL`), all using Role 02's recorded signatures verbatim, never re-signed locally. `replay` is verified as a nullifier-collision mechanism proof (its nullifiers are asserted identical to `eligible`'s, and a duplicate-within-one-batch submission of the same credentials is confirmed to hit `ASSET_ALREADY_USED`) — true cross-transaction replay needs a live ledger for the same reason `eligible`'s full settlement does. 11/11 pass. Also found and fixed a real cross-role bug while wiring this: `extractPhrimErrorCode` (`packages/contract/src/index.ts`, consumed by Role 03's worker) did not recognize the vendored `schnorr.compact` module's actual assertion text (`"Invalid attestation signature"`) as the `INVALID_SIGNATURE` code — it now does. | 12 Sept 2026 |

---

## 6. Source index

- Compact compiler & devtools: `https://github.com/midnightntwrk/compact` (installer at
  `https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh`)
- Vendored Schnorr module: `https://raw.githubusercontent.com/midnightntwrk/example-zkloan/main/contract/src/schnorr.compact`
- Reference contract using it: `https://raw.githubusercontent.com/midnightntwrk/example-zkloan/main/contract/src/zkloan-credit-scorer.compact`
- Bulletin-board simulator pattern (local circuit execution without a network):
  `https://raw.githubusercontent.com/midnightntwrk/example-bboard/main/contract/src/test/bboard-simulator.ts`,
  `.../contract/src/witnesses.ts`
- `midnightntwrk/proof-server` image: `https://hub.docker.com/r/midnightntwrk/proof-server` (tag `8.1.0`)
- npm packages inspected directly (`.d.ts` + compiled `.cjs`) for exact API shape: `@midnight-ntwrk/compact-runtime@0.16.0`,
  `@midnight-ntwrk/ledger-v8@8.1.0`, `@midnight-ntwrk/midnight-js-contracts@4.1.1`,
  `@midnight-ntwrk/midnight-js-http-client-proof-provider@4.1.1`,
  `@midnight-ntwrk/midnight-js-node-zk-config-provider@4.1.1`
