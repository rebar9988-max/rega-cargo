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
| Server middleware | `server/middleware/grok-pwa.ts` (manifest, `?install=1`, head tags) |
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

## Known gaps and risks (read before go-live)

1. **Workers Free CPU limit (10 ms/request).** SSR of these React pages and
   especially phone sign-in exceed that: `scryptSync` alone costs ~35 ms CPU
   per call (measured in Node), and phone sign-in calls it 1–2 times. On Free,
   such requests can fail with Cloudflare error 1102 (the same issue
   `rega-platform` has). The Workers Paid plan (USD 5/month, 30 s CPU)
   removes this; lowering scrypt cost is a security trade-off that needs a
   decision.
2. **Signed-in actions need a fix.** Market writes, `/move`, `/admin`, seller
   pages use `authMiddleware`, which only accepts a Better Auth / Grok gate
   session. Off the Grok platform neither exists (there is no Better Auth
   sign-in UI or `/api/auth` route; the Grok broker won't accept
   `cargo.regaplatform.com`), so these return `Unauthorized` even for users
   signed in with phone. The phone session (`rl_phone` cookie) is only
   consulted *after* the middleware. Fix: let `authMiddleware` accept the
   phone session first (security-sensitive — needs review).
3. **Tracking data is static demo data** (`src/lib/shipments.ts`), not a
   backend.
4. **`npm audit`:** 5 high advisories in `undici`/`sharp`, pulled in only by
   build/dev tooling (`nitro → env-runner → miniflare`, `wrangler →
   miniflare`). They are not in the Worker bundle. Fixing needs a breaking
   Nitro beta upgrade.
