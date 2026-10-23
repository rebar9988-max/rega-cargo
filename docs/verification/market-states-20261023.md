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
