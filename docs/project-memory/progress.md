# Progress

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
