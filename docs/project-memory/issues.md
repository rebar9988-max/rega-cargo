# Known issues, root causes and fixes

## 2026-10-14 UI refinement findings

- `tests/layout/domain.spec.ts` "complete pages hydrate…" waited for `main form button[type=submit]` on `/`, which PR #100 removed; it failed on live production too. Now waits for the hydrated footer theme button (disabled until `useHydrated`), same strength.
- Open, not changed: Bring For Me draft checkbox label 26 px tall (owned by draft PR #97); hero primary gradient top `#f10208` with 16 px white text ≈4.4:1 on phones (brand colour, owner decision); layout-lock screenshot baselines need re-rendering in the official image for every route's footer plus `/`, `/market`, `/track` (Docker daemon unavailable here, Actions billing I-7).


## 2026-10-14 beta rollout verification

PR #95 repairs are live; production migration safely applied and preserved all business record counts. Real customer/negative-authority browser checks passed. WebKit transient environment Envoy 502 asset failures prevented one hydration attempt; independent retrieval recovered and original case passed unchanged. Node request-context direct networking and an overly narrow Unauthorized-only expectation were harness issues; same-origin browser fetch verifies the actual fail-closed auth-disabled/real-database guard. No production security bypass. Missing legal content is expressly deferred for beta; verified owner/OTP/native checks and hosted Actions billing remain follow-ups. Telemetry permission prevented a complete log check. [Evidence](../verification/rl-five-improvements-20261013.md).


## 2026-10-14 candidate fixes and factual release blockers

Secure draft scope/expiry and unavailable-auth review fallback; Safari pre-hydration lost-input guards; partial administrative updates no longer reset defaulted fields; editor submits only schema-editable fields; pending identity verification cannot be cleared by archive/enable; active transport courier cannot be nulled; physical shipment recording timestamps are not invented event times; duplicate staff notifications avoided; AI gate replay and UTC counter races fail closed. Full browser gate found auth availability moving the mobile form; reserve warning geometry and keep fallback opening customer-controlled, preserving the existing CLS assertion. [Evidence](../verification/rl-five-improvements-20261013.md).

Release blocked by blank verified business/legal file and policies, no approved owner identity/real OTP verification. Hosted main Actions still fails before job steps. These are not resolved by fictional data, weakened security or paid settings.


Keep each entry: ID · status · symptom · verified root cause · fix/next step · evidence. Close entries, don't delete them.

## Open

### I-11 · RESOLVED IN PRODUCTION 2026-10-13 — WebKit blank viewport and incomplete canonical cutover

- `content-visibility:auto` left an in-viewport section unpainted in live WebKit/iPhone-profile scrolling; same-document removal restored actual text and height. Source now paints real content, and SW v12 retires cached faulty HTML. Domain cutover also left old SEO/auth/cache/source-route settings and no apex/HTTP redirects. PR #89 fixes both, with path/query/method preservation and protected REGA hosts. Staging `75511c45` passed 40 public browser cases and slow/paint checks. Native iPhone/direct IPv6/authenticated OTP checks remain unavailable; PR #89 merged (`4465ba7`), production `ddde9ad1` passed full public rendering, routing, asset, slow-network and cache verification. No rollback needed. [Paired evidence](../verification/rlgo-domain-20261013.md).


### I-1 · RESOLVED 2026-10-13 — production Hyperdrive and fallback recovered
- Current evidence: Cloudflare GET now succeeds; original origin = `misty-recipe-03041407/neondb`. Fresh read-only schema/count checks and the existing connected staging market validated `old-cherry-79292410/cargo` (13 migrations, 28 tables, 413 prohibited keywords, zero products/phone users/requests).
- Owner's current prompt explicitly authorizes root-cause fixes and infrastructure release. PATCH existing Hyperdrive origin succeeded, with original credential ready for rollback; config ID/caching/connection limit preserved. Subsequent production `/market` renders the real form/empty state, banned query `vodka` yields no product cards. No migrations, records, duplicate deletion or provider changes.
- Existing fallback `DATABASE_URL` was subsequently updated to the same verified cargo connection. Cloudflare PUT succeeded and created secret-only production version `2db4fb28` (05:20 UTC), preserving application code. Previous facts below are historical. Code rollback alone does not undo a Hyperdrive origin change.

- Symptom: `/market` and every DB-backed page show their error state.
- Root cause (re-verified 2026-10-11 15:14–15:20 UTC on live version `7b92d650`): the Worker reaches `misty-recipe-03041407/neondb`, which only has `0002_market.sql` (applied 10:31 UTC, most likely by `npm run build` with `DATABASE_URL` set). Live log on every `/market` request: `[market] error: column p.compliance_status does not exist` (added by `0012`) and `[compliance] DB rules unavailable … relation "prohibited_keywords" does not exist` (added by `0011`).
- Still open on `10723cf0` (15:38 UTC): 4 more probes raised `misty` rollbacks 334→340, `old-cherry` 0.
- Evidence the target is `misty`: 6 uncached `/market?q=<random>` probes raised `misty/neondb` rollbacks 257→287 (5 per request); `old-cherry/cargo` rollbacks stayed 0. The 10:40 report found both `HYPERDRIVE` and `DATABASE_URL` point there; the app prefers `HYPERDRIVE`.
- Correct database: `old-cherry-79292410` / `cargo` — all 12 migrations (09:38 UTC), 8 compliance triggers, 378 keywords. Neither database holds customer data, so repointing loses nothing.
- Why agents cannot fix it: the Cloudflare token cannot read or edit Hyperdrive (`10000`); secret changes and deploys need explicit owner approval (usage policy). Migrating `misty` instead was rejected: it would write to production and entrench the duplicate.
- Fix (owner, in this order):
  1. Neon console → project `old-cherry-79292410` → Connect → database `cargo`, pooling **off** → copy the connection string.
  2. Cloudflare → Hyperdrive → config `795013d06b38408e87552686a6045291` → edit origin with that host/database `cargo`/role/password. (Or give the agent token `Hyperdrive: Edit` and approve the change.)
  3. `npx wrangler secret put DATABASE_URL` (Worker `rega-cargo`) with the same string, so the fallback matches. Optionally the same for `rega-cargo-staging`, whose `DATABASE_URL` target is unverified.
  4. No redeploy needed for 2–3. Then run the verification recipe in [deployments.md](deployments.md).
  5. Only afterwards, and with approval, delete `misty-recipe-03041407`.
- Prevention: always build with `DATABASE_URL=''` unless migrating deliberately; take a Neon branch before any migration.

### I-2 · RESOLVED 2026-10-13 — Hyperdrive and Observability permissions available
- Connected Cloudflare GET/PATCH Hyperdrive now succeed. The old Hyperdrive denial below is superseded; no permission/token changes were made in this session.

- Current connected API supports Hyperdrive GET/PATCH and temporary Cargo-only Observability queries. Production post-release query: 378 sampled invocations `ok`; zero unexpected errors excluding known auth-disabled warnings. The older unavailable-scope evidence below is historical. I-1 was recovered without a scope change.

### I-3 · OPEN — phone sign-in cannot send codes
- No `WHATSAPP_*` / `TWILIO_*` / `PHONE_CODE_SECRET` secrets in production. Expected until the owner chooses a provider.

### I-9 · ROOT CAUSE FIXED IN FOLLOW-UP 2026-10-13 — first click lost before hydration: `360px filters, favorites, keyboard dialog and banned searches`
- Current evidence: existing regression reproduced on staging; held module showed enabled server filter button, first click 0 dialogs, second click 1. `ff1c6e0` reuses shared readiness in Button/Chip; new delayed-module regression passed, existing live staging regression passed 3 consecutive times. Full release gate passed (427 unit / 4 existing skips; 437 browser / 16 intentional skips); production follow-up pending; older observations below are historical.
- Symptom: against `rega-cargo-staging` the test fails about 3 of 5 runs (`dialog[open]` never appears); against production 5 of 5 pass; locally and in the CI-style local Worker it passes.
- Verified cause: the test clicks `.rl-mobile-filters` right after `page.goto("/stores?lang=en")` (default `load`, no `networkidle`), so on a slower remote the click can land before React hydrates and is lost. Control 2026-10-12: the pre-bump build (`238b755`, nitro 3.0.260610-beta) fails the same 3 of 5 on staging, so it is not a regression of the Nitro bump.
- Fix when convenient: `waitUntil: "networkidle"` on that first `goto` (test-only). Not changed yet to keep PR #75 about the dependency.

### I-5 · OPEN — content gaps
- `TODO(translate-review)` strings need native ckb/ar/fa/ku/de/tr review; legal pages need real owner details.

### I-6 · OPEN — sign-in disabled in production
- Live log: `[auth] DATABASE_URL is set but auth is disabled (VITE_AUTH_ENABLED=false) — requireUserId() rejects every request (fail closed)`. This is the shipped default (`src/lib/auth/verify.server.ts`): the Better Auth path fails closed. `phoneOrAuthMiddleware` checks an `rl_phone` session first, but phone codes cannot be sent (I-3), so nobody can sign in today; account, request and admin features stay unavailable even after I-1. Needs an owner decision (phone provider and/or enabling Better Auth).

### I-7 · OPEN · hosted CI blocked; authorized full local gate governs merges — GitHub Actions does not start any job (billing)
- Symptom: every "Cargo quality gate" run since ~15:38 UTC on 2026-10-11 ends as `failure` in 3–4 s with `runner_id: 0`, no steps and job logs returning 404: runs 165–170, including the `main` push run 166 on `486e442` and PR #60 runs on `bed4c9d` (plus one re-run) and `075b36c`.
- Verified root cause (check-run annotation on `075b36c`, 2026-10-12 06:31 UTC): "The job was not started because recent account payments have failed or your spending limit needs to be increased. Please check the 'Billing & plans' section in your settings". The repo is private on the personal account `rebar9988-max`.
- Why agents cannot fix it: billing endpoints are not reachable from agent sessions (403), and raising a spending limit is a paid change that needs the owner.
- Fix (owner): GitHub → Settings (account `rebar9988-max`) → Billing and plans → fix the failed payment method or raise the Actions spending limit (or wait for the included minutes to reset next cycle); then re-run the latest run. Hosted checks cannot be green until billing is repaired. Current owner authorization and CLAUDE.md full-local-gate policy supersede this historical merge prohibition.
- Evidence: `gh api repos/rebar9988-max/rega-cargo/check-runs/114690493529/annotations`; Actions API `get_workflow_job` / `list_workflow_runs`.
- Re-verified 2026-10-12 18:36 UTC on `main` @ `a7ee020` (run 186, job 114954290650): same annotation; runs 165–187 all end in 3–6 s. Repo rulesets/branch protection are unavailable on this plan (API 403 "Upgrade to GitHub Pro"), so `main` has no required checks. Account billing endpoints are not reachable from agent sessions, so "failed payment" vs "spending limit/quota" is not distinguishable here.
- Mitigation (PR #77, does not unblock): docs-only changes skip the ~10 min layout job, draft PRs skip CI until ready, superseded PR runs cancel; `main` and manual runs are never cancelled.

### I-10 · Shipping calculator and service choice mixed with the homepage/catalogue
- Root cause: `PremiumHome` rendered the quick calculator unconditionally, while `BazaarPage` owned delivery preference state and could mount `DeliveryHub` in place of the catalogue.
- Source fix in PR #72 on `claude/separate-shipping-bazaar`: dedicated `ShippingPage` on `/quote`, catalogue-only `BazaarPage`, and navigation from home to each service. Responsive shipping restyle; pricing/booking logic preserved.
- Not merged/deployed. [Verification](../redesign/shipping-separation.md).

## Closed

### C-5 · FIXED 2026-10-12 — `npm audit` highs in build tooling (undici/sharp via miniflare) [was I-4]
- Not in the Worker bundle. Verified 2026-10-11: 5 highs (env-runner, miniflare, nitro, sharp, undici), all fixed by `nitro` 3.0.260610-beta -> 3.0.260903-beta (one line in `package.json`, lockfile regenerated).
- Validated in an isolated worktree on `main` @ `cd42937`: `npm audit` 0 vulnerabilities, typecheck clean, 400 unit tests, build, `wrangler deploy --dry-run` (4,767 KiB vs 4,754 KiB), 95 Playwright geometry tests against the built Worker. Not yet a PR or deployed (CI blocked); PR #4 has no common ancestor with `main`, so apply the bump on a fresh branch.
- 2026-10-12: Nitro bump is PR #75 (supersedes #4). Staging check on the real runtime passed; the one staging browser failure is the pre-existing race in I-9, proven by a pre-bump control.
- Fixed by PR #75 (merged `a7ee020`, deployed `4242774e`): `npm audit` 0 vulnerabilities. PR #4 is superseded and can be closed by the owner.

### C-4 · FIXED 2026-10-12 — product-link panel shifted the request form (CLS 0.26) [was I-8]
- Symptom: production CLS 0.261 (en) / 0.267 (ckb) on `/stores/request` at 390px with throttled network and CPU, against <= 0.003 on every other page (measured 2026-10-11 and again 2026-10-12 on `10723cf0`).
- Root cause (verified with `layout-shift` sources): `ProductLinkAssist` renders nothing until a client request (`productLinkStatus`) returns, then inserts a ~430px panel above the form.
- Fix (merged as `361f954`, deployed as `5a2c2ecc`): PR #57 stamps `data-rl-plink` on `<html>` (same pattern as `data-rl-ai`) so the panel is in the server HTML; Playwright asserts panel-before-form in the HTML and CLS < 0.02.
- Also in #57: the announcement bar is now a named `<section>` (axe `region` finding on all 224 audited production pages).
- Verified on production 2026-10-12 18:1x UTC: CLS 0.001 (en) / 0.000 (ckb); axe `region` finding gone.

### C-1 · FIXED 2026-10-11 — `Disallowed operation called within global scope`
- Root cause: `HYPERDRIVE.connectionString` read at module scope in `db.ts` / `auth/*`; workerd forbids I/O in global scope.
- Fix: read it only inside a request (PR #58, deployed as `af8ee256`).

### C-2 · FIXED — WebKit layout-lock init failures
- Root cause: hydration reset the test's scroll before the lazy calculator mounted. Fixture now keeps it in view until controls mount ([step-6.md](../redesign/step-6.md)).

### C-3 · FIXED — English headline wrap during font swap (CLS 0.0755)
- Latin fallback stack now prefers Arial/Liberation Sans; CLS 0.0003 ([step-6.md](../redesign/step-6.md)).

## 2026-10-13 public domain exclusivity — resolved routing exposure

Previous configuration intentionally retained `cargo.regaplatform.com` and public staging/workers.dev. The owner's follow-up explicitly supersedes that policy: serve R&L only on `https://www.rlgo.net`, retain redirect-only apex/HTTP. Closed cargo attachment/DNS and all production/staging workers.dev/version previews; disabled Builds branch previews. Existing native previews have no routable URLs. Canonical browser/protocol checks pass; source persistence passed the full local official-image gate (455 layout tests/16 skips, zero failures) and is tracked in [PR #91](https://github.com/rebar9988-max/rega-cargo/pull/91). This is a routing/configuration change, not another application rewrite or database change. See [evidence](../verification/rlgo-exclusive-domain-20261013.md).

## R&L AI ownership and verification — 2026-10-13

The source-stage observations below are historical and superseded by the verified production checkpoint at the end of this section.

R&L AI source defects repaired: photo selection previously processed immediately; rate-limiter failures previously permitted inference; refunded failures could reopen provider-attempt budget; stale refunds could roll UTC state backwards. Actual workerd tests cover the repairs. The first API adapter caused Nitro/SSR entrypoint export pollution; the necessary public Marketplace server contract resolved it without changing business logic. Billing/missing credentials/protection visibility block rollout. See [verification report](../ai/rl-ai-verification-20261013.md).

Release preflight update: existing authenticated Cloudflare connector resolves the direct-CLI credential gap. Verified R&L main Builds trigger and rollback version `5791d60b`, no concurrent build. GitHub main branch resource reports `protected:false`. Hosted billing failure remains; the standing full local official-image gate policy applies. No release yet.

2026-10-14 continuation: full browser run 489 passed/16 existing skips/2 failed; failures were AI shortcut/consent hydration races. Fixed with existing `useHydrated` in AI controls only, added held-JavaScript first-interaction regression. Final affected official-image suite passed 72/72 without retries or baseline changes. Final full confirmation is running; no deployment yet.


2026-10-14 verified production checkpoint: PR #92 merged normally as `481bfeb`; existing Cloudflare Builds `7387019a` succeeded, Worker `c87c162d-11e9-4ca7-86e4-f6eca4a600a6`, 100%, 06:57 UTC. Genuine live planner and image inference, strict refusals, five shortcuts, authorized workflow links and eight read-only existing routes passed. Privacy-safe telemetry showed no exceptions/5xx; bindings and secrets preserved. No rollout blocker remains. Hosted Actions billing, native camera/OTP/private-order verification and field performance remain limitations; no billing or unrelated business change. Documentation-only follow-up may deploy an identical app; query current Worker state. [Evidence](../ai/rl-ai-verification-20261013.md).
