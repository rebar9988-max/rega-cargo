# Integration verification report: 2026-10-11

Every check below was read-only. Nothing was deployed, migrated, created or deleted.

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
| `old-cherry-79292410` | rl-cargo-production | 17 | 28 | **The live Cargo schema** |
| `misty-recipe-03041407` | rl-cargo-production | 18 | 0 | **Empty duplicate** with the same name, created 13 min later |
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

1. **Duplicate Neon project** `misty-recipe-03041407` (empty). Delete it in the Neon console if it was created by mistake. If the Hyperdrive config points at it, production would see an empty database after the next deploy. Check that before deploying `main`.
2. **Production lags `main`** (Hyperdrive binding not deployed). Verify the Hyperdrive config's origin host in the dashboard. It should be the `old-cherry-79292410` endpoint. Then deploy per DEPLOY.md.
3. **Cloudflare token scope**: add `Hyperdrive: Read` if agents should verify Hyperdrive.
4. **Sentry**: create a project and add the SDK only if you want error monitoring beyond Workers observability. That needs a new dependency.
5. **Google Drive** is connected but disabled in chat. Seven connectors have incomplete connections. None is needed for Cargo today.
