# Progress

Use Git history and PR descriptions for detail; record only status and pointers here.
Snapshot: 2026-10-11 ~15:40 UTC, `main` @ `df8794e`.

## Active / open PRs

- 2026-10-12: shipping/bazaar separation prepared on `claude/separate-shipping-bazaar`; dedicated `/quote` design, no home/catalogue calculator or service switch. Not merged/deployed. [Report and verification](../redesign/shipping-separation.md).

| PR | Branch | Title | State |
|---|---|---|---|
| #51 | `claude/rl-cargo-safe-expansion-0rike6` | Product-link check + homepage/catalogue refinements | open; verified 2026-10-12: all its design commits are ancestors of `main` (via #60) and its product-link part is in `main` via #53, so nothing unique remains. Owner decides whether to close; not touched |
| #49 | `claude/rega-cargo-clone-oyhxb4` | Official R&L logo, soft 3D buttons, ten-group catalogue | draft; verified 2026-10-12: its commits are ancestors of `main`; logo files byte-identical. Nothing unique remains. Not touched |
| #48 | `brand/official-rl-logo` | Replace R&L branding with the official logo | open; verified: same 1254x1254 artwork as `public/rl-logo.png` on `main` (mean pixel diff 0.49/255); only changes the asset pipeline and conflicts across 22 commits. Not touched |
| #9 | `docs/rl-ai-architecture` | R&L AI architecture proposal | open (design only); outdated: says nothing is implemented, but `/ai` ships |
| #4 | `chore/nitro-audit-fix` | Bump Nitro beta to clear npm audit highs | open (issues I-4); no common ancestor with `main`; real content is the one-line Nitro bump, validated separately (see I-4) |

"Likely superseded" is an assumption — compare the diff against `main` before closing anything.

## Pending (owner or approval needed)
- **GitHub Actions starts no job** (since ~2026-10-11 15:38 UTC, also on `main`; my pushes of 2026-10-12 created no run). Probably billing or a spending limit, unverified. No PR can be merged or deployed without CI until the owner fixes it.
- Repoint production DB (issues I-1) — blocker for market, requests, tracking, accounts.
- Choose phone sign-in provider (I-3); Turnstile keys; enable auth (I-6).
- Approve held catalogue groups (`food`, `beauty/health`, `pets/food`).
- Native translation review; real legal details (I-5).

## Completed (recent, merged to `main`)
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
