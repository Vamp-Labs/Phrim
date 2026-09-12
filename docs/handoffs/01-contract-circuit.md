# 01 — Contract & Circuit Engineer

**Read first:** `docs/handoffs/00-overview.md` §5 (frozen cross-role contracts) and §7 (shared
conventions). Then PRD §11, §12, §14, §18, §20.1.

You own the only component that **enforces** anything. Everything else in Phrim is presentation. If
your circuit can be satisfied by a tampered credential, a stale epoch, or a replayed asset nonce, the
product thesis fails outright (PRD §4.2: "If the MVP removes condition 5 and only displays
`Verified`, the core product thesis fails").

---

## Responsibilities

1. Bootstrap the pnpm workspace root (you are the only role permitted to touch root config).
2. Run the Day-1 signature spike and produce the **Schema Lock Layer B** document jointly with Role 02.
3. Implement the Phrim Compact contract: ledger state, P0 circuits, nullifier registry, mUSD vault.
4. Implement in-circuit verification of the attestor signature over the canonical credential message.
5. Write the full negative-test suite from PRD §20.1 — every rule gets a test that proves it *rejects*.
6. Deploy to Midnight Preprod (or the documented local fallback) and publish the contract address.
7. Export typed contract bindings and a documented reset procedure for Role 03 and for demo rehearsal.

---

## Scope

### In scope

- `packages/contract/**` — exclusively yours.
- Workspace root: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`, `.nvmrc`,
  `README.md`.
- `docs/handoffs/SCHEMA-LOCK.md` — you write it; Role 02 reviews and countersigns.
- P0 circuits: `createFacility`, `fundOrMintDemoToken`, `requestDraw` (PRD §14.1).
- P1 circuits **only if P0 is complete, tested and deployed**: `freezeFacility`, `closeFacility`,
  `advanceEpoch`, `rotateAttestor` — in that order of value.
- Contract unit and negative tests (PRD §20.1, all 21 cases).
- Deployment script, contract address, and the rehearsal reset procedure.
- Measuring and reporting actual proof-generation latency (PRD §19, §25).

### Out of scope

- **Any file under `packages/app/`.** The frontend is Roles 03 and 04.
- **The signer.** You never implement Schnorr signing or the TypeScript canonical serialiser — that is
  Role 02's `packages/schema/`. You *consume* `packages/schema` for constants and golden vectors.
- **The attestation HTTP service.** Role 02.
- **Fixture authoring.** Role 02 produces the five scenarios; you consume them in tests.
- **Error message copy and UI mapping.** You emit the error-code string; Role 03 renders it.
- **Repository initialisation.** No `git init`, no commits, no pushes.
- Repayment, collateral release, interest, waterfall, liquidation, multi-facility, cross-contract
  nullifier sharing, shielded amounts, native NIGHT custody (PRD §5.2, §8.3).

---

## Objectives

1. A valid eight-credential proof funds a $75,000 draw and atomically updates facility state.
2. Each of the four adversarial scenarios is rejected by the circuit with the correct category, and
   leaves `outstanding`, the vault balance, the receipt history and the nullifier set **byte-identical**
   to their pre-attempt values.
3. The signer and the circuit agree byte-for-byte on the canonical message, proven by a test that
   verifies Role 02's golden vectors inside the circuit.
4. No private credential field is readable from public ledger state after a successful draw.
5. Measured proof latency for the chosen active-record count is recorded, not promised.

---

## Requirements

### R1 — Workspace bootstrap (do this first, it unblocks everyone)

pnpm workspace with `packages/*`. `tsconfig.base.json` with `strict: true`,
`noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, target and module settings
compatible with the Midnight SDK. Node version pinned in `.nvmrc`. `.gitignore` covering
`node_modules`, build output, `.env*`, and the attestor key path Role 02 will use
(`.keys/` — gitignore it even though Role 02 creates it).

`README.md` skeleton with the sections the PRD §19/§20.3 acceptance gate requires: prerequisites,
pinned versions, install, local stack startup, build, test, deploy, run the demo, reset between
rehearsals, contract address, known-good transaction reference. You fill in the contract sections;
leave clearly-headed placeholders for the other roles.

Every dependency version is **exact** — no `^`, no `~`.

### R2 — The Day-1 spike and Schema Lock Layer B (PRD §24 Day 1, §28 open decision)

**Do this before writing any verification logic. Report the result to the PM before proceeding.**

**Start from `00-overview.md` §5.11**, which is a PM research pass verified by installing and running
both compiler binaries. It already answers most of this. Your job is to **confirm it against the
toolchain you actually install** and close the remaining gaps — not to rediscover it.

Already established in §5.11, confirm and move on:

- Pin **compactc 0.31.1** (`pragma language_version 0.23;`), not 0.34.0 — the latter targets ledger 9,
  which is not deployed.
- **There is no EdDSA on Midnight.** PRD Table 11.4 and §14.2 Stage 2.4 are factually wrong on this.
  It is **Schnorr over Jubjub**. `jubjubSchnorrVerify` is in the stdlib source but **absent from
  0.31.1**; `example-zkloan` hand-rolls it in `contract/src/schnorr.compact`.
- **Vendor `schnorr.compact` from `example-zkloan`. Do not reimplement it.** Its witness-assisted
  248-bit challenge reduction (`getSchnorrReduction`, constrained `q: Uint<7> < 116`) is
  soundness-critical — without that bound a prover forges any signature.
- The signed message is a `Vector<n, Field>`, not a byte string.
- Unshielded token API and its three traps — the inverted `Either` order, the exact-match constraint
  on `unshieldedBalance`, and `CoinInfo` → `ShieldedCoinInfo`.
- **Never use `ownPublicKey()` for authorization** — it is a prover-claimed value with no binding to
  the transaction signer, and the ZK Loan source says so in a comment.

Still genuinely open — these are your spike:

1. **Does `pad(32, s)` right-pad or left-pad?** Confirm empirically. A padding-direction mismatch
   produces a valid signature over the wrong message and is invisible until nothing verifies.
2. **The exact message construction.** The plan in `00-overview.md` §5.3 is
   `[degradeToTransient(credentialDigest(...))]` as a `Vector<1, Field>`. Confirm
   `degradeToTransient` behaves as expected and that `schnorrVerify<1>` is satisfiable, or record what
   you used instead.
3. **Public-key encoding.** How a `JubjubPoint`'s affine coordinates populate
   `attestorPublicKeyX` / `attestorPublicKeyY` (PRD Table 11.1), and how Role 02 produces a keypair
   off-chain that matches.
4. **Latency.** See the gate below. Nobody has published a number for eight in-circuit Schnorr
   verifications.
5. Anything in §5.11 that turns out to be wrong on your machine.

**Do not invent an API name.** If the documentation does not support something the PRD assumes, that
is a finding — report it, do not paper over it. §5.11 already contains three such findings.

Then write `docs/handoffs/SCHEMA-LOCK.md` containing every answer, with source URLs, plus the Layer A
layout restated from `00-overview.md` §5.2–§5.4 so the document is self-contained. Hand it to Role 02.
Neither of you writes signing or verification code until it exists.

### R2a — Ship the pure circuits before the rest of the contract

**Role 02's signer is blocked on this and nothing else.** Immediately after the spike, before
`requestDraw` is anywhere near complete, publish a compiled contract exporting:

```
export pure circuit credentialDigest(schemaVersion, providerId, facilityId, assetNonce,
                                     outstandingMinor, daysPastDue, riskScore,
                                     maturityEpoch, snapshotEpoch): Bytes<32>
export pure circuit assetNullifier(facilityId, assetNonce): Bytes<32>
```

built exactly per `00-overview.md` §5.3 (ten 32-byte words, that order) and §5.4 (three words).

The compiler emits TypeScript `pureCircuits` bindings for every `export pure circuit`. Role 02's
signer and Role 03's pre-flight call those bindings instead of reimplementing `persistentHash` in
TypeScript — which is what makes signer/circuit parity structural rather than a matter of two
implementations agreeing. `example-zkloan` re-exports `schnorrChallenge` for exactly this reason.

The rest of the contract may still be a stub when you publish these. Tell Role 02 and Role 03 the
moment they are callable.

**Latency gate — DECIDED, pre-authorised contingency, no PM check-in required to trigger it.**

Attempt the full eight-slot spec first, per PRD §8.1/§14.3 and the Day-1 spike in PRD §24. Prove one
signature in-circuit, measure, extrapolate to eight.

- **If eight meets PRD §19's 60-second target on the demo machine:** proceed with eight active slots.
  This is the primary path and the one every other role's fixtures and tests assume.
- **If it does not:** fall back to **four active credentials plus four empty-padding slots**, per PRD
  §28's own default. This is a **documented contingency you are pre-authorised to apply**, not a
  default you start from and not a decision that blocks on the PM. Apply it, then:
  1. Record in `SCHEMA-LOCK.md` and your PM report: the measured one-signature latency, the
     extrapolated eight-signature latency, the actual four-signature latency, and that the contingency
     triggered.
  2. Immediately notify Role 02 — the fixture arithmetic in `00-overview.md` §5.7 assumes eight
     occupied slots for `eligible` (all eight summing to $100,000) and six for
     `undercollateralized`; four active slots means every fixture's asset count and dollar
     distribution must be rebuilt to fit four slots while preserving the same headline numbers
     ($100,000 eligible, $75,000 draw, 80% advance rate, $85,000/$68,000 undercollateralized case).
     Role 02 does not discover this by reading test failures — you tell them directly, same day.
  3. Update this contingency's trigger and outcome in your PM report either way (triggered or not) —
     the PM needs the number regardless of which path was taken.

This is the single highest-uncertainty step in the whole project (PRD §25's top-rated technical risk).
Do it first, on Day 1, before writing anything else beyond R2a's pure circuits.

### R3 — Ledger state (PRD §11.1, Tables 11.1–11.3)

Implement all fifteen facility fields from Table 11.1 with the stated types and public visibility;
the draw receipt from Table 11.2; and `usedAssetNullifiers` as a persistent set of `Bytes<32>`
(Table 11.3).

Per PRD §28 ("Whether draw receipt needs a map or append-only counter", default "Counter plus latest
receipt for MVP"): `00-overview.md` §5.11.5 confirms Compact ships `Map<K,V>` with `insert`, `lookup`,
`member`, `size` and an iterator, and `Counter` with `increment`/`read`. A keyed
`Map<Uint<64>, DrawReceipt>` indexed by an incrementing counter is therefore cheap, and PRD §16.8 and
US 10 both want a chronological log. **Prefer the map**; fall back to counter-plus-latest only if it
costs measurable proving time. State which you chose and why in your report.

`usedAssetNullifiers` is a `Set<Bytes<32>>` — `member()` for the Stage 2.6 check, `insert()` in
Stage 4.

`status` is `Active | Frozen | Closed` (PRD FR 05).

### R4 — `createFacility` (P0, PRD §14.1, FR 01–FR 05)

Lender-only, authorised by **hash-of-secret comparison, never by a caller-reported public key**
(PRD §14.4). Derive the lender authority hash from the private lender secret using `DS_AUTHORITY`
(`00-overview.md` §5.2) and compare with the stored/expected commitment.

Stores: facility id, both authority hashes, attestor provider id and public key coordinates, token
colour, credit limit, all five policy thresholds, current epoch, status `Active`, `outstanding = 0`.

Per PRD §28 ("Borrower recipient-address binding", default "Derive and register it during facility
creation"): **register the borrower's recipient address at facility creation.** `requestDraw` then
transfers to the registered address rather than to a caller-supplied one — a caller-supplied
destination would let anyone who can satisfy the borrower check redirect funds.

### R5 — `fundOrMintDemoToken` (P0, PRD §14.1, FR 06)

Lender-only. Credits the contract's own mUSD vault. Uses the **official unshielded contract-token
pattern** (PRD §25: "Use the official unshielded contract-token pattern and keep draw amount public";
§30 source 6). Exact API and traps: `00-overview.md` §5.11.4.

```
mintUnshieldedToken(pad(32, "phrim:musd:v1"), amount,
                    left<ContractAddress, UserAddress>(kernel.self()))
```

Minting to `kernel.self()` auto-receives, so the contract holds the vault and later distributes with
`sendUnshielded`. **`left` is the contract and `right` is the user for unshielded tokens — the
opposite of the shielded `Either` order.** Getting this backwards mints the vault to a user address
and is not recoverable.

The contract exposes its vault balance publicly so `VAULT_INSUFFICIENT` is checkable.

**Explicitly not native NIGHT** (PRD §4.1, §5.2, §25). The contract holds and sends contract-issued
`mUSD` only.

### R6 — `requestDraw` (P0 — the product)

Implement PRD §14.2 exactly, in its four stages, in order. Eight slots always
(`00-overview.md` §5.5).

**Stage 1 — facility and authority**
1. Facility exists and `status == Active`, else `FACILITY_INACTIVE`.
2. Borrower authority hash derived from the private `borrowerSecret` equals the stored hash, else
   `UNAUTHORIZED`.
3. `requestedAmount > 0` (PRD FR 17), else `INSUFFICIENT_COLLATERAL`. **PM ruling:** PRD §17 defines
   no code for a malformed amount, because a zero draw is a form-validation failure that Role 03
   blocks at input and a user therefore never reaches. The circuit still asserts it — a witness is
   hostile until constrained — and reuses `INSUFFICIENT_COLLATERAL` rather than inventing a
   twelfth code that the UI would have to learn.
4. `outstanding + requestedAmount <= creditLimit`, else `CREDIT_LIMIT_EXCEEDED`.

**Stage 2 — per slot, all eight**
1. Unoccupied ⇒ constrain all fields to zero, contribute nothing, no nullifier, not counted.
2. `providerId == facility.attestorProviderId` and `facilityId == facility.facilityId`, else
   `WRONG_FACILITY`.
3. `snapshotEpoch == facility.currentEpoch` **strictly**, else `STALE_EPOCH`. Not `>=`, not a window.
4. **Schnorr-over-Jubjub** signature verifies against the registered attestor key over the canonical
   message (`00-overview.md` §5.3) via the vendored `schnorrVerify`, else `INVALID_SIGNATURE`. (The
   PRD says "EdDSA"; Midnight has none — see §5.11.2.)
5. Policy, all four, else `ASSET_INELIGIBLE`:
   `outstandingMinor > 0`; `daysPastDue <= maxDaysPastDue`; `riskScore >= minRiskScore`;
   `maturityEpoch >= currentEpoch + minRemainingEpochs`.
6. Nullifier: derive per `00-overview.md` §5.4; assert **not in `usedAssetNullifiers`** and **not
   duplicated within this batch**, else `ASSET_ALREADY_USED`. Accumulate `outstandingMinor` into
   `eligibleTotal`, queue the nullifier.

**Stage 3 — borrowing base**
1. `selectedCredentialCount > 0`.
2. `eligibleTotal * advanceRateBps >= requestedAmount * 10000`, else `INSUFFICIENT_COLLATERAL`.
   Multiplication only — **no division anywhere** (PRD §14.3). Widen before multiplying: with
   `Uint<128>` amounts and a `Uint<16>` rate this product needs headroom, and an overflow here is a
   soundness bug, not a crash. Assert the operands are within range before multiplying.
3. Vault solvency, else `VAULT_INSUFFICIENT`. Use
   **`unshieldedBalanceGte(tokenColor, requestedAmount)`**, never a read-and-compare:
   `unshieldedBalance()` imposes an exact-match constraint between construction and application time,
   so a balance that moves between proving and submission fails the whole transaction
   (`00-overview.md` §5.11.4).

**Stage 4 — atomic commit**
All of the following succeed together or the whole circuit fails. There is no partial state:
1. Insert every queued nullifier into `usedAssetNullifiers`.
2. `outstanding += requestedAmount`.
3. Write the public draw receipt (Table 11.2): `drawId` derived with `DS_DRAW_ID` from facility,
   epoch and amount; facility id; epoch; amount; resulting outstanding; `completed = true`.
4. Transfer exactly `requestedAmount` of mUSD to the **registered** borrower address (R4):
   `sendUnshielded(tokenColor, requestedAmount, right<ContractAddress, UserAddress>(borrowerAddress))`.

### R7 — Privacy (PRD FR 18, §18.1, §18.2)

No credential field — identifier, balance, risk score, delinquency, maturity, asset nonce, signature
component — may be written to any public ledger field, emitted in an event, or disclosed. Witness
values are private unless explicitly disclosed; every `disclose()` (or equivalent) in your source must
be individually justifiable, and you list each one in your report.

Treat every witness as hostile until constrained (PRD §18.1, §14.4). A witness that is read but never
constrained is an attack surface.

### R8 — Error-code assertion messages

Every assertion carries the exact error-code string from `00-overview.md` §5.6 as its message, so
Role 03 can pattern-match it. Use the constant, spelled exactly: `INVALID_SIGNATURE`,
`WRONG_FACILITY`, `STALE_EPOCH`, `ASSET_INELIGIBLE`, `INSUFFICIENT_COLLATERAL`, `ASSET_ALREADY_USED`,
`CREDIT_LIMIT_EXCEEDED`, `VAULT_INSUFFICIENT`, `FACILITY_INACTIVE`, `UNAUTHORIZED`. Never
`NETWORK_UNAVAILABLE` — that one is Role 03's.

### R9 — Test suite (PRD §20.1 — all 21 cases, none optional)

Valid eight-asset proof funds · valid subset with padding · altered balance invalidates signature ·
wrong provider key · wrong facility id · stale epoch · excessive delinquency · insufficient risk
score · insufficient remaining term · zero balance · empty credential set · insufficient collateral ·
credit limit exceeded · insufficient vault balance · wrong borrower secret · frozen facility · closed
facility · duplicate asset within one request · previously used asset in a later request · boundary
values at each threshold · maximum amounts do not overflow.

Plus, mandatory and separate:

- **The golden-vector test.** Every vector Role 02 publishes verifies inside the circuit. This is the
  Schema Lock's enforcement mechanism (`00-overview.md` §5.1).
- **The state-invariance test.** After each failing case, assert `outstanding`, vault balance, receipt
  count/latest receipt, and the nullifier set are unchanged from before the attempt. PRD §20.1's last
  line and §20.3 point 3 make this a demo gate.
- **Boundary pairs.** For each of the four policy thresholds, test exactly-at-limit (passes) and
  one-past-limit (fails). Same for `creditLimit` and vault balance.

### R10 — Deployment and rehearsal reset

**Decided (PRD §28's own default, confirmed at the approval gate):** develop and iterate locally
against the `undeployed` network stack (`00-overview.md` §5.11.7), then deploy **one known-good
happy-path transaction to Preprod** as the demo safety net (PRD §8.2, §28 "Preprod versus local-first
demo"). Local development is the primary workflow, not a fallback path — it is faster to iterate on
and is not subject to Preprod outages during the build window. The Preprod deployment exists so a
judge has an independently inspectable transaction on a real network; it does not need to be where you
develop day to day. Publish the contract address and the known-good transaction reference in the
README, plus the local-stack instructions for anyone who wants to reproduce it themselves.

Document the **reset procedure between demo rehearsals**. This is not optional: the `replay` scenario
is order-dependent and consumes nullifiers permanently, so the happy path cannot run twice against the
same facility with the same credentials. PRD §19 requires five identical consecutive rehearsals.
Give a single documented command or a short numbered procedure, and verify it works five times.

### R11 — Exports for Role 03

`packages/contract/src/index.ts` exports typed circuit wrappers, the contract's TypeScript types,
the deployed address, and the witness-construction helpers Role 03 needs. Role 03 must never need to
read your `.compact` source to call a circuit.

---

## Dependencies

| You need | From | When |
|---|---|---|
| Domain constants, TS types, canonical serialiser | Role 02 (`packages/schema`) | For tests; you may stub locally until it lands, then switch |
| Golden vectors | Role 02 | After the Schema Lock; blocks R9's golden-vector test |
| Fixture scenarios | Role 02 | For end-to-end contract tests |
| Layer B decision | **You produce it**; Role 02 consumes | Day 1 |

You block: Role 02 (Layer B), Role 03 (contract types, address, reset procedure).

You are blocked by nobody at start. **Begin with R1 and R2 immediately.**

---

## Constraints

- All shared conventions in `00-overview.md` §7 — especially **no comments in code**, including in
  `.compact` files, and **no `any`** in TypeScript.
- Integer minor units only. No floating point. **No division inside the circuit** (PRD §14.3).
- Widen before multiplying; reject overflow-prone values rather than wrapping (PRD §14.3, §18.1).
- Domain-separated persistent hashes for authority keys, credentials, nullifiers and draw ids
  (PRD §18.1).
- Never reuse commitment randomness (PRD §18.1).
- Authorisation by hash-of-secret, never by caller-reported key (PRD §14.4). **`ownPublicKey()` is
  never used in an authorization decision** — it is prover-claimed and unbound to the transaction
  signer (`00-overview.md` §5.11.3).
- Compiler pinned to **0.31.1** / `pragma language_version 0.23;`. Not 0.34.0.
- `schnorr.compact` is **vendored from `example-zkloan`, not rewritten**, with its provenance recorded
  in `SCHEMA-LOCK.md`.
- Fixed credential count of eight (PRD §14.3) unless the PM rules otherwise after R2.
- No secret — lender secret, borrower secret, attestor private key — in source, fixtures, logs, or
  query strings (PRD §18.1).
- Pinned dependency versions compatible with the selected Compact compiler and SDK (PRD §18.1, §19).
- No `git init`, no commits, no pushes, no `git add -A`.

---

## Deliverables

1. Workspace root config + `README.md` skeleton with your sections filled.
2. `docs/handoffs/SCHEMA-LOCK.md` — Layer B, with source URLs, countersigned by Role 02.
3. **Early, ahead of everything else:** a compiled contract exporting `credentialDigest` and
   `assetNullifier` as pure circuits (R2a), unblocking Role 02's signer and Role 03's pre-flight.
4. `packages/contract/src/schnorr.compact` — vendored from `example-zkloan`, provenance recorded.
5. `packages/contract/src/phrim.compact` — the contract.
6. `packages/contract/src/witnesses.ts`, `packages/contract/src/index.ts` — typed exports for Role 03,
   including the `pureCircuits` re-exports Role 02 and Role 03 depend on.
7. `packages/contract/test/**` — the 21 PRD §20.1 cases plus golden-vector, state-invariance and
   boundary-pair tests.
8. `packages/contract/scripts/deploy.ts` — deployment, plus the documented reset procedure.
9. A written report to the PM containing: the Layer B outcome; **measured** proof latency for one and
   for eight credentials; the active-record count you are recommending; the receipt-storage choice
   (counter vs map) and why; every `disclose()` you wrote and its justification; the deployed contract
   address; a known-good transaction reference; and anything in the PRD you found under-specified.

---

## Acceptance criteria

Each is independently checkable by the PM.

1. `pnpm install && pnpm -r build && pnpm -r test` succeeds from a clean clone on the pinned Node
   version, following only the README.
2. The Compact contract compiles with the pinned compiler and the version is recorded in the README.
3. All 21 PRD §20.1 cases exist as named tests and pass.
4. The golden-vector test verifies **every** vector Role 02 published, inside the circuit, and passes.
5. The state-invariance test passes for every failing case: `outstanding`, vault balance, receipts and
   the nullifier set are unchanged after each rejection.
6. `eligible` funds `7500000` minor units and increases `outstanding` from `0` to `7500000`.
7. `undercollateralized` fails with `INSUFFICIENT_COLLATERAL` — **not** `STALE_EPOCH`.
8. `stale` fails with `STALE_EPOCH`.
9. `tampered` fails with `INVALID_SIGNATURE`.
10. `replay` — submitted after a successful `eligible` draw — fails with `ASSET_ALREADY_USED`.
11. A batch containing the same `assetNonce` in two slots fails, even on a fresh facility.
12. An all-empty eight-slot batch fails.
13. Grepping compiled public ledger state and a successful transaction for any fixture asset balance,
    risk score, days-past-due, maturity, asset nonce or signature component returns **nothing**.
14. No file in `packages/contract/` or the workspace root contains a code comment.
15. `grep -rn "any" packages/contract/src --include=*.ts` shows no `any` type annotations, and there
    are no `@ts-ignore` directives.
16. Every dependency in every `package.json` you own is an exact pinned version.
17. The contract is deployed, the address is in the README, and a judge can open the referenced
    transaction.
18. The rehearsal reset procedure is documented and demonstrably works five times consecutively.
19. `docs/handoffs/SCHEMA-LOCK.md` exists, cites official sources for every primitive it names, and
    Role 02 has confirmed it built the signer against it.
20. Measured proof latency is reported as a number, with the machine it was measured on.
