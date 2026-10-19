# First legitimate R&L owner — 2026-10-19

## Scope and authorization

The owner explicitly requested invitation-only setup of the first legitimate SUPER_ADMIN, using the existing authentication/database architecture and independently verified platform ownership. The prior beta legal-content exception does not relax owner verification, password ownership or server authorization. Preserve all existing services, routes, branding, UI, independent module boundaries and the isolated R&L AI baseline.

Resumed against current `main` `2a0dfe5` after restoring unpublished work from October 14. Read the central Google Doc and current repository memory, then independently verified GitHub and Cloudflare. Latest pre-change production readback: Worker `rega-cargo`, version `84f7890e-3536-4bed-bf63-3cd199f120dc` at 100%. Current hosted main Actions succeeds; the historical billing-only limitation is superseded.

## Verified root causes and identity inspection

Production had no Better Auth `user`, `session`, `account`, `verification` or owner bootstrap tables. `phone_users`, `user_roles` and inspected request/tracking counts were zero; production migrations were applied through 0016 notifications. No existing owner account was overwritten or duplicated. The existing Better Auth email/password provider was disabled; `authConfigured` also depended solely on absent federation credentials, and `/api/auth/*` had no mounted handler. The existing role editor recognized only verified phone identities.

Independent ownership evidence: the connected authenticated GitHub actor's stable ID matches the repository owner ID, repository permissions include admin, and the authenticated Cloudflare production Build connection points to the same repository ID and provider owner ID. This authorizes the explicitly designated recipient independently of subsequent email verification. Repository display text or email matching alone is never accepted as proof. The actual email link/password activation remains the recipient's action.

## Changes

- Byte-identical opt-in Better Auth schema copied to `migrations/0001_auth.sql`; additive identity-owned `0017_owner_bootstrap.sql`. No account or privilege is seeded by migrations.
- `/owner` supports invitation activation and subsequent native email/password sign-in. An existing identity authenticates with its current password; a new identity creates its own 16–128 character password. Locale is retained through dashboard/sign-in/sign-out navigation.
- A closed `/api/auth/*` surface exposes only session reading, sign-in/out and authenticated password change. Public signup, verification, email changes and account-linking are denied. Handler code stays server-only.
- A random 256-bit invitation nonce is hashed in the database, expires, remains only in page memory, and is removed from browser history. No GET activation, automatic mail-scanner consumption, public resend, client-supplied recipient or self-approval exists.
- After native credential authentication, one database transaction checks independent approval, recipient, nonce, expiry, active identity and absence of another approved owner; verifies email, grants SUPER_ADMIN, consumes/closes bootstrap and writes an immutable audit together. Replay fails. Completed bootstrap cannot be reset by normal SQL updates/deletes.
- Private operations read fresh verified/non-disabled identity and fresh database roles; session-cookie caching is disabled. Role approval accepts active verified native email identities as well as the existing verified phone identities. Existing last-owner protection, audit immutability and phone authentication remain intact.
- HTTP origin/fetch metadata checks and the existing fail-closed rate limiter protect auth mutations and activation. No new paid provider, credential, public preview, production hostname or second database is introduced.

[Operator runbook](../operations/first-owner.md). Runtime files: `src/lib/owner/`, the owner/auth routes and the existing auth configuration/verification/identity adapter. No Marketplace, Bring For Me, Delivery/Tracking, pricing, design or R&L AI source changes.

## Verification checkpoint

Initial local TypeScript, lint (0 errors / 4 existing warnings), migration-free production build and Worker dry-run passed. Final hosted checks and release readback are recorded in the continuation section when complete; this checkpoint does not claim final CI or deployment success.

Real Neon dev-branch migration/reapplication succeeded. Real PostgreSQL smoke verified wrong nonce rejection, approved atomic verification/role/audit, and replay rejection inside a rolled-back isolated fixture; subsequent readback showed zero native users, bootstrap rows and approved owners. Early October 14 dev-only migration tracking used the name `0016_owner_bootstrap.sql`; it was moved to 0017 before any production application to preserve the newly released notifications migration number. The old dev tracking row is historical, with equivalent additive schema, and was not erased.

Native Better Auth/PGLite integration covers independent approval, verified email without approval, existing-password preservation, expiry, wrong nonce/identity, disabled identity, concurrent consumers, immutable closure/audit/last-owner guard, and rollback on audit failure. Separate HTTP tests cover the closed public surface and cross-origin requests. Browser tests cover the owner portal, denied privileged signup and invalid-link history cleanup at existing responsive browser projects.

Initial local browser attempts are retained as incomplete diagnostics: concurrent broad/local work hit timeouts; an isolated harness initially used an incorrect exact password label; initial navigation exposed the lost-locale issue, now fixed. Native activation and authenticated dashboard SSR were observed in the isolated fixture. These partial attempts are not a passed full browser gate. Production owner credentials and the real invitation are never used by the test harness.

## Release / manual boundary

Before release: require complete applicable hosted checks and normal authorized merge, apply only the verified additive production schema, and use the existing main-only Cloudflare delivery. Before inviting: recheck current ownership evidence, existing account/approved owner/bootstrap state, record independent approval plus immutable authorization audit, and send the short-lived single-use link only to the explicitly designated mailbox through an existing authorized channel. Do not print the link/nonce or create the owner's password.

Actual production email verification, bootstrap consumption and positive owner login/access verification remain pending until the recipient opens their link and creates/authenticates their own password. Do not fabricate those outcomes or reopen the completed bootstrap. Missing phone OTP delivery and formal-release legal content remain existing separate follow-ups.

Continuation: reconciled the separately authorized visible-silk release `5faa822` from current main. Both sets of memory notes are retained; its hero/runtime/test bytes are preserved exactly. Initial full local unit results: 516 passes, 4 skips, one digit-copy failure; the copy was corrected and all four focused number tests pass. Hosted exact-head verification remains required.

Hydration follow-up: isolated native Chromium login, every registered module resource, secure HttpOnly host cookies, owner role/audit visibility and nonce replay denial passed at 390/1280px. A pre-hydration email-fill loss was reproduced and repaired only on the new owner form, using the existing hydration primitive. Four focused built-Worker browser cases now pass, including a held-JavaScript regression. WebKit over plain local HTTP cannot retain the required secure host session; HTTPS verification is being prepared with an explicitly trusted isolated test CA, without weakening cookie or TLS controls.
