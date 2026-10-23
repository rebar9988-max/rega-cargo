# Marketplace (`/market`) honest empty states — 2026-10-23

Owner brief "R&L MARKETPLACE — EXISTING UX AUDIT & PREMIUM REFINEMENT" (refine, never rebuild),
resumed from `main` @ `31c4a77` (PRs #150–#155 already refined `/stores` and `/stores/request`;
not repeated here). The reference video named in the brief was not attached in this session.

## Audit

Evidence: official-image baselines `market-*.png` (no-DB error state) and live production
screenshots of `/market` (Firecrawl, `maxAge: 0`, ckb 390 px and en 1280 px, catalogue empty).

| # | Finding (verified) |
|---|---|
| 1 | With nothing listed, the nine-field filter form (≈ 500 px on a phone) appears before any message, although it cannot narrow anything |
| 2 | The unfiltered empty message said "Nothing matches." although nothing was filtered; the honest copy `JOURNEY_COPY.marketEmpty` already exists in all seven languages |
| 3 | The pager showed "1 / 1" with no products |
| 4 | The empty state was an ad-hoc start-aligned box with a primary button, a red text link and a reset link in three different styles, unlike the `/stores` `rl-empty-state` card |

Kept as is: header, hero, footer, homepage, product cards, filters (when products exist),
sort, favourites/sell/admin links, the no-database error state (changing it would move the
`market-*` layout baselines for a state customers rarely see; reported, not changed).

## Change

- `src/lib/market/search.ts`: `isMarketFiltered` and `marketView(search, count, pages)` decide
  filters / empty state (`catalogue` vs `filtered`) / reset / pager.
- `src/routes/market.index.tsx`: an empty catalogue shows `marketEmpty` in the existing
  `rl-empty-state` card with European stores (primary) and Bring For Me (secondary) and no
  filter form; an empty filtered result keeps the filters and shows "Nothing matches." with the
  same actions plus the existing reset link; the pager appears only with more than one page (or
  past the last page). No copy, route, query, data or API change.
- `src/styles/design-system.css`: `.rl-empty-actions` (one centred wrapping row, 44 px targets)
  and inline padding for `.rl-empty-state`.
- `src/lib/market/view.test.ts` (in `npm test`).

## Local gate (this session)

typecheck ✓; lint 0 errors (4 existing warnings); `npm test` 254 + 510 tests, 0 failed, 4
existing skips; build ✓; wrangler dry-run ✓. Playwright local Chromium `--ignore-snapshots`
(premium-360, chromium-iphone, chromium-ipad-portrait, chromium-laptop): 254 passed, 4 existing
skips, 0 failed. Real-browser check on the dev server (PGLite, seeded dev products) at
320/390/1280 px × ckb/ar/en: no horizontal overflow; `?q=zzz` shows the card with 3 actions and
the filters; no "1 / 1" pager; `?page=3` keeps filters and the back button. The catalogue-empty
state cannot be produced locally (the dev database is seeded); unit-tested, verified live below.

## Release (PR #156)

Hosted gate on `015a234` (run 39906219843): `scope` ✓, `verify` ✓, `layout lock` ✓ 728 passed /
16 existing skips / 0 failed (no baseline changed), `Workers Builds` ✓. Squash-merged as
**`b591f95`**; Cloudflare Workers Build `ea9c526f-c6ad-4284-b667-a3ad04e5f809` succeeded.
Live (Firecrawl, `maxAge: 0`): `/market?lang=ckb` (390 px) and `/market?lang=ar` (320 px) show
the `marketEmpty` card with European stores + Bring For Me, no filter form (`<form` only the
header search), no "1 / 1" pager; `/market?lang=en&q=zzz` (1280 px) keeps the filters and shows
"Nothing matches." with All / Bring For Me / European stores.

## Follow-up found live: empty-state text not centred in Latin-script languages

The live English screenshot showed "Nothing matches." at the right edge while the actions were
centred. Cause: `styles.css` right-aligns Latin-script text blocks directly
(`html[data-textdir="ltr"] :where(p, h2 …) { text-align: right }`), which beats the card's
inherited `text-align: center`. Pre-existing, also on the `/stores` empty state in English.
Fix (branch `claude/empty-state-centre-20261023`): `.rl-empty-state h2, p { text-align: center }`.
New test `empty states are centred in every language` (360/1280 px × ckb/ar/en on
`/stores?q=vodka`): fails at "360 en" without the fix, passes with it. Local: typecheck ✓,
lint 0 errors, `npm test` 254 + 510 / 0 failed / 4 existing skips, build ✓, Playwright
premium-360 + chromium-laptop `--ignore-snapshots` 103 passed / 4 existing skips / 0 failed.

Release (PR #157): hosted gate on `d49bf87` — `scope` ✓, `verify` ✓, `layout lock` ✓ 730 passed /
16 existing skips / 0 failed, `Workers Builds` ✓. Squash-merged as **`ffdae5f`**; Cloudflare
Workers Build `2fcef3fe-a7cc-4437-a708-3192e867331f` succeeded. Live (Firecrawl, `maxAge: 0`):
`/market?lang=en&q=zzz` (1280 px) and `/stores?lang=en&q=vodka` (360 px) show the empty-state
text centred above centred actions. Not verifiable from the agent: production console logs and
the active version allocation (no Workers deployments API); a physical phone.

## Round 2 (owner: "fix everything, don't stop") — product page and error state

Audit on the dev server (PGLite with seeded dev products; production has none yet):

| # | Finding (verified) | Fix |
|---|---|---|
| 1 | Product page offer line in English read "0 IQD Price 15,000 IQD · Shipping · سلێمانی": one paragraph with an Arabic-script city first took the RTL bidi direction and reordered the English labels | city, price and shipping are separate runs with separate `·` elements (`.rl-offer-meta`) |
| 2 | Stock "few left" / "out of stock" hard-coded in Sorani in every language (hard rule 4) | `lowStock`, `outOfStock` in `market-copy` for all seven languages (translate-review noted) |
| 3 | Save / review / favourite results appeared at the very end of the page, far from the action | each result is shown under its own action (`role="status"`) |
| 4 | Not-found product page had only a page header, no way on | Back to the marketplace (`backToMarket`, new key) + European stores |
| 5 | `/market` error state (no database): untitled muted line and three stacked buttons of different widths | the titled `rl-empty-state` card (existing `errorTitle`) with the actions centred in one wrapping row |

Not changed (reported): the product description is stored only in Sorani (`description_ku`), so
non-Sorani pages show it in Sorani — a data limitation, not a UI defect; the customer-visible
"Admin" link on `/market` (the admin pages are protected) — product decision.

Baselines: the 27 `market-*` page baselines change by design (error state) and are re-rendered
in the official image by a temporary branch workflow, removed before merge.

Local gate: typecheck ✓, lint 0 errors, `npm test` 254 + 510 / 0 failed / 4 existing skips,
build ✓; Playwright `--ignore-snapshots` premium-360 + chromium-iphone + chromium-laptop 180
passed / 4 existing skips / 0 failed (new error-state test at 320/360/1280 × ckb/ar/en).

Baseline render: temporary workflow run 39911056647 committed exactly 27 `market-*.png`
(`6891780`); reviewed — header and page header pixel-identical down to the state area
(first changed row 347–459 px), footers identical, pages +45 to +199 px (titled card). Workflow
removed before the PR.

