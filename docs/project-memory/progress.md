# Progress

Use Git history and PR descriptions for detail; record only status and pointers here.
Snapshot: 2026-10-11 ~15:40 UTC, `main` @ `df8794e`.

## Current work (2026-10-13)

- [PR #85](https://github.com/rebar9988-max/rega-cargo/pull/85) `claude/local-quality-gate-20261013` (draft, not merged; Codex handoff in PROJECT_MEMORY.md): `npm run quality:local` + workflow minute savings + memory. Local gate PARTIAL on this cloud session (no Docker daemon); needs a full run on a machine with Docker before merge. No Worker change, so no deploy is needed after merge.
- [PR #87](https://github.com/rebar9988-max/rega-cargo/pull/87) `claude/security-fixes-port-20261013` (draft): the five fixes below ported onto `main` plus port fix `cd0251c` (I-12). Gate PARTIAL (no Docker); needs the full gate, owner review and authorization. Supersedes the next bullet.
- [PR #86](https://github.com/rebar9988-max/rega-cargo/pull/86) (draft, another agent): integrations re-verification, docs only; overlaps `docs/project-memory/integrations.md` with #85.
- (Historical, ported in #87) **Unmerged security fixes on `claude/rega-cargo-clone-oyhxb4`** (2026-10-12, no open PR, not on `main`, checked by subject search and per-file diff): `df19bd1` /track accepts only unguessable codes · `06340e8` one booking per signed quote · `61f3436` single-use bot-gate tokens, fail-closed rate limits · `9ff5774` phone sign-in cookie/counters · `8b67547` atomic per-user marketplace action limit (+ `23eaa92`, an older copy of PR #77). The branch forks from `475593d` (2026-10-11) and is far behind `main`; port onto a fresh branch from `main`, re-test, owner review. Untouched by this session.

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
