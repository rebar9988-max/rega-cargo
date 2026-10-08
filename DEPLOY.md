# Deploying Rega Cargo to Cloudflare Workers

Rega Cargo runs as **its own Worker, `rega-cargo`**, on `cargo.regaplatform.com`.
It is fully separate from the live REGA site (`www.regaplatform.com`, Worker
`rega-platform`, repo `Rega`). Nothing here touches that Worker, its DNS
records, or its database. **Never point this app at REGA's database.**

## How the build works

| Piece | Where |
| --- | --- |
| Framework | TanStack Start (React 19) + Nitro v3, Vite 8 |
| Nitro preset | `cloudflare-module` (`vite.config.ts`; override with `NITRO_PRESET`) |
| Worker config | `wrangler.jsonc` → merged by the build into `.output/server/wrangler.json` |
| Static assets | `.output/public`, served via the `ASSETS` binding |
| Server middleware | security headers, HTML cache, and `server/middleware/rl-og.ts` (absolute `og:image`). Manifest is `public/manifest.webmanifest`. The Grok `/?install=1` page is not served. |
| Database | Postgres via `pg`. On Workers: Hyperdrive binding `HYPERDRIVE` (preferred) or `DATABASE_URL` secret |
| Migrations | `migrations/*.sql` (plain Postgres SQL), applied by `scripts/migrate.mjs` |

`npm run build` also writes `.wrangler/deploy/config.json`, so a plain
`npx wrangler deploy` from the repo root deploys the built output.

Useful commands:

```bash
npm ci
npm run build            # vite build (+ migrations if DATABASE_URL is set)
npm run cf:dry-run       # bundle check, no upload
npm run cf:dev           # run the built Worker locally (workerd) on :8787
npx wrangler deploy      # deploy the last build
```

For `npm run cf:dev`, put local-only values in `.output/server/.dev.vars`
(git-ignored), e.g. `BETTER_AUTH_SECRET=...` and `DATABASE_URL=postgres://...`.

## Runtime configuration

### Plain vars (in `wrangler.jsonc`)

| Var | Value |
| --- | --- |
| `BETTER_AUTH_URL` | `https://cargo.regaplatform.com` |
| `VITE_GROK_EXTENSIONS` | `0` — no third-party grok.com script in production HTML |

### Secrets (`npx wrangler secret put <NAME>`; never commit them)

| Secret | Required | Purpose |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | **yes** | Signs auth cookies. Generate: `openssl rand -hex 32`. Without it every server function that loads auth fails with a clear error. |
| `DATABASE_URL` | only if not using Hyperdrive | Postgres connection string |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_TEMPLATE`, `WHATSAPP_TEMPLATE_LANG` | for phone sign-in via WhatsApp | Meta WhatsApp Cloud API |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | for phone sign-in via SMS | Twilio |

Without WhatsApp **or** Twilio credentials, phone sign-in cannot send codes
(the UI reports that sending failed); nobody can sign in.

## Go-live checklist

1. **Postgres.** Create a dedicated Postgres database for Cargo (e.g. Neon free
   tier, Supabase, or any managed Postgres reachable from the internet with
   TLS). Do **not** reuse REGA's database.
2. **Hyperdrive** (included in Workers Free, query limits apply):
   ```bash
   npx wrangler hyperdrive create rega-cargo-db \
     --connection-string="postgres://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
   ```
   Put the returned id into `wrangler.jsonc`:
   `"hyperdrive": [{ "binding": "HYPERDRIVE", "id": "<id>" }]`.
   (Alternative: skip Hyperdrive and `wrangler secret put DATABASE_URL`.)
3. **Migrations** (from a trusted machine, once per schema change):
   ```bash
   DATABASE_URL="postgres://…" npm run db:migrate
   ```
   Applies `migrations/*.sql` in order, each in a transaction, tracked in
   `_migrations` (safe to re-run). `migrations/auth/0001_auth.sql` (Better Auth
   tables) is **not** applied by default — see "Known gaps" before copying it up.
4. **Secrets:** `npx wrangler secret put BETTER_AUTH_SECRET` plus the WhatsApp
   or Twilio set.
5. **Build + deploy:**
   ```bash
   npm ci && npm run build && npx wrangler deploy
   ```
6. **Verify on `https://rega-cargo.<account-subdomain>.workers.dev`:** home,
   `/quote`, `/track`, `/customs`, `/contact`, `/stores`, `/market`,
   `/market/<slug>`; all 7 languages (ckb/ar/fa must be RTL); mobile viewport;
   phone sign-in end to end; `npx wrangler tail rega-cargo` shows no
   `exceededCpu` / exceptions.
7. **Custom domain — only after step 6 passes:** Workers & Pages → `rega-cargo`
   → Settings → Domains & Routes → Add → Custom domain →
   `cargo.regaplatform.com` (Cloudflare creates the DNS record for this new
   hostname only; existing records are untouched). Or add to `wrangler.jsonc`:
   `"routes": [{ "pattern": "cargo.regaplatform.com", "custom_domain": true }]`
   and redeploy. Requires a token with Zone DNS edit + Workers Routes edit.

## Rollback

* **Bad deploy:** `npx wrangler deployments list --name rega-cargo` then
  `npx wrangler rollback <version-id> --name rega-cargo` (or Dashboard →
  `rega-cargo` → Deployments → Rollback). Instant, no rebuild.
* **Take Cargo offline without touching REGA:** remove the
  `cargo.regaplatform.com` custom domain from the `rega-cargo` Worker (DNS
  record for that hostname goes with it), or `npx wrangler delete rega-cargo`.
  `rega-platform` and `www.regaplatform.com` are unaffected either way.
* **Database:** migrations are forward-only. Take a provider snapshot/branch
  (Neon: branch; Supabase: backup) **before** running `db:migrate` in
  production; restore from it to roll back. Never drop production tables.
* **Code:** revert the merge commit on `main` and redeploy.

## Phone sessions

Signed-in market, move and admin server functions use `phoneOrAuthMiddleware`
(`src/lib/auth/middleware.ts`). It accepts a valid `rl_phone` session first,
then a Better Auth session. A phone session is only created after a code was
delivered and checked. Without `WHATSAPP_*` or `TWILIO_*`, every phone function
returns `unavailable` and no session is created.

## Environment

Secrets (`npx wrangler secret put`, never committed):

| Name | Purpose |
| --- | --- |
| `BETTER_AUTH_SECRET` | Signs Better Auth cookies when that path is on |
| `PHONE_CODE_SECRET` | HMAC key for phone codes |
| `DATABASE_URL` or Hyperdrive `HYPERDRIVE` | Postgres. Without it the Worker has no database |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_TEMPLATE`, `WHATSAPP_TEMPLATE_LANG` | WhatsApp codes |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | SMS codes |
| `TURNSTILE_SECRET` | Server Turnstile check (phone send + AI, when set) |
| `TURNSTILE_SITE_KEY` | Public Turnstile site key |
| `AI_TOKEN_SECRET` | Optional HMAC for the AI page token. If unset, the usage Durable Object holds the key |
| `GROK_AUTH_CLIENT_ID`, `GROK_AUTH_CLIENT_SECRET` | Only if Grok broker sign-in is ever turned on. There is no secret in the repo. **Rotate the old preview client secret** that used to be hardcoded |
| `IQD_PER_EUR` | Optional dinar-per-euro override. Default 1520 in `src/lib/corridor.ts` |

`RL_AI_ENABLED=true` stays on in production.

## Migrations

Apply in filename order with `DATABASE_URL=… npm run db:migrate`:

1. `0002_market.sql` schema and categories only (no sample rows)
2. `0003_delivery.sql`, `0004_phone.sql`, `0005_phone_codes.sql`
3. `0006_phone_limits.sql`, `0007_trust.sql`
4. `0008_remove_seed.sql` deletes `dev-user` / `seed-*` rows if a previous install had them. Does not drop tables. Safe on an empty database
5. `0009_orders.sql` quote, store-purchase and tracking tables

`migrations/dev/seed.sql` is applied only by the local PGLite fallback, never by `db:migrate`.

## Known gaps

1. **No production Postgres yet.** Quote, store requests, tracking, market and phone sign-in return a clear unavailable state (quotes fall back to the contact email) until Hyperdrive or `DATABASE_URL` is set.
2. **Phone sign-in stays closed** until WhatsApp or Twilio credentials exist. Turnstile is required in production once a provider is configured.
3. **Nitro is still `3.0.260610-beta`.** `npm audit` reports high advisories in `undici` / `sharp` via miniflare (build tooling only, not the Worker bundle). Upgrading Nitro to clear them is a breaking beta bump and was not done.
4. **The Grok preview OAuth secret was removed from the source.** Rotate it at the broker. The rest of the template auth stack stays because the build still imports it; federated sign-in is off unless `GROK_AUTH_CLIENT_SECRET` is set.

