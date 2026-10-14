# Bring For Me same-form reset repair — 2026-10-14

Owner request authorizes inspection, a focused form repair, regression tests, the existing Cloudflare deployment workflow and live verification. No redesign, new provider, production data reset or authentication bypass is authorized.

## Verified production diagnosis

Baseline: main `ddc275fa3974b1ec77d1862a3649217e82dbc909`, Worker `02664ed1-f416-4967-a774-36b86460ab52`, 100%. Exact entry: https://www.rlgo.net/stores/request?intent=buy.

The control labeled **داواکردنی کڕین** is the buy intent selector, implemented as a TanStack `Link` to the current route/search. Clicking it navigates the same form and triggers the router's default scroll reset. It is not the form's submit button. Paired live checks in the official Playwright v1.63.0 image reproduced desktop scroll 233→0 and iPhone-size WebKit scroll 182→0, with unchanged `performance.timeOrigin`, unchanged URL, no POST and every entered field retained. The exact automated regression failed on both production browsers before the patch with expected positive scroll / actual zero. Thus this interaction is a same-route scroll reset, not a homepage redirect, native reload or React state reset.

A separate real submission from **ناردنی داواکاری** reached `orderStore`, returned HTTP 401 / `error: signin`, and preserved the values. The production `phoneStatus` response was `available: false`; viewer state was `out`. Cloudflare persisted telemetry confirmed the POST and the fallback-auth fail-closed diagnostic. Missing phone delivery configuration, and no configured federated fallback, prevent anonymous visitors from obtaining the required session. The log mentions `VITE_AUTH_ENABLED=false`; this is a generic fallback diagnostic and is not proof that setting that variable alone would enable login.

SELECT-only inspection of the verified `old-cherry-79292410` / `cargo` database found 0 phone users, 0 phone sessions, 0 shipment requests and 0 approved administrators. No identity or role was seeded. This blocks a truthful authenticated production save/admin-visibility claim. A working owner-provided authentication route/test account and an approved administrator are required for those checks. No OTP code, session, database connection string or credential is stored in this report.

## Focused implementation

- `src/routes/stores.request.tsx`: suppress redundant active-intent navigation; disable scroll resets on intent switches. Keep all fields and existing route/query/UI contracts. Focus and scroll to invalid controls; make general transport/auth errors visible and localized. Use the existing phone sign-in dialog in place on 401, keeping URL, quantity, size, color, notes, destination, phone and declaration in React memory. Ignore submit events bubbling from the portal login form and restore focus after dialog cleanup; no new browser storage of contact/consent. Existing opt-in safe draft privacy rules remain intact.
- `src/components/phone-gate.tsx`: add a text-link button variant for the existing dialog. Existing callers and OTP/session security remain intact.
- `src/lib/orders/store-request.ts` and `api.ts`: accept a per-submission UUID and derive a SHA-256 key from the validated payload. Reuse the existing user-scoped idempotency constraint and `submitRequest` path. No schema migration. Retries of identical input return the first saved ID; edits/new submissions use a different key. Older clients remain compatible.
- `tests/layout/request-reset.spec.ts`: exact scroll regression, localized validation, 401/cancel recovery, double-submit/network-loss/retry, backend-ID confirmation and inline-auth field preservation. Mocked successes exist only in isolated browser tests, never in live verification.
- `src/lib/orders/store-request.test.ts` and `src/lib/flow.e2e.test.ts`: payload-bound key/privacy checks and actual isolated Postgres persistence, one-row retry, returned tracking ID, administrator visibility and unauthorized-admin denial.

## Quality gate and rollout

Final source gate: Node 22 typecheck, lint (0 errors, 5 existing warnings), release:check, production build (database migrations skipped) and Worker dry-run passed. Focused browser regression: 10/10 passed on desktop Chromium and iPhone-size WebKit. Complete official-image layout gate and existing main Cloudflare Builds rollout are in progress. Hosted Actions on baseline failed before jobs started: GitHub explicitly reports failed account payments/spending limit. Main is unprotected. Use the standing full local official-image gate policy; do not label hosted CI green or change billing/protection settings.

Native iPhone Safari hardware is unavailable. Mobile WebKit is an approximation and is reported separately from a real iPhone test.
