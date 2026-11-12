# Live browser matrix against www.rlgo.net (read-only) — 2026-10-21

Evidence for the final hardening pass. Read-only: GET navigations and typing into the `/quote` weight field only. Nothing was
submitted, no account or code was requested, no rate limit was probed.

## How it ran
- Hosted runner, official image `mcr.microsoft.com/playwright:v1.63.0-noble`, workflow run 39502951592 on the throwaway branch
  `diag/layout-failure-20261020` (spec `tests/layout/live-matrix.spec.ts` and `playwright.matrix.config.ts` live only there; not merged).
- Chromium, WebKit and Firefox x widths 320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920 x `ckb`, `ar`, `en`
  x 9 routes (`/`, `/stores`, `/stores/request`, `/quote`, `/track`, `/ai`, `/account`, `/market`, `/contact`) = 810 page loads.
  Phone widths (<= 1024) used a mobile touch context in Chromium and WebKit, not native hardware.
- Results were read from a results branch, because job logs and artifacts cannot be downloaded from the agent sandbox.

## Result
- 810/810 loads returned 200 and had exactly one `h1`; `lang` matched the requested language every time; no page error and no HTTP error.
- Horizontal overflow: none, except `/contact` at 320 px (see below).
- `html[dir]` is `rtl` for every language including `en` by design (`LAYOUT_DIR`, text direction is carried by `data-textdir`). The
  matrix's own `dir === ltr` expectation for `en` was wrong, so those failures are a test mistake, not a site defect.
- `/quote` weight field (Chromium, WebKit, Firefox at 390 and 1280): `3.2`, `3,2`, Arabic-Indic `٣٫٢` and Persian `۳.۲` all gave the same
  price as `3.2`; letters set `aria-invalid="true"` and showed no options.
- `/api/auth/rl-email/status` -> 200 `{"available":true}`, `/api/ai/status` -> 200 `{"enabled":true}`, `/owner` shows one password field.
- Phone bottom bar: its five tabs (`/`, `/market`, `/stores/request`, `/track`, `/account`) each navigated to the expected route with one `h1`
  in all three engines.

## Findings (reported, not changed)
1. `/contact` at 320 px: the e-mail card (`a.group.flex.max-w-xl`) is 3 px wider than its column in Chromium, WebKit and Firefox
   (Chromium also widens the layout viewport by 6 px). Likely cause: the card's min-content width includes the unbroken address, and
   the column uses `items-start`. A visual change, so it needs an owner decision; a candidate is clamping the card to its column
   (for example `max-w-[min(100%,36rem)]`). Widths from 360 px up are unaffected; the layout lock does not cover 320 px.
2. Firefox only, on `/` (`ckb`, `ar`) and `/ai` (all languages): console message `downloadable font: Table discarded` /
   `STAT: Invalid nameID` for `/fonts/vazirmatn-nl-v33.003.woff2`. The font still renders; protected R&L AI typography, so untouched.

## Not covered (selectors guessed, results inconclusive)
- Language picker switching (popover selector did not match), the `/account` sign-in controls, real OTP delivery, live rate limiting,
  native iPhone/iPad hardware, the active Worker version. Do not read "0 e-mail inputs" on `/account` as a defect.
