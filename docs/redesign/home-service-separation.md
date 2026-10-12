# Home service separation — 2026-10-12

Baseline: `main` at `54e505b`. Review branch: `claude/clean-shopping-shipping-20261012`.
Status: implemented; final browser validation in progress. No merge or deployment.

## Problem and resulting behavior

The production home page always placed the shipping calculator above the store logos. Selecting
Delivery also inserted the embedded DeliveryHub, adding a second quote form among the shopping
sections. The supplied mobile screenshots show the oversized quote cards and store heading.

The home now has two accessible service tabs. Bazaar shows the shopping hero, stores with the
existing non-partner notice, and the shopping process. Delivery shows its shipping hero, tracking,
one calculator and shipping guidance. Both panels stay mounted so entered dimensions survive
switching; the existing cookie/local-storage preference still restores the selected service.
Home URLs carrying shopping search/category filters always render the shopping results.

Mobile quotes group the three dimensions in one row and show each shipping option as a compact
row with EUR, IQD and chargeable weight. Home headings use the type scale and balanced wrapping,
with smaller section gaps. The official logo, translated copy, pricing functions, APIs and
permanent product-ban logic are retained.

## Changed source

- `src/components/premium-home.tsx`, `bazaar-page.tsx`, `delivery-hub.tsx` and `src/routes/index.tsx`:
  service panels, appropriate hero actions, keyboard tab navigation and shopping-search routing.
- `src/components/quote-panel.tsx`, `src/styles/design-system.css`, `src/styles/tokens.css`:
  responsive input/price layout and scoped home typography/spacing.
- `tests/layout/premium.spec.ts`, `tests/layout/layout.spec.ts`: service selection, remembered
  state, preserved dimensions, quote handoff and banned home searches. Layout settling waits
  for visible calculators, fonts and images; a redundant second network-idle wait was removed
  after a fully rendered WebKit contact page timed out on the local Worker connection. The
  multi-navigation catalogue/hero cases have an explicit 120-second budget.

## Verification

Official `mcr.microsoft.com/playwright:v1.63.0-noble` image, Node `22.23.3`, `DATABASE_URL=''`.

- TypeScript passed.
- Unit tests: 417 passed, four existing skips.
- Lint: zero errors, five existing warnings in untouched auth/i18n/theme files.
- Production build and Cloudflare dry-run passed.
- Final geometry/interaction suite and affected screenshot baselines: in progress.

The first six-worker browser run passed 359 cases, skipped 12 and timed out in 26 cases.
A two-worker recheck passed 24 of those; the remaining contact/network-idle and long catalogue
cases prompted the settling/budget changes above. Final results replace the pending status
only after the complete rerun finishes.

Review paths: `/` (each tab), `/?lang=ckb|ar|en`, `/?cat=fashion`, `/?q=Vodka`, `/stores`,
`/quote?from=ber&to=ebl&kg=3.2&l=60&w=30&h=20`, `/track`. The compiled preview uses the existing
layout suite's local Worker. Production remains `https://cargo.regaplatform.com/` until release.
