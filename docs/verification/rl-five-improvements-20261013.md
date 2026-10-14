# R&L five improvements — implementation and release evidence

## Current beta release authorization (2026-10-14)

The owner explicitly authorized production deployment as beta and deferred completing legal/business content until official public release. This supersedes the earlier legal-data release hold documented below. `src/lib/release-policy.json` explicitly permits incomplete legal content only at the beta stage; switching to public restores the complete verified-content requirement. `businessReadiness` continues returning ready=false/profile=null for missing facts. Pending customer notices remain visible. No authentication or administrative authority requirement is weakened; no arbitrary owner is seeded. Real owner/OTP verification remains unavailable and is reported as a limitation.

Existing Neon `dev-migration-check` branch was used, without creating paid resources or exposing staging. Migration 0014 brought that existing test branch to the production baseline, then 0015 applied in one transaction and reapplication passed. The Neon prepared-query adapter initially rejected a multi-statement file; the transaction rolled back. Statements were then split while preserving dollar-quoted PL/pgSQL functions, and the corrected transactional invocation succeeded. Expected schema fields and immutable-audit / last-owner triggers were read back successfully. Production inventory before migration: zero products/offers/users/roles/requests/transport/tracking records; migrations 0002–0014. Production migration/deployment remains pending at this checkpoint.

Prior held-release history follows; it is not the current authorization state.

Initial base: main 631549f; current integration base: main 19c17f2, canonical production https://www.rlgo.net. Work branch: codex/rl-five-improvements-20261013. Scope: Marketplace, Bring For Me, Delivery/Tracking and the existing AI service. No changes to REGA Platform, public hostnames, pricing rates, branding or customer records.

## Step 0: current-state audit

- Read AGENTS.md, CLAUDE.md, PROJECT_MEMORY.md and relevant architecture/progress/issues/decisions before implementation.
- Production read-only Cloudflare inspection: version 5791d60b-76b4-448b-a922-0d4d928df592 at 100%, canonical www domain. AI enabled, cap 200. PHONE_CODE_SECRET now exists; no WhatsApp/Twilio delivery provider secrets exist. No authentication provider configured by this work.
- Read-only cargo database inspection: migrations 0002–0014 applied; user_roles query returned no rows. No production SUPER_ADMIN account can be verified or silently provisioned.
- main branch metadata reports protected=false. Detailed protection endpoint denied the integration (403). Latest main Actions run 38394746826: scope/verify failure with no steps, layout skipped. Existing billing issue remains documented; no paid quota or payment setting changed.
- Requested missing verified business/legal information and explicit SUPER_ADMIN account identifier from the owner. Missing legal information is an explicit release blocker in the user's current instruction. Implementation continues independently; no merge to main or production release until the blocker is resolved.

## Step 1: secure drafts and authentication fallback

- Added opt-in sessionStorage drafts, isolated by store/intent, expiring after two hours. Persisted fields are exactly link, quantity and destination. No phone, notes, declarations, credentials, OTP or image is saved. Sensitive/private URLs are refused; unchanged reloads do not renew expiry. Storage failures do not disable the form.
- Added early sign-in availability messaging, a reviewable email draft and copyable summary. Customer sends email themselves; no email was sent by the implementation tools. No purchase/booking/request confirmation is invented. The prohibited-items declaration remains required for the fallback actions; server auth and compliance checks remain intact.
- Added regression tests for restore, expiry, sensitive URLs, unavailable storage and mailto escaping, plus mobile Chromium/WebKit browser cases in ckb/ar/en.
- Validation before step commit: typecheck passed; unit suite 219 passed plus script suite 216 passed / 4 existing skips; lint 0 errors / 5 existing warnings; DATABASE_URL='' production build passed, migration skipped. Focused browser results recorded below when complete.
- Exact local review URLs: /stores/request?store=zalando&intent=buy&lang=ckb, same with lang=ar/en; /stores/request?store=zalando&intent=ship; localhost:8788 is the isolated built Worker used by Playwright.

## Release status

Implementation is complete on the feature branch. Final mobile layout regression checks have passed. Release remains blocked by missing owner-verified business/legal content and an identifiable verified SUPER_ADMIN account / real OTP provider. No production deployment or authenticated SUPER_ADMIN verification is claimed.

## Integration with current production foundation (2026-10-14)

During implementation `main` advanced to `19c17f2` through PRs #92–#94. The work was rebased onto that foundation. Its deployed, isolated `src/modules/rl-ai` assistant, five shortcuts, Sorani welcome/refusal, scoped Vazirmatn, image processing and authorized Marketplace contract are preserved. There is one assistant and one existing provider/budget service. This task's explicit AI scope is security maintenance and administrative policy, plus the approved cost-estimate improvement; it does not authorize a new identity or global redesign.

### Trust and complaints

The existing /impressum, /privacy and /terms can render owner-verified business information and approved multilingual policy from `src/lib/business-approved.json`. The file deliberately contains no invented legal entity, address, register/VAT detail, retention period or complaint promise. /contact prepares a customer-reviewable complaint email using the existing contact address; the customer sends it, and no receipt/refund/deadline is claimed. New fields wait for hydration so Safari input is not silently lost. `npm run release:check` rejects the missing information before either deployment script can build/migrate/deploy. This presence check is not legal certification. The existing Cloudflare main trigger runs build/deploy directly, so the branch must NOT merge to main while the legal gate fails.

### Cost transparency

The existing /ai image/estimate workflow adds optional parcel dimensions, shop-to-warehouse delivery and R&L service fee inputs. The validated corridor rates, divisor, surcharge, customs planning formula and currency conversion are unchanged. Missing fee inputs remain unknown, not confirmed zero. Output labels an estimated subtotal, chargeable weight, omitted dimensions and customs uncertainty. Invalid/partial dimensions are rejected. The unchanged legacy monetary outputs and new volumetric example are regression-tested. Inputs use the existing hydration readiness guard.

### Tracking

Public tracking remains status/milestones only; private contact, payload and price are excluded. New explicit event-time/action/window metadata is additive. Legacy creation time is labelled as recording time and never promoted to an actual transport event or ETA. Future entries never supply an actual event time. Only an explicit, consistent estimate window is presented as an estimate. Staff must enter the time of a real milestone; future actual times/reversed windows fail validation. Customer next steps point to the account for quote decisions and to existing official contact for invoice, delivery or exception handling. Short legacy references remain available to owner/staff account views, but anonymous lookup requires the existing high-entropy code format.

### SUPER_ADMIN and module ownership

- Server authority always reads approved database roles for the authenticated caller. `super_admin` covers approved administrative/seller/courier permissions without relying on client claims. Ordinary admins cannot grant administrative roles; public role requests cannot request them.
- The existing /admin adds an operational editor backed by a closed resource registry. Domain adapters own Marketplace, Bring For Me requests, Delivery/Transport, Tracking and AI-policy resources. Identity/settings are an explicit shared control plane; no new database, authentication service, routes or paid provider is introduced.
- Strict schemas/allowlisted columns refuse arbitrary SQL, resource names, secret fields and fabricated identities. New user records are pending/disabled until the existing delivered-code flow verifies their phone. Provisioning creates no login credential, grants no administrative role and sends no message.
- Privileged role approval requires an active existing account. Disabling an approved SUPER_ADMIN is refused; the last approved owner cannot be removed. No owner is seeded or promoted by migration.
- New operational mutations and immutable admin audit records commit atomically. Row-version checks reject stale edits. Audit fields contain field names, not credential values. Existing compliance and domain status/history logging remain intact; archive operations preserve customer rows/history. Existing accepted-quote/compliance/status-transition rules still apply to administrative operations.
- Offer changes retain price history and trigger existing one-shot alert notifications. Partial updates use only explicit submitted fields, preventing schema defaults from unexpectedly resetting status or other fields.
- Additive migration `0015_rl_administration.sql` is tested on isolated PGlite, including reapplication, audit immutability, last-owner protection and cross-module CRUD. No production schema/data has been changed. A Neon staging migration and production release remain deferred until release gates can be met.

### AI security maintenance

The current assistant still displays curated R&L answers and approved Marketplace data only; model prose is never displayed and private workflows stay in their existing account pages. AI configuration is read through an explicit settings contract; it can disable inference or reduce the existing cap, never enable a disabled deployment or increase its budget. Policy-read outages disable inference while curated navigation/refusals can remain available. Gate/limiter outages fail closed. Per-use nonce tokens are spent atomically; unexpired spent tokens survive UTC budget rollover. Existing counter rollover refuses older-day calls, and counter mutations are atomic. Failed provider attempts remain counted. No real model invocation or paid provider request was made during these tests.

Workerd-specific isolated runtime check: two tokens issued in the same millisecond differ; exactly one of 20 concurrent attempts can spend one token; replay refusal survives daily counter reset. This harness binds no AI or production resources.

## Verification continuation

Final source gates and review state (2026-10-14):

- Unit/script gate: 481 passed, 4 existing intentional skips (231 script + 250 library passes), including PGlite cross-module integration, lifecycle, role revocation, audit immutability, concurrent mutation rules and migration reapplication. Fresh typecheck passed. Lint: 0 errors / 5 existing warnings. Generated Playwright reports/results are now excluded from lint; source rules are unchanged.
- Final migration-free production build and Worker dry run are recorded after the mobile layout fix. No DATABASE_URL was supplied to the build; no migration ran against production.
- Official Playwright image v1.63.0-noble: affected-page baseline capture passed 162/162. 108 expected PNGs changed, exactly AI/contact/privacy/stores-request across 3 languages and 9 browser/device projects. Logo, fonts, header, home and unaffected-route baselines stayed intact. A later stores-request-only baseline update addresses the discovered hydration shift.
- Focused mobile improvements and preserved AI browser gate passed 28/28 (Chromium iPhone + WebKit iPhone).
- Full suite contains 597 cases. Initial CI-style run reached its 19-minute global deadline: 267 direct passes, 4 retry passes, 4 skips; 322 remaining. Exact remaining test IDs were resumed locally with only the global deadline disabled: 300 direct passes, 9 retry passes, 12 skips, 1 failure. Individual timeouts, assertions, pixel tolerance, retries and repository CI configuration were preserved. The remaining failure identified genuine layout movement from the auth-unavailable message/fallback expansion; its source fix reserves message space and keeps fallback expansion customer-controlled. Original CLS assertion remains unchanged. Selected failure and all 13 retry cases are retested without retries below. This is not a single green CI run.
- Combined initial/resumed coverage before that correction: 580 passed (13 on retry), 16 skipped, 1 failed. No hosted CI success is claimed.
- Workerd isolated runtime: same-millisecond gate tokens differ; exactly 1 of 20 concurrent replay attempts succeeds; spent-token refusal survives UTC rollover. No AI or production bindings used.
- Existing production read-only browser smoke: 6/6 (Chromium mobile/desktop and WebKit mobile). TLS trust used the environment-provided CA; certificate validation was not disabled. These smoke tests describe existing https://www.rlgo.net, not this candidate being deployed.
- Current main 19c17f2: Actions run 38527176459 failed before job steps (scope/verify; layout skipped). The existing owner-declined billing issue is recorded in project memory. No quota/payment setting changed. Main metadata protected=false; detailed protection query returned 403. No security control or approval was bypassed.
- Production latest read-only inspection: Worker version 0f6e2dd7-441a-4092-af4e-57715a4af7b3 at 100%, deployment 8b265311-aebb-4ce3-b5c1-18adf0562ea5, 07:16:17 UTC. This is an existing main release, not this work. Cargo migrations remain 0002–0014; 0015 has only isolated validation. Approved role inventory returned no rows. No owner was created or promoted.

Release requirements still unresolved: owner-supplied legal name/form/full address/representative/register and VAT applicability/content-responsible person/verification source and date, plus approved multilingual liability, jurisdiction, complaints and retention policy; exact existing verified owner account identifier; working existing OTP delivery provider for genuine authenticated verification. Placeholders and fictional promises cannot satisfy these requirements. The presence validator is not legal certification.

The Cloudflare main build trigger does not invoke release:check. Consequently this draft must not merge to main while verified legal content is missing. No paid service, public staging URL, production data write, new auth provider or real model call was introduced. Native hardware/camera, real OTP and authenticated production operations remain unverified.

### Final hydration-shift correction gate

The warning now occupies its final geometry in server HTML; availability updates change only visibility. Email fallback remains clearly discoverable but expands only on customer action. This prevents availability responses from moving the form or product-link panel. The original strict CLS assertion is preserved. Final source typecheck, lint (0 errors / 5 existing warnings), database-free production build and Worker dry run passed. All 27 stores-request captures passed. All 14 prior failure/retry cases passed in the official image with one worker and **zero retries**, including the original mobile request CLS check. The final 45-case no-update snapshot / focused improvements gate passed 45/45 with zero retries, zero failures, zero flaky outcomes and no skipped tests. This covers all 27 request snapshots across nine device/browser projects and all nine improvement scenarios in both Chromium/WebKit iPhone. Final JSON reporter statistics: expected=45, unexpected=0, flaky=0, skipped=0. Memory link/security checks: 5/5 passed. `release:check` exits 1 with the actual missing legal fields/policies; this expected block is not a green release gate.

Full-suite coverage across the documented initial run, exact remaining-ID continuation and final correction retests is 581 passing cases and 16 intentional skips; the entire suite was not completed as one uninterrupted green CI run. The final targeted gate is against the corrected source. Hosted billing remains unresolved.

## Published review state

[Draft PR #95](https://github.com/rebar9988-max/rega-cargo/pull/95) is open, not merged, targeting main 19c17f2. Source correction/baselines: 22ef7be; initial final evidence: 14e097b. Seven implementation/verification commits were pushed on the isolated feature branch. Production remains the pre-existing 0f6e2dd7 version; no migration, role grant or deployment occurred. Hosted draft jobs skip by existing policy; this is not hosted CI success. The official-image verification container was removed after completion; repository files and test evidence remain available.

## Beta deployment preflight (supersedes the historical hold)

Fresh local gate: 231 script passes / 4 intentional skips plus 252 library/integration passes = 483 passes. Typecheck passed; lint 0 errors / 5 existing warnings. Database-free production build and Worker dry run passed. Beta release:check passes with an explicit incomplete/unverified-content warning; the public-stage requirement remains tested. No UI baseline changed for the release-stage adjustment.

Production migration 0015 applied successfully on verified `old-cherry-79292410`, branch `br-raspy-snow-bagdgpk4`, database `cargo`, in one transaction with advisory lock, 5-second lock timeout and 60-second statement timeout. The marker was inserted atomically. Before/after counts remain zero for products, offers, phone users, roles, shipment/delivery/transport requests and tracking events. No user or role was granted. The existing dev branch migration and reapplication passed before production. No new branch/compute/service or public staging URL was created.

Rollback baseline is existing Worker version `0f6e2dd7-441a-4092-af4e-57715a4af7b3`. Migration is additive and old columns remain intact; rollback the Worker version while retaining schema/data, never delete customer records or the audit table. Public and pending identities stay denied administrative access. Real owner identity, positive authenticated SUPER_ADMIN CRUD and delivered OTP remain unavailable; do not claim those checks or fabricate a bootstrap identity. Existing main metadata protected=false, no reviews on PR #95; mandatory protections/approval must still be respected if they appear before merge.

The existing Cloudflare production trigger deploy command is now `npm run release:check && npx wrangler deploy` (build command unchanged). This closes the previously documented automatic-workflow omission: future public-stage releases cannot silently skip legal readiness. No secret/binding/branch preview/domain changed. The owner-approved beta stage satisfies this gate while retaining visible pending legal facts.

Fresh beta mobile browser gate: 27 passed and one WebKit draft case reached the unchanged 45-second test deadline while local Worker connections dropped/recovered. The original failed Sorani case then passed three consecutive isolated runs with zero retries and unchanged assertions/timeouts. All 28 unique required focused cases have passed across these runs. This is not a single 28/28 uninterrupted run, and no tolerance/CI config or source UI was changed to obtain it. Final memory checks passed 5/5.
