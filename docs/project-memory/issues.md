# Known issues, root causes and fixes

Keep each entry: ID · status · symptom · verified root cause · fix/next step · evidence. Close entries, don't delete them.

## Open

### I-1 · OPEN · blocker — production Worker queries the wrong (incomplete) Neon database
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

### I-2 · OPEN — Cloudflare agent token lacks Hyperdrive and Observability scopes
- Agents cannot verify or fix I-1. Owner may add `Hyperdrive: Read/Edit`, `Workers Observability: Read`.

### I-3 · OPEN — phone sign-in cannot send codes
- No `WHATSAPP_*` / `TWILIO_*` / `PHONE_CODE_SECRET` secrets in production. Expected until the owner chooses a provider.

### I-4 · OPEN — `npm audit` highs in build tooling (undici/sharp via miniflare)
- Not in the Worker bundle. Verified 2026-10-11: 5 highs (env-runner, miniflare, nitro, sharp, undici), all fixed by `nitro` 3.0.260610-beta -> 3.0.260903-beta (one line in `package.json`, lockfile regenerated).
- Validated in an isolated worktree on `main` @ `cd42937`: `npm audit` 0 vulnerabilities, typecheck clean, 400 unit tests, build, `wrangler deploy --dry-run` (4,767 KiB vs 4,754 KiB), 95 Playwright geometry tests against the built Worker. Not yet a PR or deployed (CI blocked); PR #4 has no common ancestor with `main`, so apply the bump on a fresh branch.
- 2026-10-12: Nitro bump is PR #75 (supersedes #4). Staging check on the real runtime passed; the one staging browser failure is the pre-existing race in I-9, proven by a pre-bump control.

### I-9 · OPEN (low) — staging-only flake: `360px filters, favorites, keyboard dialog and banned searches`
- Symptom: against `rega-cargo-staging` the test fails about 3 of 5 runs (`dialog[open]` never appears); against production 5 of 5 pass; locally and in the CI-style local Worker it passes.
- Verified cause: the test clicks `.rl-mobile-filters` right after `page.goto("/stores?lang=en")` (default `load`, no `networkidle`), so on a slower remote the click can land before React hydrates and is lost. Control 2026-10-12: the pre-bump build (`238b755`, nitro 3.0.260610-beta) fails the same 3 of 5 on staging, so it is not a regression of the Nitro bump.
- Fix when convenient: `waitUntil: "networkidle"` on that first `goto` (test-only). Not changed yet to keep PR #75 about the dependency.

### I-5 · OPEN — content gaps
- `TODO(translate-review)` strings need native ckb/ar/fa/ku review; legal pages need real owner details.

### I-6 · OPEN — sign-in disabled in production
- Live log: `[auth] DATABASE_URL is set but auth is disabled (VITE_AUTH_ENABLED=false) — requireUserId() rejects every request (fail closed)`. This is the shipped default (`src/lib/auth/verify.server.ts`): the Better Auth path fails closed. `phoneOrAuthMiddleware` checks an `rl_phone` session first, but phone codes cannot be sent (I-3), so nobody can sign in today; account, request and admin features stay unavailable even after I-1. Needs an owner decision (phone provider and/or enabling Better Auth).

### I-7 · OPEN · blocker for merging — GitHub Actions does not start any job (billing)
- Symptom: every "Cargo quality gate" run since ~15:38 UTC on 2026-10-11 ends as `failure` in 3–4 s with `runner_id: 0`, no steps and job logs returning 404: runs 165–170, including the `main` push run 166 on `486e442` and PR #60 runs on `bed4c9d` (plus one re-run) and `075b36c`.
- Verified root cause (check-run annotation on `075b36c`, 2026-10-12 06:31 UTC): "The job was not started because recent account payments have failed or your spending limit needs to be increased. Please check the 'Billing & plans' section in your settings". The repo is private on the personal account `rebar9988-max`.
- Why agents cannot fix it: billing endpoints are not reachable from agent sessions (403), and raising a spending limit is a paid change that needs the owner.
- Fix (owner): GitHub → Settings (account `rebar9988-max`) → Billing and plans → fix the failed payment method or raise the Actions spending limit (or wait for the included minutes to reset next cycle); then re-run the latest run. Until then no PR has a green quality gate, so none should be merged.
- Evidence: `gh api repos/rebar9988-max/rega-cargo/check-runs/114690493529/annotations`; Actions API `get_workflow_job` / `list_workflow_runs`.

## Closed

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
