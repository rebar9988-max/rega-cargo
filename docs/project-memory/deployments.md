# CI/CD and deployments

## 2026-10-18 PR #118 merged, production build FAILED (not deployed)

[PR #118](https://github.com/rebar9988-max/rega-cargo/pull/118) (weight/size digit input) merged as `675c644` on the owner's chat instruction, on the local gate (decisions.md 2026-10-18). The existing Cloudflare Workers Build `be61d4c3-e649-457a-a714-f772f9936c79` for that commit finished with **failure** (check run 117625164795, started and completed 08:10:18 UTC; GitHub shows no log or annotation). Production was not changed by it: live `/quote` still rejects Arabic-Indic digits and `main`'s previous release `dc5bec0` (Build `a3ec9012`, Version `1bf425b0-b566-4c9f-a47e-c9062bb10e8a`) stays what the last successful build produced. Reproduction: a fresh clone of `675c644` passes `npm ci`, `npm run build` (empty DATABASE_URL, `WORKERS_CI_BRANCH=main`), `npm run release:check` and `wrangler deploy --dry-run`. Read-only check of the production `cargo` database: `_migrations` is applied through `0016` and the repo has no newer migration, so the migration step is a no-op. Cause therefore unknown from here (Cloudflare build log is not readable by the agent). Owner action if the next build also fails: open the build in the Cloudflare dashboard (Workers & Pages > rega-cargo > Builds > `be61d4c3`) and read the failing step.

**Resolved (2026-10-18 08:14 UTC):** the next push to `main` (docs-only PR #119, `57d4121`) built successfully: Build `74e026c6`, Version ID `e3ab56d5-c74b-4317-9c63-c254af2a39cd` (from the `Workers Builds: rega-cargo` check run; active-at-100% not verified by the agent). The failure of `be61d4c3` was therefore transient and its cause remains unknown. Live read-only checks after that build: `/quote` weight accepts `3.2`, `3,2` and the Arabic-Indic / Persian spellings of 3.2 in en and ckb, still refuses `0`, `70.1` and `abc`; 78 functional flows (320/390/1440 px, ckb/en) 0 failures; 78 route loads all 200 with correct `lang`/`dir`; 96 loads with 0 console, page or HTTP >= 400 errors; the `RL_LIMIT` binding still refuses after about 20 calls a minute. Not run: Firefox, WebKit, official-image layout lock. Docs-only follow-ups can build an identical app; query the current version before operating.

## 2026-10-18 PR #115 release (six code-defect fixes)

[PR #115](https://github.com/rebar9988-max/rega-cargo/pull/115) merged as `56e53f2` on the owner's chat instruction, on the local gate (decisions.md 2026-10-18). Existing Cloudflare Builds `6cedf284` succeeded, Version ID `c0c4f5a6-441d-4162-9d53-9b3f837316a0` (from the `Workers Builds: rega-cargo` check run; the agent's Cloudflare token is DNS-scoped, so "active at 100%" is **not** verified directly). `main` head stayed `56e53f2` when checked. Hosted Actions fail in seconds with the billing annotation (I-7): not code failures, not a pass. Live read-only checks after the build: 78 route loads (13 routes x ckb/ar/en x 390/1440) all 200, no overflow, `lang`/`dir="rtl"` correct; 96 loads with 0 console errors, 0 page errors, 0 HTTP >= 400; `rlgo.net` and `http://www` 301 to `https://www.rlgo.net`, legacy workers.dev 404; banned searches (vodka, cheap beer, Zigaretten, جگەرە, vape, wine) render 0 store cards and no product links in ckb and en. The fixes are server-side (quote signature, request payload, compliance matcher/cache, tracking events, quote statements), so live proof of them is the regression tests plus the identical built bundle, not a browser probe; no signed-in or mutating request was sent to production. Not run: Firefox, WebKit, official-image layout lock. Docs-only follow-ups can build an identical app; query the current version before operating. [Report](../verification/code-defects-20261017.md).

## 2026-10-16 PR #111 release (search placeholder at narrow widths, dark hero contrast)

[PR #111](https://github.com/rebar9988-max/rega-cargo/pull/111) merged as `d96c4a8` on the owner's chat instruction, on the local gate (decisions.md 2026-10-16). Existing Cloudflare Builds `f276441a` succeeded, Version ID `63811e37-a1b7-4f30-8fc9-600331d5bc1b` (from the `Workers Builds: rega-cargo` check run; the agent's Cloudflare token is DNS-scoped and a Workers API read was refused, so "active at 100%" is **not** verified directly). `main` head stayed `d96c4a8` when checked. Hosted Actions `verify`/`scope` fail in 3 s with the billing annotation (I-7); not code failures and not a pass. Live read-only checks after the build: home search placeholder transparent at 360/390 px and visible at 430 px+ (pill 86/116/156 px, still a tap target); dark-mode hero eyebrow min contrast 5.10:1 (360) / 7.00:1 (1440) in ckb, 6.58/8.21 ar, 5.10/6.12 en; 78 route loads (13 routes x ckb/ar/en x 390/1440) all 200, no overflow, `lang`/`dir="rtl"` correct; 96 loads with 0 console errors, 0 page errors, 0 HTTP >= 400; `rlgo.net` and `http://www` 301 to `https://www.rlgo.net`, legacy workers.dev 404. Not run: Firefox, WebKit, official-image layout lock, pixel baselines (stale). Docs-only follow-ups can build an identical app; query the current version before operating. [Report](../verification/final-hardening-20261016.md).

## 2026-10-16 PR #109 release (Bring For Me draft-label hit area)

[PR #109](https://github.com/rebar9988-max/rega-cargo/pull/109) merged as `a406006` on the owner's chat instruction, on the local gate (decisions.md 2026-10-16). Existing Cloudflare Builds `06a5f699` succeeded, Version ID `dd667bef-0fcf-4210-b8a3-0da8779a9976` (from the `Workers Builds: rega-cargo` check run; no Cloudflare API access from the agent, so "active at 100%" is **not** verified directly). `main` head stayed `a406006` when checked, so no later commit superseded it. Hosted Actions `verify`/`scope` failed in 3 s with the billing annotation (I-7), `layout lock` skipped: not code failures and not a pass. Live read-only checks after the build: Bring For Me draft label 50 px in ckb/ar/en at 390 and 1440 px, page heights equal the pre-deploy values; 78 loads (13 routes x ckb/ar/en x 390/1440) all 200, no horizontal overflow, `lang` = locale, `dir="rtl"`, no page errors; `rlgo.net` and `http://www` 301 to `https://www.rlgo.net`, legacy workers.dev 404. Not run: official-image layout lock, pixel baselines (stale), WebKit. Follow-up docs-only merges can build an identical app; query the current version before operating. [Report](../verification/ui-touch-targets-20261016.md).

## 2026-10-15 CI/CD audit (no deployment)

Verified state, invariants and owner actions: [runbook](../operations/cicd.md). Production `4a48cd8c` = `main` `5d66eee` (Workers Builds `b8e80818`). PR branch build `11b23adc` on `c0d7521`: success, no Version ID, no Preview URL. Hosted Actions still blocked by billing (annotation verified). Code change: migration gate (I-13). Not changed: workflow, `wrangler.jsonc`, build/deploy commands, Builds settings, secrets, domains, database.

## 2026-10-14 five-improvement beta release

PR #95 normal merge 8ae779f. Existing Cloudflare main Build 85d441c9-91a3-46f3-a9cf-246a8f5dd5ee succeeded; application Worker 1a514fed-3352-450b-9597-f3cac9f70a3e at 100%, deployment 31c582de-bdd1-453c-82fe-26d8eec48d1d, 13:09:57 UTC. New deploy command includes release:check; beta exception is owner-authorized, public gate stays strict. Migration 0015 applied atomically; unchanged business counts/no grants. Four secrets, Hyperdrive, AI cap, canonical domains and closed previews preserved. 12 customer + 3 security/track cases passed across final separate runs. Rollback Worker baseline 0f6e2dd7; preserve additive schema/data. No hosted Actions/positive owner/OTP/log verification claim. Documentation-only follow-up may produce an identical-app Worker version. [Evidence](../verification/rl-five-improvements-20261013.md).


## 2026-10-14 owner-authorized beta rollout in progress

Owner supersedes the earlier missing-legal-content hold specifically for beta. Source policy permits incomplete facts only during beta; public release must require completion. Actual Neon dev migration/reapplication passed; production migration 0015 applied transactionally with existing record counts unchanged and no roles granted. Fresh source gate: 483 local unit/script passes, 4 existing skips; typecheck/lint/build/dry-run passed. Browser/merge/build verification continues. Rollback Worker baseline 0f6e2dd7; preserve additive schema and all data. [Evidence](../verification/rl-five-improvements-20261013.md).

## 2026-10-14 five-improvement candidate — release held

No merge, deployment, staging exposure, remote migration or production data write. User prohibits release when verified legal content is missing; business-approved.json remains blank. Candidate builds locally without a database connection; migration 0015 is isolated-tested only. Existing production read-only inspection: `0f6e2dd7-441a-4092-af4e-57715a4af7b3`, 100%, 07:16 UTC. Existing main auto-build invokes build/deploy directly, so do not merge the draft until the legal gate and owner/OTP verification are satisfied. [Evidence](../verification/rl-five-improvements-20261013.md).


Procedures (build, secrets, go-live, rollback): [DEPLOY.md](../../DEPLOY.md). Deploys, secret changes and rollbacks need **explicit owner approval** ([usage policy](../integrations/usage-policy.md)).

## CI
- Workflow `.github/workflows/quality.yml` "Cargo quality gate" on push/PR to `main` and manual dispatch.
- Job `verify`: `npm ci` → typecheck → `npm test` → lint → `npm run build` (`DATABASE_URL=''`) → `cf:dry-run`.
- Job `layout lock`: official `mcr.microsoft.com/playwright:v1.63.0-noble` image, Chromium + WebKit + Firefox (`firefox-premium-360`, no screenshots; the step sets `HOME=/root`); input `update_baselines` re-renders screenshots (artifact `layout-report`).
- Job `scope` (PR #77): if a push/PR changes only `*.md` or `docs/`, `layout lock` is skipped; `verify` always runs; `workflow_dispatch` and unknown bases always render.
- Draft PRs skip CI until `ready_for_review`. A newer push to the same PR cancels its older run; `main` pushes and manual runs use a per-run concurrency group and are never cancelled.
- No deployment job in GitHub Actions. **Verified 2026-10-13:** existing Cloudflare Builds is now connected to `rega-cargo`/this GitHub repo; production main auto-build uses `npm run build` + `npx wrangler deploy`, with no build env vars. Trigger `4b2f7874-0d8a-45d4-85d5-c322060ef6a1` was created 2026-10-12 21:55. No configuration change by this session.

## 2026-10-14 R&L AI production release

Owner explicitly authorized implementation through deployment/live verification. PR #92 normally merged as `481bfeb`; no force/admin bypass. Existing Cloudflare main Builds `7387019a-d152-469b-ba5b-73b861044aae` succeeded and deployed Worker `c87c162d-11e9-4ca7-86e4-f6eca4a600a6`, 100%, 06:57 UTC, deployment `253c3b8a-23a1-4891-932d-57fa012c263e`. Rollback baseline `5791d60b-76b4-448b-a922-0d4d928df592`. Bindings/secrets preserved, no migration or new infrastructure. Live entry, five shortcuts, refusals, one genuine planner call and one genuine vision call, mobile/desktop RTL, eight existing read-only routes and privacy-safe telemetry passed. Local full-gate details and honest limitations: [AI verification](../ai/rl-ai-verification-20261013.md). Hosted Actions remains blocked by account billing; the existing full local official-image gate policy was used. Documentation-only follow-up can produce a newer Worker with identical application source; always query current deployments.

## 2026-10-13 unified release checkpoint

PR #82 code `c6941ac`: local typecheck, 426 unit tests (4 existing skips), lint 0 errors/5 warnings, build with no DATABASE_URL, dry run and official-image no-update lock (432 pass / 12 skips / 0 fail) passed. Staging version `f04cd880-970e-4710-b98b-0638008952c5`, deployment `47fdfd40-b4bb-4503-83d3-7efeb493df7b`, 100%, via existing Workers API; 57 browser cases and 30 axe checks passed. Static headers, secrets, bindings, routes and DO namespaces preserved. PR #82 merged normally as `04ada22`; production automatic Cloudflare Builds `d964e56c` succeeded (migration skipped, startup 9ms). Worker `fff69ec5`, deployment `6ccf3e09`, 100%, 06:20 UTC: 57 browser cases and 30 axe checks passed. API production-upload guard stopped before writing because the automatic rollout had already completed. Cloudflare Builds preview `013e0da9` failed fetching the private repository at 05:54 before build; do not call it a code failure or a passing hosted gate.

## 2026-10-13 infrastructure recovery (no Worker code release)

Production Hyperdrive origin repointed to verified `old-cherry-79292410/cargo` using the existing authorized connected API. Original credentials available during the recovery for rollback. No migrations, data writes, project deletion, auth changes. Existing fallback secret then coordinated to cargo: secret-only production version `2db4fb28-b170-4c6c-bea4-d3b75db3b19a`, 100%, 05:20 UTC; app code remains main `248fe11`. Prior configuration/version is `1ec140d1`. Real public market now renders filters/empty state. The previous snapshot below is historical.

## Release log (append newest first; verify with `GET .../workers/scripts/<name>/deployments`)

| When (UTC) | Worker | Version | Notes |
|---|---|---|---|
| 2026-10-18 08:14 | `rega-cargo` | `e3ab56d5` | `main` `57d4121` includes PR #118 (digit input); Cloudflare Builds `74e026c6` succeeded after `be61d4c3` (for `675c644`) failed transiently; live checks above; active-at-100% not verified |
| 2026-10-18 06:40 | `rega-cargo` | `c0c4f5a6` | PR #115 -> main `56e53f2` (six code-defect fixes); Cloudflare Builds `6cedf284` succeeded; live checks above; active-at-100% not verified |
| 2026-10-16 13:17 | `rega-cargo` | `63811e37` | PR #111 -> main `d96c4a8` (ref-home.css: narrow search placeholder, dark hero glow); Cloudflare Builds `f276441a` succeeded; live checks above; active-at-100% not verified |
| 2026-10-16 12:09 | `rega-cargo` | `dd667bef` | PR #109 -> main `a406006` (one Bring For Me label class); Cloudflare Builds `06a5f699` succeeded; live checks above; active-at-100% not verified (no Cloudflare API access) |
| 2026-10-14 20:54 | `rega-cargo` | (not queried) | Reference homepage, PR #100 → main `fb1bf7b`; existing Cloudflare Builds deployed it (live `sw.js` `rl-sw-v13`). Live read-only checks: 16 routes 200, no overflow/console/network errors at six widths, interactions OK. Hosted CI blocked (I-7), local gate only; `/` screenshot baselines stale. [Evidence](../implementation/RL_DESIGN_PROGRESS.md) |
| 2026-10-13 06:20 | `rega-cargo` | `fff69ec5` | Initial unified UI release, main `04ada22` / PR #82; Cloudflare Builds `d964e56c` successful, 100%, startup 9ms, 57 browser cases and 30 axe checks passed. Correct cargo DB binding/fallback preserved; no schema/data writes. Rollback `2db4fb28` retains the recovered database configuration. Subsequent preview/configuration follow-up can produce another version of the same UI; verify live deployments before acting |
| 2026-10-12 21:04 | `rega-cargo` | `2e724d37` | **Historical production release.** `main` @ `bd03131` (PR #78, header category strip), `--message "bd03131 PR #78: header category strip"`; owner instruction in chat ("deploying بكە"). Staging `ca679d77` first (20 routes 200; Playwright 263 passed, 1 = known I-9 race, filters dialog 5/5 after load). Gate: typecheck, lint 0 errors, `npm test` 417/0, build, bundle 4807.53 KiB, official-image layout lock 387 passed / 12 skipped on the identical tree (`9886af3`). Hosted CI not started (billing, I-7); `main` has no protection/required checks. Verified on production: 20 routes 200, `/api/ai/status` enabled, banned searches vodka/cigarettes/vape/pork bacon 0 results, legacy host 301, Playwright 264 passed / 9 skipped / 0 failed, no horizontal overflow at 390/820/1280. Worker logs NOT checked (I-2). Rollback: `12dcd05e` |
| 2026-10-12 19:05 | `rega-cargo` | `12dcd05e` | Superseded by `2e724d37`. `main` @ `3c7ad5a` (PR #72, shipping/bazaar separation); entry added retroactively from `wrangler deployments list` |
| 2026-10-12 18:37 | `rega-cargo` | `4242774e` | **Historical production release.** `main` @ `a7ee020` (PR #75, Nitro 3.0.260903-beta); staging `6b19ca0b` first. Source delta from `5a2c2ecc` = `package.json` + lockfile only. `npm audit` 0 vulnerabilities (was 5 high). Verified on production: 18 routes 200, banned search `vodka`/`vape` 0 results, CLS `/stores/request` 0.001/0.000, product-link valid/SSRF/banned cases, security headers unchanged, Playwright geometry 142 passed / 3 skipped. Worker logs were NOT checked (token lacks observability scope, I-2). Reduced gate as in decisions.md. Rollback: `5a2c2ecc` |
| 2026-10-12 18:11 | `rega-cargo` | `5a2c2ecc` | Superseded by `4242774e`; was production. `main` @ `361f954` (PR #57 merge); staging `ebfd4c86` first. Source delta from `853e698b` = 6 files (product-link flag stamped on `<html>`, announcement `<section>`). Verified on production: CLS `/stores/request` 0.261/0.267 -> 0.001/0.000 (en/ckb, 390px, throttled), 17 routes 200, banned search `vodka`/`vape` 0 results, product-link valid/SSRF/banned cases, axe 0 violations over 112 pages (ckb,en x 14 pages x light/dark x phone/desktop), Playwright geometry 142 passed / 3 skipped on production. Gate before merge was the reduced local one (decisions.md 2026-10-12). Rollback: `853e698b` |
| 2026-10-12 06:47 | `rega-cargo` | `853e698b` | Superseded by `5a2c2ecc`; was production. `main` @ `9ba82e9` (PR #60 merge), `--message "9ba82e9 PR #60"`; smoke + browser check passed; `wrangler tail` 63/63 ok, no exceptions; only the known I-1/I-6 log errors |
| 2026-10-11 15:28 | `rega-cargo` | `10723cf0` | Superseded by `853e698b` (was production, verified 15:36). Another session; source commit not recorded; `/market` still fails (I-1) |
| 2026-10-11 15:11 | `rega-cargo` | `7b92d650` | Source commit not recorded; `/market` failed (I-1) |
| 2026-10-11 15:02 | `rega-cargo-staging` | `4eac3268` | PR #60 branch at `9f81391` (hero card + tracking entry); all required routes 200 on staging afterwards |
| 2026-10-11 10:45 | `rega-cargo` | `c20d050d` | Source commit not recorded |
| 2026-10-11 10:26 | `rega-cargo` | `af8ee256` | PR #58 module-scope fix |
| 2026-10-11 10:05 | `rega-cargo` | `55cc4430` | First Hyperdrive binding; crashed on global-scope read |
| 2026-10-11 09:42 | `rega-cargo` | `fef8d4c2` | Before Hyperdrive |

Gap: deploys don't record the Git SHA. When deploying, add `--message "<sha>"` (shows as `workers/message`) and log the row here.

## Post-deploy verification checklist
1. Required routes 200 on https://cargo.regaplatform.com (AGENTS.md list), `<html lang dir>` correct.
2. `/api/ai/status` → enabled; `/market` renders data, not the error state.
3. `npx wrangler tail rega-cargo` — no exceptions / `exceededCpu`.
4. Neon counters move on `old-cherry-79292410/cargo` only.

## Which database does production use? (read-only recipe)
Hyperdrive origins are not readable with the agent token, so measure instead:
1. Neon `run_sql` on each candidate: `select datname, xact_commit, xact_rollback from pg_stat_database where datname not like 'template%'`.
2. Send 5–6 uncached GETs: `https://cargo.regaplatform.com/market?q=probe<random>&category=&brand=&min=&max=&stock=&sort=price&page=1&saved=`.
3. Re-run step 1. The database whose counters move is the target (failing queries raise `xact_rollback`).
4. In parallel `timeout 90 npx wrangler tail rega-cargo --format json` shows the query errors.
Healthy: only `old-cherry-79292410/cargo` moves, with commits not rollbacks, and `/market` renders without its error state.

## Rollback
`npx wrangler deployments list --name rega-cargo` → `npx wrangler rollback <version-id> --name rega-cargo` (owner approval). Rolling back before the legacy-host wrapper re-exposes the old workers.dev host. DB: forward-only migrations; take a Neon branch/snapshot before migrating.

Follow-up `ff1c6e0`: staging `0dd47819-60be-488f-9053-13008366da44`, deployment `dd3ddfef-205b-44f1-b2f0-022f8887909a`, startup 13ms; existing catalogue regression 3 consecutive passes. This fixes the proven first-click hydration race and missing branch-preview configuration; full lock passed 437 / 16 intentional skips / 0 failed; follow-up merge/rollout pending. Main deployment remains automatic.

## 2026-10-13 critical domain/WebKit staging checkpoint

PR #89 app commit `35c4547`: existing staging Worker `75511c45-4f5e-4081-8d02-8edc3a777379`, deployment `b4c68270`, 100%, 11:06 UTC. Cloudflare build `15bd6fa6` succeeded via a temporary trigger scoped to the existing staging Worker/repository/credential, then that trigger was removed. No Worker identity guard bypass, database migration or new service/credential. Production rollback baseline: `db08bc5b-31d3-460f-b7ea-7fdf9b0eb750` (queried live before rollout). [Validation and full report](../verification/rlgo-domain-20261013.md).

## 2026-10-13 critical domain/WebKit production release

PR #89 merged `4465ba7`; build `ed9dc719` succeeded, migration skipped, startup 9ms. Worker `ddde9ad1-6555-4ee4-afe4-b7ac5043efcc`, deployment `b5bed8a3`, 100%, 11:27 UTC. Verified actual production: 40 browser cases, 6 delayed/repeated/scroll rendering regressions, 2 slow-network cases, 31 page/API/asset/redirect probes, 2 v11→v12 cache recovery checks; zero unexpected browser/asset errors. Apex/HTTP GET 301 and POST 308 go directly to www with path/query retained. No rollback needed; baseline `db08bc5b` remains available. This docs-only update may produce an identical-code version through existing auto-builds; re-query live deployments before acting. [Full evidence and limitations](../verification/rlgo-domain-20261013.md).

## 2026-10-13 domain exclusivity

11:48 UTC routing-only closure: first disabled rega-cargo-staging workers.dev and version previews and verified 404 with www 200; disabled R&L Builds previews, production workers.dev and version previews; detached cargo.regaplatform.com (managed DNS removed). Application version remains 66c196ad-5656-4966-b69b-29b8d0a7fde9 at this checkpoint. Existing native previews have no routable URLs. Canonical/apex and separate REGA domain attachments preserved. Source persistence passed the full local official-image gate: 432 unit tests/4 skips, 455 layout tests/16 skips, zero failures. Production and staging dry-runs/startup passed. Source persistence: [PR #91](https://github.com/rebar9988-max/rega-cargo/pull/91), using normal merge and the existing automatic main deployment.

## R&L AI ownership and verification — 2026-10-13

**No R&L AI deployment performed.** Production baseline https://www.rlgo.net `/` and `/ai` returned 200, existing homepage link/camera/estimate visible. Release blocked by Actions billing, absent Cloudflare authentication and denied protection/deployment inspection. No public staging/preview, infrastructure, secrets, database, billing or branch protections changed. Full local gate result is recorded in the verification report, not presumed CI success. See [verification report](../ai/rl-ai-verification-20261013.md).

Release preflight update: existing authenticated Cloudflare connector resolves the direct-CLI credential gap. Verified R&L main Builds trigger and rollback version `5791d60b`, no concurrent build. GitHub main branch resource reports `protected:false`. Hosted billing failure remains; the standing full local official-image gate policy applies. No release yet.

2026-10-14 release gate: final official-image full run 499 passed/16 existing skips/one unchanged navigation harness cancellation; its original case passed 3 consecutive no-retry confirmations without source change. Final affected AI/readiness/visual suite 72/72. Typecheck, 460 unit/security passes + 4 existing skips, lint 0 errors/5 existing warnings, build and dry run passed on the final application tree. [PR #92](https://github.com/rebar9988-max/rega-cargo/pull/92) ready for normal authorized merge after preflight. Hosted Actions is not green (billing); standing full local gate policy applies. No release performed yet.

The existing Cloudflare production trigger deploy command is now `npm run release:check && npx wrangler deploy` (build command unchanged). This closes the previously documented automatic-workflow omission: future public-stage releases cannot silently skip legal readiness. No secret/binding/branch preview/domain changed. The owner-approved beta stage satisfies this gate while retaining visible pending legal facts.
