# R&L homepage reference: measurements

Reference: owner screenshot of the R&L homepage, `evidence/reference-1024x1536.webp` (original PNG 1024 × 1536, 8-bit RGB, aspect 2:3).

## Viewport assumption

The image is 1024 px wide. Body text measures about 14–17 px in the image, which is only plausible at **1 image px = 1 CSS px**: at 2× device pixel ratio the product names would be about 8 px. The reference is therefore treated as a **1024 CSS px wide layout** (tablet-portrait scale), device pixel ratio 1. Phone and desktop widths are adaptations of the same composition (see "Responsive").

## Geometry at 1024 px (reference → implementation)

Reference values were read from the image (box edges by pixel inspection, text by eye); implementation values come from `getBoundingClientRect()` in Chromium at 1024 × 1536 (`scratchpad boxes.mjs`, recorded in the progress file).

| Element | Reference (x0–x1, y0–y1) | Implementation |
|---|---|---|
| Header | 0–1024, 0–98, bottom corners rounded ≈24 | 0–1024, 0–98, radius 24 |
| Logo | 15–130 | 16–96 (square keyed mark, 80 px) |
| Language globe | 155–200 | 145–189 |
| Search | 230–720, h 62, pill | 213–710, h 62, pill |
| R&L AI capsule | 740–940, h 56 | 735–935, h 56 |
| Menu | 962–1000 | 959–999 |
| Hero | y 98–597 | y 98–592 |
| Hero primary CTA | 47–265, h 64 | 47–265, h 64 |
| Hero secondary CTA | 285–515 | 277–521 |
| Category tiles (8) | y 670–828, 35–990 | y 664–822, 35–989 |
| Featured cards (4) | y 888–1110, 35–990 | y 893–1113, 35–989 |
| Banners (2) | y 1125–1345; A 35–510, B 518–990 | y 1133–1357; A 35–507, B 517–989 |
| Benefit cards (4) | y 1358–1445 | y 1371–1461 |

Content width: 35 px side margins (3.4 % of width), capped at 1200 px on wide screens.

## Colours (sampled)

| Use | Sample |
|---|---|
| Header | `#980204` with a brighter band near the AI capsule (`#d70207`) |
| Primary button | `#F10208` → `#D70208` vertical |
| Hero headline red / brand | `--rl-brand` `#dd0303` (existing token) |
| Banner "bring" | `#990203` → `#E0141F` |
| Page background | `#FBFBFD` (existing `--rl-paper`) |
| Pale red (cart circle, care banner) | `#FDE6E8` (existing `--rl-soft-accent`) |

## Typography

Sorani and Arabic in the reference are a heavy Arabic-script face: the headline is about 76 px / weight 900 with a line pitch near 1.0. Implemented with the self-hosted **Vazirmatn v33.003** (`/fonts/vazirmatn-nl-v33.003.woff2`, already in the repo, `font-display: swap`), scoped to the homepage (`.rl-ref`, `.rl-ref-header`); other routes keep Noto Sans Arabic as approved on Oct 9 2026. Latin text uses Inter RL.

## Responsive

* ≥ 1024 px: reference layout (8 category columns, 4 product columns, 2 banners, 4 benefit cards).
* 768–1023 px: same, 4 product columns, benefit cards 2 × 2, categories in a scroll rail.
* < 768 px (2026-10-15): header 120 px = logo · language · R&L AI · menu row plus a full-width search row (one 64 px row left the field 0–104 px wide at 320–430 px); hero copy, then the art on a full-width red silk field that fades in from the copy (no white strip or hard edge); categories in a scroll rail, products 2 × 2, banners stacked, benefits 2 columns (1 below 480 px).
* ≥ 1280 px (2026-10-15): the art column is capped at 40rem (≤ 1.27× the 504 px artwork; it reached 1.9× at 1920 px) and the hero background carries the reference's red silk behind the copy (top sweep, bottom band, red before the art), so the art no longer fades into white.
* Verified with no horizontal overflow at 375, 390, 430, 768, 1024, 1440 (Playwright geometry suite and screenshots).

## Assets cut from the reference

Flattened artwork only exists inside the reference, so the following decorative images are crops of it (`public/home/*.webp`, no hidden geometry invented, no 3D rotation claimed): hero headphones/silk/podium, "bring it" banner art, CARE+ banner art, seven category photos, the AI robot. The logo is the owner's `rl-logo.png` with the red field keyed to transparent (`rl-mark-white-336.webp`) so it reads white on the red header as in the reference; the artwork itself is unchanged. Headline, copy, buttons, cards and every control are real HTML.
