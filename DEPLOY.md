# Deploying Rega Cargo to Cloudflare Workers

Rega Cargo runs as **its own Worker, `rega-cargo`**, on `www.rlgo.net` (the retired
`cargo.regaplatform.com` is detached).
It is fully separate from the live REGA site (`www.regaplatform.com`, Worker
`rega-platform`, repo `Rega`). Nothing here touches that Worker, its DNS
records, or its database. **Never point this app at REGA's database.**

## Existing automatic release (verified 2026-10-13)

Cloudflare Builds is connected to **this** repository/`rega-cargo`, production branch `main`, with `npm run build` then `npx wrangler deploy`. It has no build environment variables. GitHub Actions is the quality gate, not the deployment job. Never merge until applicable repository safeguards and the authorized quality gate are satisfied. See [release evidence](docs/redesign/unified-journeys-20261013.md) and [CI/deployment memory](docs/project-memory/deployments.md). Do not inject production `DATABASE_URL` into a build; that would run migrations. Since 2026-10-15 `scripts/migrate.mjs` also refuses to migrate in any CI except a Workers Builds build of `main` (`migrationGate`), so branch builds cannot migrate even then. Current verified CI/CD state, invariants and owner-only actions: [docs/operations/cicd.md](docs/operations/cicd.md).

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

## Brand logo, colour and buttons

- **Logo:** the owner-supplied R&L artwork (red field, white globe/arrow/R&L). Source: `public/rl-logo.png`. Derived files: `public/rl-mark-168.webp` (header, footer, offline page, rate-sheet PDF), `favicon.*`, `apple-touch-icon.png`, `icon-192/512.png`, `og.jpg`. The artwork is only cropped and resized, never redrawn. Changed art ships under a new file name (cache rules in `public/_headers`); bump the `sw.js` `VERSION` with it. It sits once, at the inline-start of the header, and is never mirrored or paired with a text wordmark.
- **Red:** `--rl-brand` `#dd0303`, sampled from the logo. Buttons use it (white text 5.1:1); red text, links and focus rings use `--rl-accent` `#b80000` (6.9:1 on white). Dark mode uses a light red accent for text. All in `src/styles/tokens.css`.
- **Soft 3D buttons:** one primitive, `.rl-button` + `data-variant` (`primary | secondary | ghost | danger`), used by `<Button>`, `<a>` and `<Link>`. Depth tokens are `--rl-button-*`. Hover lift (1px) applies only on fine-pointer hover devices; focus is an outline, not a shadow; `aria-busy` shows a spinner without changing size; reduced motion removes movement. `<Button loading>` also blocks a second submit.

## Catalogue

Ten primary groups live in `src/lib/catalogue.ts` (order, subcategories, search terms) with labels in `src/lib/store-copy.ts` and `src/lib/catalogue-copy.ts`. The original six slugs (`beauty, fashion, electronics, home, baby, sports`) and their `?cat=` URLs are unchanged; `food, gaming, auto, pets` were added. Subcategories are `?sub=` refinements: they link to the public idealo.de search, or are request-only. They carry no products, prices or counts. No database change: `/market` still uses its own `categories` table.

**Held back until the owner approves:** `food` and the `beauty/health` and `pets/food` subcategories (food safety / halal / health). They show "Coming soon", are not linked, and are excluded from filters, search and store cards. To publish, edit `PENDING_APPROVAL_*` in `src/lib/catalogue.ts`. `src/lib/catalogue.test.ts` covers this and the permanent product ban.

**Navigation (2026-10-13):** primary journeys are Home → `/market` (real products/offers) → `/stores/request` (Bring For Me) → `/track` → Help (`/contact`). The five mobile destinations end with `/account`; Help stays in the menu/footer. `/stores` remains the external retailer catalogue, not synchronized inventory. Its desktop category panel, mobile strip and collapsed menu taxonomy still read the same ten groups (`src/lib/navigation.ts` → `catalogue.ts`); legitimate categories and `cat/sub/who/fav` links are preserved. Global navigation does not repeat the category wall. See [unified journey verification](docs/redesign/unified-journeys-20261013.md).

New Sorani, Arabic and Persian strings carry `TODO(translate-review)`; all seven catalogue/store/market dictionaries now have complete translated keys; native review remains required for the marked additions (PR #64/#66 dictionaries adopted in unified PR #82).

**Layout baselines:** colours and buttons changed, so `tests/layout/__screenshots__` must be re-rendered in CI (run the "Cargo quality gate" workflow with `update_baselines`), then committed. Geometry checks (`--ignore-snapshots`) pass without it.

## Brand typography

- **Brand font for Arabic script (ckb, ar, fa): Noto Sans Arabic** (v2.012, SIL OFL 1.1), approved by the owner on **Oct 9 2026**. It replaces Vazirmatn, which stays only as a fallback in the font stack and is not downloaded.
- Self-hosted subset: `public/fonts/noto-sans-arabic-v2.woff2` (U+0600-06FF + joiners, wght 400-700, ~38 KB, `font-display: swap`); licence in `public/fonts/NotoSansArabic-OFL.txt`. Latin text and numbers use **Inter**, with a ~46 KB common subset and a separate ~45 KB extended subset; licence in `public/fonts/Inter-OFL.txt`. Vazirmatn is the self-hosted Arabic-script fallback.
- Font preloads are server-rendered `<link>` elements in `src/routes/__root.tsx`: Noto for RTL, Inter for all locales. The appearance script and its exact CSP hash live together in `src/lib/appearance-script.ts`, with regression coverage in `src/lib/html-cache.test.ts`.
- Type scale tokens live in `src/styles.css`; semantic light/dark, font, spacing, radius and motion tokens live in `src/styles/tokens.css`. The body is 16px / 1.65; Arabic-script headings have no letter-spacing and use a 1.5 line-height. The hero headline steps 30px (phone) / 36px (tablet) / 48px (laptop) via `--rl-hero-title-size`; each authored line balances on its own, which also keeps font-swap layout shifts in budget. The hero art is a decorative inline-SVG route (no photo request, no layout shift), shown from the laptop breakpoint. TanStack Start inlines the compiled stylesheet in the initial HTML.

## Layout lock

The layout is fixed in code and guarded in CI, so no change can move it without a deliberate
baseline update.

**Tokens** (`src/styles.css` and `src/styles/tokens.css`; components use these, never ad-hoc sizes):

| Token | Value |
|---|---|
| Breakpoints | phone < 768 · tablet 768–1023 (`md:`) · laptop ≥ 1024 (`lg:`); `sm/xl/2xl` removed |
| Content width | `--layout-max` 1200px, centred (`page` utility; `page-bleed` without gutters) |
| Gutters | `--gutter` 16 / 24 / 32 |
| Card grids | `card-grid`: 2 / 3 / 4 columns; filtered store catalogue: 2 / 3 / 3, with a desktop filter sidebar |
| Media | product photos `aspect-product` (3:4), catalogue tiles `aspect-square` |
| Header | Main row 64px phone/tablet (brand-red bar: menu, logo, search, language, account; pinned), 88px desktop (compact 72px). Phones/tablets show the swipeable category strip directly under it; desktop keeps the category mega menu row. Announcement/category rows are separate. Legacy `--header-h` remains 64px for existing layout helpers |
| Bottom bar | `--bottom-bar-h` 64px + `safe-area-inset-bottom`, phone and tablet only |
| Type scale | stepped tokens (no fluid `clamp`); body 16px, RTL heading line-height/letter-spacing from semantic tokens |
| iOS | `viewport-fit=cover` + safe-area paddings, `text-size-adjust: 100%`, inputs ≥ 16px (no focus zoom), zoom never disabled |

**Guards**

- `src/lib/layout-lock.test.ts` (in `npm test`): no `sm:/xl:/2xl:` or `max-[…]` breakpoints, no
  single-value `[…px|rem|%]` sizes or `text-[…]`, no `max-w-6xl`/`aspect-[…]`; locked token
  declarations; viewport meta.
- `tests/layout/` (Playwright, CI job "layout lock"): required redesigned routes plus `/track`,
  `/contact`, the menu sheet and the search sheet, in ckb, ar and en, on Chromium at
  390×844, 375×667, 820×1180, 1180×820, 1280×800, 1440×900 and WebKit (Safari engine) at
  390×844, 820×1180, 1180×820. Each view asserts: no horizontal overflow; header and bottom bar at
  exact heights; content within 1200px, centred, correct gutter; card grid column count and equal
  card sizes per row; nothing outside the viewport; image boxes at their declared aspect ratio;
  inputs ≥ 16px; every text size on the token scale. Then it captures the full document in a document-sized viewport (asserting unchanged main geometry and zero scroll, then restoring the real device viewport), and compares it with
  the committed baseline (`tests/layout/__screenshots__/`, tolerance 0.2% of pixels).
- `tests/layout/premium.spec.ts`: the required route/query matrix at 360px in ckb/ar/en and both
  themes, keyboard dialogs, banned searches, filter/favorite URL state, language switching,
  font-swap layout shifts, and home calculator dimension handoff.

See [the redesign review guide](docs/redesign/README.md) for exact URLs, verification evidence,
local HTTP/2 performance reproduction, and translation/data release limits.

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
6. **Verify in isolation first, then on `https://www.rlgo.net`:** home,
   `/quote`, `/track`, `/customs`, `/contact`, `/stores`, `/market`,
   `/market/<slug>`, `/stores/request`; all languages and mobile viewport. Verify real phone
   sign-in only when provider credentials and a test account exist.
   Check Worker logs for exceptions and `exceededCpu`.
7. **Public domain exclusivity (owner decision 2026-10-13):** only
   `www.rlgo.net` serves R&L. `rlgo.net` and HTTP variants redirect directly
   to canonical HTTPS www with the same path/query (301 GET/HEAD, 308 other
   methods). Production `workers_dev: false`, `preview_urls: false`;
   custom domains are only `www.rlgo.net` and redirect-only `rlgo.net`.
   The retired `cargo.regaplatform.com` attachment and its managed DNS
   record are removed. Do not recreate them.
   Staging keeps its separate Worker, bindings and secrets, but has no
   public URL: `routes: []`, `workers_dev: false`, `preview_urls: false`.
   Test it locally or through an explicitly authorized isolated mechanism;
   do not expose another hostname without owner approval. Cloudflare Builds
   branch previews are also disabled in account settings. The wrapper keeps
   its legacy redirect/SW recovery implementation as defense for stale
   routing, while retired workers.dev URLs are unavailable at the edge.
   Never modify `rega-platform`, `regaplatform.com` or `www.regaplatform.com`.

## Rollback

* **Bad deploy:** `npx wrangler deployments list --name rega-cargo` then
  `npx wrangler rollback <version-id> --name rega-cargo` (or Dashboard →
  `rega-cargo` → Deployments → Rollback). Instant, no rebuild.
* **Routing rollback:** preserve domain exclusivity when rolling back code.
  Keep production/staging workers.dev and previews disabled and cargo detached.
  Recheck live domains/subdomain flags after any rollback. Never delete the
  Worker or change database resources to repair routing.
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
- Event triggers block DROP / ALTER / DISABLE TRIGGER on these tables, and replacing the six guard functions,
  where the role is allowed to create them (superuser; works on PGLite). On a managed Postgres without that right
  the migration skips them with a notice. 0011 and 0012 are safe to re-apply (every object is created only if missing).
  Limitation: a superuser or table owner can always drop event triggers or use `session_replication_role = replica`.
- The app check (`src/lib/compliance/check.ts`) runs on product writes, user text and links, store/quote requests,
  search, autocomplete, idealo links and AI results. Bundled rules always apply; DB rules are added on top.
- `products.compliance_status` (ok | pending_review | blocked): only `ok` is ever public; a DB trigger keeps
  non-ok products unpublished. Admins can clear `pending_review` items, never `blocked` ones.
- Scan existing data: `/admin` → "Run compliance scan", or `npm run compliance:scan` (with `DATABASE_URL` it
  applies the changes to that database). CI runs the bundled-data scan in `npm test`.


## Branch previews (2026-10-13, updated 2026-10-15)

2026-10-15: the owner enabled Workers Builds for non-production branches with a **non-deploying** command (verification only; no version, Preview URL or Version URL). Verified on PR #103 build `11b23adc`: success, no Version ID, "No Preview URL". Never change that command to `wrangler versions upload` or `wrangler preview`. See [docs/operations/cicd.md](docs/operations/cicd.md).

Cloudflare Builds branch previews (preview *deployments*) stay disabled by the owner domain-exclusivity decision. Historical branch preview records are retained and have no routable URLs. Do not re-enable automatic preview builds or public preview routing.
The root `previews` block contains explicit noindex vars and supplies no database/secrets/AI bindings.
Primary journey pages render truthful unavailable states without a test backend; authenticated writes and inference are unavailable there. Production/staging bindings and secrets are unchanged.
Preview resources do not inherit production bindings; see [Cloudflare configuration](https://developers.cloudflare.com/workers/previews/configuration/) and [isolation](https://developers.cloudflare.com/workers/previews/resources/). Existing Preview Base was verified empty. No new DB or persistent token provisioned.
