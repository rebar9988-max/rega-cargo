# Known issues, root causes and fixes

Keep each entry: ID · status · symptom · verified root cause · fix/next step · evidence. Close entries, don't delete them.

## Open

### I-9 · OPEN · TinyFish cannot perform the requested dashboard recovery at zero new cost
At 2026-10-12 06:04–06:07 UTC, the wallet reports -$0.008 unchanged, paid Agent/Browser rates and no confirmed Cloudflare/GitHub sign-in in either profile. Zero-rate Search/Fetch verified official billing requirements; no paid run or login/profile change was made. Cloudflare billing 10000 and GitHub billing 403 remain open, while Hyperdrive reads still show `neondb`. See [the concrete recovery sequence](../ai/access-recovery-2026-10-12.md). No top-up request or spending-limit change is authorized by this investigation.

### I-1 / I-2 · 16:10 UTC evidence supersedes universal permission/data assumptions below
- This session's authorized Cloudflare connector successfully reads Hyperdrive origin; it still resolves to misty-recipe/neondb. CLI authentication is unavailable, and edit permission was not exercised or assumed.
- Intended Cargo production now has 13 migration records / 413 keywords after another operator's 0014; existing staging remains 12 / 378. Exact accessible-table counts are zero for application records, but external identity/other schemas/later writes are not covered. Repointing safety cannot be inferred solely from those counts.
- No database, credential or binding changed in this work. Reuse the existing targets, perform the connected preview/authentication/rollback checks, coordinate both existing connection paths, and preserve both projects. Do not run the duplicate's broad legacy cleanup or delete a database as part of this repair.
- The owner has already authorized autonomous safe incremental execution here. Blocking gaps are verified zero-cost Actions/Workers allowances, connected preview and release/rollback readiness; do not ask the owner to repeat routine authorization. See [the dated audit](../ai/audit-2026-10-11.md).

### I-7 · FIXED IN DRAFT #68, NOT DEPLOYED · AI usage and output reliability
Provider errors/timeouts/unusable output previously reopened the global budget; stale UTC refunds erased newer state. Malformed envelopes and storage/refund failures escaped classified responses; origin validation omitted the scheme. Localized decimal digits also escaped formatted-price filtering. Minimal repairs and failing-before-fix regressions are in [the audit](../ai/audit-2026-10-11.md). Preserve the existing model/prompt/contracts; do not label production fixed until the gated release is verified.

### I-8 · PARTLY FIXED IN DRAFT #68 · visual harness reliability
Identical in-place layout-config writes caused reloads and truncated JSON reads; atomic publication/skip-unchanged fixes that proven defect. Workerd tests now use Wrangler's actual locked runtime. Separate intermittent WebKit networkidle waits remain unconfirmed: a full repeat passes with existing retries, and the original-config diagnostic passes, but all earlier failures remain disclosed. No snapshot/assertion/timeout/CI weakening.

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
