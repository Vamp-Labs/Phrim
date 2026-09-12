# packages/app

Vite + React 18 + TypeScript borrower/lender web app (PRD §13.3, §16). Owned by Role 03. Everything
under `src/app/`, `src/viewmodels/`, and this package's own config files is this role's; `src/ui/` and
`landing/` belong exclusively to Role 04.

## Install and run

```
pnpm install                       # from the workspace root
pnpm --filter @phrim/app run dev
pnpm --filter @phrim/app run build   # currently blocked, see "Known build blocker" below
pnpm --filter @phrim/app run typecheck
pnpm --filter @phrim/app run test
```

`dev` serves on `http://localhost:5173` (Vite's default), matching the attestation service's CORS
allowlist.

## No `.env` files — configuration is a checked-in module

Per `00-overview.md` §7, this package never reads, writes, or echoes `.env*` files. Every network
endpoint is a plain exported constant:

- `src/app/midnight/network.ts` — Midnight node/indexer/proof-server endpoints for `undeployed`
  (local stack) and `preprod`.
- `src/app/midnight/attestationConfig.ts` — the attestation service base URL
  (`http://127.0.0.1:4300`, matching `packages/attestation`'s default).
- `src/app/midnight/contractAddress.ts` — the deployed Phrim contract address per network. **Both
  entries are `null` today** because there is no live deployment (see Status). This file is the single
  place a real address gets added once Role 01 deploys — never fabricate one here.

None of these values are secret. Switching network is a one-line edit to the call site that reads
`PHRIM_NETWORK_IDS` (or a future in-app toggle, PRD §8.2, §28) — never an environment variable.

## Running against Preprod vs. the local stack

| | `undeployed` (local) | `preprod` |
|---|---|---|
| Node RPC | `http://localhost:9944` | `https://rpc.preprod.midnight.network` |
| Indexer | `http://localhost:8088/api/v4/graphql` | `https://indexer.preprod.midnight.network/api/v4/graphql` |
| Proof server | `http://localhost:6300` on **both** — there is no hosted proof server, because it handles private data. |
| ZK artifacts | `/zk-config/{keys,zkir}/<circuitId>.{prover,verifier,bzkir}`, served by this app itself straight out of `packages/contract/managed/phrim` (dev middleware + a build-time copy in `vite.config.ts`) — no separate CDN or asset step needed. |

The local stack is `midnightntwrk/midnight-local-dev` (`npm install && npm start`); see
`00-overview.md` §5.11.7 for image tags and known indexer boot quirks. Preprod needs a funded wallet
from `https://midnight-tmnight-preprod.nethermind.dev/`.

## Demo runbook (PRD §21 order)

1. **Facility Setup** (`/facility`) — lender connects a wallet, creates `FACILITY_DEMO_001`, sets the
   ten policy fields, funds the vault. *(Submit is wired to the real `getConfiguredContractAddress`
   check; with no address configured it surfaces `submitState: 'error'` rather than pretending to
   succeed — see Status.)*
2. **Private Collateral** (`/collateral`) — select the `eligible` scenario. Eight rows import from the
   attestation service, masked, with `Calculated locally; contract proof is authoritative` shown above
   the local preview.
3. **Draw Request** (`/draw`) — enter `7500000` ($75,000), review the public-disclosure preview, submit.
   *(Submit is wired to `isDrawFlowAvailable`/`runDrawFlow`; with no address configured it surfaces
   `NETWORK_UNAVAILABLE` rather than pretending to prove and settle — see Status.)*
4. **Draw Result** (`/result`) — confirm `Draw funded`, the balance deltas, and the contract
   address/tx id a judge can open independently.
5. Switch to the `undercollateralized` scenario on `/collateral`, repeat 3–4, confirm
   `INSUFFICIENT_COLLATERAL` and the zero-movement statement.
6. Re-submit the original `eligible` batch, confirm `ASSET_ALREADY_USED`.
7. **Facility History** (`/history`) — confirm the receipts log and the total absence of any
   asset-level row.

Run the happy path five consecutive times using Role 01's documented reset procedure before treating
the demo as rehearsed (PRD §19, §20.3).

## `NETWORK_UNAVAILABLE`

Any provider call that cannot reach the configured node, indexer, attestation service, **or a
configured contract address** surfaces the `NETWORK_UNAVAILABLE` categorical error (`packages/schema`'s
error table) — never a raw fetch error or stack trace. `src/app/state/drawFlow.ts`'s
`isDrawFlowAvailable`/`runDrawFlow` check `contractAddress.ts` before touching the network at all, so
"no contract deployed yet" and "the network is unreachable" both resolve to the same honest, safe
state instead of a stuck spinner or a fabricated result. Once a real address exists, the retry path
still needs Role 01/Role 02's help to re-read ledger state for an already-confirmed transaction before
resubmitting, so a network hiccup cannot produce a second successful draw (PRD §19 Recovery) — the
idempotency check itself is not implemented yet, only the safe-refusal path is.

## Status — what is wired and what is blocked

`packages/contract/src/index.ts` now exports the real compiled contract (Role 01 shipped it: typed
circuits, `pureCircuits`, `extractPhrimErrorCode`, `buildCredentialSlots`). Everything below that only
needed those typed exports is now real, type-checked against them, and not guessed:

- `src/app/midnight/providers.ts` — two provider sets built from the real SDK functions: a full
  main-thread set (`buildPhrimMainThreadProviders`, with the live wallet's `balanceTx`/`submitTx`) and
  a restricted worker-safe set (`buildPhrimProvingProviders`, whose `walletProvider` only exposes
  already-fetched public keys — see "The worker/wallet split" below).
- `src/app/midnight/contractClient.ts` — `connectToDeployedPhrimContract` (`findDeployedContract`) and
  `readPhrimLedgerState` (`publicDataProvider.queryContractState` → `phrimLedger`), both real, both
  callable the moment a contract address exists.
- `src/app/worker/circuitBinding.ts` — `synthesizeDrawProof` now really calls
  `createUnprovenCallTx({ circuitId: 'requestDraw', ... })` then `proofProvider.proveTx(...)` inside the
  worker, converting `WitnessCredentialSlot[]` to real `AssetCredential[]` via `buildCredentialSlots`.
  Only the resulting **proven** transaction (safe by the ZK property — a proof reveals nothing about
  the witnesses) crosses back out to the main thread; the raw credentials never do.
- `src/app/worker/proving.worker.ts` — failures are now categorized with the real
  `extractPhrimErrorCode`, never a raw assertion string.
- `src/app/preflight/nullifier.ts` — `bindRealAssetNullifierCircuit()` binds `packages/schema`'s
  `computeAssetNullifier` to Role 01's real `phrimPureCircuits.assetNullifier`. `ASSET_ALREADY_USED`
  prediction in the local pre-flight is no longer structurally-blocked; it is real, byte-identical to
  the circuit's own hash, once this is called at startup.
- `src/app/state/drawStageMachine.ts` / `drawFlow.ts` — the five-stage reducer plus the real
  orchestrator (`runDrawFlow`): checks the contract address, spawns the worker, drives the wallet
  balance/submit calls, and derives the transaction id from the real `Transaction.identifiers()` — not
  a substring of a hex string.
- `/facility` and `/draw`'s submit buttons call the real availability checks
  (`getConfiguredContractAddress` / `isDrawFlowAvailable`) and surface the correct blocked state.

**Still blocked purely on there being no deployed contract address** (Role 01 could not fabricate one
without a funded wallet, and neither will this package):

- The actual `createFacility` / `fundOrMintDemoToken` / `requestDraw` calls never run — `onSubmit` on
  both pages exits at the address check. The `TEMPORARY` markers in `FacilitySetupRoute.tsx` and
  `DrawRequestRoute.tsx` note the next step once an address exists: wire a live `ConnectedWallet` into
  the same code paths (`connectWallet` from `walletConnector.ts` already does the hard part).
- `/result` and `/history` still render Role 04's real views against mock data — there is no ledger to
  read.
- End-to-end proof latency, in-worker proving against a real proof server, and the worker/wallet split
  described below are all type-correct and structurally wired but **not runtime-verified**: this
  sandbox has no browser with a Midnight wallet extension, no deployed contract, and jsdom (used by the
  test suite) has neither a real Worker global nor a real IndexedDB, so none of it can be exercised by
  an automated test here. Role 01's own measurement (`docs/handoffs/SCHEMA-LOCK.md` §4: ~2–2.5s for 8
  in-circuit Schnorr verifications against a real proof server) is the only real number in the loop so
  far.

### The worker/wallet split (why proving happens off-thread but signing doesn't)

`midnight-js-contracts`'s all-in-one `submitCallTx`/`FoundContract.callTx.requestDraw(...)` needs a
live `WalletProvider`/`MidnightProvider`, and those ultimately call `window.midnight[...]` — which does
not exist inside a Web Worker (no `window`). So the draw flow is split at the one point the SDK itself
already splits it:

1. **Worker** — `createUnprovenCallTx(...)` (needs only `zkConfigProvider`, `publicDataProvider`, and a
   wallet's *public keys*, all already available) followed by `proofProvider.proveTx(...)`. This is the
   expensive part (PRD's "witness preparation" + "proving circuit" stages) and it runs entirely off the
   main thread, so Role 04's ASCII canvas never drops a frame.
2. **Main thread** — the worker posts back only the serialized, already-proven-but-unbalanced
   transaction. The main thread calls the live wallet's `balanceUnsealedTransaction` (PRD's "wallet
   signature" stage) then `submitTransaction` (PRD's "ledger confirmation" stage).

## A build note for whoever owns `pnpm-workspace.yaml` (Role 01)

**This is now a hard blocker for `pnpm --filter @phrim/app run build`, not an edge case** — as soon as
any code path imports the Web Worker (`src/app/state/drawFlow.ts` does, and it is reachable from
`/draw`), Vite's worker-bundling pipeline runs `vite-plugin-top-level-await`, which fails with
`[vite-plugin-top-level-await] missing field 'type'` because two versions of `@swc/core` are present in
the tree (confirmed: `node_modules/.pnpm/@swc+core@1.16.2` and `@swc+core@1.7.42` both exist
side by side). `typecheck` and `test` are unaffected — this is a Rollup/build-time-only failure.

The root `pnpm-workspace.yaml` needs:

```yaml
overrides:
  "@midnight-ntwrk/ledger-v8": "8.1.0"
  "@midnight-ntwrk/onchain-runtime-v3": "3.0.0"
  "@midnight-ntwrk/wallet-sdk": "1.2.0"
  "smoldot": "npm:empty-npm-package@1.0.0"
  "@swc/core": "1.7.42"
```

The first four are the pinned set `00-overview.md` §5.11.6 already specifies (pnpm 11 does not honour a
package-level `package.json`'s `overrides`/`resolutions` — this package's `package.json` still carries
both keys per that section's literal instruction, but they currently have no effect on installation).
`@swc/core` is an addition found while verifying the WASM build end to end: `vite-plugin-top-level-await`
depends on `^1.12.14`, which resolves to different concrete versions for different installs in the same
tree — the same class of dual-instantiation hazard as `midnight-js#1052`, one plugin dependency over.

**Verification note:** adding the override to `pnpm-workspace.yaml` alone did not change the resolved
versions in this workspace on the first try — `pnpm install --no-frozen-lockfile` and even
`pnpm install --force` both reported "Already up to date" and left both `@swc/core` versions in
`node_modules/.pnpm`. Whoever applies this fix should confirm it actually took effect
(`find node_modules/.pnpm -maxdepth 1 -iname '*swc+core@*'` should show exactly one version) and be
prepared to delete `pnpm-lock.yaml` and reinstall from scratch if it does not — this workspace now also
carries a reported cyclic dependency between `packages/contract` and `packages/schema`, which may be
interacting with pnpm's override resolution.
