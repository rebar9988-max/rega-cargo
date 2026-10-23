# Design and brand

Authoritative rules: [AGENTS.md](../../AGENTS.md) "DESIGN SYSTEM RULES". Implementation detail:
[DEPLOY.md](../../DEPLOY.md) "Brand logo", "Brand typography", "Layout lock". Redesign history: [docs/redesign/](../redesign/README.md).

## Never change
- **Logo**: owner-supplied red/white R&L artwork, source `public/rl-logo.png`; derived `rl-mark-168.webp`, favicons, icons, `og.jpg`. Only cropped/resized, never redrawn, mirrored or paired with a wordmark. New art ships under a new filename and a bumped `sw.js` `VERSION`.
- Red is an **accent only**: `--rl-brand #dd0303` (buttons), `--rl-accent #b80000` (text/links/focus). White/off-white surfaces, near-black text.
- Slogan: "MOVE SMART. DELIVER FAST."

## System
- Tokens: `src/styles/tokens.css` (semantic colour light/dark, spacing 8px grid, radius, motion), type scale in `src/styles.css`, components in `src/styles/design-system.css`, primitives in `src/components/ui.tsx`. Browse at `/_design`.
- Buttons: one `.rl-button` primitive with `data-variant` primary|secondary|ghost|danger.
- Fonts (self-hosted, `font-display: swap`): Noto Sans Arabic for ckb/ar/fa (Vazirmatn fallback), Inter subsets for Latin and numbers. Western digits everywhere.
- Direction: `<html dir="rtl">` always; `lang` follows locale; `data-textdir` carries the language's text direction. CSS logical properties only; directional icons flip.
- Motion 150–250 ms, respects `prefers-reduced-motion`. Full dark mode; theme applied before first paint (`src/lib/appearance-script.ts`, CSP hash tested).

## Layout lock
Breakpoints phone <768 · tablet 768–1023 · laptop ≥1024; content max 1200px; gutters 16/24/32.
Guards: `src/lib/layout-lock.test.ts` (in `npm test`) and `tests/layout/` Playwright (Chromium + WebKit; Firefox for `premium.spec.ts` only) with screenshot baselines in `tests/layout/__screenshots__/`.
**A baseline change is a design change.** Re-render only in the official image (CI workflow `update_baselines`, or `npm run test:layout:update`), never from a local browser.

## Header and category strip (phones/tablets, 2026-10-12, PR #78, live as `2e724d37`)
Below 1024px the header is one 64px brand-red row (menu, logo, search button, language, account) and the ten primary categories sit directly under it as a horizontally scrollable strip (`CategoryStrip` in `components/site-header.tsx`): icon above a two-line label, active category from `?cat=` (soft tile + 3px red underline), `food` visible but not a link, "More" opens the menu sheet. The search button focuses the existing (visually hidden) field in the same tap. Desktop header row and mega menu are unchanged. Owner reference: chat screenshot 2026-10-12. Label box is a fixed two lines with one line height for every script so pages sit at the same height in every language.

## Content rules that affect design
- No fake data (prices, ratings, stock, reviews, delivery promises). Catalogue photos are labelled examples.
- Store/brand logos keep a visible "not an official partner" note.

## Shipping separation (source change pending release, 2026-10-12)

`components/shipping-page.tsx` and `styles/shipping.css` own the `/quote` presentation. `components/bazaar-page.tsx` owns the store catalogue. Shipping forms and tracking are no longer embedded in the homepage; its shopping/shipping buttons navigate to separate routes. The full quote uses route/package/options sections, stacked mobile cards and a sticky desktop input column. Pricing logic and brand assets are unchanged. See [verification report](../redesign/shipping-separation.md).

## R&L AI ownership and verification — 2026-10-13

AI-scoped white/red restrained cards, existing tokens and official brand; reuse existing Vazirmatn v33.003 variable WOFF2 only inside assistant/image UI. Global Noto/Inter, homepage, header/footer and assets unchanged. Only 27 intentional `/ai` baselines updated in official Playwright 1.63 image after visual review. Keep correct RTL and bidi-isolated mixed text. See [verification report](../ai/rl-ai-verification-20261013.md).

## Reference homepage — 2026-10-14

`components/ref-home.tsx` + `styles/ref-home.css` (unlayered, scoped to `.rl-ref*`) own the home; `SiteHeader reference` renders the five-control header (physical order logo · language · search · R&L AI · menu, row isolated `dir="ltr"` while `<html dir>` stays rtl). Homepage-scoped font: Vazirmatn v33.003 (other routes keep Noto Sans Arabic). Measurements and evidence: [RL_REFERENCE_MEASUREMENTS.md](../implementation/RL_REFERENCE_MEASUREMENTS.md). The layout lock measures the reference header (`data-layout="ref-header"`, 64/98/98px) and exempts `.rl-ref` from the type-scale and image-ratio checks (`data-layout-exempt`); screenshot baselines for `/` must be re-rendered in the official image.

## UI refinement — 2026-10-14

Home header row, section heads and (from 1200 px) hero copy share one inline edge (`--ref-pad`; hero uses container units). Both hero headline lines start at the eyebrow's edge in every script. Touch targets ≥ 44 px on phones: reference header controls 2.75rem, footer links/legal TOC/store heart/chips/market actions `--rl-control-h`. Home section heads stay baseline-aligned (centring them raised font-swap CLS). Featured products: 2 columns on tablets, 4 from 1024 px. Footer reserves bottom-bar space only on phones/tablets (the bottom bar is shown on every page, the reference home included, since 2026-10-19). [Report](../verification/ui-refinement-20261014.md).

## European stores directory — 2026-10-22

`/stores` discovery: country chip row (DE, CH, IT, FR, GB) and a logo-only retailer rail, both single rows that scroll sideways; removable active-filter chips with reset. Store cards: 48 px logo tile (logo ≤ 28 px, `object-fit: contain`), name, country · host, two-line categories, official-site secondary button, one primary Bring For Me action. Store grid has its own layout-lock count `storeColumns` 2/3/4 (`data-layout-cols="stores"`); product sample grid keeps `catalogueColumns`. Existing tokens only; no colour, typography or logo change. [Report](../verification/european-stores-20261022.md).

## Marketplace refinement — 2026-10-22

Store logos (rail and cards, and the request form's store row) are sized by `storeLogoSize` in `lib/stores.ts`: equal area at the logo's own proportions inside a max box (rail 900 px² in 76×24, cards 1100 px² in 80×28), as `width`/`height` attributes; rail tiles are one size (6 rem). Store cards: country and host on two single lines aligned to the card's start edge (never the LTR host's own), categories reserve two lines, one hairline above the two quiet links (same style, centred). Request form: store row (logo tile, name, host), buy/ship switch as two equal halves (`.rl-intent-switch`), sent state with status icon and system buttons. Existing tokens only. [Report](../verification/marketplace-refinement-20261022.md). Follow-up 2026-10-23: the card logo tile spans the whole card and the favourite is a round corner badge (44 px target), so wordmarks stay full size on 320–430 px phones.

## Store discovery refinement — 2026-10-23 (PR #164, pending)

Owner-authorized substantial existing-UI refinement; official R&L logo and palette unchanged.
`/stores`: compact three-step hero and direct store/product-link search; one in-content
category row; country/audience filters next to results; retailer picker in a disclosure;
filtered regional storefronts grouped by brand; one card action opens the existing native
BottomSheet with region, official site, buy and self-purchased shipping. No illustrative
catalogue or duplicate category directory on this page. Compact directory footer and menu
resources. Existing responsive tokens/components/dark mode; no rebuild. See
[verification](../verification/store-discovery-20261023.md) for the actual gate/release status.
