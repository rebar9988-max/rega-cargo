# CI/CD and deployments

Procedures (build, secrets, go-live, rollback): [DEPLOY.md](../../DEPLOY.md). Deploys, secret changes and rollbacks need **explicit owner approval** ([usage policy](../integrations/usage-policy.md)).

## CI
- Workflow `.github/workflows/quality.yml` "Cargo quality gate" on push/PR to `main` and manual dispatch.
- Job `verify`: `npm ci` → typecheck → `npm test` → lint → `npm run build` (`DATABASE_URL=''`) → `cf:dry-run`.
- Job `layout lock`: official `mcr.microsoft.com/playwright:v1.63.0-noble` image, Chromium + WebKit; input `update_baselines` re-renders screenshots (artifact `layout-report`).
- Scope step (PR #77; moved from its own job into `verify` on 2026-10-13): if a push/PR changes only `*.md` or `docs/`, `layout lock` is skipped; `verify` always runs; `workflow_dispatch` and unknown bases always render.
- `layout lock` `needs: verify` (2026-10-13): a red verify skips the ~12 min layout job. Measured on successful runs 159/160 (2026-10-11): verify 1.3–1.5 min, layout lock 12–13 min (40 s container start), so a red verify saved ~12 min per run, and dropping the separate scope job saves its billed minute (billing rounds each job up to a whole minute).
- Draft PRs skip CI until `ready_for_review`. A newer push to the same PR cancels its older run; `main` pushes and manual runs use a per-run concurrency group and are never cancelled.
- No deployment job in GitHub Actions. **Verified 2026-10-13:** existing Cloudflare Builds is now connected to `rega-cargo`/this GitHub repo; production main auto-build uses `npm run build` + `npx wrangler deploy`, with no build env vars. Trigger `4b2f7874-0d8a-45d4-85d5-c322060ef6a1` was created 2026-10-12 21:55. No configuration change by this session.

## 2026-10-13 unified release checkpoint

PR #82 code `c6941ac`: local typecheck, 426 unit tests (4 existing skips), lint 0 errors/5 warnings, build with no DATABASE_URL, dry run and official-image no-update lock (432 pass / 12 skips / 0 fail) passed. Staging version `f04cd880-970e-4710-b98b-0638008952c5`, deployment `47fdfd40-b4bb-4503-83d3-7efeb493df7b`, 100%, via existing Workers API; 57 browser cases and 30 axe checks passed. Static headers, secrets, bindings, routes and DO namespaces preserved. PR #82 merged normally as `04ada22`; production automatic Cloudflare Builds `d964e56c` succeeded (migration skipped, startup 9ms). Worker `fff69ec5`, deployment `6ccf3e09`, 100%, 06:20 UTC: 57 browser cases and 30 axe checks passed. API production-upload guard stopped before writing because the automatic rollout had already completed. Cloudflare Builds preview `013e0da9` failed fetching the private repository at 05:54 before build; do not call it a code failure or a passing hosted gate.

## 2026-10-13 infrastructure recovery (no Worker code release)

Production Hyperdrive origin repointed to verified `old-cherry-79292410/cargo` using the existing authorized connected API. Original credentials available during the recovery for rollback. No migrations, data writes, project deletion, auth changes. Existing fallback secret then coordinated to cargo: secret-only production version `2db4fb28-b170-4c6c-bea4-d3b75db3b19a`, 100%, 05:20 UTC; app code remains main `248fe11`. Prior configuration/version is `1ec140d1`. Real public market now renders filters/empty state. The previous snapshot below is historical.

## Release log (append newest first; verify with `GET .../workers/scripts/<name>/deployments`)

| When (UTC) | Worker | Version | Notes |
|---|---|---|---|
| 2026-10-13 07:43 | `rega-cargo` | `db08bc5b` | Observed read-only 09:35 UTC as the live 100% version: `triggered_by: secret` (secret change, no code upload). Code underneath is `fd88780b` (07:03, version upload; `main` `5d39d9d` / PR #84 merged 07:02:48, link inferred from timing). Required routes 200; banned search empty. Who changed which secret was not recorded by that session |
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
