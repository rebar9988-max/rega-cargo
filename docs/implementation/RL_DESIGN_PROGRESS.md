# R&L reference homepage: progress checkpoint

Last updated: 2026-10-14 (session `session_01QUGppPbUTeYsGApJpfoV8P`).

## State

* Reference: owner homepage screenshot, 1024 × 1536 (`evidence/reference-1024x1536.webp`). Measurements: `RL_REFERENCE_MEASUREMENTS.md`.
* Branch: `design/rl-reference-home` (from `23eaa92`, the tip of the repo's default line when work started).
* Production status: **NOT DEPLOYED by this session** (see Blockers).

## Implemented

* `src/components/ref-home.tsx`: hero, 8 category positions, 4 featured examples, two banners, 4 benefit cards.
* `src/components/site-header.tsx` + `shell.tsx`: `reference` variant = five-control header (logo, language, search, R&L AI, menu), no announcement bar, no category nav, no bottom bar. All other routes keep the existing header.
* `src/components/bazaar-page.tsx`, `src/routes/index.tsx`: the home (no filters) renders `RefHome`; every filtered URL (`/?q=`, `?cat=`, …) and `/stores*` are untouched.
* `src/lib/ref-home-copy.ts` (i18n: ckb, ar, en; fa/de/tr/ku reuse English with `TODO(translate-review)`), `src/lib/ref-home-data.ts` (category mapping, compliance-filtered featured list).
* `src/styles/ref-home.css`: unlayered, scoped to `.rl-ref*`.
* Assets: `public/home/*`, `public/rl-mark-white-336.webp`; cache rules in `public/_headers`; service worker `rl-sw-v12`.
* Tests: `src/lib/ref-home-data.test.ts` (banned products never featured, honest copy), updated Playwright specs (`premium.spec.ts`, geometry exemptions for the reference page).

## Deliberate differences from the reference (hard rules win)

| Reference | Implemented | Why |
|---|---|---|
| Product prices (€1,199 …), strike-through price, "new / sale / discount" badges, cart | Four bundled example photographs, labelled "Example", price line "awaiting confirmation", cart control opens the existing buy-request form | AGENTS.md rule 1: no invented prices, discounts or stock |
| iPhone / AirPods / MacBook / Smart Watch X | earbuds, sneakers, kettle, perfume (existing catalogue examples) | Reference products are not in the catalogue |
| Hero secondary "see discounts" | "Compare prices" → `/market` | No discounts exist; `/market` is real price comparison |
| Banner "from everywhere in the world" | "From European stores to Kurdistan and Iraq" | Only the Europe corridor is supported |
| CARE+ banner with a purchase CTA | "Coming soon" badge, honest line "not available yet", CTA → `/contact` | CARE+ is not an operating service; no protection promise |
| Benefits: discounts, flexible payment, gift cards, favourites | Clear prices (→ `/quote`), parcel tracking (→ `/track`), store requests, saved stores (→ `/stores?fav=1`) | Only real platform features |
| "Wearables" tile | opens electronics accessories | catalogue has no wearables subgroup |
| Heading spelling "پێشنیهادە" | "پێشنیارە" | Official Sorani orthography (flagged `TODO(translate-review)`) |
| Footer absent | Existing footer kept | Impressum / privacy / terms links are legally required |
| Old home: quote calculator, brand strip, how-it-works, trust sections | Removed from `/` only | Reference has none; `/quote`, `/track`, `/stores` still provide them |
| Logo on red | Keyed (red → transparent) derivative of the owner's logo | The reference shows the white variant. **Owner should confirm**; revert = swap one `<img src>` back to `/rl-mark-168.webp` |

Not restyled: the shared language picker and search panel internals (re-coloured only).

## Visual comparison (Chromium, 1024 × 1536, DPR 1, fonts loaded)

Grayscale 8×8-block SSIM / mean absolute error against the reference, per strip. Scores are low in text-heavy and photo-heavy strips because product data, headline glyph shapes and copy legitimately differ; geometry is the better measure (see measurements table).

| Strip | SSIM | MAE |
|---|---|---|
| Header 0–96 | 0.59 | 25.9 |
| Hero 98–592 | 0.60 | 48.6 |
| Categories 600–832 | 0.71 | 17.3 |
| Featured 840–1120 | 0.58 | 40.8 |
| Banners 1120–1360 | 0.39 | 47.3 |
| Benefits 1360–1456 | 0.57 | 23.3 |

Remaining mismatches: hero silk is a crop that starts at x≈520 and fades in (the reference's silk continues behind the text), logo is a square mark rather than the wider reference crop, banner art is cropped from flattened pixels, product photos differ, headline glyphs differ slightly in width (Vazirmatn vs the reference face).

## Checks run locally

* `tsc --noEmit`: pass. `eslint .`: 0 errors (5 pre-existing warnings).
* `npm test`: 202 pass, 0 fail (+3 new).
* `DATABASE_URL='' npm run build` and `npm run cf:dry-run`: pass.
* Playwright (Chromium, against the dev server, snapshots ignored): home geometry + menu / language / search sheets at 375, 390, 820, 1180, 1280, 1440 in ckb/ar/en: 63 pass (9 skipped by design); new reference-homepage tests and the font-swap layout-shift test at 360: pass. The R&L AI header test needs the AI binding, which the dev server does not have (it only exists in the Worker), so it is verified in CI.
* Local `wrangler dev` of the built Worker fails to start in this container (workerd: "Incorrect type for map entry 'f'"); not caused by this change, so the Worker-served screenshots come from CI.

## Blockers / next action

* Screenshot baselines (`tests/layout/__screenshots__`) must be re-rendered for the new home and committed: run the "Cargo quality gate" workflow with `update_baselines` on this branch (DEPLOY.md "Layout lock").
* Deployment: the repo has no deploy workflow and this session has no Cloudflare Workers deploy credential (only a DNS token, which was not used). Production per `wrangler.jsonc` is `https://cargo.regaplatform.com`; **`www.rlgo.net` is not configured anywhere in the repo** and must be attached by the owner before a deploy there can be verified.
* Next: merge after CI + baselines, deploy with `npm run deploy` (or the connected Workers Build), then verify the live commit and capture production screenshots.
