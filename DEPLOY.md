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

## Brand typography

- **Brand font for Arabic script (ckb, ar, fa): Noto Sans Arabic** (v2.012, SIL OFL 1.1), approved by the owner on **Oct 9 2026**. It replaces Vazirmatn, which stays only as a fallback in the font stack and is not downloaded.
- Self-hosted subset: `public/fonts/noto-sans-arabic-v2.woff2` (U+0600-06FF + joiners, wght 400-700, ~38 KB, `font-display: swap`); licence in `public/fonts/NotoSansArabic-OFL.txt`. Latin text uses Outfit Variable.
- The preload for this file is an inline script in `src/routes/__root.tsx`; if it changes, update `FONT_HASH` in `server/middleware/0-a-security.ts` (sha256 of the script text) or the CSP will block it.
- Type scale tokens live in `src/styles.css` (`@theme` + `html[data-textdir="rtl"]` overrides): Arabic-script body 17px / 1.8, h1 ~30px mobile to ~44px desktop, h2 ~22-26px, card titles 19px, headings bold with line-height ~1.35, no letter-spacing on Arabic script.

## Layout lock

The layout is fixed in code and guarded in CI, so no change can move it without a deliberate
baseline update.

**Tokens** (`src/styles.css`; components use these, never ad-hoc sizes):

| Token | Value |
|---|---|
| Breakpoints | phone < 768 · tablet 768–1023 (`md:`) · laptop ≥ 1024 (`lg:`); `sm/xl/2xl` removed |
| Content width | `--layout-max` 1200px, centred (`page` utility; `page-bleed` without gutters) |
| Gutters | `--gutter` 16 / 24 / 32 |
| Card grids | `card-grid`: 2 / 3 / 4 columns, equal widths and heights per row |
| Media | product photos `aspect-product` (3:4), catalogue tiles `aspect-square` |
| Header | `--header-h` 64px incl. border, + `safe-area-inset-top` |
| Bottom bar | `--bottom-bar-h` 64px + `safe-area-inset-bottom`, phone and tablet only |
| Type scale | stepped per device class (no fluid `clamp`); body 16px Latin / 17px Arabic script |
| iOS | `viewport-fit=cover` + safe-area paddings, `text-size-adjust: 100%`, inputs ≥ 16px (no focus zoom), zoom never disabled |

**Guards**

- `src/lib/layout-lock.test.ts` (in `npm test`): no `sm:/xl:/2xl:` or `max-[…]` breakpoints, no
  single-value `[…px|rem|%]` sizes or `text-[…]`, no `max-w-6xl`/`aspect-[…]`; locked token
  declarations; viewport meta.
- `tests/layout/` (Playwright, CI job "layout lock"): `/`, `/stores`, `/quote`, `/track`, `/market`,
  `/ai`, `/contact`, `/privacy`, the menu sheet and the search sheet, in ckb and en, on Chromium at
  390×844, 375×667, 820×1180, 1180×820, 1280×800, 1440×900 and WebKit (Safari engine) at
  390×844, 820×1180, 1180×820. Each view asserts: no horizontal overflow; header and bottom bar at
  exact heights; content within 1200px, centred, correct gutter; card grid column count and equal
  card sizes per row; nothing outside the viewport; image boxes at their declared aspect ratio;
  inputs ≥ 16px; every text size on the token scale. Then it compares a full-page screenshot with
  the committed baseline (`tests/layout/__screenshots__/`, tolerance 0.2% of pixels).

**Changing the layout on purpose**

1. Change the tokens/components. `npm run test:layout:geometry` checks geometry locally (no pixels).
2. Re-render baselines in the same image CI uses: `npm run test:layout:update` (Docker), or run
   the "Cargo quality gate" workflow manually with `update_baselines` and commit
   `tests/layout/__screenshots__/` from the `layout-report` artifact.
3. Review the image diffs in the PR. A baseline change is a design change.

## Runtime configuration

### Plain vars (in `wrangler.jsonc`)

| Var | Value |
| --- | --- |
| `BETTER_AUTH_URL` | `https://cargo.regaplatform.com` |
| `SITE_URL` | `https://cargo.regaplatform.com` — canonical links, sitemap.xml, robots.txt |
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
6. **Verify on staging first (`https://rega-cargo-staging.<account-subdomain>.workers.dev`),
   then on `https://cargo.regaplatform.com`** (production has no workers.dev URL): home,
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
   **Status: done 2026-10-09** — `cargo.regaplatform.com` is attached to
   `rega-cargo` (production only; staging has `routes: []`) and is listed in
   `wrangler.jsonc`. Since the owner confirmed the new address, the old
   `rega-cargo.<subdomain>.workers.dev` URL never serves the app: a wrapper in
   front of Nitro (`scripts/legacy-host.mjs`, wired in by
   `scripts/wrap-legacy-host.mjs` after `vite build`) answers every request on
   that host with a 301 (308 for non-GET) to the same path + query on
   `https://cargo.regaplatform.com`, and `/sw.js` with a no-store service worker
   that clears caches, unregisters itself and navigates open windows/installed
   PWAs to the new domain. `assets.run_worker_first` routes `/sw.js`,
   `/manifest.webmanifest` and `/offline.html` through the Worker so the asset
   server can't serve them on the old host. Production keeps `workers_dev: true`
   for this redirect and has `preview_urls: false`. Staging
   (`rega-cargo-staging`) stays on workers.dev and is passed through untouched.
   Note: a code rollback (`wrangler rollback`) to a version before the redirect
   would serve the app on the old host again.

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


## Compliance (Islamic rules: permanent, no off switch)

- Source of truth: `src/lib/compliance/rules.ts` (8 categories, keywords in en/ku/ar/tr/fa/de; `?` = review-level).
  The app always uses this bundled list, unioned with DB rules when a database is connected.
- `migrations/0011_compliance.sql` (generated by `scripts/compliance-seed.mjs`) creates
  `prohibited_categories`, `prohibited_keywords` (extra `level` column, `de` language) and `compliance_audit_log`,
  and seeds them idempotently (`on conflict do nothing`). New keywords: add to rules.ts **and** a NEW migration.
- Protection: rows are locked on insert. DELETE / UPDATE of a locked row is **skipped and logged** (the log
  row commits, a WARNING is raised). TRUNCATE **raises** (`compliance: truncate ...`). A trigger cannot
  both raise and keep a log row (no dblink / autonomous transactions), so a TRUNCATE is logged only by the
  app when it catches that error, or in the Postgres server log. The audit log itself is append-only.
- Event triggers block DROP / ALTER / DISABLE TRIGGER on these tables where the role is allowed to create them
  (superuser; works on PGLite). On a managed Postgres without that right the migration skips them with a notice.
  Limitation: a superuser or table owner can always drop event triggers or use `session_replication_role = replica`.
