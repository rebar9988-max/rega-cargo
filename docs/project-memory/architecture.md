# Architecture (verified 2026-10-11 on `main` @ `f5cfccb`)

Detail lives in [DEPLOY.md](../../DEPLOY.md); this file is the map.

## Stack

| Layer | Choice | Where |
|---|---|---|
| UI | React 19, TypeScript 5, Tailwind 4, Radix primitives, lucide icons | `src/components/`, `src/styles*` |
| Routing / SSR | TanStack Start + TanStack Router (file routes) | `src/routes/`, generated `src/routeTree.gen.ts` |
| Server build | Nitro v3 **beta** (`3.0.260903-beta`), preset `cloudflare-module`, Vite 8 | `vite.config.ts` |
| Runtime | Cloudflare Workers (`nodejs_compat`), static assets via `ASSETS` | `wrangler.jsonc` |
| Database | Postgres via `pg` + `kysely`; prod = verified cargo on Neon via recovered Hyperdrive `HYPERDRIVE` (coordinated `DATABASE_URL` secret, 2026-10-13); local/tests = embedded PGLite | `src/lib/db.ts`, `src/lib/db-config.server.ts` |
| Migrations | plain SQL `migrations/0002…0013`, runner `scripts/migrate.mjs`, tracked in `_migrations`. `npm run build` runs `db:migrate` **whenever `DATABASE_URL` is set** | `migrations/`, `package.json` |
| Auth | Phone codes (WhatsApp/Twilio) → `rl_phone` session first, then Better Auth | `src/lib/phone/`, `src/lib/auth/middleware.ts` |
| AI | Workers AI binding `AI`, model `@cf/google/gemma-4-26b-a4b-it`; budgets in Durable Object `RlAiUsage` (SQLite) | `src/lib/ai/`, `server/routes/api/ai/`, `exports.cloudflare.ts` |
| Rate limit | Workers ratelimit `RL_LIMIT` (20 / 60 s per key) | `wrangler.jsonc` |
| Node | 22 (CI and local). Node 24 has a known AI-stream incompatibility | `.github/workflows/quality.yml` |

## Code map

- `src/routes/` — pages (see [features.md](features.md)).
- `server/routes/` — `api/ai/{challenge,identify,status}`, `robots.txt`, `sitemap.xml`.
- `server/middleware/` — security headers/CSP, render priority, HTML cache, legacy links, OG.
- `src/lib/corridor.ts` — **pricing source of truth** (chargeable weight, rates, EUR/IQD, `IQD_PER_EUR` 1520). Out of scope for restyles.
- `src/lib/compliance/` — permanent banned-products filter (`rules.ts`, `check.ts`, `service.server.ts`).
- `src/lib/{market,orders,requests,phone,search,product-link}/` — domain modules (`*.server.ts` = server only).
- `src/lib/i18n.tsx`, `src/lib/messages/{ckb,ku,ar,fa,en,de,tr}.ts`, `src/lib/*-copy.ts` — all UI text.
- `src/lib/langs.ts` — locale IDs; `LAYOUT_DIR = "rtl"`.
- `scripts/` — build/deploy helpers (`legacy-host.mjs`, `split-wrangler-env.mjs`, `migrate.mjs`, compliance seed/scan) and their `*.test.mjs`.
- `tests/layout/` — Playwright layout lock + screenshot baselines.

## Environments

| Env | Worker | Domain | Database |
|---|---|---|---|
| Production | `rega-cargo` | primary `www.rlgo.net`, apex redirects; previous `cargo.regaplatform.com` remains attached (PR #89 cutover) | Hyperdrive `795013d06b38408e87552686a6045291` → see [issues.md](issues.md) I-1 |
| Staging | `rega-cargo-staging` | workers.dev | none declared in `wrangler.jsonc` (its `DATABASE_URL` secret not checked) |
| Local | `npm run dev` :8080 | — | PGLite + `migrations/dev/seed.sql` |

**Never** touch the REGA Worker `rega-platform`, `www.regaplatform.com`/apex, or Neon project `lucky-glitter-73195208` (rega-platform).

## Environment variable names (no values here, ever)

Plain vars (`wrangler.jsonc`): `BETTER_AUTH_URL`, `SITE_URL`, `VITE_GROK_EXTENSIONS`, `RL_AI_ENABLED`, `RL_AI_DAILY_CAP`, `PRODUCT_LINK_ENABLED`, staging `RL_NOINDEX`.
Secrets (`wrangler secret put`): `BETTER_AUTH_SECRET`, `DATABASE_URL`, `QUOTE_SECRET`, `PHONE_CODE_SECRET`, `WHATSAPP_*`, `TWILIO_*`, `TURNSTILE_SECRET`, `TURNSTILE_SITE_KEY`, `AI_TOKEN_SECRET`, `IQD_PER_EUR`, `GROK_AUTH_*`. Live production secrets observed 2026-10-11: `BETTER_AUTH_SECRET`, `DATABASE_URL`, `QUOTE_SECRET` only — so phone sign-in cannot send codes.
Agent session env (names only): `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `GITHUB_TOKEN`.

## Quality gate (same as CI)

```sh
npm run typecheck && npm test && npm run lint
DATABASE_URL='' npm run build      # empty value: never migrate a real DB by accident
npm run cf:dry-run
npm run test:layout:geometry       # layout geometry without pixel baselines
```
