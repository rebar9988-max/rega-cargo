# Marketplace admin link and flaky WebKit navigation — 2026-10-23

Owner brief "CLAUDE CODE — R&L FINAL FIXES & PRODUCTION VERIFICATION" (chat, 2026-10-23), Marketplace
scope. Branch `claude/market-admin-link-ipad-nav-20261023`.

## Task 1 — admin link visible to customers

- **Root cause:** `/market` rendered the "Admin" link (`<Link to="/admin">`) for every visitor. The
  admin data and actions were already refused server-side (`adminQueue` / `adminSet` throw
  `forbidden`; `/admin` shows the sign-in gate or the forbidden header), so this was a navigation
  leak, not a privilege leak.
- **Fix:** `marketViewerCanAdmin` server function (`lib/market/api.ts`) → `viewerIsAdmin`
  (`lib/market/handlers.server.ts`) reuses the existing role check (`approved(roles, "admin")`,
  `super_admin` included) and fails closed (`false` on any error or without a session). The
  `/market` loader renders the link only when it is `true`. No role or architecture change.
- **Tests:** `lib/compliance/market.e2e.test.ts` — `viewerIsAdmin` false for signed-out, a customer,
  a seller, a pending admin and a removed admin; true for an approved admin and a super admin;
  `adminQueue` refuses the customer, the seller and the pending admin.

## Task 2 — flaky `webkit-ipad-portrait › unified.spec.ts` (`aria-current`)

Failure (PR #162, run 39913337139, job 120281969345): `/track` had no
`[data-layout="bottom-bar"] [aria-current="page"]` for 20 s ("element(s) not found"); retry passed.

Investigation (temporary read-only diagnostic workflow, removed before merge):

| Run | What | Result |
|---|---|---|
| 39917608986 | unified test isolated, WebKit iPad + iPhone × 40, no retries | 80/80 pass |
| 39980291092 | + WebGL load (hero-silk), 3 WebKit projects × 12, 4 workers | unified 108/108 pass |
| local Chromium | `/track` module request aborted on load and after the router's reload | route error page, **no header / bottom bar** — the exact failure |
| 39984645978 | new regression test, first fix (plain reload) | WebKit 0/30 — WebKit recovery fails |
| 39985809912 / 39986458917 | WebKit failure message and recovery per mode | `Importing a module script failed.` (same text for every module); an aborted module is not re-requested by a script reload |
| 39990594621 | in-page `reload()` / `replace()` after 0–2500 ms | 0/16 recovered, 1 request only |
| 39991190557 | `fetch(url, {cache: "reload"})` of the page modules, then reload | 4/4 recovered |
| 39994562906 | trace under load | a navigation away cancels modules still loading → error → recovery reload took the navigation over |
| 39996735987 | final fix: unified + regression + hero-silk, 3 WebKit projects × 8, 4 workers, no retries | **352 passed, 0 failed** |

**Root cause:** a page module request that fails (the local wrangler server drops connections under
parallel load: "Network connection lost", "Broken pipe") renders the route error page, which has no
Shell, header or bottom bar. TanStack Router recovers by reloading once per error *message* per tab;
WebKit reports every failed module with the same message, and WebKit's script reload reuses the
failed module without a new request. So in WebKit/Safari the page stayed on the error page. The same
gap exists for real visitors (a dropped request, or a deploy that replaced the files).

**Fix (`lib/chunk-recovery.ts`, `lib/error-component.tsx`):** when the route error is a module-load
failure, the error page refreshes this page's modules in the HTTP cache (`modulepreload` and module
scripts, same origin, `cache: "reload"`, 3 s cap) and reloads; at most 2 automatic reloads per page per
minute (no loop); it stands aside while the router's own reload of the same document is under way, and
never reloads once a navigation away has started (`beforeunload`, which keeps bfcache eligibility) or
the URL changed. No visual change; the error page itself is unchanged.

**Tests:** `lib/chunk-recovery.test.ts` (5 unit tests: messages, WebKit's shared message, loop limit,
router reload, blocked storage) and `unified.spec.ts` "a page module that fails to load recovers with
its navigation in every browser" (/market module fails once, /track fails twice; fails on unchanged
code with the original "element(s) not found"). The original test is unchanged — not weakened,
skipped or retried.

## Task 3 — production verification

See the release section below (recorded after merge and deploy).

## Release and production verification (2026-10-23)

- PR #165 squash-merged as **`020d39b`** (`main`) after the hosted gate on head `a0ac076`
  (run 39999709330): `scope` ✓, `verify` ✓, `layout lock` ✓ **751 passed / 16 skipped / 0 failed,
  0 flaky** (Chromium, WebKit iPhone/iPad, Firefox), `Workers Builds` ✓. Temporary diagnostic workflow
  not in the merged diff.
- Cloudflare: Workers Build `926c71c5-b491-4166-b6f0-f56d8a9d06b3` on `020d39b` succeeded, Version
  `445da8ad-0d25-4cba-8778-0b903042c75b`. Traffic allocation of that version is **not verified** (no
  Workers deployments access from this session); the live pages below serve the new code.
- Live checks on `https://www.rlgo.net` (Firecrawl real browser, `maxAge: 0`; the sandbox proxy refuses
  rlgo.net):
  - `/market?lang=en` desktop 1440: 200; links Sell and Favorite, **no `/admin` link**; desktop nav
    marks Market; honest empty-catalogue card.
  - `/market?lang=ckb` phone 390: 200, `<html lang="ckb" dir="rtl">`, **no `/admin` href** in the HTML,
    bottom bar `aria-current="page"` on Market.
  - Live client bundle `assets/index-Cfjku_e0.js` (200) contains the recovery code
    (`rl_chunk_reload`, `beforeunload` guard).
  - `/stores?lang=ar` phone 390 and `/stores?lang=en` desktop 1440: 200, no admin link; Bring For Me
    marked current; the Latin-script category rule
    `html[data-textdir="ltr"] .rl-store-categories { direction: ltr; text-align: right }` is served.
- Not verifiable here, stated honestly:
  - **Product pages:** the live Marketplace has no listed products. No test product was created, per
    the brief.
  - **Firefox:** rendering cannot be run live (Firecrawl is Chromium). The Firefox category clamp is
    covered by the CI Firefox test "clamped Latin-script store categories cut at the end of the line"
    (passed in run 39999709330).
  - **Browser console:** there is no console access on production. The CI browser suites run on the
    merged code.
  - **Physical devices:** not available.
- Observation, outside this task's scope: on `/stores` desktop the category row from PR #164
  (another session) is a horizontal swipe row that shows a native scrollbar and cuts the last chip at
  the edge. This is reported only; it was not changed.
