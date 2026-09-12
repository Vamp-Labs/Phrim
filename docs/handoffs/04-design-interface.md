# 04 — Design System & Interface Engineer

**Read first:** `docs/handoffs/00-overview.md` §4 (the `ui/` ↔ `app/` boundary is absolute), §5.9
(view-models), §7. Then PRD §16 in full, §19 (accessibility, responsiveness), and
`docs/ASCII-ART-RESEARCH.md` in full.

You own every pixel. Role 03 owns every byte. The design-system inventory is embedded **verbatim**
below in §Requirements so you never have to re-derive a token or guess a value.

---

## The thing you must understand before you start

**There is no existing HTML to follow.** PRD §16 is written as though a static landing page exists.
It does not. The three files that would have carried it —`docs/index.html`, `docs/styles.css`,
`docs/main.js` — are **dangling symlinks** pointing at themselves one directory down. Verified
12 Sept 2026.

So the design system is not something you extract. It is something you **establish**, from the PRD
specification reproduced below, and then hold every page to. The two real assets that do exist are
`docs/assets/logo.webp` (WebP with alpha, 256×256) and `docs/fonts/GeistPixel-Circle.woff2`
(WOFF2/TrueType, 28 044 bytes). Copy them into `packages/app/public/` and `landing/`; do not move,
delete or repair the symlinks.

---

## Responsibilities

1. Establish the design system: tokens, typography, primitives — written down once in
   `docs/design-system.md` before any page is built.
2. Build the static landing page (vanilla HTML5 + CSS3 + ES6, per PRD §16.1) at `landing/`.
3. Build the five presentational page views in `packages/app/src/ui/views/`, driven purely by
   Role 03's view-models.
4. Build the ASCII background engine — five page themes plus `AsciiMorph` transitions — at 60fps.
5. Resolve the fifteen documented GAPs in the inventory, once, systematically.
6. Own accessibility and reduced-motion across the whole surface.

---

## Scope

### In scope

- `landing/**` — exclusively yours. Static, vanilla, no build step.
- `packages/app/src/ui/**` — exclusively yours: `tokens.css`, `base.css`, `primitives/`, `views/`,
  `ascii/`.
- `packages/app/public/fonts/`, `packages/app/public/assets/` — copies of the two real assets.
- `docs/design-system.md` — your written design decisions, GAP resolutions, and token documentation.
- All CSS, all animation, all focus and disabled and loading and empty states, all responsive
  behaviour, all `prefers-reduced-motion` handling.

### Out of scope

- **Anything under `packages/app/src/app/` or `packages/app/src/viewmodels/`.** Not a hook, not a
  fetch, not a route. That is Role 03.
- **`vite.config.ts`, `packages/app/package.json`, `index.html` (the SPA entry).** Role 03 owns them.
  Need a font preload tag or an asset alias? Ask Role 03.
- **Any data fetching, state management, wallet, contract or worker code.** Your views are pure:
  props in, markup out.
- **Error message and recovery copy.** It comes verbatim from PRD §17 via
  `packages/schema/src/errors.ts` through the view-model. You style it; you never reword it.
- **Number formatting that changes a value.** Amounts arrive as decimal strings in minor units; you
  format for display, you never parse to `number` and you never do arithmetic.
- Workspace root config, repository initialisation, commits, pushes.

### The hard boundary

You import from `packages/app/src/viewmodels/` (read-only). You never import from
`packages/app/src/app/`. Role 03 never edits a file under `src/ui/`. If a view needs data no
view-model carries, tell the PM — do not reach across.

---

## Objectives

1. Five application pages and a landing page that read as one designed system, not six pages that
   happen to share a colour.
2. 60fps ASCII backgrounds that do not steal a frame from a 60-second proof (PRD §16.2.3).
3. A non-technical observer can see why a draw passed or failed without reading contract code
   (PRD §5.1, "Make the result understandable").
4. Every GAP resolved once, in a written decision, not improvised per page.
5. Keyboard-accessible, visible focus, non-colour-only status, reduced-motion honoured (PRD §19).

---

## Requirements

### R0 — Write `docs/design-system.md` before you build a page

Resolve all fifteen GAPs below, in writing, with the token names you are adding. Then build. A design
system improvised page-by-page is how five pages end up with five spacing scales.

This document is also where **all** explanation lives, because `00-overview.md` §7 forbids comments in
code — including in `.css` and `.glsl`. Your CSS carries no comments; your reasoning goes here.

---

## THE DESIGN-SYSTEM INVENTORY (embedded verbatim — this is your contract)

### I.1 Colour tokens — PRD §16.1.1, exact

| Token | Value | Role / Usage |
|---|---|---|
| `--bg` | `#000000` | Pure onyx black background canvas |
| `--text` | `#ffffff` | Primary crisp white copy, headlines, and active counters |
| `--muted` | `#8e8e8e` | Subdued metadata, inactive link states, and metric labels |
| `--nav-text` | `#2e2e2e` | Deep charcoal typography on white pill surfaces |
| `--pill-dark` | `#28282a` | Dark gunmetal background for secondary actions and avatar rings |
| `--sign-in-text` | `#c8c8c8` | High-legibility silver text on dark surfaces |
| `--nav-shadow` | `0 4px 14px rgba(0, 0, 0, 0.16)` | Soft, diffused floating elevation on pills and badges |
| `--trust-bg` | `#28282a` | Outer avatar container and trust pill background |
| `--trust-border` | `rgba(255, 255, 255, 0.4)` | Translucent edge highlighting pill borders |
| `--trust-text` | `#c4c2c3` | Refined silver text for enterprise credentials |

Ten tokens. **Strictly monochrome — zero hues.** These names and values go into `tokens.css` unchanged.

### I.2 Typography — PRD §16.1.2, exact

- **UI primary:** `Inter`, `"Segoe UI"`, `system-ui`, sans-serif. Weights `400` Regular, `500` Medium,
  `600` Semi-Bold. Navigation labels, body copy, metric numbers, button text, modal controls.
- **Display / retro glyphs:** `BubbledotICG-FinePos` (OnlineWebFonts CDN), fallback
  `Geist Pixel Circle` (local WOFF2 — the file you have), fallback `monospace`. Hero display
  headlines, metric icon glyphs (`<`, `%`, `*`, `#`), architectural ASCII accents.
- **Hero display size — the only type size the PRD specifies:** `clamp(28px, 6.2vw, 80px)`.
- **Iconography:** Font Awesome 6.5.2. The PRD specifies Microsoft/Amazon/Google brand glyphs for the
  trust row — **overridden, see I.10: real brand marks are cut.** Use Font Awesome for any other
  interface iconography you need.

### I.3 Spacing, radii, shadows, borders — everything the PRD specifies

| Property | Value | Source |
|---|---|---|
| Radius — pill | `999px` | §16.1.3 |
| Radius — mobile sheet | `28px` | §16.1.3 |
| Shadow — elevation | `0 4px 14px rgba(0,0,0,0.16)` | `--nav-shadow` |
| Glow — CTA | `0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,255,255,0.32), 0 0 44px rgba(255,255,255,0.12)` | §16.1.3 |
| Border — translucent | `rgba(255,255,255,0.4)` | `--trust-border` |
| Trust avatar padding | `5px` | §16.1.3 |
| Nav active dot | `::after` with `box-shadow: -5px 0 0 #000, 5px 0 0 #000; bottom: 5px` | §16.1.3 |

**No spacing scale exists in the PRD.** → GAP-1.

### I.4 Grid, containers, breakpoints

| Property | Value | Source |
|---|---|---|
| Root layout | `.page { display:flex; flex-direction:column; justify-content:space-between; height:100vh / 100dvh; overflow:hidden; }` with vertical clamp padding | §16.1.3 |
| Header container | centred row, `max-width: 720px` | §16.1.3 |
| Brand button | circular white `#fff`, `clamp(40px, 4.4vw, 46px)`, mark scaled 72%, centred | §16.1.3 |
| Nav pill | white, height `44px`–`48px`, `border-radius: 999px` | §16.1.3 |
| Trust avatars | `--trust-size: clamp(36px, 4.5vw, 42px)`, `5px` padding, overlap `-0.42 × trust-size` | §16.1.3 |
| Trust hover lifts | `-2px`, `-4px`, `-2px` | §16.1.3 |
| Hamburger (≤720px) | `48 × 48px` circular; X via `translateY(±6.5px)` + `rotate(±45deg)` | §16.1.3 |
| Drawer backdrop | fixed full-screen, `rgba(0,0,0,0.62)`, `blur(6px)` | §16.1.3 |
| Drawer sheet | floating white, `border-radius: 28px`, staggered link animations | §16.1.3 |
| Background canvas | `<canvas id="phrim-ascii-bg">`, `position:absolute; inset:0; pointer-events:none; z-index:0` | §16.2.1 |
| Mobile breakpoint | `≤ 720px` — **the only breakpoint in the PRD** | §16.1.3 |
| Minimum supported | 1280 × 720 and common laptop widths | §19 |

### I.5 Component vocabulary — specified

- Circular white brand button with centred geometric mark at 72% scale
- Elongated white nav pill with three-dot active indicator
- Dark pill button (`--pill-dark`) for secondary actions
- Overlapping circular avatar trust row flowing into a dark trust pill — **the component may be
  reused, the PRD's copy and brand marks may not; see I.10.** If kept, the pill states a target market
  (e.g. "Built for regulated capital markets"), never an adoption claim, and the avatars carry neutral
  placeholder marks, never Microsoft/Amazon/Google.
- Glowing white CTA pill: black bold text, the three-layer halo above, `revealPulse` entry, hover scale
- Four-column tabular animated metric counters with dot-matrix glyph icons
- Mobile hamburger → black X on white disc; glass backdrop; floating white sheet drawer
- Full-bleed background canvas at `z-index: 0`

### I.6 Component vocabulary — required by pages 1–5 but **never specified**

| # | Component | Needed by |
|---|---|---|
| GAP-3 | Text / number / hash input field | §16.4 — ten fields |
| GAP-4 | Data table / row list | §16.5 — eight rows; §16.8 — receipts log |
| GAP-5 | `Private` / `Public` data tag | §16.5, §16.6, FR 24 |
| GAP-6 | Status badge — `Draw funded`, `Active`/`Frozen`/`Closed`, signature valid/invalid | §16.7, §16.8 |
| GAP-7 | Multi-stage progress visualiser, four stages | §16.6, FR 25 |
| GAP-8 | Error panel — category + recovery | §16.7, FR 26 |
| GAP-9 | Balance / metric card | §16.7, §16.8 |
| GAP-10 | Scenario selector, five options | §16.5 |

### I.7 Interaction and state patterns

| State | Specified | |
|---|---|---|
| Hover | Trust avatars lift `-2px`/`-4px`/`-2px`; CTA scales | §16.1.3 |
| Entry | `revealPulse` (CTA), `slideDown`, `headlineFade`; GPU-accelerated cubic-bezier | §13.3, §16.1.3 |
| Counters | `easeOutCubic`; duration `1500 + i×80ms`; stagger `480 + i×90ms`; IntersectionObserver threshold `0.25`; **evaluated once** | §16.1.3 |
| Page transition | `AsciiMorph`: 300ms scramble through `@ # * % & !`, resolving into the target theme | §16.2.2 |
| Reduced motion | Procedural animation halts; static high-contrast ASCII frame; solid typography | §16.2.3 |
| Focus | Required — "visible focus" — **no style or token given** | §19 → GAP-11 |
| Disabled | Not specified | GAP-12 |
| Loading | Only the four-stage proof visualiser | GAP-13 |
| Empty | Not specified (history with no draws) | GAP-14 |
| Error / success colour | §16.7 calls for red/amber crosses; the palette has **no** red or amber | GAP-15 |

### I.8 Page structure, shared chrome, and ASCII themes

| Page | User | Purpose | ASCII theme |
|---|---|---|---|
| Landing | Public | Value prop, trust, metrics, CTA | Animated CSS/canvas background, neural field aesthetic (no video asset — see I.10) |
| 1 Facility Setup | Lender | Policy + vault funding | **The Cryptographic Vault** |
| 2 Private Collateral | Borrower | Credentials + privacy boundary | **The Confidential Matrix Stream** |
| 3 Draw Request | Borrower | Amount, disclosure, proving | **The ZK Circuit Synthesizer** |
| 4 Draw Result | Both | Enforced settlement / rejection | **Atomic Settlement & Token Beam** |
| 5 Facility History | Lender | Status, balances, receipts | **Merkle DAG & Block Lattice** |

Shared chrome on every page: background canvas at `z-index: 0`; header row (brand + nav pill + action
pill) within `max-width: 720px`; `.page` flex column pinned to the viewport.

### I.9 ASCII theme specifications — `docs/ASCII-ART-RESEARCH.md` §3, binding

| Page | Metaphor | Glyphs | Motion |
|---|---|---|---|
| 1 Vault | Isometric 3D vault / safety-deposit chamber, lock dials, digital pillars | `+ - \| / \ [ ] O #` | Slow majestic 3D rotation of the vault door; concentric dial rings rotate as the lender adjusts credit limit and advance rate |
| 2 Matrix Stream | Dual-layer encrypted streams: raw data into a hashing funnel on the left, masked asterisks and nullifier hashes on the right | `0 1 * · : X % ▓ ░` | Cascading vertical columns, subtle digital rain; numbers periodically scramble into nullifier hashes |
| 3 Circuit Synthesizer | Circuit-board lattice, pulsing cryptographic nodes, Fourier waveforms | `~ ^ - + = * # <` | On `Prove and Request Draw`, traces illuminate in waves converging on a central constraint node; pulses at the frequency of proof stages |
| 4 Settlement | Double-pan cryptographic scale, ascending token beam | `^ / \ \| ( ) $ o *` | Success: particles erupt upward, an ASCII checkmark locks into place. Failure: the scale tilts, `X` crosses flicker |
| 5 Merkle DAG | Horizontal block lattice / chronological DAG, hash-linked vectors | `[#] ---> \| + : .` | Slow horizontal drift as epochs scroll in; hovering a block highlights its connecting arrows |

Atmosphere per page: 1 structural security and high stability; 2 privacy — private values blur into
micro-glyphs while public badges stay crisp; 3 high kinetic energy; 4 finality and settlement
authority; 5 archival verifiable auditability.

### I.10 Landing page content — DECIDED AT THE APPROVAL GATE, PRD §16.3's copy is overridden

**PRD §16.3's literal copy is not built.** The *structure* stays (header, two-line dot-matrix
headline, subhead, glowing CTA, trust row, four-metric footer); the *content* is Phrim-specific,
written from the PRD's own pitch. Full ruling: `00-overview.md` §6.8 — read it before writing a
single word of copy. Summary:

- **Header:** circular mark + white nav pill — unchanged.
- **Headline (two lines, retro dot-matrix):** derived from PRD §2's one-line pitch — private proof of
  eligible collateral, enforceable draw. Not `Intelligence` / `Designed To Evolve`, not a paraphrase
  of it. You own the exact wording; it must be recognisably about Phrim to someone who has only read
  the headline.
- **Subhead:** a tight edit of PRD §1's own line — *"A valid private collateral proof releases a draw.
  An invalid, stale, tampered, or replayed proof cannot move funds or change facility state."* This is
  already well-written; prefer reusing it closely over inventing something new.
- **CTA:** `Get Started` stays, routed to `/facility`.
- **Trust row: real logos are removed. Hard requirement, not a style call.** Microsoft, Amazon and
  Google marks do not ship — they would imply a partnership or customer relationship that does not
  exist. Pick one:
  - cut the trust row entirely and let the rest of the page carry it, or
  - replace it with **generic, non-trademarked** copy describing a target market, not false adoption
    — e.g. "Built for regulated capital markets" or "Designed for asset-backed credit facilities." No
    logos, no named companies, nothing implying existing customers or users.

  Record which option you chose, and its exact copy, in `docs/design-system.md`.
- **Four-metric footer:** replace `< 120ms` Inference Time / `% 99.99%` Uptime / `* 24/7` Runtime /
  `# 2.4M` Context Windows — none of these are true of Phrim — with metrics traceable to the PRD's own
  numbers: the demo draw amount (`$75,000`), the advance rate (`80%`), the collateral batch size
  (`8` credentials), or a measured proof-latency figure once Role 01 reports one. Keep the glyph +
  number + label visual pattern (`<`, `%`, `*`, `#`); change what the numbers claim. Every metric must
  be something a judge could ask "how do you know that" about and get a real, PRD-traceable answer.

Structure all of this as data (a config object / a template) so a future copy pass is a one-file
change, not a rebuild.

---

## GAP resolutions you must make (all fifteen, in `docs/design-system.md`)

| GAP | What is missing | Direction |
|---|---|---|
| 1 | Spacing scale | Define a small geometric scale as tokens. Use `clamp()` so it participates in the single-viewport fit. |
| 2 | **Single-viewport fit** | `overflow: hidden` + `100dvh` vs. Page 1's ten fields and Page 2's eight rows at 720px height. Solve it **once** as a system rule (e.g. an internally-scrolling content region inside a fixed chrome, or a two-column dense form), and apply it identically to all five pages. This is your hardest problem — solve it before building. |
| 3 | Input field | Tokens + one primitive covering text, number, bps, money and hash inputs, with label, hint, error and focus states. |
| 4 | Table / row list | One primitive serving both the 8-row collateral table and the receipts log. |
| 5 | Private/Public tag | Must be unmissable — the privacy boundary is the product's core claim (FR 24). |
| 6 | Status badge | `Draw funded`, facility status, per-record signature status. |
| 7 | Four-stage progress | Distinct, individually observable stages (FR 25). |
| 8 | Error panel | Category + verbatim PRD §17 message + recovery, plus the zero-movement confirmation. |
| 9 | Balance / metric card | Large tabular figures; `font-variant-numeric: tabular-nums`. |
| 10 | Scenario selector | Five options, clearly labelled as demo scenarios. |
| 11 | **Focus ring** | PRD §19 requires visible focus. On a pure-black high-contrast surface, define a ring that is visible on both white pills and black panels. Never `outline: none` without a replacement. |
| 12 | Disabled | Distinguishable without relying on colour alone. |
| 13 | Loading | Beyond the proof stages — page-level and card-level. |
| 14 | Empty | History with no draws; collateral with nothing imported. |
| 15 | **Success / failure colour** | **Design conflict, PM-ruled.** §16.1.1 is strictly monochrome; §16.7 and the ASCII research call for red/amber. Ruling: add **exactly two** semantic hue tokens. Use them only for draw outcome states, never for chrome, never for a border or a background that is not an outcome. Per PRD §19 "non-color-only status", **always** pair with a glyph and a text label, so every state survives greyscale. Verify by screenshotting in greyscale. |

Extension tokens get names consistent with the base ten (lowercase, hyphenated, no prefix soup) and
are listed with their rationale in `docs/design-system.md`.

---

## R1 — `landing/` (static, vanilla, no build step)

PRD §16.1: "The implementation is static, vanilla (HTML5 + CSS3 + Vanilla ES6 JS), and fully
responsive without horizontal or vertical scrollbars." Three files — `index.html`, `styles.css`,
`main.js` — plus copies of `logo.webp` and `GeistPixel-Circle.woff2`. Opens from the filesystem with
no server and no build.

Everything in I.1–I.5 and I.10 applies. The `Get Started` CTA links into the app.

**Background: DECIDED — no video, ever.** PRD §16.2 specifies a full-bleed looping MP4. No video file
exists in the repository, none will be provided, and **the video path is cut, not deferred** — do not
build a `<video>` tag with a fallback, build the fallback as the primary and only implementation.
Implement an animated CSS/canvas background consistent with the ASCII engine's aesthetic (R5): a
lightweight Canvas2D or CSS-gradient neural-field-style loop — the same visual register as the
operational pages' ASCII themes (I.9), not a generic gradient blob. It shares the monochrome palette
(I.1) and respects `prefers-reduced-motion` exactly as R5's engine does. This is a real, finished
deliverable, not a placeholder — it is the first thing every visitor and judge sees.

Font loading: `BubbledotICG-FinePos` comes from a third-party CDN and the local WOFF2 is the declared
fallback. Order the `font-family` stack so the page is correct offline and at judging time if the CDN
is slow or blocked — the local file must carry the design on its own. Same for Font Awesome, only if
you keep the trust row and it uses brand-mark icons for something else — since real company marks are
cut per I.10, Font Awesome's brand glyphs are not needed for the trust row itself.

## R2 — `packages/app/src/ui/tokens.css` and `base.css`

`tokens.css`: the ten PRD tokens verbatim, then your documented extensions. `:root` custom properties
only, zero runtime, no CSS framework (PRD §13.3: "zero framework CSS bloat"). No comments — the
documentation is `docs/design-system.md`.

`base.css`: reset, the `.page` single-viewport shell, typography defaults, `@font-face` for the local
WOFF2, focus ring, `prefers-reduced-motion` block.

## R3 — `packages/app/src/ui/primitives/`

The components from I.5 plus the eight from I.6. Every primitive is pure: props in, markup out. No
fetching, no global state, no `useEffect` reaching outside itself.

Server-component rules do not apply (this is a Vite SPA), but the spirit does: keep interactivity at
the leaves. A primitive that needs internal state (drawer open, counter running) owns exactly that
state and nothing more.

## R4 — `packages/app/src/ui/views/` — the five page views

One presentational component per page, each taking exactly one view-model prop from
`packages/app/src/viewmodels/` (`00-overview.md` §5.9) plus typed callbacks for user actions. No data
access of any kind.

Build against Role 03's mock view-models. Cover **every** state each view can be in: idle, busy, each
`ProofStage`, funded, all eleven error codes, empty history, invalid signature rows.

Per-page content requirements are PRD §16.4–§16.8 and are not optional — including Page 4's explicit
"zero funds moved and facility state remained unmodified" confirmation on the failure path, and
Page 5's strict absence of any private customer-level record.

## R5 — `packages/app/src/ui/ascii/` — the background engine

Per PRD §16.2.1 and the research document: one `<canvas id="phrim-ascii-bg">` as a global background
layer, `position: absolute; inset: 0; pointer-events: none; z-index: 0`.

- **Primary implementation:** custom WebGL/GLSL fragment shader, or Canvas2D procedural if WebGL
  proves fragile — the research document (§2.1, §2.3) endorses both; pick one, justify it in
  `docs/design-system.md`, and do not mix.
- **Uniforms:** `u_resolution`, `u_time`, `u_mouse`, `u_theme` (PRD §16.2.1).
- **Five themes** per I.9, switched by `u_theme` / `setTheme`.
- **Three.js + `AsciiEffect`** for the Page 1 vault and Page 4 token mesh **only if** the budget in
  §16.2.3 still holds with it — it is ~150 KB and the PRD's own headline claim is a 0 KB vanilla
  pipeline. Procedural is an acceptable and preferred substitute; say which you chose and why.
- **`AsciiMorph`** transitions: 300ms scramble through `@ # * % & !` (§16.2.2).
- **Performance budget (§16.2.3):** 60fps, under 25MB VRAM, under 4% GPU load. **Measure it and
  report the numbers** — the PRD states them as guarantees and unverified guarantees are worse than
  none.
- **The canvas must never contend with proof generation.** Role 03 runs proving in a Web Worker
  precisely so your loop keeps its frames; do not add main-thread work that undoes that. No per-frame
  DOM writes, no per-frame layout reads.
- **`prefers-reduced-motion: reduce` halts procedural animation** and renders a static high-contrast
  frame (§16.2.3). This is not a fade-out — the loop stops.
- Pause the render loop when the tab is hidden and when the canvas is not visible.

## R6 — Accessibility (PRD §19, and it is graded)

- Every action reachable and operable by keyboard.
- Visible focus everywhere (GAP-11). Never remove an outline without replacing it.
- **Status never conveyed by colour alone** — glyph + text label on every state.
- Descriptive errors; the error panel is associated with what failed.
- The background canvas is decorative: `aria-hidden="true"`, not focusable, `pointer-events: none`.
- Live regions for the proof stage machine so a screen reader hears progress.
- Contrast: `--muted` `#8e8e8e` on `#000000` is roughly 5.3:1 — fine for body text, **not** for small
  text below 14px or for anything load-bearing. Check every pairing you introduce; `--nav-text`
  `#2e2e2e` on white is high contrast and safe.
- Usable at 1280 × 720 and at ≤720px width via the drawer.

---

## Dependencies

| You need | From | Blocks |
|---|---|---|
| `packages/app/src/viewmodels/` types + mocks | Role 03, **first deliverable** | R4 views. Until it lands, do R0, R1, R2, R3, R5 — all unblocked |
| `packages/app/package.json`, `vite.config.ts` | Role 03 | Building inside the app package |
| Verbatim §17 error copy | Role 02 via view-model | Styling the error panel |
| Workspace root | Role 01 | — |

**`landing/` and `docs/design-system.md` have zero dependencies. Start there.**

---

## Constraints

- All shared conventions in `00-overview.md` §7.
- **No comments in code — including `.css`, `.glsl` and `.html`.** Explanation lives in
  `docs/design-system.md`.
- **Never touch `packages/app/src/app/`, `packages/app/src/viewmodels/`, `vite.config.ts`, the SPA
  `index.html`, or `packages/app/package.json`.**
- No CSS framework, no component library, no Tailwind. Pure CSS custom properties (PRD §13.3).
- Ask the PM before adding any dependency — including Three.js. Exact pinned versions.
- No `any`, no `@ts-ignore` in `.tsx`.
- Amounts arrive as decimal strings in minor units. Format for display; never parse to `number`, never
  do arithmetic, never round.
- Views are pure. No fetching, no wallet, no contract, no global state.
- Every animation respects `prefers-reduced-motion`.
- Do not repair, recreate or delete `docs/index.html`, `docs/styles.css`, `docs/main.js`.
- No `git init`, no commits, no pushes.

---

## Deliverables

1. `docs/design-system.md` — token documentation, all fifteen GAP resolutions with rationale, the
   single-viewport system rule, the WebGL-vs-Canvas2D decision, the Three.js decision, and the
   greyscale verification of GAP-15.
2. `landing/` — `index.html`, `styles.css`, `main.js`, assets, fonts. Opens from the filesystem.
3. `packages/app/src/ui/tokens.css`, `base.css`.
4. `packages/app/src/ui/primitives/` — the specified vocabulary plus the eight GAP components.
5. `packages/app/src/ui/views/` — five presentational views covering every view-model state.
6. `packages/app/src/ui/ascii/` — the engine, five themes, `AsciiMorph`, reduced-motion path.
7. `packages/app/public/fonts/`, `packages/app/public/assets/` — copied real assets.
8. A written report to the PM: **measured** fps / VRAM / GPU load per theme and the machine measured
   on; the exact landing-page copy you wrote and which trust-row option you chose; whether the CDN
   display font is reliable enough to depend on; your single-viewport rule; and anything in PRD §16
   you found contradictory.

---

## Acceptance criteria

1. `landing/index.html` opens directly from the filesystem with no server and no build step, and
   renders completely.
2. The landing page has **no horizontal or vertical scrollbar** at 1280×720, at 1440×900, and at
   375×667 (PRD §16.1).
3. All ten PRD §16.1.1 tokens exist in `tokens.css` with **exactly** the specified names and values.
4. Every extension token is documented in `docs/design-system.md` with a rationale.
5. All fifteen GAPs have a written resolution.
6. Landing page contains: a two-line dot-matrix headline derived from PRD §2's pitch (not
   `Intelligence` / `Designed To Evolve` or any paraphrase of it), the `Get Started` CTA routed to
   `/facility`, and a four-metric footer using Phrim-traceable numbers (not inference time, uptime,
   runtime or context-window figures). **No real company logo or brand name appears anywhere on the
   page** — grep the landing HTML/CSS/JS for `Microsoft`, `Amazon`, `Google` and any Font Awesome
   brand-icon class and confirm zero matches.
7. If a trust row is present, its copy names no company and no specific customer, and states a target
   market or design intent only (e.g. "Built for regulated capital markets").
8. No `<video>` element exists in `landing/`; the background is a working, finished CSS/canvas
   animation, not a placeholder.
9. Metric counters animate with `easeOutCubic`, the specified durations and stagger, via
   IntersectionObserver at `0.25`, and evaluate **once**.
10. At ≤720px the hamburger, glass backdrop and white sheet drawer behave as §16.1.3 describes.
11. All five views render every mock view-model state — every `ProofStage`, all eleven error codes,
    funded, rejected, empty — without a runtime error.
12. Page 4 failure state displays the explicit zero-funds-moved / state-unmodified confirmation.
13. Page 5 shows no asset-level private record in any state.
14. Every asset attribute on Page 2 carries a visible `Private` tag; Page 3 shows the public
    disclosure set as public.
15. All five ASCII themes render and are visually distinct, matching the glyph sets in I.9.
16. `AsciiMorph` runs a 300ms scramble on route change.
17. With `prefers-reduced-motion: reduce`, **all** procedural animation halts and a static frame
    renders — verified by toggling the OS/devtools setting on every page. This includes the landing
    page's CSS/canvas background.
18. Measured fps, VRAM and GPU load per theme are reported with the machine they were measured on.
19. Every interactive element is keyboard reachable and shows a visible focus ring on both white-pill
    and black-panel surfaces.
20. A greyscale screenshot of Page 4 funded and Page 4 rejected remains unambiguous — glyph and label,
    not colour alone.
21. The background canvas is `aria-hidden`, not focusable, and `pointer-events: none`.
22. `grep -rn "/\*\|//\|<!--" packages/app/src/ui landing --include=*.css --include=*.tsx --include=*.ts --include=*.html --include=*.js` shows no comments.
23. No import from `packages/app/src/app/` appears anywhere under `packages/app/src/ui/`.
24. No file under `packages/app/src/app/`, `packages/app/src/viewmodels/`, `vite.config.ts`, the SPA
    `index.html` or `packages/app/package.json` was modified by you.
25. The three dangling symlinks in `docs/` are untouched.
26. Every dependency is an exact pinned version.
