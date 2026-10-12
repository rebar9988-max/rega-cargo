# Progress

## 2026-10-12 conversational assistant checkpoint

Premium conversational extension: implemented and pushed as draft [#69](https://github.com/rebar9988-max/rega-cargo/pull/69), branch `feat/rl-premium-chat-20261011`, stacked on draft #68; full 451-pass regression suite plus typecheck/lint/empty-DB build/dry run. Final focused visual/interaction suite: 90 pass without retries; full preceding suite: 449 pass, three pass on existing retries, twelve skips. Baseline review and draft PR creation are recorded in the chat audit. Fresh GitHub state unchanged through main `486e442`, #68 `f896a00`; no active jobs cancelled. Release remains blocked by the verified Actions account billing gate and existing backend/auth gaps. [Evidence](../ai/chat-audit-2026-10-12.md).

Use Git history and PR descriptions for detail; record only status and pointers here.

2026-10-12: owner-requested TinyFish investigation completed within verified zero-rate Search/Fetch. Negative wallet balance and unconfirmed authenticated profiles block paid browser automation; no top-up or new profile was created. Fresh read-only checks preserve the existing Hyperdrive/billing blockers and production version. [Concrete steps and evidence](../ai/access-recovery-2026-10-12.md) are recorded in this same draft #68; runtime remains unchanged, and no remote CI/merge/deploy is claimed.

This documentation-only follow-up reran Node 22 checks: 436 pass / zero fail / four existing skips, typecheck, lint with the same five existing warnings, empty-DB build and Wrangler dry run all pass. All 148 public files remain byte-identical. No new full visual or live inference run is claimed.

Snapshot: 2026-10-11 ~15:40 UTC, `main` @ `df8794e`.

Continuation checkpoint (16:10 UTC): main memory changes through `486e442` are preserved in the fix branch. [Draft #68](https://github.com/rebar9988-max/rega-cargo/pull/68), branch `fix/rl-ai-budget-hardening-20261011`, contains tested P0 AI and verification repairs (`e430bbf`, `f210498`). It targets the dedicated review base, is unmerged and has no remote Actions run. The [audit](../ai/audit-2026-10-11.md) records actual tests, an earlier failed full visual run, the passing full repeat with three flaky cases, final 41-pass focused run, byte-identical public assets and all blockers. No database or deployment change was made by this work.

Additional open PRs inspected: #64 marketplace translations, #65 database recovery documentation, #66 store/catalogue translations. Their files were left untouched. Do not close or merge them based on assumed overlap.

Memory follow-up quality gate: Node 22 **436 passed, zero failed, four existing skips** (including all five memory guards); typecheck/lint/empty-DB build pass. No runtime/dependency/workflow change after tested `f210498`; no new screenshot baseline. Draft #68 remains unmerged/undeployed with no remote CI run.

## Active / open PRs

| PR | Branch | Title | State |
|---|---|---|---|
| #60 | `claude/rl-cargo-design-impl-xvqpm0` | Home: brand-red hero card and parcel-tracking entry (Figma concept) | draft, CI running (earlier runs failed) |
| #57 | `claude/rl-ai-shopping-hero-k5aeln` | i18n for all 7 languages + product-link layout shift + announcement landmark | open, may overlap #55/#61 (merged) |
| #51 | `claude/rl-cargo-safe-expansion-0rike6` | Product-link check + homepage/catalogue refinements | open, likely superseded by #53 |
| #49 | `claude/rega-cargo-clone-oyhxb4` | Official R&L logo, soft 3D buttons, ten-group catalogue | draft; holds 6 unmerged hero/forms/store-card commits on top |
| #48 | `brand/official-rl-logo` | Replace R&L branding with the official logo | open, likely superseded by #50 |
| #9 | `docs/rl-ai-architecture` | R&L AI architecture proposal | open (design only) |
| #4 | `chore/nitro-audit-fix` | Bump Nitro beta to clear npm audit highs | open (issues I-4) |

"Likely superseded" is an assumption — compare the diff against `main` before closing anything.

## Pending (owner or approval needed)
- Repoint production DB (issues I-1) — blocker for market, requests, tracking, accounts.
- Choose phone sign-in provider (I-3); Turnstile keys; enable auth (I-6).
- Approve held catalogue groups (`food`, `beauty/health`, `pets/food`).
- Native translation review; real legal details (I-5).

## Completed (recent, merged to `main`)
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
