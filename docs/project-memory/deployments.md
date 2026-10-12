# CI/CD and deployments

Procedures (build, secrets, go-live, rollback): [DEPLOY.md](../../DEPLOY.md). Deploys, secret changes and rollbacks need **explicit owner approval** ([usage policy](../integrations/usage-policy.md)).

## CI
- Workflow `.github/workflows/quality.yml` "Cargo quality gate" on push/PR to `main` and manual dispatch.
- Job `verify`: `npm ci` → typecheck → `npm test` → lint → `npm run build` (`DATABASE_URL=''`) → `cf:dry-run`.
- Job `layout lock`: official `mcr.microsoft.com/playwright:v1.63.0-noble` image, Chromium + WebKit; input `update_baselines` re-renders screenshots (artifact `layout-report`).
- Deploys are **manual** (`npm run deploy` / `deploy:staging`); there is no deploy job in CI.

## Release log (append newest first; verify with `GET .../workers/scripts/<name>/deployments`)

| When (UTC) | Worker | Version | Notes |
|---|---|---|---|
| 2026-10-12 18:11 | `rega-cargo` | `5a2c2ecc` | **Current production.** `main` @ `361f954` (PR #57 merge); staging `ebfd4c86` first. Source delta from `853e698b` = 6 files (product-link flag stamped on `<html>`, announcement `<section>`). Verified on production: CLS `/stores/request` 0.261/0.267 -> 0.001/0.000 (en/ckb, 390px, throttled), 17 routes 200, banned search `vodka`/`vape` 0 results, product-link valid/SSRF/banned cases, axe 0 violations over 112 pages (ckb,en x 14 pages x light/dark x phone/desktop), Playwright geometry 142 passed / 3 skipped on production. Gate before merge was the reduced local one (decisions.md 2026-10-12). Rollback: `853e698b` |
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
