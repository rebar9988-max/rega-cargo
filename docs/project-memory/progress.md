# Progress

Use Git history and PR descriptions for detail; record only status and pointers here.
Snapshot: 2026-10-11 ~15:40 UTC, `main` @ `df8794e`.

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
