# Known issues, root causes and fixes

Keep each entry: ID · status · symptom · verified root cause · fix/next step · evidence. Close entries, don't delete them.

## Open

### I-1 · OPEN · blocker — production Worker queries the wrong (incomplete) Neon database
- Symptom: `/market` and every DB-backed page show their error state.
- Root cause (re-verified 2026-10-11 15:14–15:20 UTC on live version `7b92d650`): the Worker reaches `misty-recipe-03041407/neondb`, which only has `0002_market.sql` (applied 10:31 UTC, most likely by `npm run build` with `DATABASE_URL` set). Live log on every `/market` request: `[market] error: column p.compliance_status does not exist` (added by `0012`) and `[compliance] DB rules unavailable … relation "prohibited_keywords" does not exist` (added by `0011`).
- Still open on `10723cf0` (15:38 UTC): 4 more probes raised `misty` rollbacks 334→340, `old-cherry` 0.
- Evidence the target is `misty`: 6 uncached `/market?q=<random>` probes raised `misty/neondb` rollbacks 257→287 (5 per request); `old-cherry/cargo` rollbacks stayed 0. The 10:40 report found both `HYPERDRIVE` and `DATABASE_URL` point there; the app prefers `HYPERDRIVE`.
- Correct database: `old-cherry-79292410` / `cargo` — all 12 migrations (09:38 UTC), 8 compliance triggers, 378 keywords. Neither database holds customer data, so repointing loses nothing.
- Why agents cannot fix it: the Cloudflare token cannot read or edit Hyperdrive (`10000`); secret changes and deploys need explicit owner approval (usage policy). Migrating `misty` instead was rejected: it would write to production and entrench the duplicate.
- Fix (owner, in this order):
  1. Neon console → project `old-cherry-79292410` → Connect → database `cargo`, pooling **off** → copy the connection string.
  2. Cloudflare → Hyperdrive → config `795013d06b38408e87552686a6045291` → edit origin with that host/database `cargo`/role/password. (Or give the agent token `Hyperdrive: Edit` and approve the change.)
  3. `npx wrangler secret put DATABASE_URL` (Worker `rega-cargo`) with the same string, so the fallback matches. Optionally the same for `rega-cargo-staging`, whose `DATABASE_URL` target is unverified.
  4. No redeploy needed for 2–3. Then run the verification recipe in [deployments.md](deployments.md).
  5. Only afterwards, and with approval, delete `misty-recipe-03041407`.
- Prevention: always build with `DATABASE_URL=''` unless migrating deliberately; take a Neon branch before any migration.

### I-2 · OPEN — Cloudflare agent token lacks Hyperdrive and Observability scopes
- Agents cannot verify or fix I-1. Owner may add `Hyperdrive: Read/Edit`, `Workers Observability: Read`.

### I-3 · OPEN — phone sign-in cannot send codes
- No `WHATSAPP_*` / `TWILIO_*` / `PHONE_CODE_SECRET` secrets in production. Expected until the owner chooses a provider.

### I-4 · OPEN — `npm audit` highs in build tooling (undici/sharp via miniflare)
- Not in the Worker bundle. Fix needs a Nitro beta bump (PR #4, open).

### I-5 · OPEN — content gaps
- `TODO(translate-review)` strings need native ckb/ar/fa/ku review; legal pages need real owner details.

### I-6 · OPEN — sign-in disabled in production
- Live log: `[auth] DATABASE_URL is set but auth is disabled (VITE_AUTH_ENABLED=false) — requireUserId() rejects every request (fail closed)`. This is the shipped default (`src/lib/auth/verify.server.ts`): the Better Auth path fails closed. `phoneOrAuthMiddleware` checks an `rl_phone` session first, but phone codes cannot be sent (I-3), so nobody can sign in today; account, request and admin features stay unavailable even after I-1. Needs an owner decision (phone provider and/or enabling Better Auth).

## Closed

### C-1 · FIXED 2026-10-11 — `Disallowed operation called within global scope`
- Root cause: `HYPERDRIVE.connectionString` read at module scope in `db.ts` / `auth/*`; workerd forbids I/O in global scope.
- Fix: read it only inside a request (PR #58, deployed as `af8ee256`).

### C-2 · FIXED — WebKit layout-lock init failures
- Root cause: hydration reset the test's scroll before the lazy calculator mounted. Fixture now keeps it in view until controls mount ([step-6.md](../redesign/step-6.md)).

### C-3 · FIXED — English headline wrap during font swap (CLS 0.0755)
- Latin fallback stack now prefers Arial/Liberation Sans; CLS 0.0003 ([step-6.md](../redesign/step-6.md)).
