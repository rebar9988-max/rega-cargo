# Progress

Use Git history and PR descriptions for detail; record only status and pointers here.
Snapshot: 2026-10-11 ~15:40 UTC, `main` @ `df8794e`.

## Active / open PRs

| PR | Branch | Title | State |
|---|---|---|---|
| #60 | `claude/rl-cargo-design-impl-xvqpm0` | Home: brand-red hero card and parcel-tracking entry (Figma concept) | draft, CI running (earlier runs failed) |
| #57 | `claude/rl-ai-shopping-hero-k5aeln` | Fix product-link layout shift (CLS 0.26) and name the announcement landmark | open; scope reduced to 8 files (translations dropped, they live in #55/#61/#64/#66); local checks green on `daab6ec`, **no CI result** (Actions blocked) |
| #51 | `claude/rl-cargo-safe-expansion-0rike6` | Product-link check + homepage/catalogue refinements | open; verified 2026-10-11: product-link part is in `main` via #53, its homepage hero is a different carousel design (AI is a secondary button) that conflicts with `main` in `premium-home.tsx`, `design-system.css`, `tokens.css`. Owner decision pending; not touched |
| #49 | `claude/rega-cargo-clone-oyhxb4` | Official R&L logo, soft 3D buttons, ten-group catalogue | draft; logo files byte-identical to `main`; shares 5 design commits with #51. `be509a0` (compact forms) cherry-picks cleanly onto `main`; `cc16212` conflicts only in `premium-home.tsx`. Not touched |
| #48 | `brand/official-rl-logo` | Replace R&L branding with the official logo | open; verified: same 1254x1254 artwork as `public/rl-logo.png` on `main` (mean pixel diff 0.49/255), so it only changes the asset pipeline and conflicts across 22 commits. Not touched |
| #9 | `docs/rl-ai-architecture` | R&L AI architecture proposal | open (design only); outdated: states nothing is implemented, but `/ai` ships |
| #4 | `chore/nitro-audit-fix` | Bump Nitro beta to clear npm audit highs | open (issues I-4); no common ancestor with `main`, real content is the one-line Nitro bump, validated separately (see I-4) |

"Likely superseded" is an assumption — compare the diff against `main` before closing anything.

## Pending (owner or approval needed)
- **GitHub Actions starts no job** (since ~2026-10-11 15:38 UTC, also on `main`; my pushes of 2026-10-12 created no run). Probably billing or a spending limit, unverified. No PR can be merged or deployed without CI until the owner fixes it.
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
