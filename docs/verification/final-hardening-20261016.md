# Final production hardening and responsive parity — 2026-10-16

Base: `origin/main` @ `d1e0229` (application commit `a406006`, docs `d1e0229`). Scope: audit, two
root-cause CSS fixes in `src/styles/ref-home.css`, verification evidence. No redesign, copy, route,
API, data, dependency, CI or deployment-config change. Brand colours, logo and fonts untouched.

## What changed in the application (15 lines of CSS, one file)

| Defect (measured) | Root cause | Fix |
|---|---|---|
| Home header search pill is 46 px (320), 86 px (360), 116 px (390) wide; its placeholder shows as a clipped fragment ("…ی") | Logo, language, R&L AI and menu are fixed-size (274 px incl. gaps and gutters), the field gets the remainder | Below 26.125 rem (418 px) the placeholder is transparent. The pill stays a 44 px search target; tapping anywhere on it still focuses the field and opens the full-width sheet (verified by touch at 320/360/390). At ≥ 430 px the placeholder remains |
| Dark mode, hero eyebrow 4.1–4.17:1 at 360 px (needs 4.5:1) | The hero's pink glow `rgb(255 205 205 / .55)` is tuned for the light surface; on the dark surface it paints a light blob under the light-red eyebrow | `:root[data-theme="dark"] .rl-ref-hero` keeps the same gradient with the glow at `/ .4` (was `/ .55`). Eyebrow now 5.1:1 (360) and 7.0:1 (1440), lede 6.6:1 / 12.0:1; light mode byte-identical. A first try at `/ .1` gave 7.5:1 but removed the glow that separates the dark secondary hero button from the background (1.06:1 vs 1.52:1 on production), so it was rejected; `/ .4` keeps 1.34:1 / 1.50:1 (production 1.52 / 1.79) |

Existing tokens and values only; the new rules follow the file's own `:root[data-theme="dark"]` pattern.

## Findings that are not defects, or are outside this task

* **AI consent checkbox (`/ai`)**: has `id` + `<label for>` (accessible name present), 24×24 px, which
  meets WCAG 2.2 AA target size (2.5.8, 24 px). It does not reach the stricter 44 px guideline.
  R&L AI is under the owner-only baseline, so it was not touched.
* **`.rl-filters-label`** and store-card category text are flagged by the clipping heuristic but are
  an intentional visually-hidden label and a three-line clamp.
* **Hero primary CTA** (gradient `#f10208`→`#d70208`, white 16 px/800) measures 4.52:1 at its worst pixel; passes narrowly. Brand colour, not changed.

## Mobile/desktop parity

The attached approved desktop design (1024 px) and live production at 1024 px have the same structure
and components (red header with logo/language/search/R&L AI/menu, hero artwork, category tiles,
product cards, the two promo banners, benefits row). At 390 px the same components stack and wrap
(hero art below the copy, cards in two columns, banners and benefits one per row); card radii,
buttons, icons, typography and artwork are the same shared components. Differences from the reference
image are intentional honesty rules (no invented prices, discounts or ratings; verified copy only).

## Verification

Real built Worker without Docker (`wrangler dev --config .output/server/wrangler.layout.json --host localhost`), local Chromium.

| Check | Result |
|---|---|
| typecheck / lint / `npm test` / build / `cf:dry-run` | pass; lint 0 errors (5 existing warnings); 236 + 255 tests, 0 fail |
| Layout suite, all Chromium projects, geometry (`--ignore-snapshots`) | 394 passed, 12 skipped, 0 failed |
| Width matrix 320/360/375/390/430/768/1024/1280/1440/1920 × ckb/ar/en × light/dark × 8 routes (480 states) | horizontal overflow 0; `dir="rtl"` and `lang` = locale in all |
| Touch targets < 44 px at ≤ 768 px | only native 24 px checkboxes inside 50–148 px labels, hidden file inputs, the R&L AI consent checkbox, and the home search *input* at 320 px (the 46 px pill is the target; verified) |
| Live production runtime, 96 loads (16 routes × ckb/ar/en × 390/1440) | 0 console errors, 0 page errors, 0 HTTP ≥ 400; only noise: Playwright's blocked service worker and Cloudflare's analytics beacon cancelled at navigation |
| Live production vs branch pixels (`ab-diff.mjs`) | 108 renders (9 routes × ckb/ar/en × 360/1440 × light/dark): 97 pixel-identical; the rest are the intended areas (home search pill at 360: 0.001–0.002 %; home dark hero glow) and 6 sub-0.01 % renderer-noise cases on pages the CSS cannot reach. One 1 px height difference on `/impressum` (ar, 1440) did not reproduce: three repeat measurements on each origin gave 1953 px both |

## Browsers

Only Chromium is installed. Firefox and WebKit are **not available** (`playwright install` is not
permitted here; no download). WebKit/Firefox, the official-image layout lock and pixel baselines were not run.
The committed baselines are stale for current `main` (80 of 84 local comparisons fail, 66 by page height),
so they were not used and nothing was regenerated.

## CI and Cloudflare

* GitHub Actions `verify` and `scope` fail in 3 s with runner id 0 and the annotation "The job was not
  started because recent account payments have failed or your spending limit needs to be increased";
  `layout lock` is skipped. This is an account restriction, not a code failure, and it is **not a pass**.
  Billing cannot be changed by an agent.
* Cloudflare: the `Workers Builds: rega-cargo` check run on `d1e0229` reports Build `0e7f1653`,
  Version `03ed3c18-84b7-4b70-9456-3d4f988cb2d0`, matching the reported values; `a406006` → build `06a5f699`,
  version `dd667bef-0fcf-4210-b8a3-0da8779a9976`. The agent's only Cloudflare credential is DNS-scoped
  and a Workers API read with it was refused, so the **active version and traffic allocation are not
  verified** (environment limitation). Live behaviour matches the code of `a406006`.
* Domains: `https://rlgo.net` and `http://www.rlgo.net` return 301 to `https://www.rlgo.net`; the legacy workers.dev host returns 404.
