# Homepage visual fidelity and unified responsive layout — 2026-10-15

Authority: the owner's original R&L homepage design (1024 × 1536, `docs/implementation/evidence/reference-1024x1536.webp`), re-attached on 2026-10-15 with iPhone screenshots of production. Scope: visual fidelity and responsive adaptation of the reference homepage only. No copy, route, data, price, API, auth, compliance, R&L AI or module change. Base: `main` @ `5d66eee`.

## Five modules

Marketplace (`src/lib/market/`), Bring For Me (`src/lib/orders/`, `src/lib/requests/`), Delivery (`src/lib/delivery/`, `/quote`), Tracking (`src/lib/tracking/`, `/track`), R&L AI (`src/modules/rl-ai/`, `src/lib/ai/`). None touched: the change is `src/styles/ref-home.css` (homepage-scoped, unlayered `.rl-ref*`) plus tests and docs.

## Audit (production `5d66eee`, Chromium, read-only)

Captured at 320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920 px; 1024 compared with the reference at the same width (DPR 1). Colours sampled from the reference hero.

| # | Width | Discrepancy (measured) | Root cause | Result |
|---|---|---|---|---|
| F1 | 320–767 | Header search unusable: text field **0 px** at 320, 34 px at 360, 64 px at 390, 104 px at 430 | five controls in one 64 px row | Phones: logo · language · R&L AI · menu row + full-width search row (120 px, same height as the app's other phone headers). Field 236 / 276 / 306 / 346 px at 320 / 360 / 390 / 430 |
| F2 | all | No red silk behind the hero copy; light seam where the artwork fades in (x≈520 at 1024) | hero background was white + two soft pink radials; the art crop faded into white | Background layers reproduce the reference silk sampled from the image: top sweep, top-left glow, bottom red band, and red before the art starts, so its faded edge meets red |
| F3 | < 768 | Hero split into "text on white" + a separate full-bleed image block; 7 px hard edge left of the art at 430 (visible on the owner's iPhone screenshot) | top-only mask; capped height left the image narrower than the box | Art sits on a full-width red silk field that fades in from the copy; the art's top and left edges fade into it |
| F4 | ≥ 1280 | Hero 620–930 px tall; 504 px artwork upscaled to 945 px (1.9×) at 1920 | art column = 49.2 % with no cap | Art column `min(49.2%, 40rem)`: hero 630 px, ≤ 1.27× |
| F5 | phones, LTR | Hero subtitle right-aligned in en/de/tr/ku (started at x 34, not 16) | global right alignment for Latin paragraphs inside the fixed-rtl layout | Subtitle follows the hero's physical left edge like eyebrow and headline |
| F6 | dark | (introduced and fixed in this change) pale-pink silk read as a light band on dark | — | Dark-theme silk tints are deep red |

Necessary differences, unchanged: real marketplace products or labelled examples instead of invented prices/discounts (hard rule 1); benefit cards and CARE+ show only real services; footer present. Owner decisions, unchanged: wider logo crop, category-tile label weight, CARE+ wording.

## Verification

- 10 widths on the built Worker: `scrollWidth = innerWidth` everywhere, no console errors; geometry above. Opening search on a phone keeps the 120 px header (the field's row keeps its height when the sheet becomes fixed).
- ckb, ar, en checked on phones; dark mode at 390 and 1024.
- Tests updated deliberately (owner instruction): `geometry.ts` phone home-header row 64 → 120; the header-order spec asserts the phone two-row arrangement; the refinement spec now also asserts art ≤ 640 px and a ≥ 200 px phone search input.
- Gate (local; hosted Actions blocked by billing, I-7): typecheck pass, lint 0 errors / 5 existing warnings, `npm test` 486 passed / 4 existing skips, build pass. Chromium layout lock on the built Worker (six Chromium device projects + `premium-360`, `--ignore-snapshots`): **394 passed, 12 existing skips, 0 failed**, including the phone search sheets (first run found the header collapsing to 76 px behind the open sheet; fixed by keeping the field row's height).
- Not run: WebKit and pixel comparison (no official Playwright image / Docker daemon here). Every `/` screenshot baseline (and phone sheets over `/`) changes and needs the `update_baselines` re-render.

Evidence: [1024 reference / before / after](visual-fidelity-20261015/home-1024-reference-before-after.webp) · [390](visual-fidelity-20261015/home-390-before-after.webp) · [320](visual-fidelity-20261015/home-320-before-after.webp) · [1920](visual-fidelity-20261015/home-1920-before-after.webp)
