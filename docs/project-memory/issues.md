# Known issues, root causes and fixes

Keep each entry: ID · status · symptom · verified root cause · fix/next step · evidence. Close entries, don't delete them.

## Open

### I-1 · OPEN · blocker — production database points at the empty duplicate Neon project
- Symptom: `/market` (and every DB-backed page) shows its error state.
- Root cause (verified 2026-10-11 10:40 UTC, re-confirmed 15:08 UTC): Hyperdrive `795013d0…` and the `DATABASE_URL` secret both reach `misty-recipe-03041407/neondb`, which only has `0002_market.sql` applied (12 tables, no compliance tables). The real schema is `old-cherry-79292410` database `cargo` (12/12 migrations, 378 banned keywords, 0 products). At 15:08 `misty` showed 255 rollbacks and `old-cherry` 0.
- Fix: owner repoints Hyperdrive origin + `DATABASE_URL` to `old-cherry`/`cargo` (steps: [verification-report.md](../integrations/verification-report.md#open-items-for-the-owner)). Then delete `misty-recipe-03041407` only with owner approval.
- Prevention: `npm run build` runs `db:migrate` whenever `DATABASE_URL` is set — always build with `DATABASE_URL=''` unless migrating deliberately.

### I-2 · OPEN — Cloudflare agent token lacks Hyperdrive and Observability scopes
- Agents cannot verify or fix I-1. Owner may add `Hyperdrive: Read/Edit`, `Workers Observability: Read`.

### I-3 · OPEN — phone sign-in cannot send codes
- No `WHATSAPP_*` / `TWILIO_*` / `PHONE_CODE_SECRET` secrets in production. Expected until the owner chooses a provider.

### I-4 · OPEN — `npm audit` highs in build tooling (undici/sharp via miniflare)
- Not in the Worker bundle. Fix needs a Nitro beta bump (PR #4, open).

### I-5 · OPEN — content gaps
- `TODO(translate-review)` strings need native ckb/ar/fa/ku review; legal pages need real owner details.

## Closed

### C-1 · FIXED 2026-10-11 — `Disallowed operation called within global scope`
- Root cause: `HYPERDRIVE.connectionString` read at module scope in `db.ts` / `auth/*`; workerd forbids I/O in global scope.
- Fix: read it only inside a request (PR #58, deployed as `af8ee256`).

### C-2 · FIXED — WebKit layout-lock init failures
- Root cause: hydration reset the test's scroll before the lazy calculator mounted. Fixture now keeps it in view until controls mount ([step-6.md](../redesign/step-6.md)).

### C-3 · FIXED — English headline wrap during font swap (CLS 0.0755)
- Latin fallback stack now prefers Arial/Liberation Sans; CLS 0.0003 ([step-6.md](../redesign/step-6.md)).
