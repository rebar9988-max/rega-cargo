# UI/UX refinement (spacing, alignment, touch targets) — 2026-10-14

Scope: the owner's "strict UI/UX refinement (v2)" prompt — spacing, alignment, layout distribution,
consistency, readability and responsive behaviour only. No redesign, no copy/translation, route,
API, data, pricing, auth, compliance-filter, R&L AI, dependency, CI or deployment-config change.
Base: `origin/main` @ `f207338` (reference homepage, PR #100).

## Five modules (boundaries unchanged)

| Module | Directories (unchanged) | Touched by this change |
|---|---|---|
| Marketplace | `src/lib/market/`, `src/routes/market.*`, `src/components/market-*`, `bazaar-page.tsx` | class names on `/market` actions and pagination only |
| Bring For Me | `src/lib/orders/`, `src/lib/requests/`, `src/routes/stores.request.tsx` | none (shared `items-link`/`request-bits` link height only) |
| Delivery (shipping/quote) | `src/lib/delivery/`, `src/routes/quote.tsx`, `shipping-page.tsx` | none |
| Tracking | `src/lib/tracking/`, `src/routes/track.tsx` | one layout class on the lookup form |
| R&L AI | `src/modules/rl-ai/`, `src/lib/ai/`, `ai-page.tsx` | none (owner-only baseline) |

Shared presentation only: `src/styles/{ref-home,design-system}.css`, `src/styles.css` (one utility),
`site-footer.tsx`/`shell.tsx` (footer spacing flag). Every value is an existing token
(`--rl-control-h`, `--rl-space-*`, `--rl-reading`, `--ref-pad`) or the value the homepage stylesheet
already uses for the same control (2.75rem). No new token, no new dependency.

## Method

Playwright (Chromium) audit of 14 public routes (`/`, `/stores`, `?cat=fashion`, `?fav=1`,
`/stores/request?…intent=buy|ship`, `/quote`, `/market`, `/ai`, `/track`, `/contact`, `/impressum`,
`/privacy`, `/terms`) at 360/390/768/1024/1440 px in ckb, ar and en (light), ckb dark, plus ku, fa,
de and tr at 360 and 1440: 392 page loads before and after. Per page: horizontal overflow
(`scrollWidth > innerWidth`), touch targets < 44×44 on phones, text clipped by an overflow box,
WCAG AA contrast of solid-background text, h1 count, `<html lang dir>`, page errors.
Live production header/hero geometry was measured read-only before the change.

| Gate | Before | After |
|---|---|---|
| Horizontal overflow | 0 / 392 | 0 / 392 |
| Page errors | 0 | 0 |
| Pages without exactly one h1 | 0 | 0 |
| Touch-target detections < 44 px (phones) | 2,489 | 91: 79 Bring For Me draft checkbox/label (see restricted) + 12 market "in stock" checkbox, whose label is 48 px tall |
| Solid-background contrast failures | 0 real (flags were a disabled button and an opacity-0 hover action) | 0 |

Layout shift: a first attempt centred the section heads and raised the English font-swap shift on
the 360 px home (the existing `premium.spec.ts` budget failed: 3 observers × 0.0174 = 0.052). Restoring
baseline alignment fixed it: per-language shift ckb 0 / ar 0.0003 / en 0.0148 vs production `main`
0.0010 / 0 / 0.0141 (same total, 0.0151); the budget test passed 5 of 5 repeats.

Two `after` flags (one double-h1, two black-background contrast reports) happened while the dev
server hot-reloaded CSS during the run; re-measuring those exact cases gave 1 h1, 0 contrast issues.

## Quality gate (local; hosted Actions blocked by billing, I-7)

- `npm run typecheck` pass · `npm run lint` 0 errors / 5 existing warnings · `npm test` 486 passed, 4 existing skips, 0 failed · `npm run build` (empty `DATABASE_URL`) and `npm run cf:dry-run` pass.
- Layout lock on the built Worker (`wrangler dev`, no database, as CI): all six Chromium device projects + `premium-360`, `--ignore-snapshots`: **394 passed, 12 existing skips, 0 failed**, including the new refinement spec, the font-swap CLS budget and the banned-search/compliance checks.
- Not run here: WebKit projects and pixel comparison (no official Playwright image / Docker daemon in this environment).

## The 15 issues

The earlier list of "15 previously identified issues" is not in the repository, project memory or
this session, so these 15 were identified and measured fresh.

| # | Area | Defect (measured) | Fix | Status |
|---|---|---|---|---|
| 1 | Header | Home header edges 8–19 px off the content column (768: 16 vs 26; 1024: 16 vs 35; 1440: 142 vs 160) | header row uses the sections' `--ref-pad` | fixed (all widths equal) |
| 2 | Header / touch | Phone menu 36×40, language 40×40 | both 44×44; row gap one step tighter so the search keeps its space | fixed |
| 3 | Hero | Hero copy 104 px off the content column at 1440 (56 vs 160) | copy inset = max(reference inset, content column) via container units | fixed (1440: 160 = 160; ≤1200 px unchanged) |
| 4 | Typography | First headline line indented in RTL (ckb 10–19 px, ar 35–67 px) | both lines share the eyebrow's edge | fixed (all langs) |
| 5 | Marketplace (home) | "All categories / All stores" links 23 px tall | 44 px tap height, still baseline-aligned with the heading | fixed |
| 6 | Marketplace / responsive | 768–1023 px: 4 product columns, prices split ("15,000 / IQD") | 2 columns on tablets, 4 from 1024; prices never wrap | fixed |
| 7 | Footer | Footer links 32 px tall on every page | 48 px rows with the same 48 px rhythm (gap moved into the row) | fixed |
| 8 | Footer spacing | 80 px empty band under the footer on laptops and on the home (no bottom bar there) | bottom-bar clearance only where the bar exists | fixed |
| 9 | Footer alignment | Theme toggle stretched full width, icon centred off the column | start-aligned 48 px button | fixed |
| 10 | Brands / store cards | Favourite (heart) button 38 px wide | 48 px | fixed |
| 11 | Stores | Audience chips 38–44 px wide in some languages | min 48 px | fixed |
| 12 | Marketplace (`/market`) | Action links glued to the page-header border, 23 px tall; pagination 40 px | top spacing token, 48 px actions and pagination | fixed |
| 13 | Tracking | Lookup field stretched ~1,100 px on desktop next to a small button | form keeps the reading width (`--rl-reading`) | fixed |
| 14 | Legal pages | Table-of-contents links 19–43 px wide | min 48 px | fixed |
| 15 | Bring For Me / Delivery | "Restricted items" and help e-mail links 40 px tall | 48 px | fixed |

Also: the skip link is 48 px tall when focused.

## Restricted / reported, not changed

- **Bring For Me draft checkbox label (26 px tall):** draft PR #97 (and #79) rewrite this form; changing
  it here would collide with that open work. Left for that PR.
- **Hero primary button gradient (`#f10208` → `#d70208`) with 16 px white text on phones:** ≈4.4:1 at
  the gradient's top edge (passes at ≥18.66 px bold on tablets/desktop). Brand colour — reported, not
  changed (owner rule). The token brand red `#dd0303` is 5.1:1.
- **R&L AI page and capsule:** unchanged (owner-only baseline). The capsule measures 94×44 / 200×56;
  no defect found.
- **Store-card category text (360 px):** flagged by the clip heuristic, but the visible text is not cut
  (three-line clamp by design); no change.
- **Layout-lock screenshot baselines:** the official Playwright image cannot run here (no Docker
  daemon), and hosted Actions is blocked (I-7). `/` baselines were already stale since PR #100; pages
  touched here (footer on every route, `/market`, `/track`) now also need re-rendering via the
  "Cargo quality gate" `update_baselines` run once Actions works.

## Evidence

Before/after (Chromium, ckb, light): [header+hero 1440](ui-refinement-20261014/home-1440-header-hero.webp) ·
[tablet products 768](ui-refinement-20261014/home-768-products.webp) ·
[footer 390](ui-refinement-20261014/home-390-footer.webp) ·
[/market 1440](ui-refinement-20261014/market-1440-actions.webp) ·
[/track 1440](ui-refinement-20261014/track-1440-form.webp)

## Production verification (read-only, 2026-10-15 ~03:30 UTC, owner-approved)

Status: **PASS** (with the limitations below).

- **Release identity:** PR #102 merged as `5d66eee` (2026-10-14 23:13 UTC). `main` head is still `5d66eee`; the live HTML on `/` and `/track` carries CSS that exists only in this change (`container-type:inline-size`, `padding-inline:max(clamp…`, `.rl-compare-actions`, `.rl-track-form`), absent before the merge. The Cloudflare Worker version ID was **not** queried (no Workers API credential in this session), so the deployment is identified by content, not by version ID. `sw.js` stays `rl-sw-v13` (this change did not bump it).
- **Geometry (live, with the R&L AI capsule present):** header edges = section edges at 360/390/768/1024/1440 (16/16/26/35/160 px); hero copy 160 = sections at 1440; both headline lines start at the eyebrow in ckb/ar/en; logo/language/AI/menu controls ≥ 44 px; `scrollWidth = innerWidth` everywhere.
- **Audit, 350 live page loads** (14 routes × 5 widths × ckb/ar/en light, ckb dark at 390/1440, ku/fa/de/tr at 360/1440): horizontal overflow 0; page errors 0; console errors 0; exactly one h1 everywhere; `<html dir="rtl">` and `lang` correct everywhere; 0 contrast failures on solid backgrounds. 4 aborted lazy-image requests (`ERR_ABORTED` when the test closed the page; no 4xx/5xx).
- **Existing specs against production (read-only navigation):** 23/23 passed: refinement spec, reference-home controls and sections, R&L AI capsule, homepage accessibility landmarks, header category strip, font-swap CLS budget, hydration after delayed assets (iPhone + 1440), homepage paint while scrolling (iPhone + 1440), required routes at 360 px in ckb/ar/en light and dark, filters/favourites/keyboard dialog/banned searches (cigarettes, vape, vodka, pork bacon list nothing), catalogue categories.
- **Remaining touch-target detections:** Bring For Me draft checkbox (open draft PR #97); market "in stock" checkbox (inside a 48 px label); home header search input at 360 px is 34 px wide inside an 86×44 field — tapping anywhere in the field focuses it, so the target passes, but the visible placeholder is heavily truncated (was 90 px before this change; owner may choose a shorter placeholder or compact capsule later).
- **Not verified:** WebKit/native iPhone, Cloudflare version ID and runtime logs, authenticated or order-submitting journeys. Hosted Actions still fails before any step (billing, I-7) — external, not a code failure.

Live evidence: [390 top](ui-refinement-20261014/production-390-top.webp) · [1440 full page](ui-refinement-20261014/production-1440.webp)
