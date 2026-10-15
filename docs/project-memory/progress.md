# Progress

## 2026-10-15 homepage visual fidelity (PR #104, not merged)

Owner re-asserted the original homepage design as visual authority. [PR #104](https://github.com/rebar9988-max/rega-cargo/pull/104) (`claude/visual-fidelity-20261015`): phone home header gets a full-width search row (field was 0 px at 320 px), hero background rebuilt with the reference's red silk (no white seam), phone art on a continuous red field, art column capped at 40rem, LTR subtitle alignment, dark-mode tints. Local gate: typecheck, lint 0 errors, 486 unit passes, build, Chromium layout lock 394/12 skips/0 failed. Awaiting owner merge (merge = Cloudflare deploy); `/` screenshot baselines need re-render (I-7). Report: `docs/verification/visual-fidelity-20261015.md` on that branch.


## 2026-10-15 continuation checkpoint (Actions still blocked, I-7)

- **PR #87 (security port) is superseded:** every one of its five fixes is already on `main` (public `/track` 60-bit codes, one booking per signed quote via idempotency key, single-use gate tokens + challenge rate limit failing closed, `__Host-rl_phone` cookie + privacy copy in 7 languages, atomic marketplace action limit; gate key derived under `rl-ai-gate-v1`). `main`'s `RlAiUsage` Durable Object is *more* hardened (transactions, no day rollback, safe refunds), so merging #87 would regress it. Recommendation: owner closes #87 unmerged. Not closed by Claude.
- `npm audit` (all and `--omit=dev`): 0 vulnerabilities on `main` `5d66eee`.
- PR #99 (language selector, another session) still merges cleanly with `main` after #102.
- Live lab performance (Chromium, read-only; mobile = Slow 4G 150 ms/1.6 Mbps + 4× CPU, 390 px; median of 3; LCP read before scrolling): LCP mobile `/` 3.16 s (hero image 29 KB, already preloaded with high priority; TTFB ≈1.06 s through the agent proxy), `/stores` 1.51 s, `/quote` 1.14 s, `/track` 1.01 s, `/ai` 1.08 s; desktop all ≤ 1.23 s. CLS ≤ 0.0264 everywhere. Lab numbers only, not Lighthouse scores or field data.


## 2026-10-15 UI refinement verified live

PR #102 (`5d66eee`) is live at https://www.rlgo.net (identified by CSS unique to the change; version ID not queried). Owner-approved read-only verification passed: 350 page loads, 0 overflow/page/console errors, 23/23 existing specs on production. Open: Bring For Me draft checkbox (PR #97), narrow 360 px home search text area beside the AI capsule (target passes), screenshot baselines (I-7), WebKit/native iPhone unverified. [Report](../verification/ui-refinement-20261014.md).


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
