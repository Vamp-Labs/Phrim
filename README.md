# Phrim

Privacy-preserving borrowing-base draw gate for asset-backed credit facilities, built on Midnight.

See `docs/Phrim-PRD.md` for the product specification and `docs/handoffs/` for the frozen cross-role
engineering contracts. `docs/handoffs/SCHEMA-LOCK.md` records the verified signature primitive, byte
layout, and measured proof latency behind the contract in this repository.

## Prerequisites

| Tool | Required version | Notes |
|---|---|---|
| Node.js | `20.18.1` | pinned in `.nvmrc` |
| pnpm | `11.4.0` | pinned in `package.json#packageManager` |
| Compact devtools | `0.5.2` (or later) | installs and pins the compiler below |
| Compact compiler (`compactc`) | `0.31.1` | **not** the `compact` devtools CLI version; see below |
| Docker | any recent version | for the local proof server, and optionally the local node/indexer |

### Installing the Compact compiler

```
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
compact update 0.31.1
compact compile --version   # must print 0.31.1
```

Confirmed against this exact install: `--language-version` prints `0.23.0`, `--runtime-version` prints
`0.16.0`, `--ledger-version` prints `ledger-8.0.2`. Do not use `compact update latest` — 0.34.0 targets
ledger 9, which is not deployed on any live Midnight network (see `docs/handoffs/00-overview.md` §5.11.1).

### Local proof server

Every network (including Preprod) proves locally — there is no hosted proof server, by design, because
proving touches private witness data.

```
docker run -d --name phrim-proof-server -p 6300:6300 midnightntwrk/proof-server:8.1.0
curl http://localhost:6300/version   # must print 8.1.0
```

The first run downloads public SRS parameters from `https://srs.midnight.network/` on first use; this
is expected and does not require any additional configuration.

## Install

```
pnpm install
```

## Build

```
pnpm --filter @phrim/contract run compile   # compactc → packages/contract/managed/phrim (gitignored)
pnpm -r run build
```

The Compact compile step regenerates real ZK proving keys and takes roughly 2.5 minutes on a modern
laptop (measured: AMD Ryzen 5 5500U, 6C/12T — 2m23s for all six exported circuits, dominated by
`requestDraw`'s eight in-circuit Schnorr verifications). Use `compact compile --skip-zk src/phrim.compact
managed/phrim` for fast iteration on TypeScript-facing changes only; it skips proving-key generation
and is not sufficient for deployment or for measuring real proof latency.

## Test

```
pnpm -r run test
```

`packages/contract`'s suite (`packages/contract/test/phrim.test.ts`) covers all 21 PRD §20.1 cases plus
golden-vector, boundary-pair, and state-invariance checks, using an in-process circuit simulator
(`packages/contract/test/support/simulator.ts`, modeled on the official `example-bboard` test pattern)
against the real compiled contract — no network required. **One documented limitation:** this simulator
executes circuits via `@midnight-ntwrk/compact-runtime` directly, which does not apply the kernel-level
bookkeeping that unshielded-token operations (`mintUnshieldedToken` / `unshieldedBalance` /
`unshieldedBalanceGte`) require — that bookkeeping is only performed when a real Midnight node processes
a submitted transaction. Concretely: `fundOrMintDemoToken` runs correctly and without error in the
simulator, but a subsequent `vaultBalance()` read in the same simulator instance always returns `0`,
regardless of how much was funded. Tests that need a *successful* draw are written to assert that the
request clears every other Stage 1–3 check and is rejected only by `VAULT_INSUFFICIENT` — proving
signature verification, policy thresholds, authorization, replay/duplicate detection, and the
advance-rate calculation are all correct — and separately assert that state is unchanged, which is
still true for that rejection. The one exception is the true cross-transaction replay case (submit the
same funded batch twice): because a first draw can never actually complete under this limitation, the
test verifies the underlying `assetNullifier` mechanism is deterministic instead. **Full end-to-end
verification of a successful draw, funded from vault to borrower wallet, and of true cross-transaction
replay rejection, requires a live network** (local `undeployed` node + indexer, or Preprod) and was not
performed in this environment — see "Known limitations" below.

## Local network (optional, for full integration testing)

Local stack images: `midnightntwrk/midnight-node:1.0.0`, `midnightntwrk/indexer-standalone:4.3.3`,
`midnightntwrk/proof-server:8.1.0` (already covered above). Node RPC defaults to
`ws://localhost:9944`, indexer to `http://localhost:8088/api/v4/graphql`. The Docker org is
`midnightntwrk` (no hyphen) — `midnightnetwork/*` images from older tutorials are stale.

## Deploy

A real wallet-wiring module is provided at `.keys/wallet-wiring.mjs` (gitignored). It builds a real
`walletProvider` / `midnightProvider` pair from a seed phrase using the actual installed
`@midnight-ntwrk/wallet-sdk-*` packages — nothing fabricated, no mocked signing. It never logs, prints,
or otherwise echoes the seed.

**1. Put the deployer's mnemonic in `.keys/deployer-seed.txt`** (gitignored) — create this file
yourself; nothing in this repository creates, reads a default, or ships a placeholder for it:

```
your twenty four (or twelve) word mnemonic phrase goes on this single line
```

**Format required:** a standard **BIP-39 mnemonic phrase** (the format Lace and the Preprod faucet
wallet both use — 12 or 24 words, space-separated), on one line, nothing else in the file. This is
**not** a raw hex seed and **not** a private key — it is the recovery phrase itself.
`wallet-wiring.mjs` converts it to the SDK's key material via the standard BIP-39 seed derivation
(`@scure/bip39`'s `mnemonicToSeedSync`) followed by Midnight's own HD role-based derivation
(`@midnight-ntwrk/wallet-sdk-hd`'s `HDWallet`, account `0`, key index `0`, one derivation per wallet
role — Night/unshielded, Zswap/shielded, Dust) — the same derivation path a Midnight wallet is expected
to use, not an invented one.

**2. Set the remaining environment variables and run:**

```
export PHRIM_ACCOUNT_ID=<deployer wallet address, e.g. from Lace>
export PHRIM_PRIVATE_STORAGE_PASSWORD=<a strong local secret, never committed>
export PHRIM_WALLET_MODULE=/absolute/path/to/Phrim/.keys/wallet-wiring.mjs
export PHRIM_NETWORK_ID=preprod   # or 'undeployed' for the local stack
pnpm --filter @phrim/contract run deploy
```

`PHRIM_ACCOUNT_ID` is only a local storage-scoping key for the private-state provider (per
`@midnight-ntwrk/midnight-js-level-private-state-provider`'s `accountId` field) — it does not need to be
cryptographically derived from the seed, but using the deployer's own address keeps it meaningful.
`wallet-wiring.mjs` reads `PHRIM_NETWORK_ID` (default `preprod`) itself and derives the matching indexer
and node RPC URLs from it automatically (override with `PHRIM_INDEXER_URL`, `PHRIM_INDEXER_WS_URL`,
`PHRIM_NODE_RPC_URL` if needed). It also reads `PHRIM_PROOF_SERVER_URL` (default `http://localhost:6300`)
for the wallet's own proving service — the same variable and default `scripts/deploy.ts` already uses
for the `zkConfigProvider`/`proofProvider` pair, so one proof server serves both.

`scripts/deploy.ts` never fabricates, generates, or stores a wallet seed — `PHRIM_WALLET_MODULE` must
point at a module exporting `walletProvider` and `midnightProvider` (the exact
`@midnight-ntwrk/midnight-js-types` `WalletProvider` / `MidnightProvider` interfaces `deploy.ts`
imports). On success it prints the deployed contract address, transaction id, transaction hash, and
block hash as JSON. Local private state and the deployment's signing key are persisted to a LevelDB
database at `.keys/midnight-level-db/` (override the location with `PHRIM_PRIVATE_STATE_DB`).

**Confidence note on `wallet-wiring.mjs`:** this module has now completed multiple real, funded
Preprod deployments end to end (proving, balancing, submission, and on-chain finalization) — see
"Contract address and known-good transaction" below. Two real defects were found and fixed along the
way, both worth knowing if you hit them again:

- **`relayURL` needs the `wss://` scheme, not `https://`.** `docs/handoffs/00-overview.md` §5.11.7
  lists the Preprod node RPC endpoint as `https://rpc.preprod.midnight.network`; empirically, the
  wallet SDK's underlying `@polkadot/rpc-provider` `WsProvider` requires `wss://`. `wallet-wiring.mjs`
  uses `wss://rpc.preprod.midnight.network`.
- **The first `submitTransaction` after a fresh `WalletFacade.init()` can fail with a client-issued
  `1000: Normal Closure`.** Root-caused by instrumented tracing of `@polkadot/api`: the submission
  service's `PolkadotNodeClient` connects once at init time to fetch chain metadata, then immediately
  disconnects (by design, to avoid an idle socket). The very first `submitTransaction` call can race
  that disconnect — `ensureConnection()` reads a stale `isConnected=true` before the WebSocket's
  `close` event has actually been processed, and sends the real transaction on a socket that is
  already closing. A plain retry succeeds, because by the second attempt `isConnected` correctly
  reads `false` and a fresh connection is established before resending. `wallet-wiring.mjs`'s
  `midnightProvider.submitTx` retries up to 3 times for exactly this reason.

The one point that could not be confirmed by static reading alone —
because no bundled example or test in the installed packages shows this exact end-to-end wiring — is
whether `ZswapSecretKeys.fromSeed` / `DustSecretKey.fromSeed` / `ShieldedWallet(...).startWithSeed` /
`DustWallet(...).startWithSeed` expect the **HD-role-derived 32-byte key** (what this module passes,
based on `ZswapSecretKeys.fromSeed`'s own doc comment specifying a "32-byte seed", which a raw 64-byte
BIP-39 seed is not) or the raw master BIP-39 seed directly. If the very first deploy attempt fails
during wallet sync or balancing with a key-length or key-derivation error, that is the first thing to
revisit — the fix would be passing `masterSeed` directly to those four calls instead of the per-role
derived key. Everything else (imports, function names, config shapes, the unshielded key/keystore path,
the facade wiring) is verified against real types with high confidence.

### Contract address and known-good transaction

**Deployed.** A deployer wallet was generated in this environment (`.keys/generate-wallet.mjs`),
funded via the Preprod faucet, synced, and used to deploy Phrim for real — real ZK proving against a
local `midnightntwrk/proof-server:8.1.0`, real fee payment in Dust, real on-chain finalization.

```
Network:            preprod
Contract address:   f64afd02c9ec83f9121d1c01850bb91d71b57fc73e56e17e68620931c0a748df
Known-good tx id:   00c4c9f65dccf06aad0cc8659883ed49f8dfa55007795a9c058d1519de1178a402
Tx hash:            5e4a0f8e55a49ebf39530dc06db9b66b693b683329c0af15d7cc7815750fea49
Block hash:         a17920eebf7770e34bcb53956af9e2376fcefd951c13baf6a0aa41966eb89534
Deployed by:        Role 01 (Contract & Circuit Engineer), via `pnpm --filter @phrim/contract run deploy`
```

This is the third deployment attempted against the same wallet, and the one with a complete, usable
local deployment record (private state and signing key persisted under `.keys/midnight-level-db/`).
The two earlier attempts each surfaced a real, now-fixed defect rather than being wasted effort:

- The first attempt's on-chain transaction succeeded, but the script crashed immediately afterward
  while persisting local private state — a throwaway `PHRIM_PRIVATE_STORAGE_PASSWORD` used only 2 of
  the 3 required character classes — leaving a second, orphaned contract instance at
  `e637e9cc636f7f3d086d850f93c4a8018fbfd449f567f7a76910148ae6a5047c` with no usable local record.
- The second attempt succeeded in full, but revealed that `deploy.ts`'s private-state config was
  using the wrong field: `privateStateStoreName` names a logical table *inside* a LevelDB database,
  not the database's on-disk location — the actual location is controlled by `midnightDbName`, which
  `deploy.ts` was never setting, so every deploy was silently writing to a fixed, unconfigurable
  `./midnight-level-db` relative to whatever directory the command was run from (in practice,
  `packages/contract/midnight-level-db`, outside `.keys/` and un-gitignored by name). `deploy.ts` now
  sets `midnightDbName` explicitly to an absolute path under `.keys/`, so local deployment state is
  co-located with the rest of the deployer's keys and reliably gitignored. That contract instance
  (`e2f3fa14a90c7e80a8579492ef1d7404d32eec36d8191ec7640b60bb54149c44`) is otherwise fully valid on
  chain, just recorded in a since-corrected local path.

Redeploying costs one Dust-payable transaction; on Preprod that is inexpensive to repeat, so neither
earlier attempt was treated as a blocker.

Before this deployment could be attempted, the deployer wallet's single Night UTXO had to be
registered for Dust generation (`.keys/register-dust.mjs`) — Dust is Midnight's decaying,
time-accrued fee resource, generated only by *registered* Night UTXOs, and registration is a separate,
explicit, fee-paying transaction in its own right. Getting that transaction to actually land
surfaced two more real defects, independent of the connection-race note above:

- **`registerNightUtxosForDustGeneration` already returns an internally-signed recipe.** Its return
  value is `{ type: 'UNPROVEN_TRANSACTION', transaction: <already-signed Transaction> }` — calling
  `facade.signRecipe()` on it again (a reasonable-looking next step, and what the first attempt did)
  re-signs an already-signed transaction and corrupts its signature/input count, which the node
  rejects at the mempool level with `1010: Invalid Transaction: Custom error: 192`
  (`MalformedError::InputsSignaturesLengthMismatch` in the node's ledger types). The fix is to pass
  the recipe straight to `facade.finalizeRecipe()` with no extra signing step.
- The same connection-race note above applies to `facade.submitTransaction()` in this flow too, and
  is handled the same way (a 3-attempt retry) in `.keys/register-dust.mjs`.

## Rehearsal reset procedure

Phrim's ledger design (`docs/handoffs/00-overview.md` §2.3) is one contract holding one active
facility, keyed by `facilityId`, with a shared `usedAssetNullifiers` set. This is deliberate — the
nullifier registry must be shared contract state for replay prevention to mean anything — but it also
means the `replay` demo scenario permanently consumes the `eligible` batch's nullifiers once it
succeeds, and the same funded facility cannot rerun the happy path a second time.

**To reset between rehearsals, redeploy a fresh contract instance:**

```
pnpm --filter @phrim/contract run reset
```

This calls `scripts/reset.ts`, which redeploys Phrim with the same wallet wiring as `deploy` (same
required environment variables) and prints the new `rehearsalContractAddress`. A fresh deployment has
an empty `usedAssetNullifiers` set and `facilityExists = false`, so the full demo script (`createFacility`
→ `fundOrMintDemoToken` → happy path → undercollateralized → replay) can run identically from a clean
starting state. Point the frontend / attestation service at the newly printed address before each
rehearsal.

### Wallet sync cost on Preprod, and why it is a one-time cost — product-relevant finding (PRD §8.2, §28)

**The deployer wallet's Zswap (shielded) and Dust sync is a real, multi-hour, CPU-bound cost on
Preprod** — `wallet-wiring.mjs` must trial-decrypt the entire shielded-pool and Dust-ledger history
since genesis before it can see its own funded balance, because there is no checkpoint/fast-sync
starting-height option exposed anywhere in the installed `wallet-sdk-shielded` /
`wallet-sdk-dust-wallet` types (confirmed by reading them). Measured live against Preprod on a
mid-range laptop (the same AMD Ryzen 5 5500U as the proof-latency measurement in
`docs/handoffs/SCHEMA-LOCK.md` §4): unshielded sync is near-instant, but shielded/Dust sync must cover
roughly **1.5 million ledger indices**. Shielded sync completed within roughly the first hour; Dust
sync (the slower, larger side — its serialized checkpoint alone is several MB, versus a few KB for
shielded/unshielded) reached ~669,000 of ~1,509,000 indices (~44%) after ~67 minutes of continuous
sync on this hardware, an effective rate of roughly 160-170 indices/second — projecting to **roughly
2.5 hours total for a wallet's first full sync**, almost entirely Dust-bound.

**This would make the PRD §19 five-consecutive-rehearsal requirement impractical against Preprod if
paid every time** — reset.ts, run naively, would force a multi-hour wait per rehearsal. To fix this,
`wallet-wiring.mjs` now **checkpoints real sync progress to disk**: every 30 seconds during sync, on
`SIGINT`/`SIGTERM`, and once more after full sync, it calls each of the three wallet objects'
`serializeState()` and writes the result to `.keys/wallet-sync-state.json` (gitignored, atomic
write-then-rename). On the next run, if that file exists, all three wallets are reconstructed via
`WalletClass.restore(serializedState)` instead of a fresh `startWithSeed`/`startWithPublicKey`.

**This was verified empirically, not just read from the types** — while the real deploy attempt was
mid-sync, its checkpoint file was copied aside (without touching the live process) and loaded into a
separate, disposable process via `.restore(...)`. Its very first state emission showed
`shielded.appliedIndex` and `dust.appliedIndex` starting from the checkpointed values (into the
millions), not from `0` — conclusive proof that resumption skips already-covered history rather than
rescanning from genesis.

**Conclusion: the multi-hour wallet sync is a one-time cost per wallet, not a per-rehearsal cost.**
Once `.keys/wallet-sync-state.json` exists and is kept (it is deliberately outside any path this
repository's `reset.ts`/`deploy.ts` deletes), every subsequent `deploy`/`reset` invocation resumes from
the last checkpoint — at worst reprocessing up to 30 seconds of indices, not the full history. Five
consecutive Preprod rehearsals against an already-synced wallet are therefore realistic; five
rehearsals each starting from an *unsynced* wallet are not, and the local `undeployed` stack (which has
no comparable history to scan) remains the right choice for rapid, repeated iteration during
development, with Preprod reserved for the rehearsed, already-synced demo wallet.

## Known limitations (read before judging demo-readiness)

- **No live-network deployment performed.** No funded wallet seed was available or fabricated. The
  compiled contract, its proving keys, and its full circuit-logic test suite are real and verified;
  only the on-chain deployment step is outstanding. `scripts/deploy.ts` and `scripts/reset.ts` are
  written and type-checked against the real `@midnight-ntwrk/midnight-js-contracts@4.1.1` API surface,
  but have not been executed.
- **Unshielded-token balance is not observable from the in-process test simulator** (see "Test",
  above). This does not indicate a bug in `fundOrMintDemoToken` / `requestDraw` — it reflects a gap
  between local circuit simulation and real ledger/kernel transaction processing. A live network
  (local `undeployed` or Preprod) is required to observe an end-to-end funded draw.
- **Real ZK proof latency was measured directly** (not estimated) using the actual pinned toolchain and
  the real `proof-server:8.1.0` over its documented `/prove` API — see
  `docs/handoffs/SCHEMA-LOCK.md` §4. Eight in-circuit Schnorr verifications took 1.9–2.5 seconds on a
  mid-range laptop, well inside the PRD §19 60-second budget with large headroom, so Phrim uses the
  full eight active credential slots (the four-plus-four contingency was not triggered).

## Repository layout

```
packages/
  contract/     [Role 01] Compact contract, tests, deploy/reset scripts — this package
  schema/       [Role 02] canonical codec, domain constants, fixtures, golden vectors
  attestation/  [Role 02] Fastify attestation service
  app/          [Role 03] Vite/React dApp shell, wallet + providers, worker
                [Role 04] src/ui/** — design tokens, primitives, page views, ASCII engine
landing/        [Role 04] static landing page
docs/           PRD, handoffs, design system
```

See `docs/handoffs/00-overview.md` for the full role map, frozen cross-role contracts, and file-layout
ownership boundaries.
