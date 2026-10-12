# CI/CD and deployments

Procedures (build, secrets, go-live, rollback): [DEPLOY.md](../../DEPLOY.md). Deploys, secret changes and rollbacks need **explicit owner approval** ([usage policy](../integrations/usage-policy.md)).

## CI
- Workflow `.github/workflows/quality.yml` "Cargo quality gate" on push/PR to `main` and manual dispatch.
- Job `verify`: `npm ci` → typecheck → `npm test` → lint → `npm run build` (`DATABASE_URL=''`) → `cf:dry-run`.
- Job `layout lock`: official `mcr.microsoft.com/playwright:v1.63.0-noble` image, Chromium + WebKit; input `update_baselines` re-renders screenshots (artifact `layout-report`).
- Deploys are **manual** (`npm run deploy` / `deploy:staging`); there is no deploy job in CI.

2026-10-12 autonomous gate-repair continuation: local Node22 suite445 passes, strict checks/build/dry-run pass, full pinned-Docker392-case visual run exits0 with379 pass/one flaky passed on existing retry/12 existing skips. No production deployment or current-commit remote CI was performed. At06:32 UTC, production remains10723cf0 from the other session and Hyperdrive remainsneondb; retain the then-current version/configuration for a future gated rollback. [Actual root-cause evidence and release limits](../ai/audit-2026-10-11.md).

Final read-only production version confirmation at06:57 UTC remains10723cf0, 100%. Live Playwright at06:54 verifies ten public desktop/mobile pages and negative AI gates; no live inference/authenticated DB verification. Neither the local tests nor those public baseline checks establish that this patch is deployed.

PR [#68](https://github.com/rebar9988-max/rega-cargo/pull/68) is a review artifact, not a release: no patch Actions run or deployment exists. Local Node 22, full pinned-Docker visual repeat and final focused checks are documented in [the audit](../ai/audit-2026-10-11.md), including failures/flakiness. Both required current-commit CI jobs and the zero-spend guard remain prerequisites for retarget/merge/deploy. The owner authorized autonomous safe work; no routine permission needs repeating, but no gate is waived.

At 16:10 UTC read-only recheck, production still used version `10723cf0-8784-4f54-a439-5093fcd03459` from another session's 15:28 deployment; Hyperdrive still pointed to misty-recipe/neondb. This work changed neither. Live desktop/mobile checks passed at 15:35 for page rendering and negative AI gates, not inference or authenticated DB flows. Preserve the then-current version for a future rollback and never reset Durable Object state.

## Release log (append newest first; verify with `GET .../workers/scripts/<name>/deployments`)

| When (UTC) | Worker | Version | Notes |
|---|---|---|---|
| 2026-10-11 15:28 | `rega-cargo` | `10723cf0` | **Current production** (verified 15:36). Another session; source commit not recorded; `/market` still fails (I-1) |
| 2026-10-11 15:11 | `rega-cargo` | `7b92d650` | Source commit not recorded; `/market` failed (I-1) |
| 2026-10-11 15:02 | `rega-cargo-staging` | `4eac3268` | Source commit not recorded |
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
Prefer an authorized Hyperdrive-origin read and explicit Neon target/schema checks; this session's connector can read it. When a session lacks that read permission, the older counter-comparison diagnostic below may help, but avoid unnecessary probes and do not treat aggregate activity as proof of authentication/data safety:
1. Neon `run_sql` on each candidate: `select datname, xact_commit, xact_rollback from pg_stat_database where datname not like 'template%'`.
2. Send 5–6 uncached GETs: `https://cargo.regaplatform.com/market?q=probe<random>&category=&brand=&min=&max=&stock=&sort=price&page=1&saved=`.
3. Re-run step 1. The database whose counters move is the target (failing queries raise `xact_rollback`).
4. In parallel `timeout 90 npx wrangler tail rega-cargo --format json` shows the query errors.
Healthy: only `old-cherry-79292410/cargo` moves, with commits not rollbacks, and `/market` renders without its error state.

## Rollback
`npx wrangler deployments list --name rega-cargo` → `npx wrangler rollback <version-id> --name rega-cargo` (owner approval). Rolling back before the legacy-host wrapper re-exposes the old workers.dev host. DB: forward-only migrations; take a Neon branch/snapshot before migrating.
