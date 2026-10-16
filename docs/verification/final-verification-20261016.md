# Final production verification — 2026-10-16

Production `https://www.rlgo.net`; `main` @ `d29240d` (application code of `d96c4a8`, later commits are docs).
Read-only audit; no application change was needed (no verified defect).

## 1. Active Cloudflare deployment

| Item | Evidence | Status |
|---|---|---|
| Latest build on `main` `d29240d` | `Workers Builds: rega-cargo` check run: Build `9cbb8f8c`, Version ID `3ca8f27e-0937-4a72-b9f7-4b9451dd02b7`, success | verified (GitHub check run) |
| Build of app commit `d96c4a8` | Build `f276441a`, Version ID `63811e37-a1b7-4f30-8fc9-600331d5bc1b`, success | verified (GitHub check run) |
| Deployed client code = `main` | All 16 content-hashed `/assets/*.js|css` files served by production have the same sha256 as the files of a local `npm run build` of `d29240d` | verified: client bundle identity |
| **Version ID active at 100 %, traffic allocation** | needs the Workers API / dashboard (`wrangler deployments list --name rega-cargo`) | **NOT verified**: the agent's only Cloudflare credential is DNS-scoped; a Workers API read with it was refused by the session's permission classifier, and the repo docs record that endpoint class returns code 10000 |

Do not read the check-run version as proof of active traffic. Owner/other tool with Workers access: run
`npx wrangler deployments list --name rega-cargo` and confirm the top entry is at 100 % and that it is `3ca8f27e-...` or a later docs-only build (merging this report itself creates one; the application is identical).

## 2. GitHub Actions billing blocker

Run 38907381184 (push `d29240d`, 13:22 UTC): `verify` and `scope` fail in 2-3 s, `runner_id: 0`, 0 steps; `layout lock` skipped.
Annotation: "The job was not started because recent account payments have failed or your spending limit needs to be
increased. Please check the 'Billing & plans' section in your settings". Infrastructure, not code: CI is **not green** and
none of these jobs ran. Billing and Actions-settings endpoints are blocked by the agent proxy; nothing was changed or paid.
**Owner action:** GitHub Settings > Billing and plans: fix the failed payment method or raise the Actions spending limit, then
re-run the latest `main` run and confirm `scope`, `verify`, `layout lock` (see issues I-7).

## 3. Playwright

| Browser | Result |
|---|---|
| Chromium (7 device projects: iPhone, iPhone SE, iPad portrait/landscape, laptop 1280, laptop 1440, premium 360) on the built Worker (`wrangler dev --config .output/server/wrangler.layout.json --host localhost`), `--ignore-snapshots` | 394 passed, 12 skipped, 0 failed. The 12 skips are by design (`test.skip` for the phone/tablet menu sheet and mobile filter sheet at laptop widths) |
| Firefox | **not run**: build 1543 not installed |
| WebKit | **not run**: build 2359 not installed |

Firefox/WebKit are not installed and the session environment forbids `playwright install` (the download hosts are reachable).
To run them: `npx playwright install --with-deps firefox webkit` and `npx playwright test` in an environment that allows it
(or the official image `mcr.microsoft.com/playwright:v1.63.0-noble`, as CI does). Pixel baselines were not used: they are stale for `main`
(80 of 84 local comparisons fail, 66 by page height) and are only valid in the official image; none were regenerated.

## 4. Responsive, RTL/LTR, accessibility, navigation, console

* 480 states (8 routes x ckb/ar/en x light/dark x 320/360/375/390/430/768/1024/1280/1440/1920) on the built Worker: horizontal overflow 0, `<html dir="rtl">` always with `lang` = locale.
* axe (contrast, labels, names, landmarks, aria; 180 states): 0 violations.
* Keyboard: 54 page states, 2,727 Tab stops, every stop has a visible indicator (category strip rings its icon by design).
* Navigation, search, category menu, language switch, keyboard dialogs, favorites, banned-search checks: covered by the 394 passing Chromium cases.
* CLS (108 loads) max 0.0028 (limit 0.1).
* Live production, 96 loads (16 routes x ckb/ar/en x 390/1440): 0 console errors, 0 page errors, 0 HTTP >= 400; only the harness's blocked service worker and Cloudflare's analytics beacon cancelled at navigation. 78 route loads all 200, no overflow.
* `https://rlgo.net`, `http://www.rlgo.net` and `http://rlgo.net/...` return 301 to the same path on `https://www.rlgo.net`; legacy workers.dev returns 404; HSTS, CSP, nosniff and referrer-policy headers present.

Touch targets under 44 px on phones remain only native 24 px checkboxes inside 50-148 px labels, hidden file inputs, the R&L AI consent checkbox (owner baseline; labelled, 24 px = WCAG 2.2 AA) and the home search *input* at 320 px (the pill is the target).

## 5. Remaining blockers

1. Active Cloudflare version/traffic: needs Workers-scoped access (owner or a connector).
2. GitHub Actions billing (owner).
3. Firefox and WebKit runs, official-image layout lock and baseline re-render (needs Docker/Actions or an environment that permits browser installs).
