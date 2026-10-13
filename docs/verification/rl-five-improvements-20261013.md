# R&L five improvements — implementation and release evidence

Base: main 631549f, canonical production https://www.rlgo.net. Work branch: codex/rl-five-improvements-20261013. Scope: Marketplace, Bring For Me, Delivery/Tracking and the existing AI service. No changes to REGA Platform, public hostnames, pricing rates, branding or customer records.

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

Implementation and verification in progress. No production deployment or authenticated SUPER_ADMIN verification is claimed.
