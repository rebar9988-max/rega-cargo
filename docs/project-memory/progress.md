# Progress

## 2026-10-18 homepage hero: original silk released (PR #122 / `f430d75`)

**Final:** owner requested publication; #121 prerequisite merged; complete hosted gate passed (507 unit/script + 651 browser/layout/pixel, 4/16 existing skips, zero failures). Main-only Cloudflare Build `5fb9e9c5` succeeded; version `b1ac11a9` verified at 100%. Live motion, stable foreground, reduced motion and required routes verified; detailed production rerun/environment limits are in the report below. Earlier diagnostic counts in this entry are superseded by that final gate.

Continuation preserves the original silk photograph instead of replacing its folds. A transparent, guarded WebGL overlay moves only silk (18/26-second waves); the original poster supplies the stationary headphones and podium. Reduced motion/static fallback, offscreen/tab pause, decoded-mask startup, context-loss cleanup and a 300k-pixel/30fps cap are covered by focused tests. Original hero pixels and geometry are identical in 21 reduced-motion comparisons (320–1440 px × ckb/ar/en). Official-image focused checks: 46 passed, 4 Firefox WebGL-unavailable skips; Firefox fallback passed. Broader official-image geometry: 537 pass / 16 skips / 1 existing WebKit iPad search hydration failure; no full-green gate claim. See the [report](../verification/hero-silk-20261018.md) for remaining gates and production status. The earlier procedural screenshots/results describe a superseded candidate, not production.

## 2026-10-18 CI, WebKit/Firefox and layout lock (PR #121 merged as `96d9f15`; tests/config/baselines only)

GitHub Actions runs again (I-7 resolved). The official-image layout lock had failed on `main` @ `598e93f` only on stale pixel baselines (61 failed, 500 not run); baselines re-rendered with the `update_baselines` dispatch and reviewed (351 PNGs; `/` 5658 to 3485 px on iPhone, phone pages +16-24 px, laptop -72 px). On the PR head `46de4ca` (run 39117144355, no `update_baselines`): `scope`, `verify` and `layout lock` pass; layout lock 606 passed / 16 skipped / 0 failed / 0 flaky (Chromium 372, WebKit 188, new Firefox `premium.spec.ts` 23, premium-360 23). Two test-only fixes found on the way: Firefox needs `HOME=/root` in the job container and a one-font-size tolerance in the category-label cut-off check (66/61 px, nothing hidden); a WebKit iPad homepage-search flake now waits for hydration. Live `www.rlgo.net` re-checked read-only (routes 200, redirects, workers.dev 404); Cloudflare active version/traffic still **not verifiable** by the agent. Owner subsequently requested publication of the previewed silk animation; prerequisite #121 merged normally as `96d9f15` after verifying its successful hosted checks. [Report](../verification/ci-gates-20261018.md).

## 2026-10-18 weight/size digit input (PR #118 merged `675c644`; deployed by Build `74e026c6`, Version `e3ab56d5-c74b-4317-9c63-c254af2a39cd`)

Production inspection (78 read-only flows, 320/390/1440 px, ckb/en: 0 failures). The only remaining browser defect after the concurrent release `dc5bec0`: Arabic-Indic/Persian digits (and `1e1` on the server) in weight/size inputs. Fixed with one shared `parseDecimal`; pricing unchanged. Chromium 395/12 skipped/0 failed, 236 + 271 unit tests. [Report](../verification/digit-input-20261018.md).

## 2026-10-17 code defect sweep (PR #115 merged `56e53f2`, deployed)

Six verified defects fixed with regression tests that fail on the old code: non-canonical quote signatures allowed up to 4 bookings per signed quote; request payloads over 4,000 characters were truncated into unreadable JSON (data loss, request still accepted); the alcohol-free exemption applied to the whole text and let banned alcohol words through as `review` (now clause-local, stricter only); a DB blip dropped admin compliance keywords; archived tracking events leaked to the owner; staff quote vs customer accept raced (now single atomic statements). Static analysis clean (tsc 0, ESLint 0 errors, audit 0). Left for the owner: phone-code resend lockout trade-off, 0.1 kg chargeable rounding (locked pricing formula), rate-limit fail-open, `review` matches not flagged on requests. Gate: 236 + 261 tests, build, dry-run, Chromium suite 394/12/0. Released on the local gate by owner instruction: Workers Builds `6cedf284`, Version ID `c0c4f5a6-441d-4162-9d53-9b3f837316a0`; live smoke checks passed (see deployments.md). [Report](../verification/code-defects-20261017.md).

## 2026-10-16 final production verification (read-only, no code change)

`main` @ `d29240d`. Production client assets are byte-identical (16/16 sha256) to a local build of `main`; latest Workers Builds check run: Build `9cbb8f8c`, Version `3ca8f27e-0937-4a72-b9f7-4b9451dd02b7` - active-at-100% / traffic **not verified** (DNS-scoped token only). GitHub Actions still billing-blocked (run 38907381184: 2-3 s, runner 0, 0 steps) - owner action in I-7; CI is not green. Chromium suite on the built Worker 394 pass / 12 by-design skips / 0 fail; Firefox and WebKit not run (not installed; `playwright install` forbidden here). 480-state width matrix overflow 0, axe 0 violations, 2,727 focus stops ok, live 96 loads 0 console/page/HTTP errors. [Report](../verification/final-verification-20261016.md).

## 2026-10-16 final hardening and responsive parity (PR #111 merged `d96c4a8`, deployed)

Audit of `main` @ `d1e0229`; two root-cause CSS fixes in `ref-home.css` (15 lines): the home search placeholder no longer shows as a clipped fragment below 418 px (pill stays a 44 px tap target; verified by touch at 320/360/390), and the dark-mode hero glow is `/ .4` instead of `/ .55` so the eyebrow reaches 5.1:1 at 360 px (was 4.17:1) without losing the dark secondary button's separation. Verified on the built Worker without Docker: typecheck, lint (0 errors), 236 + 255 tests, build, dry-run; Chromium layout suite 394 pass / 12 skipped / 0 fail; 480-state matrix at 320-1920 px x ckb/ar/en x light/dark: overflow 0; live production 96 loads with 0 console/page errors and 0 HTTP >= 400; production-vs-branch pixels 97 of 108 identical. Mobile/desktop parity against the approved desktop design confirmed (same shared components, stacked). `/ai` consent checkbox: labelled, 24 px (WCAG 2.2 AA ok), owner-baseline module untouched. Released on the local gate by owner instruction: Workers Builds `f276441a`, Version ID `63811e37-a1b7-4f30-8fc9-600331d5bc1b`; live checks passed (see deployments.md). **Not run / blocked:** Firefox and WebKit (not installed), official-image layout lock and baselines (no Docker; hosted Actions billing-blocked; baselines stale), Cloudflare active version/traffic (agent token is DNS-scoped, Workers API read refused). [Report](../verification/final-hardening-20261016.md).

## 2026-10-16 touch-target, accessibility and visual verification (PR #109, merged `a406006`, deployed)

Continuation of the 2026-10-14 refinement (#102 already on `main`). After merging `main`, PR #109 shrank to one class change: the Bring For Me draft checkbox label (26 → 50 px hit area, layout footprint unchanged, page height identical to production in 18/18 checks) plus evidence. Verified on the built Worker without Docker (`wrangler dev --config .output/server/wrangler.layout.json --host localhost`, Chromium via `launchOptions.executablePath`): layout suite 394 pass / 12 skip / 0 fail; typecheck, lint (0 errors), 236 + 255 tests, build, dry-run pass; 450-state overflow audit 0; axe 180 states 0 violations; 2,727 focus stops all with an indicator; CLS max 0.0023; live production vs branch pixels: 108 renders, 0 height differences, max 0.051 % pixels. Earlier Playwright failures were dev-server (Vite) artefacts, identical on unmodified `main`. Reported, not changed: header search is 86 px at 360 px; dark-mode 360 px hero eyebrow 4.1-4.17:1 (brand token); R&L AI consent checkbox (owner baseline). **Not run:** official-image layout lock, pixel baselines (stale for `main`: 80 of 84 fail locally, 66 by page height), WebKit. [Report](../verification/ui-touch-targets-20261016.md). Released on the local gate by owner instruction: Workers Builds `06a5f699`, Version ID `dd667bef-0fcf-4210-b8a3-0da8779a9976`; live checks passed (see deployments.md).

## 2026-10-14 UI/UX refinement (spacing, alignment, touch targets)

Owner's strict refinement prompt (no redesign). Branch `claude/ui-refinement-20261014` from main `f207338`. 15 measured issues fixed in presentation only (home header/hero alignment, phone header targets, tablet product columns, footer targets/spacing, store-card/chip/legal/market/link targets, `/market` spacing, `/track` form width). 392-page Chromium audit before/after: overflow 0/0, target detections 2,489 → 91 (remaining: Bring For Me draft checkbox owned by open PR #97). Local gate: typecheck, lint 0 errors, 486 unit passes, build, dry-run; Chromium layout lock 394 passed / 12 existing skips / 0 failed (no WebKit/pixels: no Docker daemon). [PR #102](https://github.com/rebar9988-max/rega-cargo/pull/102). Five module boundaries, R&L AI baseline, copy, routes, pricing and compliance untouched. [Report](../verification/ui-refinement-20261014.md).


## 2026-10-14 beta release verified

PR #95 merged as 8ae779f; Cloudflare main Build 85d441c9 succeeded, application Worker 1a514fed at 100%. Migration 0015 applied safely, no grants/customer record loss. 483 local tests (4 skips), build/type/lint/dry run pass; 12 real customer + 3 tracking/security cases passed across documented final runs on mobile/desktop/WebKit. Beta legal exception expressly authorized; public legal gate retained. Owner/OTP/native checks unavailable; Actions failed before steps, telemetry Forbidden. [Evidence](../verification/rl-five-improvements-20261013.md). Earlier in-progress/held checkpoints below are historical.


## 2026-10-14 beta continuation

Owner expressly permits beta deployment with incomplete legal/business content, superseding the earlier hold. PR #95 remains the implementation vehicle. Explicit beta policy preserves unverified pending content and blocks incomplete formal/public release. Existing Neon dev migration validation passed; fresh local gate and production rollout are in progress. No owner/OTP bypass or new paid resource. [Evidence](../verification/rl-five-improvements-20261013.md).

## 2026-10-14 five-improvement candidate

Implementation on `codex/rl-five-improvements-20261013`, rebased onto `19c17f2`; [PR #95](https://github.com/rebar9988-max/rega-cargo/pull/95) is open/draft and production merge/deploy is blocked by owner-verified legal content and verified owner/OTP access. 481 local unit/script passes, 4 existing skips; complete browser evidence and correction checkpoints in [verification](../verification/rl-five-improvements-20261013.md). Migration 0015 has isolated validation only. No production changes.


Use Git history and PR descriptions for detail; record only status and pointers here.
Snapshot: 2026-10-11 ~15:40 UTC, `main` @ `df8794e`.

## Current work (2026-10-13)

- PR #89: smallest domain/WebKit root-cause repair, staging `75511c45` verified across five browser profiles, slow requests and actual scrolled painting. Canonical HTTPS www + apex/HTTP redirects, SW v12, no product/backend/branding changes. Full local lock completed; focused no-retry gate passed 45/45. PR #89 merged as `4465ba7`; production `ddde9ad1` passed 40 browser, 6 rendering/paint, 2 slow, 31 protocol and 2 cache checks. Documentation-only follow-up records production evidence. [Report](../verification/rlgo-domain-20261013.md). PR #88 was reused as the domain migration reference; its branch and other open work remain untouched.

- `claude/unified-journeys-20261013`: unified real marketplace + Bring For Me + tracking, small reusable changes and existing contract preservation. [Report](../redesign/unified-journeys-20261013.md). PR #82: typecheck, 426 unit tests (4 existing skips), lint 0 errors/5 existing warnings, migration-free build and Worker dry run pass. Final official-image no-update lock 432 passed / 12 intentional skips / 0 failed on code `c6941ac`; staging `f04cd880` passed 57 browser cases and 30 axe checks. Reviewed translations adopted from #64/#66 without merging their branches. PR #82 merged as `04ada22`, Cloudflare main Build `d964e56c` succeeded; initial production version `fff69ec5` passed 57 browser cases and 30 axe checks.
- Hyperdrive P1 root cause fixed live; real marketplace now healthy/empty. No database records or schema changed.
- Cloudflare main automatic deployment recovered on retry. Feature preview retry found the missing `previews` block; follow-up `claude/verified-release-preview-20261013` (`ff1c6e0`) adds isolated noindex vars and fixes reproduced first catalogue clicks via shared readiness guards. Staging `0dd47819` passed the existing catalogue filter/favorite/keyboard/banned-query regression 3 consecutive times; final no-update lock passed 437 / 16 intentional skips / 0 failed; no baseline changes. Follow-up merge/rollout pending. Missing phone-provider credentials remain an external blocker for authenticated production journeys.
- Existing PR #79 also edits `/stores/request`; it remains untouched. This task preserves its branch rather than silently merging unverified work.

## Historical active / open PRs (recheck GitHub before acting)

- 2026-10-12: [PR #72](https://github.com/rebar9988-max/rega-cargo/pull/72) shipping/bazaar separation prepared on `claude/separate-shipping-bazaar`; dedicated `/quote` design, no home/catalogue calculator or service switch. Official-image gate passed: typecheck, 417 tests, lint (0 errors), build, cf dry-run, 386 browser/layout checks (12 expected skips). Not merged/deployed. [Report and verification](../redesign/shipping-separation.md).

| PR | Branch | Title | State |
|---|---|---|---|
| #77 | `claude/ci-minutes-recovery` | ci: spend fewer Actions minutes (docs-only skips layout, drafts wait, superseded PR runs cancel) | open 2026-10-12; workflow-only, no Worker change; local verify gate green (417 tests); hosted CI cannot start (I-7) |
| #51 | `claude/rl-cargo-safe-expansion-0rike6` | Product-link check + homepage/catalogue refinements | open; verified 2026-10-12: all its design commits are ancestors of `main` (via #60) and its product-link part is in `main` via #53, so nothing unique remains. Owner decides whether to close; not touched |
| #49 | `claude/rega-cargo-clone-oyhxb4` | Official R&L logo, soft 3D buttons, ten-group catalogue | draft; verified 2026-10-12: its commits are ancestors of `main`; logo files byte-identical. Nothing unique remains. Not touched |
| #48 | `brand/official-rl-logo` | Replace R&L branding with the official logo | open; verified: same 1254x1254 artwork as `public/rl-logo.png` on `main` (mean pixel diff 0.49/255); only changes the asset pipeline and conflicts across 22 commits. Not touched |
| #9 | `docs/rl-ai-architecture` | R&L AI architecture proposal | open (design only); outdated: says nothing is implemented, but `/ai` ships |

"Likely superseded" is an assumption — compare the diff against `main` before closing anything.

## Pending (owner or approval needed)
- **GitHub Actions starts no job** (since ~2026-10-11 15:38 UTC, also on `main`). Verified: account billing block (I-7; re-verified 2026-10-12 18:36 UTC). No PR can be merged or deployed without CI until the owner fixes it.
- Production Hyperdrive and fallback recovered (I-1, 2026-10-13); no data/schema mutation.
- Choose phone sign-in provider (I-3); Turnstile keys; enable auth (I-6).
- Approve held catalogue groups (`food`, `beauty/health`, `pets/food`).
- Native translation review; real legal details (I-5).

## Completed (recent, merged to `main`)
- #78 header: brand-red bar + swipeable category strip on phones/tablets; merged `bd03131` by the owner, deployed `2e724d37` (staging `ca679d77` first); local gate (official-image layout lock 387/12/0)
- #72 shipping/bazaar separation; merged `3c7ad5a`, deployed `12dcd05e`
- #75 Nitro 3.0.260903-beta (clears the 5 npm audit highs, supersedes #4); merged `a7ee020`, deployed `4242774e`; reduced local gate
- #57 product-link layout-shift fix (CLS 0.26 -> 0.001) and named announcement landmark; merged `361f954`, deployed `5a2c2ecc`; reduced local gate (decisions.md)
- #60 home hero as a brand-red card + parcel-tracking entry (Figma "Mobile Home Concept", read-only View seat); merged as `9ba82e9` on the local quality gate (GitHub Actions blocked, I-7; owner decision 2026-10-12), deployed to production `853e698b`
- #63 project-wide persistent memory (`CLAUDE.md` lifecycle, `PROJECT_MEMORY.md`, `docs/project-memory/`, memory test); CI verify + layout lock green on `8d68623`, merged as `df8794e`
- #62 compliance: banned-product filter gaps (percent-encoded links, brands sold by name, disguised spellings)
- #61 i18n header/footer/home/marketplace copy for ku, de, fa, tr
- #59 integration inventory and production DB verification report
- #58 Hyperdrive read only inside a request · #54 Hyperdrive binding
- #56 `CLAUDE.md` Sorani communication preference
- #55 i18n SEO + product-link copy · #53 product-link check on in production
- #52 CI layout-lock timeout report · #50 static AI hero, brand system, catalogue, RTL layout lock
- #47 premium redesign Steps 0–6 ([docs/redesign/](../redesign/README.md))
- #40–#46 Western digits, layout lock, compliance, header language picker, customer requests (R7), prohibited-items page, brand rail

## 2026-10-13 domain exclusivity

Domain exclusivity follow-up: live cargo custom-domain attachment and its DNS record removed; staging shutdown verified first (404 while www stayed 200), then production workers.dev disabled. Both workers.dev URLs return 404; apex 301 preserves path/query. Source config and permanent instructions updated to prevent re-exposure. Local typecheck, 432 unit tests/4 skips, lint 0 errors/5 existing warnings, migration-free build, both environment dry-runs, startup and npm audit passed. Official-image layout lock: 455 passed, 16 existing skips, zero failures or retries. Canonical browser verification: 10 cases passed; 31 protocol checks passed. No application/UI/database change. Source persistence: [PR #91](https://github.com/rebar9988-max/rega-cargo/pull/91), normal merge followed by existing automatic main deployment.

## R&L AI ownership and verification — 2026-10-13

The source-stage observations below are historical and superseded by the verified production checkpoint at the end of this section.

R&L AI implementation, focused security and browser verification completed on `codex/rl-ai-domain-lock-20261013`; full official-image gate running. No production deployment claimed. Existing unmerged #68/#69 and unrelated PRs remain untouched. See the linked verification report for final gate and review handoff. See [verification report](../ai/rl-ai-verification-20261013.md).

Release preflight update: existing authenticated Cloudflare connector resolves the direct-CLI credential gap. Verified R&L main Builds trigger and rollback version `5791d60b`, no concurrent build. GitHub main branch resource reports `protected:false`. Hosted billing failure remains; the standing full local official-image gate policy applies. No release yet.

2026-10-14 continuation: full browser run 489 passed/16 existing skips/2 failed; failures were AI shortcut/consent hydration races. Fixed with existing `useHydrated` in AI controls only, added held-JavaScript first-interaction regression. Final affected official-image suite passed 72/72 without retries or baseline changes. Final full confirmation is running; no deployment yet.

2026-10-14 release gate: final official-image full run 499 passed/16 existing skips/one unchanged navigation harness cancellation; its original case passed 3 consecutive no-retry confirmations without source change. Final affected AI/readiness/visual suite 72/72. Typecheck, 460 unit/security passes + 4 existing skips, lint 0 errors/5 existing warnings, build and dry run passed on the final application tree. [PR #92](https://github.com/rebar9988-max/rega-cargo/pull/92) ready for normal authorized merge after preflight. Hosted Actions is not green (billing); standing full local gate policy applies. No release performed yet.


2026-10-14 verified production checkpoint: PR #92 merged normally as `481bfeb`; existing Cloudflare Builds `7387019a` succeeded, Worker `c87c162d-11e9-4ca7-86e4-f6eca4a600a6`, 100%, 06:57 UTC. Genuine live planner and image inference, strict refusals, five shortcuts, authorized workflow links and eight read-only existing routes passed. Privacy-safe telemetry showed no exceptions/5xx; bindings and secrets preserved. No rollout blocker remains. Hosted Actions billing, native camera/OTP/private-order verification and field performance remain limitations; no billing or unrelated business change. Documentation-only follow-up may deploy an identical app; query current Worker state. [Evidence](../ai/rl-ai-verification-20261013.md).


## 2026-10-14 owner-only R&L AI baseline

Owner explicitly reconfirmed that R&L AI must remain a permanent R&L foundation across unrelated changes; only the owner can explicitly request an affected baseline change. Identical rules recorded in root AGENTS/CLAUDE and module AGENTS/README. General modernization/refactor requests do not authorize drift. Preserving maintenance allowed. Exact identity, tool allowlist and Sorani baseline regression checks plus governance CODEOWNERS coverage added; no application/runtime or infrastructure change. Review rules are not technical immutability or branch protection.

Owner-only protection review: [PR #94](https://github.com/rebar9988-max/rega-cargo/pull/94). Local verify passed: typecheck, 462 unit/integration/security passes + 4 existing skips, lint 0 errors/5 existing unrelated warnings, migration-free build and Worker dry run. Focused governance/memory 10/10; three isolated mutation checks rejected unauthorized drift. Runtime source and visual baselines are identical to the verified #92/#93 application, so browser/pixel suites were not repeated for governance-only edits. Hosted Actions remains billing-blocked; existing local gate policy applies.

## 2026-10-14 reference homepage

[PR #100](https://github.com/rebar9988-max/rega-cargo/pull/100) merged as `fb1bf7b` and live at https://www.rlgo.net (verified read-only, see [RL_DESIGN_PROGRESS.md](../implementation/RL_DESIGN_PROGRESS.md)). Pending: re-render `/` layout baselines, Lighthouse, three owner decisions (keyed logo, home tracking form, CARE+ wording).


## 2026-10-18 release continuation after #115/#116

Owner authorized implementation and release of the four previously deferred policy items: fixed five-minute/five-attempt OTP window with atomic 60-second resends and single consumption; decimal-comma weight inputs with all tenth-kilogram boundaries covered and pricing unchanged; fail-closed missing/error rate limits; transactional in-app staff review notices via additive migration 0016. No UI redesign, module boundary change, account grant or paid service. Details, measured checks, deployment state and remaining limitations: [release evidence](../verification/release-hardening-20261018.md).

Gate follow-up: the unchanged-base English slow-font test reproduced CLS 0.0589166 (>0.05). Local Latin fallback metrics repair in `src/styles.css`/`tokens.css` makes that existing test pass while primary fonts and final loaded-font design remain unchanged. Final full browser counts are in the same release report.


## 2026-10-19 Visible original silk follow-up

Owner cannot perceive the released motion. The published renderer runs, but 1.45-pixel deformation is too restrained. Candidate increases local fold travel and moving sheen with smooth foreground protection; no other runtime layer changes. Checks and publication in progress; see [evidence](../verification/hero-silk-20261019.md).


2026-10-19 verified outcome: Verified release supersedes the pending checkpoint above: #124 exact head fb79c2f passed hosted gate 39219963680, then merged normally as 5faa822. Main Build f5dd0b70 succeeded; version 788eccf7 at 100%. Real public suite 15/15 passed, four viewport samples and an already cached service-worker client verified, 13 routes finish at 200. No remaining visible-silk release blocker. [Evidence](../verification/hero-silk-20261019.md).


## 2026-10-19 Mobile silk quality repair in progress

Owner screenshot supersedes the earlier release-complete assessment. Production restored to original static version 20ffc4f4 at 100%; public 200/original image/no silk canvas confirmed. Candidate fixes transparent compositing, original colour preservation, independent startup and adaptive slow-device rendering. Actual DPR3 product colours are identical in nine Chromium/WebKit sizes; final hosted gate pending. [Evidence](../verification/hero-silk-mobile-20261019.md).
