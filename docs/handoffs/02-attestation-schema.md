# 02 — Attestation & Canonical Schema Engineer

**Read first:** `docs/handoffs/00-overview.md` §5 (frozen cross-role contracts) and §7 (shared
conventions). Then PRD §11.2, §15, §18, §20.2.

You own the **shared vocabulary of the entire project**. `packages/schema` is imported by the
contract tests, the attestation service, and the frontend. If your canonical serialiser disagrees
with the circuit by a single byte, nothing verifies and the demo is dead — PRD §25 rates this a
Medium-probability, High-impact risk, and §15.3 makes byte-exact parity a precondition for UI work.

---

## Responsibilities

1. Build `packages/schema` — the canonical types, domain constants, byte-exact serialiser, nullifier
   preimage builder, and the error-code enumeration that every other package imports.
2. Implement the **Schnorr-over-Jubjub** signer against the Schema Lock (Role 01's
   `docs/handoffs/SCHEMA-LOCK.md`). **The PRD says "EdDSA" in Table 11.4, §14.2 and FR 08. Midnight
   has no EdDSA** — see `00-overview.md` §5.11.2. This is a factual correction to the PRD, already
   researched; you do not need to rediscover it.
3. Produce **golden test vectors** — the artefact that proves signer/circuit parity.
4. Author the five deterministic demo scenarios with arithmetic that actually works.
5. Build the Fastify attestation service with the four endpoints in PRD §15.1.
6. Manage the persistent demo attestor key without ever putting it in the repository.

---

## Scope

### In scope

- `packages/schema/**` — exclusively yours.
- `packages/attestation/**` — exclusively yours.
- Countersigning `docs/handoffs/SCHEMA-LOCK.md` (Role 01 writes it; you confirm you built to it).
- The five scenarios in `00-overview.md` §5.7, plus per-rule ineligibility variants for Role 01's
  negative tests.
- Golden vectors, including the ten-word canonical preimage in hex for eyeball comparison.
- Attestor keypair generation, persistence and rotation tooling for the demo.
- Your own README section: how to start the service, how to regenerate fixtures, how the key is
  persisted.

### Out of scope

- **The circuit.** You never write `.compact`. You never implement in-circuit verification.
- **Choosing the signature primitive.** Role 01 establishes it in the Schema Lock from official
  documentation. You implement against that decision; if it looks wrong, you challenge it in writing,
  you do not unilaterally pick a different curve.
- **Any file under `packages/app/` or `packages/contract/`.**
- **Workspace root config.** Role 01 owns it. Need a change? Ask the PM.
- **A database.** The dataset is deterministic and lives in fixtures. No persistence layer, no ORM,
  no migrations.
- **Authentication, rate limiting, multi-tenant providers, real KYC.** This is a demo trust root and
  PRD §18.3 says so plainly.
- Repository initialisation, commits, pushes.

---

## Objectives

1. `packages/schema` produces a ten-word canonical preimage that the circuit reproduces exactly.
2. Golden vectors exist and Role 01's in-circuit test verifies every one of them.
3. All five scenarios issue **reproducible, byte-identical** credentials on every run — five
   consecutive rehearsals produce the same bytes (PRD §19).
4. `undercollateralized` fails for the right reason (collateral shortfall, not stale epoch).
5. The service leaks nothing: no private credential field in any log line, ever.

---

## Requirements

### R1 — `packages/schema/src/domain.ts` (write this first)

The four domain separators from `00-overview.md` §5.2, as exact ASCII constants **and** their 32-byte
padded forms (Compact's idiom is `pad(32, "…")`):

| Constant | Value | ASCII bytes | Padded |
|---|---|---:|---:|
| `DS_CREDENTIAL` | `phrim:credential:v1` | 19 | 32 |
| `DS_ASSET_NULLIFIER` | `phrim:asset-nullifier:v1` | 24 | 32 |
| `DS_AUTHORITY` | `phrim:authority:v1` | 18 | 32 |
| `DS_DRAW_ID` | `phrim:draw-id:v1` | 16 | 32 |

`DS_ASSET_NULLIFIER` is quoted verbatim from PRD §14.2 Stage 2.6. Do not alter its spelling.

**Padding direction is set by the Schema Lock**, not by you — Role 01 confirms empirically whether
`pad(32, s)` right-pads or left-pads. Implement whichever it records. A mismatch here signs a
perfectly valid signature over the wrong message and stays invisible until nothing verifies.

Ship a test asserting each constant's UTF-8 byte length matches the table and each padded form is 32
bytes. This catches a stray space or a smart quote before it costs a day.

### R2 — `packages/schema/src/types.ts`

TypeScript types for the credential (PRD Table 11.4, all twelve fields), the facility policy
(Table 11.1), the draw receipt (Table 11.2), the eight-slot batch with its `slotOccupied` flag
(`00-overview.md` §5.5), and the scenario identifiers.

**Every integer wider than 32 bits is `bigint`, never `number`.** `outstandingMinor` is `Uint<64>`
and `creditLimit`/`outstanding`/`amount` are `Uint<128>` — all exceed `Number.MAX_SAFE_INTEGER`.
Anything crossing a JSON boundary is a decimal **string** (`00-overview.md` §5.9). Serialising a
`bigint` to JSON throws by default; handle it explicitly rather than by a global patch.

### R3 — `packages/schema/src/canonical.ts` — the ten-word serialiser

Implement `00-overview.md` §5.3 exactly: ten 32-byte big-endian words —
`DS_CREDENTIAL` padded, then the nine Table 11.4 fields in table order, each zero-extended to 32
bytes. 320 bytes total.

Binding behaviours:

- Assert the output is exactly ten words of exactly 32 bytes on every call. A length assertion is
  cheap and it is the single most valuable guard in this package.
- **Declared widths still bind.** A value exceeding its Table 11.4 width — `daysPastDue` above
  `2^16 − 1`, say — is a **thrown error**, never a silent truncation and never a quiet widening into
  the 32-byte container. Same for a negative value.
- `schemaVersion` must be `1`.
- `facilityId` and `assetNonce` must be exactly 32 bytes each; reject anything else.
- No hashing happens in this function. It produces words. See R3a for what hashes them.

### R3a — Do not reimplement `persistentHash`

`persistentHash` is a ZK-friendly hash whose construction is a property of the Compact runtime. A
TypeScript reimplementation is the exact failure PRD §25 warns about, and it is avoidable.

Role 01 exports `credentialDigest` and `assetNullifier` as **pure circuits** (their handoff R2a). The
Compact compiler emits TypeScript `pureCircuits` bindings for these. **Your signer imports and calls
those bindings** to get the digest it signs, so the digest is byte-identical to the circuit's by
construction rather than by agreement.

Your ten-word serialiser still exists and still matters: it is the specification of *what goes in and
in what order*, it feeds the pure circuit's arguments, and it is what the golden vectors print in hex
when something goes wrong. It just does not hash.

This makes R6 depend on Role 01 shipping the compiled pure circuits — which is why that is Role 01's
first code deliverable, ahead of the rest of the contract.

### R4 — `packages/schema/src/nullifier.ts`

The three-word preimage from `00-overview.md` §5.4: `DS_ASSET_NULLIFIER` padded ‖ `facilityId` ‖
`assetNonce`, in that order, facility id first. Assert three words of 32 bytes.

As with R3a, the hash itself comes from Role 01's `assetNullifier` pure circuit, not from a
TypeScript reimplementation. Re-export it cleanly so Role 03 can call it — the frontend uses it to
predict `ASSET_ALREADY_USED` locally before proving, and a derivation that drifts would make the
pre-flight lie.

### R5 — `packages/schema/src/errors.ts`

The eleven-code union from `00-overview.md` §5.6, plus a lookup table mapping each code to its
**verbatim** PRD §17 user message and recovery text. No rewording, no added punctuation, no
"friendlier" copy. Role 03 imports this and renders it; Role 04 styles it.

### R6 — The signer (`packages/schema/src/signer.ts` or `packages/attestation/src/signer.ts`)

**Blocked until `docs/handoffs/SCHEMA-LOCK.md` exists.** Do R1–R5 and R7 first; they are unblocked.

Implement signing exactly as the Schema Lock specifies: **Schnorr over Jubjub**, the curve and
challenge construction from `example-zkloan`'s `schnorr.compact`, signing a `Vector<n, Field>` derived
from Role 01's `credentialDigest` pure circuit (R3a), with the public key encoded as the affine
`JubjubPoint` coordinates that populate `attestorPublicKeyX` / `attestorPublicKeyY`.

Output the three signature components under **PRD Table 11.4's field names** —
`signatureR8x`, `signatureR8y`, `signatureS` — so the PRD stays traceable, and document the mapping
in your README section:

| Table 11.4 field | Schnorr component |
|---|---|
| `signatureR8x` | `announcement.x` |
| `signatureR8y` | `announcement.y` |
| `signatureS` | `response` |

The field *shape* the PRD specified survives intact; only the scheme name was wrong.

Note that `schnorr.compact` re-exports `schnorrChallenge` as a pure circuit precisely so an off-chain
signer can compute the identical challenge. Use it rather than reimplementing the challenge hash, for
the same reason as R3a.

If the Schema Lock is ambiguous on any point, get it resolved in writing before you code. An
ambiguity resolved by guessing is exactly the failure mode PRD §25 warns about.

### R7 — The five scenarios (`packages/schema/src/fixtures/`)

Per `00-overview.md` §5.7, using the canonical demo constants in §5.8. Eight assets, all amounts in
minor units, all deterministic — no `Math.random`, no `Date.now`, no environment-dependent values
anywhere in fixture generation.

**`eligible`** — eight occupied slots summing to `10000000` ($100,000). Every asset:
`outstandingMinor > 0`, `daysPastDue <= 30`, `riskScore >= 600`, `maturityEpoch >= 9`
(= `currentEpoch 7` + `minRemainingEpochs 2`), `snapshotEpoch == 7`, `providerId == 1`,
`facilityId == sha256("FACILITY_DEMO_001")`. Check: `10000000 × 8000 = 80 000 000 000 ≥
7500000 × 10000 = 75 000 000 000`. Passes with headroom.

**`undercollateralized`** — the trap. Same eight assets, **freshly signed at `snapshotEpoch == 7`**,
with two assets now carrying `daysPastDue > 30`. The eligible total falls to `8500000` ($85,000),
supporting `8500000 × 8000 / 10000 = 6800000` ($68,000) < `7500000`.

> If you epoch-shift these instead of re-signing them, the circuit rejects them at Stage 2.3 and the
> demo shows `STALE_EPOCH` where PRD §21 promises an undercollateralisation failure. Role 01's
> acceptance criterion 7 tests for exactly this. Re-sign at the current epoch.

Note the interaction: the two delinquent assets are *ineligible*, so they do not contribute to
`eligibleTotal` — but the circuit's Stage 2.5 asserts `daysPastDue <= maxDaysPastDue` for every
**occupied** slot, which would fail with `ASSET_INELIGIBLE`, not `INSUFFICIENT_COLLATERAL`. Resolve
this the way the demo needs: **the borrower deselects the two delinquent assets**, so they are sent
as *unoccupied* slots and the batch carries six occupied slots totalling `8500000`. That is what
happens in real borrowing-base practice and it produces the failure PRD §21 describes. Build the
fixture that way and document the reasoning in your README section.

**`stale`** — the `eligible` batch signed at `snapshotEpoch == 6`. Everything else valid.

**`tampered`** — the `eligible` batch with exactly one field changed after signing: slot 0's
`outstandingMinor`. Signature untouched. Document which field is mutated so Role 03 can label it and
Role 01 can test it.

**`replay`** — byte-identical to `eligible`. Not "similar" — identical, same `assetNonce` values, so
the nullifiers collide.

**Per-rule ineligibility variants**, for Role 01's PRD §20.1 negative tests: one fixture each for
excessive delinquency, insufficient risk score, insufficient remaining term, zero balance, wrong
provider key, wrong facility id — plus exactly-at-threshold and one-past-threshold pairs for the four
policy rules.

All fixtures are clearly labelled synthetic (PRD §27: "The demo uses deterministic synthetic records
that are clearly labeled"). Use obviously fictional customer references.

### R8 — Golden vectors (`packages/schema/test/vectors/`)

The parity artefact. For each of at least the `eligible` eight credentials plus one from each failure
scenario, publish a JSON record containing:

- every input field, exactly as signed;
- the **ten 32-byte canonical words in hex** — this is what a human compares by eye when parity breaks;
- the intermediate hash/packed field elements as defined by the Schema Lock;
- the three signature components;
- the attestor public key coordinates;
- the derived nullifier and its three-word preimage in hex;
- the expected verification outcome.

Also publish `sha256("FACILITY_DEMO_001")` in hex so Role 01, 03 and 04 all use the identical
facility id bytes.

Role 01 writes a contract test that verifies every vector **inside the circuit**. That test passing
is the definition of the Schema Lock holding. Tell the PM the moment it does.

Vectors are regenerable by a committed script and are deterministic — regenerating must produce a
byte-identical file.

### R9 — The attestation service (PRD §15.1)

Fastify, Node 20, TypeScript strict. Four endpoints, exactly:

| Method | Endpoint | Behaviour |
|---|---|---|
| `GET` | `/health` | Demo preflight. Returns status, service version, provider id, and whether the key loaded. Never the key. |
| `GET` | `/v1/provider` | Provider identifier and **public** key (the two affine coordinates that populate `attestorPublicKeyX/Y`). |
| `GET` | `/v1/fixtures/:scenario` | Deterministic sample data for one allowed scenario. `:scenario` is validated against a **closed allowlist** of the five ids — anything else is a 400, and the path parameter never touches the filesystem. |
| `POST` | `/v1/credentials/sign` | Canonicalise and sign up to eight demo asset records. Rejects >8 records, rejects malformed widths, rejects `schemaVersion != 1`. |

CORS restricted to the local dev origin. Response schemas declared so serialisation is a whitelist,
not a blacklist — this is how R11 is enforced structurally rather than by discipline.

### R10 — Key persistence (PRD §18.1)

> "Persist the demo provider key between restarts so already issued credentials do not become invalid
> unexpectedly."

Generate the keypair once into a gitignored path outside the package source (`.keys/attestor.json`
at the workspace root — Role 01 has gitignored `.keys/`). Load at boot. If the file is absent,
generate it and log that a **new** key was created, loudly, because every previously issued credential
just became invalid.

The private key never enters: the repository, a log line, an HTTP response, an error message, a
`console.*` call, or a fixture. `/v1/provider` returns public coordinates only.

Provide a documented regeneration command for a clean-slate rehearsal, and state in the README that
running it invalidates all existing credentials and requires re-running facility creation.

### R11 — Logging and privacy (PRD §18.1, §18.2, §19)

Log exactly: method, path, status code, duration, scenario id, and a categorical error. **Nothing
else.** No request body, no response body, no credential field, no signature, no key.

Write a test that asserts this: sign a batch with a sentinel value in `outstandingMinor`, capture all
log output, and assert the sentinel never appears. This is a real test, not a review note — PRD §18.2
makes it an acceptance gate.

### R12 — Integration parity test (PRD §20.2)

> "Attestation service signature matches the circuit's canonical message."

Write a test in your package that signs via the live service and asserts the returned canonical
preimage equals the one `packages/schema` produces locally for the same input. Role 01 owns the
in-circuit half; you own the service-to-schema half. Together they close the loop.

---

## Dependencies

| You need | From | Blocks |
|---|---|---|
| Workspace root, `tsconfig.base.json` | Role 01 | Starting `packages/schema` |
| `docs/handoffs/SCHEMA-LOCK.md` (Layer B) | Role 01, Day 1 | **R6 signer, R8 vectors only.** R1–R5, R7, R9–R11 are unblocked — do them first |
| Compiled `credentialDigest` + `assetNullifier` pure circuits | Role 01, R2a, early | R3a, R4, R6, R8 |
| Confirmation the golden-vector test is green | Role 01 | Declaring done |

You block: Role 01 (golden vectors, fixtures), Role 03 (the running service, schema package, error
table).

---

## Constraints

- All shared conventions in `00-overview.md` §7 — especially **no comments in code** and **no `any`**.
- `bigint` for anything wider than 32 bits; decimal **strings** across JSON boundaries; never a float,
  never a decimal point in a credential.
- **Never reimplement a Compact hash in TypeScript.** Call the compiler-generated `pureCircuits`
  bindings (R3a).
- Deterministic everywhere: no `Math.random`, no `Date.now`, no locale- or timezone-dependent
  formatting in fixture or vector generation. Five runs, identical bytes.
- Exact pinned dependency versions. Ask the PM before adding any dependency.
- The attestor private key never touches the repository, a log, or a response.
- No database, no ORM, no migrations, no auth.
- You do not choose the signature primitive; the Schema Lock does.
- No `git init`, no commits, no pushes.

---

## Deliverables

1. `packages/schema/` — `domain.ts`, `types.ts`, `canonical.ts`, `nullifier.ts`, `errors.ts`,
   `signer.ts`, `fixtures/`, with unit tests including the byte-length assertions.
2. `packages/schema/test/vectors/` — golden vectors, deterministic, regenerable by a committed script,
   with hex preimages.
3. `packages/attestation/` — the Fastify service, the four endpoints, key loading, the log-leak test.
4. Countersignature on `docs/handoffs/SCHEMA-LOCK.md` confirming the signer was built to it.
5. Your README section: starting the service, regenerating fixtures and vectors, key persistence and
   what regenerating the key invalidates, and the `undercollateralized` deselection reasoning from R7.
6. A written report to the PM: any Schema Lock ambiguity you had to resolve and how; the exact eight
   asset amounts in each scenario with the arithmetic shown; confirmation that the in-circuit
   golden-vector test is green; and anything in the PRD you found under-specified.

---

## Acceptance criteria

1. `pnpm --filter schema test` and `pnpm --filter attestation test` pass from a clean install.
2. The canonical serialiser output is **exactly ten 32-byte words** for every fixture credential,
   asserted in a test, in the §5.3 order.
3. The nullifier preimage is **exactly three 32-byte words**, asserted in a test.
4. Each domain separator's byte length matches `00-overview.md` §5.2 — 19, 24, 18, 16 — asserted in a
   test, and `DS_ASSET_NULLIFIER` is character-for-character `phrim:asset-nullifier:v1`.
5. An out-of-range field value throws at signing time; it is never truncated. Tested.
6. Regenerating fixtures and golden vectors twice produces byte-identical files.
7. **Role 01's in-circuit golden-vector test passes against your published vectors.** This is the
   single most important criterion in this handoff.
8. `eligible` totals `10000000` minor units across eight occupied slots and the advance-rate
   inequality holds for a `7500000` draw.
9. `undercollateralized` is signed at `snapshotEpoch == 7` (not 6), carries six occupied slots
   totalling `8500000`, and produces `INSUFFICIENT_COLLATERAL` — not `STALE_EPOCH`, not
   `ASSET_INELIGIBLE` — when Role 01 runs it.
10. `stale` differs from `eligible` only in `snapshotEpoch`.
11. `tampered` differs from `eligible` in exactly one documented field, with the original signature.
12. `replay` is byte-identical to `eligible`.
13. `GET /v1/fixtures/:scenario` with a value outside the five-id allowlist returns 400 and never
    touches the filesystem. Tested with a path-traversal string.
14. `POST /v1/credentials/sign` with nine records is rejected.
15. The log-leak test passes: a sentinel credential value never appears in captured log output.
16. `GET /v1/provider` returns public coordinates only; `grep` of the whole repository finds no
    private key material.
17. `.keys/` is gitignored and no key file is inside any `packages/` directory.
18. Restarting the service twice yields the same provider public key and previously issued credentials
    still verify.
19. No file in `packages/schema/` or `packages/attestation/` contains a code comment.
20. `grep -rn ": any\|as any\|@ts-ignore" packages/schema/src packages/attestation/src` returns
    nothing.
21. Every dependency is an exact pinned version.
