# packages/attestation

Fastify demo attestation service (PRD §15.1). Owned by Role 02. No database, no auth, no ORM — a
deterministic fixture set signed by a persisted demo key, using a real Schnorr-over-Jubjub signature
verified against the same compiled circuits the Phrim contract runs.

## Install and run

From the repository root:

```
pnpm install
pnpm --filter attestation run dev     # tsx watch src/main.ts
pnpm --filter attestation run start   # tsx src/main.ts
pnpm --filter attestation test
pnpm --filter attestation run typecheck
```

Requires `packages/contract/managed/phrim/**` to exist first (`pnpm --filter @phrim/contract run
compile`) — `buildServer()` binds the real `pureCircuits` at startup and needs them present.

Default port is `4300`, host `127.0.0.1`. Override with `PHRIM_ATTESTATION_PORT` /
`PHRIM_ATTESTATION_HOST`. CORS is restricted to `http://localhost:5173` (Vite's default) by default.

## Endpoints (PRD §15.1)

| Method | Path | Notes |
|---|---|---|
| `GET` | `/health` | `{ status, service, version, providerId, keyLoaded }`. Never the key. |
| `GET` | `/v1/provider` | `{ providerId, publicKeyX, publicKeyY }` as decimal strings — the real Jubjub public key derived from the persisted seed. |
| `GET` | `/v1/fixtures/:scenario` | `:scenario` validated against the closed five-id allowlist (`eligible`, `undercollateralized`, `stale`, `tampered`, `replay`); anything else is `400 UNKNOWN_SCENARIO` and the parameter never touches the filesystem. Returns fully, really signed credentials. |
| `POST` | `/v1/credentials/sign` | Body `{ credentials: UnsignedAttestedAssetCredentialJson[] }`, 1–8 entries. Validates shape, batch size, `schemaVersion`, and every field's declared width, then returns real Schnorr-over-Jubjub signatures over the real `credentialDigest`. |

## Key persistence (PRD §18.1)

`src/key.ts`'s `AttestorKeyStore` generates a random 32-byte seed on first boot and writes it to
`.keys/attestor.json` at the **workspace root** (`resolveDefaultKeyFilePath()` resolves three
directories up from `src/`), mode `0600`. Subsequent boots load the same seed, and
`deriveAttestorKeypair` (`src/keypair.ts`) reduces it to a Jubjub scalar (`schema`'s
`scalarFromSeed`) and derives the same public key every time — verified by
`test/provider.test.ts`'s restart test. The seed never appears in a log line, an HTTP response, or an
error message; `/v1/provider` exposes only the derived public coordinates.

Regenerate a clean-slate key with:

```
pnpm --filter attestation run regenerate-key
```

**This deletes the existing key file and writes a new one. Every credential signed under the old key
stops verifying immediately — the facility must be re-created and every credential re-issued.** Only
run this between full demo rehearsals, never mid-rehearsal.

`.keys/` is listed in the repository's root `.gitignore`. No key file has been written inside any
`packages/` directory; all key files this package produces live at
`<workspace root>/.keys/attestor.json`, and every test uses an OS temp directory instead.

## Logging (PRD §18.1, §18.2, §19)

`src/logging.ts` + the `onResponse` hook in `src/server.ts` log **exactly** `method`, `path`,
`statusCode`, `durationMs`, `scenarioId`, `categoricalError` — nothing else. Fastify's own request
logger is disabled (`Fastify({ logger: false })`) specifically so no library-level default ever logs a
request or response body. `test/log-leak.test.ts` signs a batch containing a sentinel
`outstandingMinor` value and asserts it never appears in captured log output, and asserts the log
entry's key set is exactly the six whitelisted fields. This holds for real signing traffic too — the
signature computation happens entirely inside `schema`'s bound circuits and never touches a log call.

## Signing (R6 — built against `docs/handoffs/SCHEMA-LOCK.md`)

`buildServer()` calls `bindPhrimPureCircuits(phrimPureCircuits)` from `schema`/`@phrim/contract` once
at startup, then derives the attestor's real Jubjub keypair from the persisted seed
(`src/keypair.ts`) and constructs a real signer (`src/signer.ts`,
`schema`'s `createCredentialSigner`). Every previously-blocked seam (`bindJubjubKeypairDeriver`,
`bindSchnorrSign`) has been removed — key derivation needs no circuit binding at all (Schnorr key
generation is independent of the message-hashing scheme), and signing goes straight through
`schema`'s real implementation. See `packages/schema/README.md` for the cryptographic detail
(deterministic per-digest nonce, the two SCHEMA-LOCK §4.5 corrections, why this is safe here).

`packages/schema`'s `src/fixtures/sign.ts` is bound the same way (`bindFixtureSigner`), so
`GET /v1/fixtures/:scenario` returns fully signed batches for all five deterministic scenarios, not
just the `eligible`/`undercollateralized` structural data.

## Integration parity (R12)

`test/parity.test.ts` signs a credential through the live service, then independently rebuilds the
ten-word canonical preimage from both the request and the response using `packages/schema` directly,
and asserts they are byte-identical — proving the service never re-encodes or drifts from what
`packages/schema` would produce standalone for the same input. It also asserts the service never
mutates a non-signature field, and that two different credentials get two different signatures.
