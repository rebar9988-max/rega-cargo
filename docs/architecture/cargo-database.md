# Cargo database (Neon Postgres)

Status, identity and runbook for R&L Cargo's own database. Verified 2026-10-11.
No passwords or connection strings are stored here. Get them from the Neon
console or the Neon MCP `get_connection_string`, and pipe them straight into
`wrangler secret put`.

## Architecture

```
cargo.regaplatform.com → Worker rega-cargo ──┐
rega-cargo-staging.*.workers.dev → Worker    ├─ pg (node-postgres) → Neon pooler → database "cargo"
  rega-cargo-staging                          ┘   via DATABASE_URL secret today, Hyperdrive later
```

- Driver: `pg` in `src/lib/db.ts`. On Workers it opens one short-lived client per query (no cross-request sockets); `src/lib/db-config.server.ts` picks the `HYPERDRIVE` binding first, then the `DATABASE_URL` secret.
- Schema: plain SQL in `migrations/*.sql`, tracked in `_migrations`, applied by `scripts/migrate.mjs` (one transaction per file, safe to re-run). `migrations/auth/` and `migrations/dev/` are never applied by it.
- No ORM migrations. Kysely is only used by the Better Auth path.

## Identity (not secrets)

| Item                         | Value                                                                                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Neon organization            | `org-fancy-tree-15468236`, **free** plan                                                                                                                       |
| Project                      | `rl-cargo-production`, id `old-cherry-79292410`                                                                                                                |
| Region / Postgres            | `aws-eu-central-1` (Frankfurt), PostgreSQL 17                                                                                                                  |
| Database                     | `cargo`                                                                                                                                                        |
| Owner role (migrations only) | `cargo_owner`                                                                                                                                                  |
| Runtime role (Workers)       | `cargo_app`: `SELECT, INSERT, UPDATE, DELETE` on `public` tables, sequence usage. No `CREATE`, no `TRUNCATE`, no DDL. Created per branch with its own password |

| Branch                 | Id                       | Endpoint                 | State                                                                                                                                   |
| ---------------------- | ------------------------ | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `production` (default) | `br-raspy-snow-bagdgpk4` | `ep-long-mud-banlg0tm`   | **Live.** All 12 migrations applied 2026-10-11, own `cargo_app` role (separate password). Wired to Worker `rega-cargo` (`DATABASE_URL`) |
| `staging`              | `br-lively-sea-ba6u1qzn` | `ep-dry-water-baph7vmu`  | All 12 migrations, `cargo_app` role. Wired to Worker `rega-cargo-staging` (`DATABASE_URL`)                                              |
| `dev-migration-check`  | `br-broad-sun-bajwlo1d`  | `ep-wild-grass-bax26md7` | Migration test branch (parent of `staging`). Disposable                                                                                 |

**Never use `rega-platform` (`lucky-glitter-73195208`).** That is REGA's database.
Before any write, check that the host starts with one of the endpoints above.
If ownership is unclear, stop.

## Validation done on 2026-10-11 (dev-migration-check and staging)

- `0002`–`0013` applied in order, each in its own transaction; a second run applied 0 (idempotent).
- 28 tables, including `shipment_requests`, `tracking_events`, `request_quotes`, `request_status_log`, `declarations`, `products`, `offers`, `phone_users`, `phone_sessions`, `rate_counters`, `compliance_audit_log`. Foreign keys and indexes are present.
- Compliance seed: 8 prohibited categories, 378 keywords. Row guards, truncate guards and `products_compliance_unpublish` are installed. Neon's owner role was allowed to create the `compliance_no_drop` / `compliance_no_alter` event triggers.
- `cargo_app`: insert = yes, truncate = no, `CREATE` on schema = no.
- Live probe: `/track?id=RG-TEST-0000-0000` returns `notfound` on staging and, since the production connection, on `https://cargo.regaplatform.com` too (it returned `unavailable` before), so both Workers query the database.
- Production after connection: 12 migrations, `cargo_app` can insert but not truncate or run DDL, 378 keywords and 8 categories, 0 orders and 0 users (nothing was written). An idempotent re-run applied 0.
- Browser check of production (390px, Playwright): `/`, `/stores`, `/stores?cat=electronics`, `/stores/request?store=amazon&intent=buy`, `/quote`, `/market` (via its normal 307), `/track`, `/ai`, `/impressum`, `/privacy`, `/terms` all 200 with no console errors, no HTTP errors and no horizontal overflow.
- Write-and-read round trip (insert, read back, delete) done as `cargo_app` on **staging** only. No test rows were written to production.

## Runbook: connect production (done 2026-10-11 with owner approval; kept for rebuilds)

Run from a machine that can reach Neon on TCP 5432. Claude cloud sandboxes
block 5432; there, use Neon's WebSocket driver or the Neon SQL editor.

1. **Check the target.** Branch `production` of `old-cherry-79292410`, endpoint `ep-long-mud-banlg0tm`.
2. **Back up the branch first.** It is empty today; once it holds data, create a Neon branch before every migration.
3. **Migrate as owner:**
   `DATABASE_URL="<cargo_owner pooled URL for production>" npm run db:migrate`, then run it again and expect `up to date`.
4. **Create the runtime role** on the production branch with a fresh random password (never reuse staging's):
   ```sql
   CREATE ROLE cargo_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD '<random ≥ 32 chars>';
   GRANT CONNECT ON DATABASE cargo TO cargo_app;
   GRANT USAGE ON SCHEMA public TO cargo_app;
   REVOKE CREATE ON SCHEMA public FROM cargo_app;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO cargo_app;
   GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO cargo_app;
   ALTER DEFAULT PRIVILEGES FOR ROLE cargo_owner IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO cargo_app;
   ALTER DEFAULT PRIVILEGES FOR ROLE cargo_owner IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO cargo_app;
   ```
5. **Record the current Worker version** with `npx wrangler deployments list --name rega-cargo`. Before the 2026-10-11 connection it was `b76e69e0-db16-42ac-93b5-fe350dda38fc` (rollback target); the secret change created `83d4c246-cca8-4f73-ae77-4061e360982b` with the same code.
6. **Set the secret** (pipe it; do not type it into shell history):
   `npx wrangler secret put DATABASE_URL --name rega-cargo < cargo-app-prod.url`
   This creates a new Worker version with the same code.
7. **Verify** that `https://cargo.regaplatform.com/track?id=RG-TEST-0000-0000` returns "not found" (not "unavailable"), that `/`, `/stores`, `/quote` and `/market` load without console errors, and that `npx wrangler tail rega-cargo` shows no exceptions.
8. **Roll back** with `npx wrangler secret delete DATABASE_URL --name rega-cargo` (back to the unavailable state) or `npx wrangler rollback <version> --name rega-cargo`. Data stays in Neon.

After the setup, reset the `cargo_owner` password (Neon console → Roles). All
branches started with the same owner password, and it was handled during setup.

## Hyperdrive (target; blocked on token permission)

The Cloudflare API token in the dev environment can manage Worker secrets but
gets `Authentication error [code: 10000]` on `/hyperdrive/configs`. The owner
needs to add **Account → Hyperdrive → Edit** to that token, or run these steps
from their own login:

```bash
npx wrangler hyperdrive create rega-cargo-db --connection-string="<cargo_app production URL>"
npx wrangler hyperdrive create rega-cargo-db-staging --connection-string="<cargo_app staging URL>"
```

Then add the bindings in a reviewed PR: `"hyperdrive": [{ "binding": "HYPERDRIVE", "id": "<id>" }]`
at the top level, and the staging id under `env.staging`. After deploy and
verification, remove the `DATABASE_URL` secrets. The code needs no change,
because `HYPERDRIVE` already takes priority.

## Known limitations

- Without Hyperdrive, every query opens a new TLS connection to Neon's pooler. That works but adds latency. Hyperdrive removes it.
- Worker logs: `wrangler tail` returned no events from the cloud sandbox, so Worker logs were not inspected there. Check `wrangler tail rega-cargo` or the Cloudflare dashboard from another machine.
- Writes (quotes, store requests, market) need a signed-in phone user. Phone sign-in stays closed until WhatsApp or Twilio credentials exist, so end-to-end write flows cannot be tested in a browser yet.
- Free plan: autoscaling 0.25 CU, branch logical size limit 1 GiB (as reported by Neon), compute suspends when idle, so the first query after idle is slower.
- A superuser or table owner can still bypass compliance triggers. The app role `cargo_app` cannot.
