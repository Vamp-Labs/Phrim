# 00 — Phrim Delivery Overview

**Source of truth:** `docs/Phrim-PRD.md` v1.0 (12 Sept 2026).
**Supporting research:** `docs/ASCII-ART-RESEARCH.md`.
**This document:** role map, dispatch order, frozen cross-role contracts, design-system inventory, technology decisions.

Every role handoff (`01`–`04`) is self-contained for execution. This file is the only place where
contracts **shared between roles** are defined. Where this file and a role file disagree, this file
wins. Where this file and the PRD disagree, the PRD wins — report the conflict to the PM rather than
resolving it locally.

---

## 1 Verified repository state (12 Sept 2026)

Checked before planning. Do not assume anything beyond this list exists.

| Path | State |
|---|---|
| `docs/Phrim-PRD.md` | Present, 1038 lines, v1.0 |
| `docs/ASCII-ART-RESEARCH.md` | Present, 140 lines |
| `docs/assets/logo.webp` | Present, WebP with alpha, **256×256** |
| `docs/fonts/GeistPixel-Circle.woff2` | Present, WOFF2/TrueType, 28 044 bytes |
| `docs/index.html` | **Dangling symlink** → `docs/docs/index.html` (does not exist) |
| `docs/styles.css` | **Dangling symlink** → `docs/docs/styles.css` (does not exist) |
| `docs/main.js` | **Dangling symlink** → `docs/docs/main.js` (does not exist) |
| git | **Not initialised.** No `.git`, no history, no remote |
| Source code | **None.** No `package.json`, no `src/`, no Compact sources, no lockfile |

### 1.1 Consequence: there is no existing HTML design reference

PRD §16 describes a static landing page as though it exists. **It does not.** The three files that
would have carried it are broken symlinks pointing at themselves one directory down.

Therefore the authoritative visual reference for this project is **PRD §16.1.1 (tokens), §16.1.2
(typography), §16.1.3 (component patterns), §16.2–16.8 (page specs), and `docs/ASCII-ART-RESEARCH.md`**
— plus the two real binary assets above. Section 6 of this document distils all of it into a single
inventory. Role 04 builds the landing page from that inventory; it is a **deliverable**, not a
reference.

No role may repair, recreate, or delete the dangling symlinks. Role 04 writes new files at new paths.

### 1.2 Factual corrections to the PRD

The PRD is the product authority and stays so. But PM research (§5.11), verified by compiling against
the real toolchain, found four statements in it that are factually wrong about Midnight today. **Where
the PRD and this list disagree, this list wins, because the PRD's version does not compile.**

| PRD says | Reality | Affects |
|---|---|---|
| "EdDSA" signature (Table 11.4, §14.2 Stage 2.4, FR 08) | **Midnight has no EdDSA.** It is **Schnorr over Jubjub**, hand-rolled in `example-zkloan`'s `schnorr.compact` because the stdlib circuit is absent from the deployable compiler | 01, 02 |
| `@midnight-ntwrk/wallet-api` (§13.3 stack table) | **Abandoned** — last published May 2025; superseded by `wallet-sdk-abstractions` + `dapp-connector-api@4.0.1` | 03 |
| `persistentHash("string", a, b)` (§14.2 Stage 2.6) | Compact takes a `Vector<n, Bytes<32>>`; the separator is `pad(32, "…")`, a 32-byte word | 01, 02, 03 |
| Target network "Preprod" (header) | Correct, but the id is the **string** `'preprod'` — `NetworkId` is not an enum and **there is no "testnet"** | 03 |

Everything else in the PRD stands. Do not use this list as licence to "correct" product decisions you
disagree with — it covers verified toolchain facts only. Anything else you think is wrong goes to the
PM.

---

## 2 Technology decisions

### 2.1 Frontend: Vite 5 + React 18 + TypeScript (**not** Next.js) — DECIDED

**Approved.** The standing default for this organisation is Next.js App Router. It is overridden
here, on the PRD's own argument (§13.3) plus three product-specific reasons:

1. **WASM-first cryptography.** Midnight's proving and runtime libraries are browser-WASM modules
   loaded into a Web Worker (§13.3, §16.2.3). Vite has first-class WASM and worker support with no
   loader configuration; Next's bundler adds a server/client build split that this workload gets
   nothing from.
2. **There is no server.** Every privacy claim in §18.2 depends on private credential fields never
   leaving the browser. A framework whose default execution model is server rendering is a liability
   here — an accidental server component that touches a credential is a silent privacy regression,
   and §18.2 is a pass/fail acceptance test.
3. **Ecosystem parity.** Midnight's official example DApps and the ZK Loan reference the PRD builds
   on are Vite-based. On a ten-day hackathon budget (§24) the cost of being the first team to make
   the SDK work under App Router is not recoverable.

**Rejected:** Next.js App Router (above); Remix (same server-first objection, smaller Midnight
precedent); plain CRA/Webpack (no maintained WASM story, dead tooling).

**Since drafting, this has been upgraded from a judgement call to a verified constraint.** Midnight
maintains an open, deferred epic stating that Next.js is unsupported:
[midnight-ledger#323](https://github.com/midnightntwrk/midnight-ledger/issues/323) —

> "Next.js — the dominant React framework — **is unsupported** due to Node.js-specific dependencies
> across midnight-js and the ledger WASM bindings." … "DApp developers building with Next.js **cannot
> use the Midnight SDK**." Status: *"Foundation have not requested this capability via SoW so we need
> to defer this."*

Named, unfixed blockers: `submit-tx.ts` unconditionally imports `node:fs`/`node:path`;
`level-private-state-provider` depends on `classic-level`, a node-gyp native addon with no browser
path; `indexer-public-data-provider` hardcodes `isomorphic-ws` → native `ws`; private-state encryption
uses Node `crypto`, not Web Crypto; and the `ledger-wasm` / `onchain-runtime-wasm` / `zkir-wasm`
bundles are built by `wasm-pack` **targeting Node.js only** — no `--target web` build exists.

Midnight's official Next.js guide installs exactly one package, `@midnight-ntwrk/dapp-connector-api`
(pure TS, zero WASM), and covers wallet connection only — no contracts, no providers, no proving. The
organisation's single Next.js app forces webpack off Turbopack on both dev and build and uses no
proving.

Every official example DApp — `example-bboard`, `example-zkloan`, `midnight-leaderboard`,
`example-kitties` — is Vite. There are zero Next.js examples that call a contract.

**Confirmed at the approval gate. Vite is final for this project.** No role reopens this question.

### 2.2 Backend: Node 20 + TypeScript + Fastify, stateless, file-backed key

PRD §13.1 mandates "Node TypeScript service using a fixed demo dataset and persistent demo signing
key". The only open choice is the HTTP layer.

**Chosen: Fastify.** Four endpoints (§15.1), no database, no auth, JSON in/out. Fastify gives schema-
based request validation and typed routes with one dependency, which matters because §18.1 forbids
private values in logs and Fastify's serialiser lets us whitelist response fields rather than
blacklist them.

**Rejected:** Express (needs 3–4 extra middleware packages to reach parity, weaker types); Hono
(fine, but no advantage here); Next.js API routes (would couple the signer's lifetime to the
frontend build and put a signing key inside the web app's process); anything with a database (the
dataset is deterministic and lives in fixtures — a database is state that can drift between demo
rehearsals, and §19 demands five identical consecutive runs).

**Key persistence:** the demo attestor private key is generated once into a gitignored file outside
the repo tree and loaded at boot (§18.1: "Persist the demo provider key between restarts so already
issued credentials do not become invalid"). Never committed, never logged, never in a response body.

### 2.3 Contract: Compact on Midnight, one deployable contract

Not a decision — PRD §13.1, §14. The single choice inside it is **one contract holding a facility
map** versus **one contract per facility**. Chosen: **one contract, single active facility keyed by
`facilityId`**, because §8.1 scopes Tier 1 to "one active facility" and the nullifier registry
(§11.3, Table 11.3) must be shared state for replay prevention to mean anything.

### 2.4 Monorepo: pnpm workspaces

Four packages with hard ownership boundaries (§4). pnpm chosen for workspace protocol support and a
single lockfile — §19 requires pinned, reproducible versions.

---

## 3 Role map

Four roles. Each covers a slice that can be executed and verified independently.

| # | Role | One-line scope | Handoff |
|---|---|---|---|
| 01 | Contract & Circuit Engineer | The Compact contract: P0 circuits, nullifiers, mUSD vault, negative tests, deployment | `docs/handoffs/01-contract-circuit.md` |
| 02 | Attestation & Canonical Schema Engineer | The shared schema package, Schnorr signer, Node attestation service, five deterministic scenarios, golden vectors | `docs/handoffs/02-attestation-schema.md` |
| 03 | DApp Integration Engineer | Vite/React app shell, wallet + providers, Web Worker proving, contract client, error mapping, view-models | `docs/handoffs/03-dapp-integration.md` |
| 04 | Design System & Interface Engineer | Design tokens, static landing page, five presentational page views, ASCII background engine, accessibility | `docs/handoffs/04-design-interface.md` |

### 3.1 Dependency graph

```
        ┌──────────────────────────────────────────┐
        │ 00-overview.md — frozen contracts (§5)   │
        └───┬──────────┬──────────┬────────────┬───┘
            │          │          │            │
            v          v          v            v
         ┌─────┐   ┌─────┐    ┌─────┐      ┌─────┐
         │ 01  │<=>│ 02  │    │ 04  │      │ 03  │ (shell/providers only)
         │contr│SL │attst│    │ UI  │      │     │
         └──┬──┘   └──┬──┘    └──┬──┘      └──┬──┘
            │         │          │            │
            │ types   │ service  │ components │
            └─────────┴──────────┴───────────>│
                                              v
                                      ┌───────────────┐
                                      │ 03 wiring     │
                                      │ integration   │
                                      └───────┬───────┘
                                              v
                                      ┌───────────────┐
                                      │ PM review gate│
                                      └───────────────┘
```

`SL` = the **Schema Lock** (§5.1), a joint Day-1 deliverable between 01 and 02.

### 3.2 Dispatch order

- **Wave 1 (concurrent):** 01, 02, 04.
  - 01 and 02 must complete the Schema Lock (§5.1) before either writes verification or signing code.
  - 04 has no dependency on anything; it builds against the mock view-models in §5.6.
- **Wave 2:** 03 starts concurrently with Wave 1 on the app shell, routing, providers and worker
  scaffolding. It blocks on 01's exported contract types and 02's running service before wiring.
- **Wave 3:** PM review of every deliverable against that role's acceptance criteria.

### 3.3 Root-config ownership

**Role 01 owns the workspace root** and is the only role that may create or edit:
`package.json` (root), `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`, `.nvmrc`, `README.md`.

Roles 02, 03, 04 create only their own `packages/<name>/**`, including their own `package.json`.
If a root change is needed, report it to the PM — do not edit root files.

**No role runs `git init`, `git commit`, `git push`, `git add -A`, or `git add .`.** Role 01 may
create `.gitignore` as a file. Repository initialisation is a human decision.

---

## 4 File layout (mandatory)

```
/
├─ package.json                    [01] pnpm workspace root
├─ pnpm-workspace.yaml             [01]
├─ tsconfig.base.json              [01]
├─ .gitignore                      [01]
├─ README.md                       [01] setup, pinned versions, run + test commands
├─ docs/                           [PM] PRD, research, handoffs — no role writes here except
│                                       SCHEMA-LOCK.md (01+02) and design-system.md (04)
├─ packages/
│  ├─ schema/                      [02] canonical codec + types + fixtures + golden vectors
│  │  ├─ src/
│  │  │  ├─ types.ts               credential + facility TS types
│  │  │  ├─ domain.ts              domain separator constants (§5.2)
│  │  │  ├─ canonical.ts           byte-exact serialiser (§5.3)
│  │  │  ├─ nullifier.ts           nullifier preimage builder (§5.4)
│  │  │  ├─ errors.ts              PhrimErrorCode union (§5.5)
│  │  │  └─ fixtures/              five deterministic scenarios (§5.7)
│  │  └─ test/
│  │     └─ vectors/               golden vectors consumed by 01 and 02
│  ├─ contract/                    [01] Compact sources, artifacts, tests, deploy
│  │  ├─ src/phrim.compact
│  │  ├─ src/witnesses.ts
│  │  ├─ src/index.ts              exported contract types + circuit wrappers for 03
│  │  ├─ test/
│  │  └─ scripts/deploy.ts
│  ├─ attestation/                 [02] Fastify service
│  │  ├─ src/server.ts
│  │  ├─ src/signer.ts
│  │  ├─ src/routes/
│  │  └─ test/
│  └─ app/                         SHARED PACKAGE, SPLIT BY DIRECTORY — see below
│     ├─ package.json              [03]
│     ├─ vite.config.ts            [03]
│     ├─ index.html                [03] SPA entry
│     ├─ public/
│     │  ├─ fonts/                 [04] copy of GeistPixel-Circle.woff2
│     │  └─ assets/                [04] copy of logo.webp
│     └─ src/
│        ├─ main.tsx               [03]
│        ├─ app/                   [03] EXCLUSIVE — routes, containers, hooks, providers
│        │  ├─ routes/
│        │  ├─ midnight/           wallet, providers, contract client
│        │  ├─ worker/             proving Web Worker
│        │  └─ state/
│        ├─ viewmodels/            [03] EXCLUSIVE — the types in §5.6; 04 imports read-only
│        └─ ui/                    [04] EXCLUSIVE — tokens, primitives, page views, ascii engine
│           ├─ tokens.css
│           ├─ base.css
│           ├─ primitives/
│           ├─ views/              five presentational page views
│           └─ ascii/              WebGL/Canvas2D background engine + AsciiMorph
└─ landing/                        [04] EXCLUSIVE — static vanilla HTML/CSS/JS landing page
   ├─ index.html
   ├─ styles.css
   ├─ main.js
   └─ assets/, fonts/
```

**The `src/ui/` ↔ `src/app/` boundary is absolute.** Role 04 never imports from `src/app/`. Role 03
never edits a file under `src/ui/`. They meet only at the view-model types in §5.6 and at the
component prop signatures those types imply. If a view needs data that no view-model carries, the
role that noticed it reports to the PM; it does not reach across the boundary.

---

## 5 FROZEN CROSS-ROLE CONTRACTS

Everything in this section is **binding on every role**. Changing any of it requires PM sign-off and
a re-issued handoff. These exist because PRD §25 identifies "signer and circuit serialize fields
differently" as a Medium-probability, High-impact risk, and because §15.3 requires byte-exact parity.

### 5.1 The Schema Lock (joint 01 + 02 deliverable, Day 1)

Two layers:

- **Layer A — frozen here, non-negotiable.** Field order, field widths, byte encoding, domain
  separator strings, empty-slot semantics, nullifier preimage. Defined in §5.2–§5.4 below.
- **Layer B — pre-researched below (§5.11), confirmed by a Day-1 spike, then frozen by 01 and 02
  jointly.** The concrete signature primitive, the curve, the challenge construction, and the
  padding direction of `pad(32, …)`. PRD §28 lists this as an open decision owned by the Contract
  lead, due end of day 1, defaulting to "match the current official ZK Loan example" — §5.11 records
  what the ZK Loan example actually does, verified by compiling against the real toolchain.

**Layer B procedure:**

1. Role 01 runs the Day-1 spike from PRD §24 (one provider signature verifying inside a minimal
   Compact circuit), starting from §5.11 rather than from scratch. Role 01 confirms every claim in
   §5.11 against the toolchain it actually installs, and does **not** invent a primitive.
2. Role 01 writes `docs/handoffs/SCHEMA-LOCK.md` recording: primitive name, curve, hash function,
   exact symbols used and where they came from, the `Vector<n, Field>` message construction, the
   `pad(32, …)` padding direction, and the public-key encoding that populates
   `attestorPublicKeyX` / `attestorPublicKeyY`.
3. Role 02 implements the signer against that document and produces golden vectors (§5.7).
4. Role 01 adds a contract test that verifies every golden vector **inside the circuit**. This test
   is the definition of "the lock holds".
5. Neither role proceeds past this point on verification/signing code until that test is green.

Both roles report the Layer B outcome to the PM. **The 8-vs-4 active-record question is pre-decided
and does not block on a PM check-in:** attempt the full eight-slot spec first; if the spike shows
eight in-circuit signature verifications cannot meet the §19 latency target, Role 01 applies PRD §28's
own default — four active plus four empty slots — as a **documented contingency**, not as a fallback
starting point, and notifies Role 02 the same day so fixtures are rebuilt around four slots. Full
detail: handoff 01, R2 "Latency gate". Either outcome (eight holds, or the contingency triggered) is
reported to the PM with the measured numbers — the PM needs the number, not a decision to make.

### 5.2 Domain separators — ASCII, padded to 32 bytes

Compact's domain-separation idiom is `pad(32, "…")`, as used throughout `example-bboard` and
`example-zkloan`: the ASCII string right-padded with zero bytes to a 32-byte word, which then becomes
one element of the `Vector<n, Bytes<32>>` passed to `persistentHash`. Every separator below is
therefore a **32-byte word**, not a raw string.

| Constant | Exact string | ASCII bytes | Padded | Source |
|---|---|---:|---:|---|
| `DS_CREDENTIAL` | `phrim:credential:v1` | 19 | 32 | PM-defined per PRD §18.1 |
| `DS_ASSET_NULLIFIER` | `phrim:asset-nullifier:v1` | 24 | 32 | **PRD §14.2 Stage 2.6 — verbatim, do not alter** |
| `DS_AUTHORITY` | `phrim:authority:v1` | 18 | 32 | PM-defined per PRD §18.1 |
| `DS_DRAW_ID` | `phrim:draw-id:v1` | 16 | 32 | PM-defined per PRD §18.1 |

`DS_ASSET_NULLIFIER` is quoted directly from the PRD and is the one string a judge may check against
the spec. It is spelled `phrim:asset-nullifier:v1` — lowercase, two colons, one hyphen, suffix `v1`.
All four are under 32 bytes, so none is truncated.

**Padding direction is a Layer B item.** Role 01 confirms empirically whether `pad(32, s)` right-pads
(ASCII first, zeros after) or left-pads, records the answer in `SCHEMA-LOCK.md`, and Role 02 matches
it. Do not assume — a padding-direction mismatch produces a perfectly valid signature over the wrong
message and is invisible until nothing verifies.

These constants live in exactly one place: `packages/schema/src/domain.ts`, as both the raw string and
the 32-byte padded form. Role 01 mirrors them as Compact `pad(32, "…")` literals and adds a test
asserting the padded Compact words equal the TypeScript constants byte-for-byte.

### 5.3 Canonical credential preimage — ten 32-byte words, fixed order

Derived from PRD Table 11.4, in table order, excluding the three signature fields. Every value is
widened to a full 32-byte big-endian word, because `persistentHash` in Compact consumes a
`Vector<n, Bytes<32>>` and mixed-width concatenation has no representation there.

| # | Word | Field | Declared type (Table 11.4) | Encoding into 32 bytes |
|---:|---|---|---|---|
| 0 | `DS_CREDENTIAL` | — | ASCII | `pad(32, "phrim:credential:v1")` |
| 1 | `schemaVersion` | Uint 8 | big-endian, zero-extended; value is `1` for v1 |
| 2 | `providerId` | Uint 32 | big-endian, zero-extended |
| 3 | `facilityId` | Bytes 32 | raw, already 32 bytes |
| 4 | `assetNonce` | Bytes 32 | raw, already 32 bytes |
| 5 | `outstandingMinor` | Uint 64 | big-endian, zero-extended, **minor units (cents)** |
| 6 | `daysPastDue` | Uint 16 | big-endian, zero-extended |
| 7 | `riskScore` | Uint 16 | big-endian, zero-extended |
| 8 | `maturityEpoch` | Uint 32 | big-endian, zero-extended |
| 9 | `snapshotEpoch` | Uint 32 | big-endian, zero-extended |

Ten words, 320 bytes total, in exactly this order.

Rules, all binding:

- **Big-endian, zero-extended to 32 bytes, no delimiters, no length prefixes.** Word order is the
  order above and the order of Table 11.4.
- The domain separator is word **0**. It is never hashed separately and never appended.
- **Declared widths still bind.** A value that does not fit its Table 11.4 width — a `daysPastDue`
  above `2^16 − 1`, say — is a **hard error at signing time**, never a truncation and never a quiet
  widening. The 32-byte word is a transport container, not a licence to exceed the declared type.
- `outstandingMinor` is in **minor units**. `$100,000.00` is `10000000`. No role handles a decimal or
  a float anywhere in the credential path (PRD §14.3: no floating point, no division).
- `schemaVersion` must equal `1`; both the signer and the circuit reject anything else.

#### 5.3.1 The digest is computed once, by the contract, and reused off-chain

`persistentHash` is a ZK-friendly hash whose exact construction is a property of the Compact runtime.
**No role reimplements it in TypeScript.** Instead, Role 01 exports it as a pure circuit:

```
export pure circuit credentialDigest(
  schemaVersion, providerId, facilityId, assetNonce,
  outstandingMinor, daysPastDue, riskScore, maturityEpoch, snapshotEpoch
): Bytes<32>
```

which internally builds the ten-word vector above and hashes it. The Compact compiler emits a
TypeScript `pureCircuits` binding for every `export pure circuit`, so Role 02's signer imports
`pureCircuits.credentialDigest` from the compiled contract and gets a **byte-identical** digest
without writing a second implementation.

This is the same technique `example-zkloan` uses (it re-exports `schnorrChallenge` so its off-chain
attestation API can compute the identical challenge), and it converts PRD §25's top risk — "signer and
circuit serialize fields differently" — from a live hazard into a structural impossibility.

**Consequence for sequencing:** `credentialDigest` is Role 01's first code deliverable after the
spike, ahead of the rest of the contract, because Role 02's signer is blocked on it. Role 01 ships a
compiled contract exposing it even while the rest of `requestDraw` is a stub.

The golden vectors still record the ten words in hex plus the resulting digest (§5.7), so parity
remains checkable by eye when something goes wrong.

### 5.4 Nullifier derivation — three 32-byte words

PRD §14.2 Stage 2.6 mandates:
`persistentHash("phrim:asset-nullifier:v1", facility.facilityId, credential.assetNonce)`

Expressed in real Compact, that is a `Vector<3, Bytes<32>>`:

| # | Word | Value |
|---:|---|---|
| 0 | `DS_ASSET_NULLIFIER` | `pad(32, "phrim:asset-nullifier:v1")` |
| 1 | `facilityId` | from **facility ledger state**, not from the credential |
| 2 | `assetNonce` | from the credential |

Order is DS ‖ facilityId ‖ assetNonce. The facility identifier is taken from ledger state so a
credential cannot steer its own nullifier. The circuit separately asserts
`credential.facilityId == facility.facilityId` (PRD §14.2 Stage 2.2), so the two agree on the happy
path and a mismatch fails before the nullifier is used.

As with the credential digest, Role 01 exports this as
`export pure circuit assetNullifier(facilityId, assetNonce): Bytes<32>` and Role 02/Role 03 call the
generated TypeScript binding rather than reimplementing the hash. Role 03 needs it off-chain to
predict `ASSET_ALREADY_USED` in the local pre-flight (§5.6), and a reimplementation that drifts would
make the pre-flight lie.

**Duplicate detection is two-sided** (PRD §14.2 Stage 2.6, §18.1): against the persisted
`usedAssetNullifiers` set **and** within the current eight-slot batch. Both checks are mandatory;
omitting the in-batch check means one asset can be counted eight times.

### 5.5 Empty-slot semantics

`requestDraw` always takes exactly **eight** slots (PRD §8.1, §14.3). Each slot carries an explicit
`slotOccupied: Boolean` witness flag.

- `slotOccupied == false` ⇒ the circuit **constrains every field of that slot to zero** and the slot
  contributes nothing to `eligibleTotal`, produces no nullifier, and is not counted in
  `selectedCredentialCount`. A zeroed slot is never signature-checked.
- `slotOccupied == true` ⇒ the full Stage 2 sequence runs, and `outstandingMinor > 0` is asserted
  (PRD FR 17, §14.2 Stage 2.5).
- `selectedCredentialCount > 0` is asserted in Stage 3 (PRD §14.2 Stage 3.1). An all-empty batch
  fails.

Marking a genuine credential as unoccupied is permitted and is not an attack — it contributes nothing
and consumes no nullifier. The attack the zero-constraint blocks is smuggling unverified values
through a slot the circuit skipped.

### 5.6 Error codes — the single enumeration

PRD §17 defines eleven codes. This is the exact union, owned by `packages/schema/src/errors.ts`,
consumed by every role:

```
INVALID_SIGNATURE | WRONG_FACILITY | STALE_EPOCH | ASSET_INELIGIBLE |
INSUFFICIENT_COLLATERAL | ASSET_ALREADY_USED | CREDIT_LIMIT_EXCEEDED |
VAULT_INSUFFICIENT | FACILITY_INACTIVE | UNAUTHORIZED | NETWORK_UNAVAILABLE
```

User-facing message and recovery text for each code is **verbatim from PRD §17** — the table's
"User message" and "Recovery" columns. No role rewords them.

**Two-tier surfacing (resolves PRD §28 "Public error detail emitted by contract" to its stated
default of "minimal categorical failure surfaced locally"):**

1. **Local pre-flight (Role 03, authoritative for UX only).** Before proving, the app evaluates the
   selected batch against the fetched public facility policy and the used-nullifier set and predicts
   a category. This is what the user sees. It is explicitly **not** an approval — PRD §9.3 step 3 and
   §16.5 require the label `Calculated locally; contract proof is authoritative`.
2. **In-circuit assertion (Role 01, authoritative for enforcement).** Every assertion in the circuit
   uses the matching error-code string as its assertion message. Role 03 pattern-matches the code out
   of the failure and falls back to a generic categorical failure if it cannot.

Enforcement is **always** the circuit. A local pre-flight pass must never be able to skip, weaken or
short-circuit a circuit check, and Role 03 must not gate submission on the pre-flight result in a way
that hides a circuit failure — the four failure scenarios in §5.7 have to reach the user as real
rejections, not as disabled buttons.

`NETWORK_UNAVAILABLE` is Role 03's alone; the circuit never emits it.

### 5.7 The five deterministic scenarios

PRD §15.2, with the arithmetic made explicit. Every amount is in **minor units**. Advance rate is
`8000` bps (80%), credit limit and epochs per §5.8.

**Contingent on the Day-1 latency spike (handoff 01, R2 "Latency gate"):** the slot counts below
assume the primary path — **eight active slots**. If the spike triggers the documented four-active
contingency, Role 01 notifies Role 02 the same day and every row below is rebuilt around four
occupied slots, preserving the same headline dollar amounts ($100,000 eligible, $75,000 draw,
$85,000 → $68,000 undercollateralized). Do not build both versions speculatively — build for eight
until told otherwise.

| Scenario | Content | Expected outcome | Expected code |
|---|---|---|---|
| `eligible` | 8 occupied slots, eligible total `10000000` ($100,000), all policy-passing, `snapshotEpoch == currentEpoch` | **Draw of `7500000` ($75,000) succeeds.** `10000000 × 8000 = 80000000000 ≥ 7500000 × 10000 = 75000000000` ✓ | — |
| `undercollateralized` | The `eligible` batch, **newly signed at the same epoch**, with **two of the eight assets now delinquent and deselected (sent as unoccupied slots)** rather than submitted delinquent — 6 occupied slots, eligible total falls to `8500000` ($85,000) | **Draw of `7500000` fails.** `8500000 × 8000 = 68000000000 < 75000000000` ✗ (supports only $68,000) | `INSUFFICIENT_COLLATERAL` |
| `stale` | Valid signatures, `snapshotEpoch == currentEpoch − 1` | Fails at Stage 2.3 | `STALE_EPOCH` |
| `tampered` | `eligible` batch with exactly one field mutated after signing (mutate `outstandingMinor` of slot 0) | Signature verification fails; proof cannot be generated | `INVALID_SIGNATURE` |
| `replay` | Byte-identical to the `eligible` batch that already funded a draw | Nullifier already in `usedAssetNullifiers` | `ASSET_ALREADY_USED` |

Notes that matter:

- **`undercollateralized` assets must be freshly signed, not epoch-shifted, and the two delinquent
  assets must be deselected rather than submitted as occupied-but-ineligible.** Two failure modes to
  avoid: (1) if they are stale, the circuit rejects at Stage 2.3 and the demo shows `STALE_EPOCH`
  where §21 promises an undercollateralisation failure; (2) if the two delinquent assets are sent as
  *occupied* slots, Stage 2.5 asserts `daysPastDue <= maxDaysPastDue` on every occupied slot and the
  circuit fails with `ASSET_INELIGIBLE`, not `INSUFFICIENT_COLLATERAL`. The correct construction is
  six occupied slots (the two delinquent ones marked `slotOccupied = false`), which mirrors real
  borrowing-base practice — a borrower drops ineligible receivables before submitting — and produces
  the failure §21 actually describes. Role 02 owns getting this right; Role 01's negative tests assert
  the specific code.
- **`replay` requires the `eligible` draw to have succeeded first.** It is order-dependent. The demo
  script (§21) runs happy path → undercollateralized → replay, and the scenarios must be runnable in
  that order five times consecutively (§19, §20.3) — which means a documented reset path between
  rehearsals (fresh facility id or fresh deployment). Role 01 owns the reset procedure and documents
  it in the README.
- **`ASSET_INELIGIBLE` has no dedicated demo scenario** but is required by §17 and by the §20.1
  negative tests (delinquency, risk, term, zero balance). Role 01 covers it with unit tests; Role 02
  provides per-rule fixture variants; Role 03 renders it. It is not in the three-minute script.

### 5.8 Canonical demo constants

Bound once here so all four roles produce the same demo. Role 02 fixtures, Role 01 tests, Role 03
defaults and Role 04 mock view-models all use these.

| Constant | Value | Note |
|---|---|---|
| `facilityId` label | `FACILITY_DEMO_001` | PRD §9.1 step 2 |
| `facilityId` bytes | `sha256("FACILITY_DEMO_001")`, 32 bytes | deterministic, recorded in the golden vectors |
| `attestorProviderId` | `1` | Uint 32 |
| `creditLimit` | `20000000` | $200,000 |
| `advanceRateBps` | `8000` | 80.00% (PRD §15.2, §29) |
| `maxDaysPastDue` | `30` | |
| `minRiskScore` | `600` | |
| `minRemainingEpochs` | `2` | |
| `currentEpoch` | `7` | lets `stale` use epoch `6` without underflow |
| `outstanding` at start | `0` | |
| vault funding | `15000000` | $150,000 — enough for the draw, small enough that `VAULT_INSUFFICIENT` is testable |
| demo draw amount | `7500000` | $75,000 (PRD §21, §29) |
| `schemaVersion` | `1` | |
| slot count | `8` | fixed (PRD §14.3) |

Asset maturity epochs in fixtures must satisfy `maturityEpoch >= currentEpoch + minRemainingEpochs`
i.e. `>= 9` for eligible assets.

### 5.9 View-model contracts (Role 03 defines, Role 04 consumes)

These types live in `packages/app/src/viewmodels/`. Role 03 writes them; Role 04 imports them and
builds every view against them. Role 04 ships mock instances so it can build with zero runtime
dependency on Role 03.

Shapes are frozen at the field level. Role 03 may add fields; removing or renaming one requires
telling Role 04.

```
FacilitySetupVM   { fields: PolicyFieldVM[]; submitState: ActionState; vaultBalanceMinor: string | null }
PolicyFieldVM     { id; label; hint; value; kind: 'text'|'number'|'bps'|'money'|'hash'; error: string | null }
CollateralVM      { rows: CredentialRowVM[]; scenario: ScenarioId; previewTotalMinor: string;
                    previewSupportsMinor: string; allSignaturesValid: boolean }
CredentialRowVM   { slot: 0..7; occupied: boolean; maskedAssetRef: string; outstandingMinorMasked: string;
                    daysPastDueMasked: string; riskScoreMasked: string; signatureStatus: 'valid'|'invalid'|'unchecked' }
DrawRequestVM     { requestedMinor: string; publicDisclosure: { facilityIdShort; epoch; requestedMinor };
                    privateSummary: { pledgedCount: number }; stage: ProofStage; error: PhrimError | null }
ProofStage        'idle'|'preparing'|'proving'|'awaiting-wallet'|'submitting'|'confirmed'|'failed'
DrawResultVM      { outcome: 'funded'|'rejected'; amountMinor; priorOutstandingMinor;
                    newOutstandingMinor; availableCreditMinor; walletBalanceMinor;
                    nullifiersConsumed: number; contractAddress: string; txId: string;
                    error: PhrimError | null }
HistoryVM         { status: 'Active'|'Frozen'|'Closed'; vaultMinor; outstandingMinor; capacityMinor;
                    receipts: DrawReceiptVM[] }
DrawReceiptVM     { drawId; epoch; amountMinor; resultingOutstandingMinor; completed: boolean }
PhrimError        { code: PhrimErrorCode; message: string; recovery: string }
ActionState       'idle'|'busy'|'done'|'error'
```

**All monetary values crossing this boundary are `string` decimal integers in minor units.** Not
`number` — `Uint<128>` exceeds `Number.MAX_SAFE_INTEGER`. Role 04 formats for display; Role 04 never
does arithmetic on them beyond what a formatter needs, and never parses them to `number`.

`CredentialRowVM` carries **masked** values by design (PRD §11.3, §16.5): Role 04 renders what it is
given and never receives a raw asset identifier. The masking policy is Role 03's.

### 5.10 Privacy invariant (binding on all four roles)

PRD §18.2 is a pass/fail acceptance test, checked by the PM at review:

> After a successful draw, inspect public contract state, transaction data, application logs, browser
> network requests, and repository fixtures. None may reveal asset-level balances, delinquency, risk
> score, maturity, asset nonce, or provider signature.

Concretely, for every role:

- No credential field is ever an argument to `console.*`, a thrown `Error` message, an analytics call,
  a URL, a query string, or a request body other than the one call that carries witnesses into the
  local proving worker.
- The attestation service logs method, path, status, duration and scenario id — nothing else.
- Fixtures committed to the repo contain synthetic data only and are labelled as such (PRD §27).
- No role reads, writes or echoes `.env*` files or secrets.
- The demo attestor **private** key never enters the repository.

### 5.11 Verified toolchain baseline (PM research, 12 Sept 2026)

Researched against official documentation, the published npm tarballs' `.d.ts` files, the Compact
standard-library source, and by **installing and running both compiler binaries**. Claims marked
**[V-EMP]** were confirmed by compiling probe contracts. Every role confirms these against its own
installation and reports any drift — they are a head start, not a substitute for the spike.

#### 5.11.1 Compiler — pin 0.31.1, not latest

| | **compactc 0.31.1 — use this** | compactc 0.34.0 — do not use |
|---|---|---|
| `--language-version` | **0.23.0** | 0.26.0 |
| `--runtime-version` | **0.16.0** | 0.19.0 |
| `--ledger-version` | **ledger-8.0.2** | ledger-9.1.0.0-rc.3 |

0.34.0 targets **ledger 9, which is not deployed on any live network.** Its own release notes say to
keep using 0.31.x for deployable contracts. The support matrix pins Preview/Preprod/Mainnet to
compiler 0.31.1 / runtime 0.16.0. Note that `/relnotes/compact` marks 0.31.0 "UNSUPPORTED" and 0.34.0
"LATEST", contradicting the matrix — the release notes are the tiebreaker. **[V-EMP]**

Write `pragma language_version 0.23;`. Install via the official `compact-installer.sh`, then
`compact update 0.31.1`. Toolchains live under `$HOME/.compact`; the env var is `COMPACT_DIRECTORY`
(`COMPACT_HOME` is legacy). Module search path is `COMPACT_PATH`. `--skip-zk` gives fast iteration
without proving keys. **[V]**

#### 5.11.2 Signatures — it is Schnorr over Jubjub, **not EdDSA**

**PRD Table 11.4, §14.2 Stage 2.4 and §10.2 FR 08 all say "EdDSA". Midnight has no EdDSA.** This is a
factual correction to the PRD and it binds every role.

- `jubjubSchnorrVerify` **exists in the standard library but is absent from 0.31.1** — it landed after
  the 0.31 branch. Compiling against 0.31.1 gives `unbound identifier`. **[V-EMP]**
- `secp256k1EcdsaVerify` exists only on 0.34.0 and only with `--feature-zkir-v3`. **[V-EMP]**
- Therefore `example-zkloan` **hand-rolls Schnorr over Jubjub** in a local module,
  `contract/src/schnorr.compact`, whose own header says it is temporary until the stdlib circuit
  ships. **Copy that file. Do not reimplement it.** **[V]**

```
export struct SchnorrSignature { announcement: JubjubPoint; response: Field; }
export circuit schnorrVerify<#n>(msg: Vector<n, Field>,
                                 signature: SchnorrSignature,
                                 pk: JubjubPoint): [];
```

Verification is `ecMulGenerator(response) == ecAdd(announcement, ecMul(pk, c))`.

**The soundness-critical detail:** `transientHash` returns a value in the BLS12-381 scalar field
(~2²⁵⁵), but `ecMul` needs a scalar below the Jubjub subgroup order (~2²⁵²·⁴). The challenge is
truncated to 248 bits by a **witness-assisted division** — `getSchnorrReduction` supplies `(q, r)`
with `cFull == q·2²⁴⁸ + r`, and the circuit constrains `q : Uint<7> < 116`. Without that bound a
prover can forge any signature. This is exactly why the file is copied rather than rewritten. **[V]**

**Impact on the frozen schema, all already reflected above:**

- Table 11.4's `signatureR8x` / `signatureR8y` / `signatureS` map onto
  `announcement.x` / `announcement.y` / `response`. The field *shape* survives; only the scheme name
  was wrong. Role 02 keeps the Table 11.4 field names for PRD traceability and documents the mapping.
- `attestorPublicKeyX` / `attestorPublicKeyY` (Table 11.1) are the affine coordinates of a
  `JubjubPoint`. Consistent with the PRD.
- The signed message is a **`Vector<n, Field>`**, not a byte string. Phrim signs
  `[degradeToTransient(credentialDigest(...))]` — a `Vector<1, Field>` derived from §5.3's ten-word
  digest. `degradeToTransient(Bytes<32>) -> Field` is in the stdlib and is the intended bridge. Role
  01 confirms this in the spike and records the final message construction in `SCHEMA-LOCK.md`.

#### 5.11.3 Authorization — `ownPublicKey()` is not authentication

From the ZK Loan contract's own source comment: **[V]**

> `ownPublicKey()` is never used: it returns a prover-claimed value with no cryptographic binding to
> the transaction signer, so any assertion that depends on it is bypassable.

ZK Loan derives identity from a single 32-byte witness secret via domain-separated `persistentHash`.
This is exactly what PRD §14.4 requires and what §5.2's `DS_AUTHORITY` is for. **No role uses
`ownPublicKey()` for any authorization decision.**

#### 5.11.4 Unshielded contract-issued tokens — exact API

Compiled clean on 0.31.1. **[V-EMP]**

```
circuit mintUnshieldedToken(domainSep: Bytes<32>, amount: Uint<64>,
                            recipient: Either<ContractAddress, UserAddress>): Bytes<32>;
circuit sendUnshielded(color: Bytes<32>, amount: Uint<128>,
                       recipient: Either<ContractAddress, UserAddress>): [];
circuit receiveUnshielded(color: Bytes<32>, amount: Uint<128>): [];
circuit unshieldedBalance(color: Bytes<32>): Uint<128>;
circuit unshieldedBalanceGte(color: Bytes<32>, amount: Uint<128>): Boolean;
```

Three traps, all of which would cost a day each:

1. **The `Either` order is inverted between unshielded and shielded.** Unshielded is
   `Either<ContractAddress, UserAddress>` — `left` = contract, `right` = user wallet. Shielded is
   `Either<ZswapCoinPublicKey, ContractAddress>` — the other way round. Phrim is unshielded
   throughout: mint to `left(kernel.self())`, pay the borrower with `right(userAddress)`.
2. **`unshieldedBalance(color)` imposes an exact-match constraint** between construction and
   application time — the transaction fails if the balance moved in between. Use
   `unshieldedBalanceGte` for the Stage 3.3 vault-solvency check (PRD §14.2), never a read-and-compare.
   The returned balance is also the balance at the *start* of execution and is not updated by sends
   within the same circuit.
3. **`CoinInfo` no longer exists** under that name — it is `ShieldedCoinInfo` /
   `QualifiedShieldedCoinInfo`. Also note `Maybe.is_some` and `Either.is_left` are **snake_case** in
   the source even though the rendered docs suggest camelCase.

Token identity: `color = persistentCommit([domainSep, contractAddress], pad(32, "midnight:derive_token"))`.
The contract address is baked in, so no other contract can mint Phrim's `mUSD`. Minting to
`kernel.self()` auto-receives, making mint-then-distribute the canonical vault pattern — which is
exactly PRD §9.1 step 4 and §14.1 `fundOrMintDemoToken`.

#### 5.11.5 Ledger ADTs available

`Counter` (`increment(Uint<16>)`, `read(): Uint<64>`), `Cell<T>`, `Set<T>` (`insert`, `member`,
`size`, iterator — this is `usedAssetNullifiers`), `Map<K,V>` (`insert`, `lookup`, `member`, `size`,
iterator — this makes a keyed draw-receipt history cheap, so revisit §5 of handoff 01's R3 choice),
`List<T>`, `MerkleTree`, `HistoricMerkleTree`, `Kernel` (`kernel.self()`). **[V]**

#### 5.11.6 JS SDK — pin this exact set

Use the versions the official examples pin, **not `npm latest`**. **[V]**

```
@midnight-ntwrk/midnight-js-contracts                    4.1.1
@midnight-ntwrk/midnight-js-types                        4.1.1
@midnight-ntwrk/midnight-js-protocol                     4.1.1
@midnight-ntwrk/midnight-js-utils                        4.1.1
@midnight-ntwrk/midnight-js-network-id                   4.1.1
@midnight-ntwrk/midnight-js-http-client-proof-provider   4.1.1
@midnight-ntwrk/midnight-js-indexer-public-data-provider 4.1.1
@midnight-ntwrk/midnight-js-fetch-zk-config-provider     4.1.1   (browser)
@midnight-ntwrk/midnight-js-node-zk-config-provider      4.1.1   (Node/CLI)
@midnight-ntwrk/midnight-js-level-private-state-provider 4.1.1
@midnight-ntwrk/dapp-connector-api                       4.0.1
@midnight-ntwrk/wallet-sdk                               1.2.0
@midnight-ntwrk/wallet-sdk-address-format                3.1.2
@midnight-ntwrk/compact-runtime                          0.16.0
```

plus the overrides/resolutions every example carries:

```
"@midnight-ntwrk/ledger-v8": "8.1.0",
"@midnight-ntwrk/onchain-runtime-v3": "3.0.0",
"@midnight-ntwrk/wallet-sdk": "1.2.0",
"smoldot": "npm:empty-npm-package@1.0.0"
```

Version traps:

- **`@midnight-ntwrk/wallet-api` is abandoned** — last published May 2025, superseded by
  `wallet-sdk-abstractions`. **PRD §13.3 names it in the stack table; that row is out of date.**
- `wallet-sdk@1.2.0` exists but is **not tagged `latest`** (latest is 1.1.0). Pin it explicitly.
- `compact-runtime` latest is 0.19.0 but `midnight-js-protocol@4.1.1` needs **0.16.0**. Never install
  `compact-runtime` directly.
- A `5.0.0-beta` line is ESM-only and requires Node ≥ 22.12. Not for this build.

**Provider set** (from the shipped `.d.ts`): `privateStateProvider`, `publicDataProvider`,
`zkConfigProvider`, `proofProvider`, `walletProvider`, `midnightProvider`, optional `loggerProvider`.
`levelPrivateStateProvider` now **requires** `privateStoragePasswordProvider` and `accountId`;
`httpClientProofProvider` takes the zkConfigProvider as its second argument; `deployContract`'s key is
`compiledContract`, not `contract`. Older tutorials get all three wrong. **[V]**

**Wallet connector v4 dropped `enable()` and `state()`.** The API is
`window.midnight[key].connect(networkId)`, returning `getUnshieldedBalances`, `getUnshieldedAddress`,
`balanceUnsealedTransaction`, `submitTransaction`, `getConfiguration`, and friends. Addresses are
Bech32m. **[V]**

#### 5.11.7 Networks and local stack

`NetworkId` is **`type NetworkId = string`**, not an enum — `setNetworkId(NetworkId.TestNet)` does not
compile. Valid values: `undeployed` | `preview` | `preprod` | `mainnet`. **There is no "testnet".**
Phrim targets `preprod` (PRD header) with `undeployed` as the local fallback. **[V]**

| Network | id | Node RPC | Indexer |
|---|---|---|---|
| Local | `undeployed` | `http://localhost:9944` | `http://localhost:8088/api/v4/graphql` |
| Preprod | `preprod` | `https://rpc.preprod.midnight.network` | `https://indexer.preprod.midnight.network/api/v4/graphql` |

The indexer API is **v4**; `v1`/`v2` paths in older tutorials are dead. **The proof server is always
local (`http://localhost:6300`) on every network** — there is no hosted proof server, because it
handles private data. This is worth stating in the pitch: it reinforces PRD §18.2.

Local stack: the official `midnightntwrk/midnight-local-dev` repo (`npm install && npm start`).
Images are `midnightntwrk/proof-server:8.1.0`, `midnightntwrk/indexer-standalone:4.3.3`,
`midnightntwrk/midnight-node:1.0.0`. **The Docker org is `midnightntwrk` with no hyphen** —
`midnightnetwork/proof-server` from older tutorials is dead. Indexer 4.3.x refuses to boot without SPO
config even when unused (`APP__INFRA__SPO_NODE__URL`, `APP__INFRA__SPO_NODE__BLOCKFROST_ID`). The
proof server image is distroless — no shell, so healthcheck it by probing `GET /version`, not by
`exec`. Preprod faucet: `https://midnight-tmnight-preprod.nethermind.dev/`. **[V]**

#### 5.11.8 Known live bugs that will bite

- **WASM dual-instantiation** (`midnight-js#1052`, `midnight-ledger#644`, both open). Two copies of a
  WASM module in `node_modules` make `instanceof` silently false, producing
  `ContractRuntimeError: expected instance of ChargedState`. **CLI and e2e tests pass; only the
  browser fails** — so it will surface late, during integration, looking like a frontend bug. The
  only official fix is Vite-specific:
  `resolve.dedupe: ['@midnight-ntwrk/compact-runtime', '@midnight-ntwrk/onchain-runtime-v3']`.
  Role 03 applies it pre-emptively.
- `example-bboard`'s own `vite.config.ts` needs `target: 'esnext'`, `minify: false`, manual WASM
  chunking, `transformMixedEsModules`, a custom `resolveId` hook for `onchain-runtime-v3`, and the
  `vite-plugin-wasm` / `vite-plugin-top-level-await` / `vite-plugin-node-polyfills` trio. Role 03
  starts from that config rather than an empty one.
- `example-counter` was **archived** August 2026. Use `example-bboard`, `midnight-leaderboard`, or
  `example-zkloan` as references.

#### 5.11.9 Explicitly unverified

- No published compactc ↔ midnight-js compatibility matrix exists. The 0.31.1 ↔ 4.1.1 ↔ runtime-0.16.0
  pairing is inferred from the example repos' pins plus the support matrix — consistent, never stated.
- Whether 0.34.0-compiled contracts work against midnight-js 4.1.1. Assume not.
- Whether the un-hyphenated `@midnightntwrk` npm scope is permanent.
- Whether `pad(32, s)` right-pads or left-pads — **Role 01 confirms empirically** (§5.2).
- Proof latency for eight in-circuit Schnorr verifications. **Nobody knows. This is the Day-1 spike
  and PRD §25's highest-impact technical risk.**

---

## 6 Design-system inventory

**Provenance warning:** unlike a normal inventory, this is not extracted from shipped HTML — no HTML
exists (§1.1). Every row below cites the PRD section it comes from. Rows marked **GAP** are things
the PRD's five pages demonstrably need but never specify; Role 04 must resolve each one **once**, in
`docs/design-system.md`, before building any page — not ad hoc per page.

### 6.1 Colour tokens — verbatim from PRD §16.1.1

| Token | Value | Use |
|---|---|---|
| `--bg` | `#000000` | Pure onyx black background canvas |
| `--text` | `#ffffff` | Primary crisp white copy, headlines, active counters |
| `--muted` | `#8e8e8e` | Subdued metadata, inactive links, metric labels |
| `--nav-text` | `#2e2e2e` | Deep charcoal typography on white pill surfaces |
| `--pill-dark` | `#28282a` | Dark gunmetal for secondary actions and avatar rings |
| `--sign-in-text` | `#c8c8c8` | High-legibility silver text on dark surfaces |
| `--nav-shadow` | `0 4px 14px rgba(0, 0, 0, 0.16)` | Soft diffused elevation on pills and badges |
| `--trust-bg` | `#28282a` | Outer avatar container and trust pill background |
| `--trust-border` | `rgba(255, 255, 255, 0.4)` | Translucent pill edge highlight |
| `--trust-text` | `#c4c2c3` | Refined silver for enterprise credentials |

The palette is **strictly monochrome**. Ten tokens, zero hues.

### 6.2 Typography — PRD §16.1.2

- **UI primary:** `Inter`, `"Segoe UI"`, `system-ui`, sans-serif. Weights 400, 500, 600. Navigation
  labels, body copy, metric numbers, button text, modal controls.
- **Display / retro glyphs:** `BubbledotICG-FinePos` (OnlineWebFonts CDN) → fallback
  `Geist Pixel Circle` (local WOFF2, **present at `docs/fonts/GeistPixel-Circle.woff2`**) → `monospace`.
  Hero headlines, metric icon glyphs (`<`, `%`, `*`, `#`), architectural ASCII accents.
- **Only specified size in the entire PRD:** hero display `clamp(28px, 6.2vw, 80px)` (§16.1.2).
- **Icons:** Font Awesome 6.5.2. PRD specifies Microsoft/Amazon/Google brand glyphs for the trust row
  — **overridden, see §6.8: real brand marks are cut, hard requirement.**

### 6.3 Spacing, radii, shadows, borders — what exists

| Property | Specified value | Source |
|---|---|---|
| Radius — pill | `999px` | §16.1.3 nav pill |
| Radius — mobile sheet | `28px` | §16.1.3 drawer |
| Shadow — elevation | `0 4px 14px rgba(0,0,0,0.16)` | `--nav-shadow` |
| Glow — CTA | `0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,255,255,0.32), 0 0 44px rgba(255,255,255,0.12)` | §16.1.3 |
| Border — translucent | `rgba(255,255,255,0.4)` | `--trust-border` |
| Trust avatar padding | `5px` | §16.1.3 |
| Nav dot indicator | `::after` with `box-shadow: -5px 0 0 #000, 5px 0 0 #000; bottom: 5px` | §16.1.3 |

No spacing scale is defined anywhere in the PRD. **GAP-1.**

### 6.4 Grid, containers, breakpoints

| Property | Value | Source |
|---|---|---|
| Root layout | `.page { display:flex; flex-direction:column; justify-content:space-between; height:100vh/100dvh; overflow:hidden; }` | §16.1.3 |
| Header container | `max-width: 720px`, centred row | §16.1.3 |
| Brand button | `clamp(40px, 4.4vw, 46px)`, circular, white, mark scaled 72% | §16.1.3 |
| Nav pill height | `44px`–`48px` | §16.1.3 |
| Trust avatar size | `--trust-size: clamp(36px, 4.5vw, 42px)`, overlap `-0.42 × trust-size` | §16.1.3 |
| Hamburger | `48 × 48px`, X transform `translateY(±6.5px) rotate(±45deg)` | §16.1.3 |
| Mobile breakpoint | `≤ 720px` — **the only breakpoint in the PRD** | §16.1.3 |
| Drawer backdrop | `rgba(0,0,0,0.62)` + `blur(6px)` | §16.1.3 |
| Background canvas | `position: absolute; inset: 0; pointer-events: none; z-index: 0` | §16.2.1 |
| Minimum supported | 1280 × 720 and common laptop widths | §19 |

**The single-viewport, `overflow: hidden` constraint (§16.1) is the hardest thing in this design
system**, because Page 1 (Facility Setup) has ten input fields and Page 2 has eight table rows, and
both must fit 720px of height without a scrollbar. Role 04 resolves this as a system decision, once.
**GAP-2.**

### 6.5 Component vocabulary

Specified in §16.1.3 and the page sections:

- Circular brand button with centred geometric mark
- Elongated white nav pill with three-dot active indicator
- Dark pill button (secondary action)
- Overlapping circular avatar trust row feeding into a dark trust pill
- Glowing white CTA pill, black bold text, halo glow, `revealPulse` entry, hover scale
- 4-column tabular animated metric counters with dot-matrix glyph icons
- Mobile hamburger → X on white disc; glass backdrop; floating white sheet drawer with staggered links
- Full-bleed background canvas layer

Needed by §16.4–16.8 but **never specified**:

| Component | Needed by | |
|---|---|---|
| Text / number / hash input field | §16.4 (10 fields) | **GAP-3** |
| Data table / row list | §16.5 (8 rows), §16.8 (receipts log) | **GAP-4** |
| `Private` / `Public` data tag | §16.5, §16.6, FR 24 | **GAP-5** |
| Status badge — `Draw funded`, `Active`/`Frozen`/`Closed`, signature valid/invalid | §16.7, §16.8 | **GAP-6** |
| Multi-stage progress visualiser (4 stages) | §16.6, FR 25 | **GAP-7** |
| Error panel with category + recovery | §16.7, FR 26 | **GAP-8** |
| Balance / metric card | §16.7, §16.8 | **GAP-9** |
| Scenario selector (5 options) | §16.5 | **GAP-10** |

### 6.6 Interaction and state patterns

| State | Specified? | |
|---|---|---|
| Hover | Trust avatars lift `-2px`, `-4px`, `-2px`; CTA scales | §16.1.3 |
| Entry animation | `revealPulse` (CTA), `slideDown`, `headlineFade` | §13.3 |
| Counters | `easeOutCubic`, duration `1500 + i×80ms`, stagger `480 + i×90ms`, IntersectionObserver at `0.25`, evaluated once | §16.1.3 |
| Page transition | `AsciiMorph` — 300ms scramble through `@ # * % & !` | §16.2.2 |
| Reduced motion | Animations halt; static high-contrast ASCII frame; solid typography | §16.2.3 |
| Focus | Required ("visible focus") but **no token or style given** | §19 — **GAP-11** |
| Disabled | Not specified | **GAP-12** |
| Loading | Only the 4-stage proof visualiser | **GAP-13** |
| Empty | Not specified (history with no draws) | **GAP-14** |
| Error / success colour | §16.7 mentions "red/amber" crosses; palette has **no** red or amber | **GAP-15** |

**GAP-15 is a design conflict, not an omission.** §16.1.1 is strictly monochrome; §16.7 and the ASCII
research call for red/amber failure states. PM ruling: introduce **exactly two** semantic hues, define
them as tokens, use them only for outcome states (funded / rejected) and never for chrome, and — per
§19 "non-color-only status" — always pair them with a glyph and a text label so the state survives
being read in greyscale.

### 6.7 Page structure and shared chrome

| Page | User | Purpose | ASCII theme (§16.2, research §3) |
|---|---|---|---|
| Landing | Public | Value prop, trust, metrics, CTA | Animated CSS/canvas background, neural-field register (no video asset — decided at gate, see §6.8) |
| 1 Facility Setup | Lender | Policy + vault funding | The Cryptographic Vault — isometric rotating safe, dials |
| 2 Private Collateral | Borrower | Credential import, privacy boundary | The Confidential Matrix Stream — cascading tape + nullifier masks |
| 3 Draw Request | Borrower | Amount, disclosure preview, proving | The ZK Circuit Synthesizer — circuit lattice, convergence pulse |
| 4 Draw Result | Both | Enforced settlement or rejection | Atomic Settlement & Token Beam — particle fountain, balance scale |
| 5 Facility History | Lender | Status, balances, receipts | Merkle DAG & Block Lattice — drifting linked blocks |

Shared chrome on every page: background canvas at `z-index: 0`, header row (brand + nav pill +
action pill) within `max-width: 720px`, `.page` flex column pinned to the viewport.

Per-page ASCII glyph sets and motion are specified in `docs/ASCII-ART-RESEARCH.md` §3.1–3.5 and are
binding on Role 04.

### 6.8 Landing page content — DECIDED AT THE APPROVAL GATE, supersedes PRD §16.3's literal copy

PRD §16.3 specifies generic AI-product boilerplate (`Intelligence` / `Designed To Evolve`, a
Microsoft/Amazon/Google trust badge, and four metrics — `< 120ms` Inference Time, `% 99.99%` Platform
Uptime, `* 24/7` Autonomous Runtime, `# 2.4M` Context Windows — unrelated to anything Phrim does).
**The PM flagged this at the approval gate and the answer is: do not build it as written.** The
*structure* of §16.3 (header, two-line dot-matrix headline, subhead, glowing CTA, trust row, 4-metric
footer) stays. The *content* is replaced, on two specific rulings:

**Ruling 1 — copy.** Write Phrim-specific landing copy from the PRD's own pitch, not invented
marketing language. Sources, in priority order:

- **Headline** — draw from PRD §2's one-line pitch: *"Phrim lets fintech borrowers unlock
  asset-backed credit by proving their receivables satisfy lender rules without exposing the loan
  tape, using Midnight to turn a private proof directly into an enforceable draw."* Compress this into
  a two-line dot-matrix headline. It must name what Phrim actually does — private proof, enforceable
  draw — not evoke a generic AI product. Example direction (Role 04 owns the exact wording, this is
  not a prescribed string): line 1 states the mechanism (private proof of eligible collateral), line 2
  states the outcome (funds released, nothing else disclosed). Do not use "Intelligence" or "Designed
  To Evolve" or any paraphrase of them.
- **Subhead** — a compressed version of PRD §1's Executive Decision framing: *"A valid private
  collateral proof releases a draw. An invalid, stale, tampered, or replayed proof cannot move funds
  or change facility state."* This sentence (or a tight edit of it) is strong, accurate, and already
  written — prefer reusing it closely over inventing new language.
- **CTA label** — `Get Started` may stay; it is generic enough to be accurate and does not misrepresent
  anything. Route it into the app (`/facility`, PRD §9.1 step 1).
- **Four-metric footer** — replace the AI-product metrics with ones Phrim can actually substantiate,
  reframing the same visual pattern (glyph + number + label) around figures traceable to the PRD: the
  demo's own numbers are legitimate content here — e.g. draw amount `$75,000`, advance rate `80%`,
  collateral pool `8` credentials, or a measured proof-latency figure once Role 01 reports one (§25,
  §19). Do not claim uptime, inference time, or context-window figures Phrim has no basis for. Each
  metric must be something a judge could ask "how do you know that" about and get a real answer.

**Ruling 2 — no real trademarks, hard requirement.** The Microsoft/Amazon/Google trust badge is
**removed entirely.** Shipping real company logos in a hackathon demo implies a partnership or
customer relationship that does not exist, and it is not a style call — it does not ship. Role 04
either:

- cuts the trust row section outright, letting the header/headline/CTA/metrics carry the page; or
- replaces it with a **generic, non-trademarked** trust indicator — no logos, no named companies. Any
  copy here must be honest about the project's actual stage: language like "Built for regulated
  capital markets" or "Designed for asset-backed credit facilities" is acceptable because it describes
  a target market, not a false claim of adoption. Language implying existing customers, users, or
  enterprise adoption is not acceptable — Phrim is a hackathon MVP (PRD §5.2 non-goals; §29 Definition
  of Done requires the pitch to state limitations "without exaggeration").

Role 04 picks one of the two options above and records the choice and its exact copy in
`docs/design-system.md` (§6.8 addendum). The three-avatar overlapping-circle *component* from
§16.1.3 may be reused visually with neutral placeholder marks if Role 04 keeps the trust row; it must
not be reused with brand marks.

---

## 7 Shared conventions (binding on all roles)

- **English everywhere** — identifiers, strings, docs, commit messages, replies.
- **No comments in code.** Not block, not line, not JSDoc, in any language, including `.compact`,
  `.css` and `.glsl`. Explanations belong in the role's markdown deliverable. The only exception is
  scaffolding the user has explicitly called temporary, which gets exactly one line:
  `// TEMPORARY — <what it is>; delete with <what to remove>`.
- **TypeScript strict.** No `any`, no `@ts-ignore`, no `!` used to silence a genuine nullable.
  `strict: true`, `noUncheckedIndexedAccess: true` in `tsconfig.base.json`.
- **No new dependency without asking the PM.** Check what the workspace already has first. PRD §18.1
  requires a fixed dependency set compatible with the selected Midnight compiler and SDK versions.
- **Pin every version.** No `^`, no `~`, in any `package.json` (PRD §19 reproducibility).
- **Every animation respects `prefers-reduced-motion`** (PRD §16.2.3).
- **Never read, write, or echo `.env*` files or secrets.**
- **Never run `git commit`, `git push`, or any destructive git command.** Never `git add -A` or
  `git add .`.
- **Money is integer minor units, everywhere, always.** No floats, no division in the circuit
  (PRD §14.3).
- When blocked, **report to the PM** with the specific blocker. Do not widen your scope into another
  role's directory to unblock yourself.

---

## 8 Working schedule and priority discipline

**Confirmed at the approval gate:** no external deadline was given, so PRD §24's ten-day delivery
plan is the working schedule for sequencing and pacing purposes, mapped onto the four-role structure
here rather than the PRD's day-by-day solo/small-team breakdown:

| PRD §24 days | Maps onto |
|---|---|
| Day 1 | Role 01 R2 spike + Schema Lock; Role 01 R2a pure circuits; Role 04 starts `landing/` and `docs/design-system.md` (zero dependencies) |
| Days 2–4 | Role 01 facility state + eligibility circuit + eight-slot batch; Role 02 schema/signer/fixtures against the Schema Lock; Role 03 app scaffold + view-models (unblocks Role 04's views) |
| Day 5 | Role 01 settlement (mUSD transfer); Role 02 attestation service complete; Role 03 wiring begins |
| Day 6 | Role 02's five scenarios fully reproducible; Role 01's golden-vector test green |
| Days 7–8 | Role 03 borrower + lender UI wiring; Role 04 views complete against real data |
| Day 9 | Integration: happy path + four failures end to end, five consecutive rehearsals |
| Day 10 | Preprod deployment, README, demo rehearsal, PM final review |

PRD §8.1 Tier 1 and §24.1's cut order remain the schedule's safety valve. If a role runs short on
time it cuts from the bottom of this list, and reports the cut:

1. Facility history polish
2. Attestor rotation (`rotateAttestor`)
3. Freeze and close UI (keep circuit tests if already built)
4. Downloadable receipt

**Never cut, at any cost (§24.1):** the happy path, the tamper failure, the undercollateralisation
failure, the replay failure, and the atomic transfer.
