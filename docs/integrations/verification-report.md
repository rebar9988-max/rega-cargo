# Integration verification report: 2026-10-11

## Status at 15:25 UTC: read this first

| Check | Verified result |
|---|---|
| Live Worker | `rega-cargo` version `7b92d650`, deployed 15:11 UTC. Bindings: `HYPERDRIVE` `795013d0…`, `DATABASE_URL` secret, `PRODUCT_LINK_ENABLED=true`, `RL_AI_ENABLED=true` (same as `wrangler.jsonc`) |
| Which database production uses | **Still `misty-recipe-03041407/neondb` (wrong).** Five live `/market` requests added rollbacks there (314 → 316); `old-cherry-79292410/cargo` rollbacks stayed at 0. `/market` shows "Try again" |
| `old-cherry-79292410/cargo` (intended) | 28 tables, migrations `0002`–`0014`, 413 locked compliance keywords, 0 unlocked, 0 products, 6 categories. No customer rows in any table |
| `misty-recipe-03041407/neondb` (duplicate) | 12 tables, only `0002_market.sql`, no compliance tables, 6 categories. No customer rows |
| Migration `0014_compliance_brands.sql` | Applied to `cargo` at ~15:24 UTC exactly as `scripts/migrate.mjs` does: one transaction, then a `_migrations` row. Additive only (35 keywords, locked by the trigger) |
| Hyperdrive config | **Unverifiable with the session token** (`10000 Authentication error` on list and get) |

**Remaining blocker (owner action).** Edit Hyperdrive `795013d06b38408e87552686a6045291` so its origin is the `old-cherry-79292410` endpoint, database `cargo` (pooling off), then set the `DATABASE_URL` secret on `rega-cargo` to the same string. Alternatively, grant the Cloudflare token `Account → Hyperdrive → Edit`. No redeploy is needed for Hyperdrive; a secret edit takes effect immediately. Do not delete `misty-recipe-03041407` until `/market` works.

Builds and deploys must keep using `DATABASE_URL=''` until then. Otherwise `npm run build` migrates whichever database the local `DATABASE_URL` names.

The earlier passes below were read-only.

## Recovery pass (10:05–10:40 UTC): read this first

**Production database features are down, and both configured connections point at the empty duplicate database.**

| Fact | Evidence |
|---|---|
| Live version `55cc4430` (deployed 10:05 UTC by another session) binds `HYPERDRIVE` (`795013d0…`) as well as the `DATABASE_URL` secret. The app prefers `HYPERDRIVE` | Cloudflare `workers/scripts/rega-cargo/settings`; `src/lib/db-config.server.ts` |
| Every DB-backed page fails with `Disallowed operation called within global scope` (`/market` renders its "try again" state) | `wrangler tail rega-cargo` during `/market` requests. Reproduced locally with `wrangler dev` and a local Hyperdrive binding |
| Cause: `db.ts`, `auth/server.ts` and `auth/verify.server.ts` read `HYPERDRIVE.connectionString` at module scope. workerd forbids that, because modules (even dynamic imports) evaluate in global scope | Stack trace: `resolveDatabaseUrl` ← `db-*.mjs` module body |
| Hyperdrive `795013d0…` → **`misty-recipe-03041407`, database `neondb` (empty)** | `wrangler dev --remote` with the real binding: `relation "offers" does not exist`. Over 20 probes, `misty/neondb` rollbacks went 8→18. `old-cherry` and `rega-platform` counters did not change |
| `DATABASE_URL` secret → **also the empty `misty/neondb`** | Same remote probe without the Hyperdrive binding: same missing-relation errors. Only `misty/neondb` rollbacks rose. `old-cherry` (`cargo` and `postgres`) rollbacks stayed at 0 |
| The real schema is **`old-cherry-79292410`, database `cargo`** (not `neondb`). No production connection references it | `pg_stat_database` and `_migrations` on `old-cherry` |
| The bundled banned-products list still applies when the DB rules are unreachable | Preview log: `[compliance] DB rules unavailable, using bundled list` |

### Update 10:40 UTC

- PR #58 (another session) fixed the module-scope crash the same way and was deployed as version `af8ee256` at 10:26 UTC. Production now **does reach the database, and it is the wrong one**. The live log (`wrangler tail`) shows `column p.compliance_status does not exist` and `relation "prohibited_keywords" does not exist` on `/market`. `/market` still shows its error state.
- At 10:31:51 UTC something applied `0002_market.sql` to `misty-recipe-03041407/neondb`, and nothing after it. That database now has 12 market tables and 6 categories, but no compliance tables, triggers or blocklist, and 0 products. The likely cause: `npm run build` runs `db:migrate` whenever `DATABASE_URL` is set. No one in this session wrote to either database.
- Banned-product protection still holds in production through the bundled list (`[compliance] DB rules unavailable, using bundled list`), and there are no products to leak.

This session deployed nothing, because no deploy is safe until the connection is repointed. The earlier "22/22 clean" browser result below is still true for console and network, but `/market` was already showing its server-rendered error state.

## Source control: GitHub

- Authenticated as `rebar9988-max`. Repo `rebar9988-max/rega-cargo`.
- `main` at `cd42937` (Hyperdrive binding, #54). Last completed `main` CI run: **success** (run 131, `f41c39f`).
- Open PRs at audit time: #56, #55, #54 (since merged), #51, #49 (draft), #48, #9, #4. Runs for #54, #55 and #56 were in progress. One earlier #54 run (132) failed; its follow-up commit addressed the layout-lock web server.

## Local quality gate (on `main` `cd42937`)

| Step | Result |
|---|---|
| `npm run typecheck` | pass |
| `npm test` | pass: 205 node tests (201 pass, 0 fail; the other 4 did not run) + 194 TS tests (194 pass) |
| `npm run lint` | pass: 0 errors, 5 warnings |
| `DATABASE_URL='' npm run build` | pass |
| `npm run cf:dry-run` | pass: 4754.19 KiB, gzip 1063.05 KiB; bundle includes `env.HYPERDRIVE (795013d0…)` |

All five steps were run on `cd42937`.

## Infrastructure: Cloudflare (REST API, env token)

- Token status: `active`. Workers: `rega-cargo`, `rega-cargo-staging`, `rega-platform`.
- Custom domains: `cargo.regaplatform.com → rega-cargo`. Apex and `www` → `rega-platform` (correct separation).
- Live `rega-cargo` version `fef8d4c2`, deployed 2026-10-11 09:42 UTC via wrangler.
- Live bindings: `AI`, `ASSETS`, `RL_AI_USAGE` (DO), `RL_LIMIT`, secrets `BETTER_AUTH_SECRET` / `DATABASE_URL` / `QUOTE_SECRET`, plus plain vars. **No `HYPERDRIVE` binding is live.** `main` now declares Hyperdrive config `795013d06b38408e87552686a6045291`, so production lags `main`.
- Hyperdrive API: **denied for this token** (`10000 Authentication error`). I could not verify that the config exists or which database it targets.

## Database: Neon

| Project | Name | PG | Tables | Assessment |
|---|---|---|---|---|
| `old-cherry-79292410` | rl-cargo-production | 17 | 28 (database `cargo`) | **The real Cargo schema** |
| `misty-recipe-03041407` | rl-cargo-production | 18 | 0 (database `neondb`) | **Empty duplicate**. Currently the target of both production connections |
| `lucky-glitter-73195208` | rega-platform | 18 | — | REGA platform. Not Cargo, not touched |

Read-only query on `old-cherry-79292410`:

- `_migrations`: 12 applied, latest `0013_customer_requests.sql`. This matches all 12 files in `migrations/`.
- Compliance: 8 prohibited categories, 378 prohibited keywords, 8 `compliance%` triggers in place.
- `products`: 0 rows. `categories`: 6.

## Production: https://cargo.regaplatform.com

- HTTP: all required routes return 200. `/market` returns 307 to its canonical query string. An unknown API path returns 404. `robots.txt` and `sitemap.xml` return 200.
- Headers: HSTS (1 year, subdomains), strict CSP with nonce, `frame-ancestors 'none'`.
- Browser (Playwright Chromium, desktop 1366×900 and mobile 390×844), 11 routes × 2 viewports:
  - 22/22 loaded with **0 console errors, 0 failed requests and 0 HTTP ≥ 400 responses**.
  - `<html lang="ckb" dir="rtl">` on every page. No horizontal overflow.
  - Screenshot review (mobile `/quote`): red-and-white R&L logo in the header, Sorani UI, bottom navigation intact.

## Other connectors

- Sentry: org `terms-of-service-1c` (EU region), **0 projects**. The app has no Sentry SDK.
- Supabase: 0 projects. Not used by Cargo.
- Figma: user `Ben`, Starter team, **View seat**: read-only design access.
- Context7: resolves Hyperdrive and Workers docs.

## Open items for the owner

1. **Repoint production at `old-cherry-79292410`, database `cargo`** (blocker). In the Cloudflare dashboard, go to Hyperdrive, open config `795013d06b38408e87552686a6045291` and edit the origin. Set the host to the `old-cherry` endpoint from the Neon console (Connect, pooling off), the database to `cargo`, and use that project's role and password. Then run `npx wrangler secret put DATABASE_URL` with the same `cargo` connection string, so the fallback matches. Only then merge and deploy the module-scope fix.
2. **Cloudflare token scope**: add `Hyperdrive: Edit` (or at least `Read`) and `Workers Observability: Read` if agents should verify or repair this without a dashboard visit.
3. **Duplicate Neon project** `misty-recipe-03041407`: leave it in place until item 1 is done. Afterwards, delete it in the Neon console if nothing else uses it. Its `neondb` was still receiving failing queries during this pass, possibly from `rega-cargo-staging`, whose `DATABASE_URL` was not checked.
4. **Sentry**: create a project and add the SDK only if you want error monitoring beyond Workers observability. That needs a new dependency.
5. **Google Drive** is connected but disabled in chat. Seven connectors have incomplete connections. None is needed for Cargo today.
