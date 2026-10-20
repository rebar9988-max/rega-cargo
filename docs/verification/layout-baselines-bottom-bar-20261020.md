# Layout lock: phone/tablet baselines after the homepage bottom bar — 2026-10-20

Scope: test assets only (24 screenshot baselines). No application code, CSS, copy, route, data, auth or CI change.

## Why `layout lock` was red on `main`

- `main` @ `8a06f23` (#132, bottom bar on the homepage): `layout lock` failed (run 39346389816). #132 itself said the
  phone/tablet `/` baselines would need a re-render.
- The two later `main` runs reported success only because `scope` skipped the layout job for docs-only changes
  (`3409ebf` run 39487776373, `e0cc4e9` run 39346735888: `layout lock: skipped`). That is not a pass.
- `main` @ `3cf2537` (#137, code change) ran the layout job again and failed; a re-run of the failed job (attempt 2)
  failed the same way, so it is deterministic, not flaky. #137 is not the cause (JSON-LD in `<head>`, a popup
  `event.source` check).

## What failed (diagnostic run with the Playwright `github` reporter)

24 failed / 690 passed / 16 skipped. All 24 are `toHaveScreenshot` cases in `tests/layout/layout.spec.ts`:
`home` (ckb, ar, en) on chromium-iphone, chromium-iphone-se, chromium-ipad-portrait, webkit-iphone,
webkit-ipad-portrait, plus `search` (chromium/webkit ipad-portrait) and `lang` (webkit ipad-portrait).
No geometry, horizontal-overflow, console, RTL or bottom-bar-height assertion failed.

Every `home` failure reports the same size change, e.g. `Expected 375x3402, received 375x3482`: exactly **+80 px**.
Cause in code: `clear-bottom-bar` (`src/styles.css`) = `--bottom-bar-h` 64 px + safe-bottom + `--rl-space-2` 16 px, applied
below 64rem, i.e. phones and tablets, never laptops. #132 made `SiteFooter` always use it.

## How the new baselines were produced and checked

- Rendered in the official Playwright container on a hosted runner (`--update-snapshots=changed`, throwaway branch,
  run 39500303526); all tests passed after the update.
- Because Playwright stops at a size mismatch, the pixels had never been compared. They were compared here, pixel by
  pixel, old committed file against new file (24 changed files, exactly the 24 failing cases):
  - 13 `home` files: the old image is **identical** for all of its rows; the new one only adds 80 px at the bottom.
  - 2 `home` files (`chromium-ipad-portrait/home-en`, `chromium-iphone-se/home-ar`): 13 and 12 stray pixels
    mid-page, maximum channel difference 2 and 1 (of 255): anti-aliasing noise, inside the configured tolerance
    (`threshold` 0.2, `maxDiffPixelRatio` 0.002).
  - 9 viewport shots (3 chromium `search`, 3 webkit `search`, 3 webkit `lang`; 13 + 2 + 9 = 24): same size; the
    differences are the bottom 64 rows (the bar now sits under the sheet) plus at most 17 stray pixels with channel
    difference ≤ 3.
- Not changed: laptop, 1440 and landscape-tablet baselines.

## Not claimed

Native iPhone/iPad hardware, and any live-site check at 320/375/390/430 px (still open, see `PROJECT_MEMORY.md`).
The pull request's own `layout lock` is the verification of these files; it is the authority, not this note.
