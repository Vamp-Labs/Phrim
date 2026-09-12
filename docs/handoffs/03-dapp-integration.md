# 03 — DApp Integration Engineer

**Read first:** `docs/handoffs/00-overview.md` §4 (file layout — the `ui/` ↔ `app/` boundary is
absolute), §5 (frozen contracts, especially §5.6 error tiers, §5.9 view-models, §5.10 privacy), §7.
Then PRD §9, §10.5, §13.3, §16.2.3, §19, §20.2.

You own everything the application *does*. Role 04 owns everything it *looks like*. You meet at the
view-model types in `00-overview.md` §5.9, which **you write**.

Your hardest constraint is not technical: PRD §18.2 is a pass/fail acceptance test that inspects
browser network requests and application logs for private credential values. Every architectural
decision you make is downstream of keeping credentials in the tab.

---

## Responsibilities

1. Scaffold the Vite + React 18 + TypeScript app and its five routes.
2. Define and export the view-model types in `packages/app/src/viewmodels/` so Role 04 can build
   against them on day one.
3. Wire Midnight: wallet connection, provider set, contract client, transaction submission.
4. Run witness generation and proof synthesis in a **dedicated Web Worker** so the ASCII canvas never
   drops frames (PRD §13.3, §16.2.3).
5. Implement the two-tier error model: local pre-flight prediction + circuit assertion parsing.
6. Implement the five-stage proof progress lifecycle and the local borrowing-base preview.
7. Wire Role 04's presentational views to real data, and prove the privacy invariant with a test.

---

## Scope

### In scope

- `packages/app/package.json`, `vite.config.ts`, `index.html`, `tsconfig.json`.
- `packages/app/src/main.tsx`.
- `packages/app/src/app/**` — exclusively yours: routes, containers, hooks, state, `midnight/`,
  `worker/`.
- `packages/app/src/viewmodels/**` — exclusively yours; Role 04 imports read-only.
- Local pre-flight validation against fetched public facility state and the used-nullifier set.
- Credential import from the attestation service, held in memory / encrypted local private state only.
- Scenario selection driving the attestation service (PRD §16.5).
- Preprod ↔ local-stack switching and the `NETWORK_UNAVAILABLE` path (PRD §8.2).
- Your README section: env-free configuration, running against Preprod vs local, and the demo runbook.

### Out of scope

- **Anything under `packages/app/src/ui/`.** Not a style fix, not a class name, not a one-line CSS
  tweak. If a view needs a change, tell Role 04.
- **`landing/`** — Role 04's static landing page.
- **`packages/contract/`, `packages/schema/`, `packages/attestation/`.** You consume all three.
- **Workspace root config.** Role 01 owns it.
- **Visual design decisions**: colours, spacing, typography, the ASCII background, animations,
  reduced-motion handling, focus styles. All Role 04.
- **The circuit's enforcement.** Your pre-flight is UX only and must never gate away a real rejection.
- Repository initialisation, commits, pushes.

---

## Objectives

1. A borrower can import a scenario, preview it locally, request a $75,000 draw, and see a funded
   result with a real transaction reference — end to end, five times (PRD §19, §20.3).
2. The four failure scenarios surface the correct category from PRD §17 with its verbatim message and
   recovery text, and state that nothing moved.
3. No private credential field appears in any network request other than the local worker handoff, in
   any log line, or in any URL (PRD §18.2, §20.2).
4. Proof generation never blocks the main thread; the background canvas keeps rendering.
5. A judge can independently inspect the contract address and transaction id from the result page
   (PRD FR 28).

---

## Requirements

### R1 — View-models first (do this before anything else; Role 04 is waiting)

Write `packages/app/src/viewmodels/` implementing `00-overview.md` §5.9 exactly — same names, same
fields. Export the types and a set of **mock instances** covering every state each view can be in:
idle, busy, each proof stage, funded, each of the eleven error codes, empty history.

Publish this to Role 04 as soon as it compiles. Role 04 builds every view against these mocks and has
no other dependency on you; the longer this takes, the longer Role 04 is blocked.

Field-level rules that are not negotiable:

- **Every monetary value is a decimal `string` in minor units.** `Uint<128>` exceeds
  `Number.MAX_SAFE_INTEGER`; a `number` here is a correctness bug that will not show up until a large
  value does. Convert with `bigint` internally, stringify at the boundary.
- `CredentialRowVM` carries **masked** values (PRD §11.3, §16.5). You decide the masking policy;
  Role 04 renders whatever string you hand it and never sees a raw asset identifier.
- Adding a field later is fine. Renaming or removing one means telling Role 04 first.

### R2 — App scaffold

Vite 5 + React 18 + TypeScript strict. Five routes matching PRD §16.4–16.8:

| Route | Page | Primary user |
|---|---|---|
| `/facility` | 1 Facility Setup | Lender |
| `/collateral` | 2 Private Collateral | Borrower |
| `/draw` | 3 Draw Request | Borrower |
| `/result` | 4 Draw Result | Both |
| `/history` | 5 Facility History | Lender |

**Do not start from an empty `vite.config.ts`.** `00-overview.md` §5.11.8 records what
`example-bboard` actually needs, and you will need the same: `vite-plugin-wasm`,
`vite-plugin-top-level-await`, `vite-plugin-node-polyfills`, `target: 'esnext'`, `minify: false`,
manual WASM chunking, `transformMixedEsModules`, and a custom `resolveId` hook for
`onchain-runtime-v3`. Start from that config.

**Apply the WASM dedupe workaround pre-emptively:**

```
resolve: { dedupe: ['@midnight-ntwrk/compact-runtime', '@midnight-ntwrk/onchain-runtime-v3'] }
```

Two copies of a WASM module in `node_modules` make `instanceof` silently false and produce
`ContractRuntimeError: expected instance of ChargedState`. The failure mode that makes this worth
pre-empting: **CLI and e2e tests pass, only the browser fails** — so it surfaces late, during
integration, disguised as a frontend bug. Open upstream issues: `midnight-js#1052`,
`midnight-ledger#644`.

Cross-origin isolation headers in dev only if the toolchain actually requires them for
`SharedArrayBuffer` — determine from the SDK rather than adding speculatively.

The landing page is a **separate static artefact** at `landing/` (Role 04). Link to the app from it;
do not rebuild it in React.

### R3 — Midnight integration (`src/app/midnight/`)

**Pin the exact SDK version set in `00-overview.md` §5.11.6 — not `npm latest`.** Three of those pins
are traps that cost a day each: `@midnight-ntwrk/wallet-api` (which PRD §13.3 names) is **abandoned**
and superseded by `wallet-sdk-abstractions`; `wallet-sdk@1.2.0` exists but is **not tagged `latest`**;
and `compact-runtime` must be `0.16.0` even though `0.19.0` is latest.

**Provider set** (from the shipped `.d.ts`): `privateStateProvider`, `publicDataProvider`,
`zkConfigProvider`, `proofProvider`, `walletProvider`, `midnightProvider`, optional `loggerProvider`.
Note three API changes that every older tutorial gets wrong: `levelPrivateStateProvider` now
**requires** `privateStoragePasswordProvider` and `accountId`; `httpClientProofProvider` takes the
zkConfigProvider as its second argument; and `deployContract`'s key is `compiledContract`, not
`contract`.

**Wallet connection:** `@midnight-ntwrk/dapp-connector-api@4.0.1`. v4 **removed `enable()` and
`state()`** — the API is `window.midnight[key].connect(networkId)`, returning
`getUnshieldedBalances`, `getUnshieldedAddress`, `balanceUnsealedTransaction`, `submitTransaction`,
`getConfiguration`. Addresses are Bech32m. Phrim's mUSD is **unshielded**, so use the unshielded
balance and address calls, not the shielded ones.

Typed contract calls go through Role 01's `packages/contract` exports. Do not read Role 01's
`.compact` source; if the export you need is missing, ask Role 01 for it.

Circuits you call: `createFacility` and `fundOrMintDemoToken` from `/facility`; `requestDraw` from
`/draw`. P1 circuits (`freezeFacility`, `advanceEpoch`) only if Role 01 shipped them and Tier 1 is
complete.

Read public ledger state for facility policy, balances, receipts and the nullifier set — everything
`/history` and the pre-flight need (PRD §20.2: "Public ledger state refreshes after confirmation").

**Network selection:** `NetworkId` is **`type NetworkId = string`, not an enum** —
`setNetworkId(NetworkId.TestNet)` does not compile, and **there is no "testnet"**. Valid values are
`undeployed` | `preview` | `preprod` | `mainnet`. Use `setNetworkId('preprod')` by default and
`'undeployed'` for the local stack, switched by an explicit build-time or in-app toggle (PRD §8.2,
§28). Endpoints are in `00-overview.md` §5.11.7; the indexer path is **`/api/v4/graphql`** — `v1`/`v2`
in older tutorials are dead.

**The proof server is always local (`http://localhost:6300`), on every network including mainnet** —
there is no hosted proof server, because it handles private data. Worth surfacing in the UI: it is
independent corroboration of the PRD §18.2 privacy claim.

Never `.env` files — use a checked-in non-secret config module, or Vite's mode flags. Failure to reach
the network is `NETWORK_UNAVAILABLE`, with a retry that **cannot accidentally create a second
successful draw** (PRD §19 Recovery). Check for an existing confirmed transaction before resubmitting.

### R4 — The proving worker (`src/app/worker/`)

Witness construction and proof synthesis run in a dedicated Web Worker (PRD §13.3, §16.2.3). The main
thread never blocks. This is what keeps Role 04's 60fps canvas alive during a 60-second proof.

The worker boundary is the **only** place a raw credential value legitimately travels, and it travels
via `postMessage` within the same origin — it never leaves the browser. Structured-clone the batch in;
get back a proof artefact or a categorical failure out. **Never post a raw credential field back out
of the worker**, and never include one in a worker error message.

Post progress events back so the main thread can drive the stage machine in R6.

### R5 — Local pre-flight and borrowing-base preview (PRD §9.3 step 3, §16.5, FR 24)

Before proving, evaluate the selected batch against fetched public policy and the on-ledger nullifier
set. Derive nullifiers by calling Role 01's `assetNullifier` **pure circuit** through the
compiler-generated `pureCircuits` binding (re-exported by `packages/schema`) — never by
reimplementing the hash in TypeScript. A drifting reimplementation makes the pre-flight lie about
`ASSET_ALREADY_USED`, which is the one failure the demo most needs to get right. Compute: eligible total, supported draw amount
(`eligibleTotal × advanceRateBps / 10000`, computed in `bigint`), per-record signature status, and the
predicted error category.

Two labels are mandatory and their wording comes from the PRD:

- `Calculated locally; contract proof is authoritative` (PRD §16.5, verbatim).
- Every asset attribute tagged `Private`; the public disclosure set — facility id, epoch, requested
  amount — tagged as public (PRD FR 24, §16.5, §16.6).

The pre-flight is **UX only**. It must not be able to suppress a real circuit rejection. Do not
disable the submit button on a predicted failure in a way that prevents the demo from showing the
enforced rejection — the four failure scenarios have to reach the contract and come back rejected,
because that is the entire point of the product (PRD §4.2). Warn, do not block.

### R6 — Proof stage machine (PRD FR 25, §16.6)

`idle → preparing → proving → awaiting-wallet → submitting → confirmed | failed`, matching
`ProofStage` in `00-overview.md` §5.9 and the four visible stages in PRD §16.6 (witness preparation →
proving circuit → wallet signature → ledger confirmation). Drive `DrawRequestVM.stage`; Role 04
renders it. Log stage, duration and transaction id only (PRD §19 Observability).

### R7 — Error handling (`00-overview.md` §5.6)

Import the eleven-code union and the verbatim PRD §17 message/recovery table from
`packages/schema/src/errors.ts`. Do not rewrite the copy.

On circuit failure, parse Role 01's assertion message for the error code. If you cannot match one,
fall back to a generic categorical failure — **never** surface a raw assertion string, a stack trace,
or a witness value to the UI (PRD FR 26: errors "do not echo private values or secrets").

Populate `DrawResultVM.error` and, on the failure path, state explicitly that zero funds moved and
facility state is unmodified (PRD §16.7). Verify this from re-read ledger state rather than asserting
it blindly — it is the claim judges will test.

### R8 — Page wiring

| Page | What you provide |
|---|---|
| 1 Facility Setup | Ten policy input fields (PRD §16.4) as `PolicyFieldVM[]`, defaulted to `00-overview.md` §5.8, validated client-side, submitting `createFacility` + `fundOrMintDemoToken`. Show resulting vault balance. |
| 2 Private Collateral | Scenario selector hitting the attestation service; eight rows with per-record signature status; masked values; local preview; privacy tags. |
| 3 Draw Request | Amount input validated against remaining capacity; public-disclosure preview; private summary (count only); stage machine; safe error recovery. |
| 4 Draw Result | Funded: amount, prior vs new outstanding, available credit, borrower mUSD balance, nullifiers consumed, contract address, tx id, link to history. Rejected: category, zero-movement confirmation, recovery. |
| 5 Facility History | Status, vault/outstanding/capacity cards, chronological receipts. **Never any private asset row** (PRD §16.8). |

Credentials live in memory or encrypted local private state for the session only (PRD §9.2 step 4).
Not `localStorage` in plaintext, not a cookie, not a URL parameter.

### R9 — Privacy tests (PRD §18.2, §20.2 — these are acceptance gates, not nice-to-haves)

Write automated tests that assert:

1. A sentinel value placed in a credential field never appears in any captured `console.*` output.
2. No outbound request other than the attestation-service fetch and the local worker `postMessage`
   carries a credential field — assert by intercepting `fetch`/XHR during a full draw flow.
3. No credential field ever appears in a URL, query string or route parameter.
4. The borrower token balance increases by **exactly** the draw amount after a funded draw
   (PRD §20.2).
5. After a failed draw, re-read ledger state equals the pre-attempt state.

---

## Dependencies

| You need | From | Blocks |
|---|---|---|
| Workspace root, `tsconfig.base.json` | Role 01 | Package setup |
| `packages/contract` typed exports + deployed address | Role 01 | R3, R6, R7 wiring |
| Rehearsal reset procedure | Role 01 | The demo runbook |
| `packages/schema` (canonical, nullifier, errors, types) | Role 02 | R5, R7 |
| Running attestation service + five scenarios | Role 02 | R8 page 2 |
| Presentational views | Role 04 | Final wiring only |

**You are not blocked at start.** R1 (view-models), R2 (scaffold) and the worker skeleton proceed
immediately. Ship R1 first — Role 04 is waiting on it.

---

## Constraints

- All shared conventions in `00-overview.md` §7 — **no comments in code**, **no `any`**, no
  `@ts-ignore`, no `!` silencing a real nullable.
- **Never touch `packages/app/src/ui/` or `landing/`.**
- **Never read, write or echo `.env*` files.** Network configuration is non-secret and checked in.
- Money is `bigint` internally and a decimal `string` at every boundary. No `number`, ever, for an
  amount.
- No private credential value in a log, a URL, an analytics call, an error message, or any network
  request outside the worker handoff.
- Retry must be idempotent with respect to draws (PRD §19 Recovery).
- Ask the PM before adding any dependency. Exact pinned versions — **the set in `00-overview.md`
  §5.11.6, including the `overrides`/`resolutions` block**, which is not optional.
- No `git init`, no commits, no pushes.

---

## Deliverables

1. `packages/app/` scaffold: `package.json`, `vite.config.ts`, `index.html`, `tsconfig.json`,
   `src/main.tsx`.
2. `packages/app/src/viewmodels/` — the §5.9 types plus mocks for every state. **Delivered first.**
3. `packages/app/src/app/midnight/` — wallet, providers, contract client, network switching.
4. `packages/app/src/app/worker/` — the proving worker and its typed message protocol.
5. `packages/app/src/app/routes/` — five route containers wired to Role 04's views.
6. Local pre-flight + borrowing-base preview + two-tier error mapping.
7. The five privacy/integration tests in R9.
8. Your README section: run against Preprod, run against local, the demo runbook in PRD §21 order,
   and what to do when the network is unavailable.
9. A written report to the PM: the masking policy you chose; whether the nullifier derivation is
   reproducible off-chain for pre-flight (and what you did if not); measured end-to-end draw latency;
   and anything in the PRD you found under-specified.

---

## Acceptance criteria

1. `pnpm --filter app build` and `pnpm --filter app typecheck` succeed with `strict: true`.
2. `grep -rn ": any\|as any\|@ts-ignore" packages/app/src/app packages/app/src/viewmodels` returns
   nothing.
3. No file you own contains a code comment.
4. `git status` / file listing shows **zero** changes by you under `packages/app/src/ui/` or
   `landing/`.
5. All five routes render and navigate without console errors.
6. `viewmodels/` exports every type in `00-overview.md` §5.9 with the specified field names, and mocks
   exist for every `ProofStage` value and all eleven error codes.
7. Every monetary field in `viewmodels/` is typed `string`, not `number`.
8. The happy path funds `7500000` minor units and `/result` shows the contract address and a
   transaction id a judge can open independently.
9. Each of the four failure scenarios surfaces its correct PRD §17 code with the **verbatim** message
   and recovery text, and displays the zero-movement confirmation.
10. After each failure, re-read ledger state equals pre-attempt state — asserted by the R9 test, not
    by the UI's claim.
11. The borrower mUSD balance increases by exactly the draw amount — asserted by the R9 test.
12. The sentinel test passes: no credential value in captured console output.
13. The network-interception test passes: no credential field in any request outside the attestation
    fetch and the worker handoff.
14. No credential field appears in any URL or route parameter.
15. Proof generation runs in a Web Worker — verifiable in devtools, and the main thread stays
    responsive for the duration.
16. The four proof stages from PRD §16.6 are individually observable during a real draw.
17. `Calculated locally; contract proof is authoritative` appears verbatim on the collateral page.
18. Every asset attribute on the collateral page is tagged `Private`; facility id, epoch and requested
    amount are tagged public on the draw page.
19. `/history` contains no asset-level row under any state.
20. Disconnecting the network yields `NETWORK_UNAVAILABLE` and retrying after reconnection does not
    produce a second draw.
21. The happy path runs five consecutive times using Role 01's reset procedure without manual repair.
22. Every dependency is an exact pinned version.
