# Phrim — 4 Minute Demo Video Script

Shot-by-shot script with exact narration and exact interactions.

---

## Before you hit record — prerequisite checklist

Run through all of these first. Any one of them missing will break the demo on camera.

| # | Check | How to verify |
|---|---|---|
| 1 | Local proof server running | `curl http://localhost:6300/version` → prints `8.1.0` |
| 2 | Attestation service live | `curl https://attestation-production-fafc.up.railway.app/health` → `"status":"ok"` |
| 3 | Lace wallet installed, Midnight network selected, funded with Preprod tNight | Balance visible in Lace |
| 4 | Live facility provisioned with the published demo secret | `/app/history` shows `Active`, outstanding `$0.00`, and no draw receipts |
| 5 | Browser zoom at 100%, window ~1440×900 | Layout is designed single-viewport; zoom breaks it |
| 6 | Lace unlocked *before* recording | Avoids a password prompt mid-take |

**Two tabs open, in this order:** (1) `https://app-production-db4a.up.railway.app` (2) Lace extension pinned to the toolbar.

> If step 4 isn't ready yet, you can still record everything up to 2:35 — the failure-path
> sections are the only parts that need a live funded facility.

---

## 0:00 – 0:25 · The problem

**SAY:**
> "When a fintech lender wants to draw on a warehouse credit facility, they have to prove their
> receivables actually qualify. Today that means exporting a loan tape — customer-level balances,
> delinquency, risk scores — and sending it to the lender, who recalculates everything in a
> spreadsheet. Every draw means another copy of your most sensitive portfolio data sitting in
> someone else's inbox."

**INTERACTION:**
- Start on the landing page hero, scrolled to top.
- Let the rotating headline word cycle once (prove → pledge → settle → disclose).
- Slow scroll down to the **Capabilities** section, pause on row `01 Private collateral proof`.

---

## 0:25 – 0:45 · The promise

**SAY:**
> "Phrim replaces that with a proof. The borrower proves the draw is backed by eligible
> collateral — without sending the loan tape at all. And the proof doesn't just produce a
> report. It's what releases the money. A valid proof funds the draw. An invalid, stale,
> tampered, or replayed proof cannot move a cent."

**INTERACTION:**
- Scroll to the **How it works** section (the dark inverted band).
- Let one step auto-advance so the code panel types itself out.
- Click **Launch App** in the top-right nav.

---

## 0:45 – 1:05 · Connect wallet

**SAY:**
> "This is running on Midnight's Preprod network against a real deployed contract. I'll connect
> my own wallet — this pays the transaction fee and signs the submission."

**INTERACTION:**
- Land on `/app/facility` (Facility Setup).
- Click **Connect Wallet** in the header.
- Approve in the Lace popup.
- Point at the header — it now shows your truncated address with a live green dot.

---

## 1:05 – 1:35 · The facility and its policy

**SAY:**
> "The lender's policy is fixed on-chain before any draw happens. An eighty percent advance rate.
> A two-hundred-thousand-dollar credit limit. Receivables more than thirty days past due don't
> count. Risk score below six hundred doesn't count. These aren't settings I can nudge at draw
> time — they're what the circuit enforces."

**INTERACTION:**
- Scan down the Facility Setup fields: `Credit limit`, `Advance rate (bps) 8000`,
  `Maximum days past due 30`, `Minimum credit risk score 600`.
- Click **Create and Fund Facility** → it recognises the facility is already active and moves you on.
- You land on `/app/collateral`.

---

## 1:35 – 2:10 · Private collateral

**SAY:**
> "Here's the collateral. Eight receivables, each one signed by the registered servicer.
> Look at the table — every asset-level value is masked and tagged Private. The balance, the
> days past due, the risk score: none of it leaves this browser. What you see is a local preview —
> one hundred thousand dollars eligible, supporting a seventy-five thousand dollar draw at the
> eighty percent advance rate. And it says so right here: calculated locally, the contract proof
> is authoritative."

**INTERACTION:**
- Point at the **Private** tags down the table column.
- Point at the **Signature valid** badges.
- Point at the three metric cards: `Eligible total $100,000.00`, `Supportable draw $80,000.00`,
  `Signatures All valid`.
- Point at the caveat line: *"Calculated locally; contract proof is authoritative."*
- Click **Continue to Draw Request**.

---

## 2:10 – 2:55 · The happy path — prove and settle

**SAY:**
> "Now the actual draw. Seventy-five thousand dollars. Notice what becomes public: the facility
> ID, the epoch, the requested amount. That's it. The private summary just says eight assets
> pledged — not which ones, not what they're worth."
>
> *(click Prove and Request Draw)*
>
> "The proof is being generated right now, in a web worker, on my machine. There is no hosted
> proof server in Midnight — there can't be, because proving touches the private inputs. Eight
> signatures verified inside the circuit, about two and a half seconds."

**INTERACTION:**
- Point at the **Public disclosure** card row (`Facility`, `Epoch`, `Requested amount`).
- Point at **Private summary** — `Pledged assets 8` with its Private tag.
- Click **Prove and Request Draw**.
- Approve the transaction in Lace when it pops.
- Let the four-stage progress indicator run through: preparing → proving → awaiting wallet → submitting.
- Land on `/app/result`.

**SAY (on the result page):**
> "Draw funded. Outstanding went from zero to seventy-five thousand. Eight nullifiers consumed.
> And there's the contract address and the transaction ID — you can go look it up yourself."

**INTERACTION:**
- Point at the **Draw funded** badge, then the settlement metric cards.
- Point at **Contract address** and **Transaction id**.

---

## 2:55 – 3:25 · The failure paths — this is the real point

**SAY:**
> "But funding a valid draw is the easy half. Here's what makes this enforcement and not a badge."
>
> *(select Undercollateralized)*
>
> "Same facility, freshly signed collateral, but two receivables went delinquent. Eligible drops
> to eighty-five thousand, which only supports sixty-eight. I'll still ask for seventy-five."
>
> *(submit → rejected)*
>
> "Rejected. Insufficient collateral. And critically — zero funds moved, facility state unchanged.
> The contract says so, not the UI."
>
> *(select Replay)*
>
> "And this one — the exact batch that just funded successfully, submitted again. The nullifiers
> are already spent, so it can't fund twice."

**INTERACTION:**
- Navigate to `/app/collateral`.
- Click scenario **Undercollateralized** → watch the eligible total drop to `$85,000.00`.
- Continue → Draw Request → **Prove and Request Draw** → approve.
- On the result page, point at `INSUFFICIENT_COLLATERAL` and the line *"Zero funds moved.
  Facility state remained unmodified."*
- Back to `/app/collateral`, click scenario **Replay**, submit, show `ASSET_ALREADY_USED`.

---

## 3:25 – 3:45 · Why Midnight

**SAY:**
> "This needs four things at once, and Midnight is where they all exist together: private
> circuit inputs, so the loan tape stays put. Signature verification over that private data
> inside the circuit — Schnorr over Jubjub, eight of them. Nullifiers, so pledged assets can't be
> financed twice. And a public state transition that actually moves the token, atomically, only
> after the proof verifies."

**INTERACTION:**
- Go to `/app/history`.
- Point at the receipts table — real draws, real resulting balances, read straight from the ledger.
- Note there is no customer-level row anywhere on this page.

---

## 3:45 – 4:00 · Close, honestly

**SAY:**
> "What's real here: the Midnight proof, the in-circuit signature verification, the nullifiers,
> the facility accounting, the token transfer. What's demo: the receivables are synthetic and
> clearly labelled, and the attestation service is a single trusted issuer. Phrim doesn't prove
> the servicer's data is true — it proves it was signed by the registered servicer and satisfies
> the lender's policy. Everything else follows from that, cryptographically."

**INTERACTION:**
- Scroll back to the landing page **Security** section, or end on the result page's transaction ID.
- Hold the final frame for ~2 seconds before cutting.

---

## Timing budget

| Section | Duration | Running total |
|---|---:|---:|
| Problem | 0:25 | 0:25 |
| Promise | 0:20 | 0:45 |
| Connect wallet | 0:20 | 1:05 |
| Facility & policy | 0:30 | 1:35 |
| Private collateral | 0:35 | 2:10 |
| Happy path | 0:45 | 2:55 |
| Failure paths | 0:30 | 3:25 |
| Why Midnight | 0:20 | 3:45 |
| Close | 0:15 | 4:00 |

**If you run long,** cut the Replay scenario (2:55–3:25 shrinks to just Undercollateralized) —
it's the most compressible section. Never cut the failure paths entirely; a demo that only shows
the happy path is exactly the "verified badge" this project is arguing against.

---

## If something breaks on camera

| Symptom | Cause | Say this |
|---|---|---|
| Proof hangs at `proving` | Local proof server not running | Cut. Start it, re-record from 2:10. |
| `NETWORK_UNAVAILABLE` | Preprod indexer blip | Cut, retry — it's usually transient. |
| Wallet popup doesn't appear | Lace locked | Cut, unlock, re-record from the click. |
| Draw rejected `UNAUTHORIZED` | Facility not provisioned with the published demo secret | Stop — this needs fixing off-camera first. |
