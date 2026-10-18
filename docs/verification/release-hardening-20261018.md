# R&L release continuation — 2026-10-18

Base: verified `main` `07fb64e82217304a7222ef01601b65beca302b69`, after merged PRs #115 and #116. No restart or reimplementation of the six released fixes.

## Authorized changes

Owner requested autonomous implementation, checks, commit/push, deployment and live verification for OTP resends, 0.1 kg precision, fail-closed limits and review notifications. Existing five-module boundaries, languages, visuals, pricing, domain exclusivity and free-service policy remain authoritative.

* OTP: atomic reservation before delivery, 60-second cooldown, five guesses within a fixed five-minute window. A resend keeps the original deadline and attempts; exhausted-window resend retries do not spend the daily send budget. Expiry restores the per-code budget. PIN typos no longer spend the phone's daily sending budget; independent per-IP PIN limits and existing phone/IP sending budgets remain. Only successfully delivered codes activate. Conditional consumption admits a single concurrent winner and cannot delete a newer code.
* Weight: every tenth from 0.1 through 70 kg is regression-covered in server pricing, with signed boundary round trips and decimal request persistence. Calculator and server accept decimal commas. Existing nearest-tenth rounding (including 4.84→4.8 and 4.85→4.9), minimums, surcharges, cents, and whole-euro request estimates are unchanged. The pricing function itself is untouched.
* Limits: absent `RL_LIMIT`, missing client IP, thrown errors and non-boolean success fail closed. The production binding was directly verified before release; no binding, budget or domain change.
* Review: compliance `review` decisions enter `reviewing` in customer and administrative creation. Additive migration `0016_request_review_notifications.sql` records one existing in-app inbox notice per distinct approved admin/super-admin when a request enters review. Same-state retries produce none; later review cycles notify again. The request-owned trigger runs in the same transaction for customer decline, staff status changes and administrative changes. Receipt notices were moved into the creation statement. Quote decline and the review transition are one statement, so a notification failure rolls both back. No external mail/SMS notification provider is introduced.

## Verification

Final commands and browser totals are recorded in the release update below. Focused initial tests: 28 pass, 0 fail, 0 skipped. Replacing the six affected implementation files with verified base versions produces six failures in these same regressions; restored fixes pass. Additional decline failure injection proves both quote and request roll back when the notice cannot be persisted.

Neon: production `old-cherry-79292410`, database `cargo`, branch `br-raspy-snow-bagdgpk4` inspected read-only. Existing dev branch `br-broad-sun-bajwlo1d` validated the additive migration and a transactional, rolled-back probe: one notice for two approved roles on the same user, none for a same-state update, another for the next review cycle. Probe records remaining: zero. Pre-change backup branch `br-misty-voice-bauhyebc` created without a compute endpoint. No production customer data, roles or credentials are changed by this work.

Initial Cloudflare deployment was directly verified: `db58bc44-faef-4a0d-bbaf-5c4b16dca311`, 100%, deployment `a2274f77-f1f1-40ce-9ab5-aaf0782ae1ef` (PR #116 docs-only build). `RL_LIMIT` ratelimit binding, Hyperdrive and existing secret names were inspected without exposing values.

## Environment and remaining limits

* Git clone lacked credentials; source was obtained through the authenticated GitHub connector at the pinned commit. Binary assets were checked against Git blob hashes; the >1 MB logo needed the identical public production file because GitHub Contents returned empty content. No asset change is included in the release.
* Node 22.23.3 used, as the repository requires. Host proxy instrumentation emits a Node warning into CLI JSON stderr; `NODE_NO_WARNINGS=1` removes that instrumentation warning, without suppressing assertions or test failures.
* Official Playwright browser download returned invalid ZIP data. A temporary Chromium 153 package outside the repository supplies the browser; a temporary harness omits its single-process flag and handles the host's unavailable network-interface syscall. These harness changes are not application changes and are not committed. Firefox, WebKit, native hardware and official-image pixel baselines are not claimed.
* GitHub-hosted Actions on the base still fail before execution; Workers Builds success is not a unit/browser test gate. Release relies on the explicit owner-authorized local gate, without changing checks or protection.
* Production has zero approved staff recipients and no configured phone delivery provider. Real staff receipt and real OTP delivery cannot be claimed. No account is invented or promoted. In-app notices become deliverable to eligible staff once an approved account exists; no email-delivery promise is made.

Official references retrieved through Firecrawl: [Cloudflare Rate Limiting API](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) and [PostgreSQL trigger transactions](https://www.postgresql.org/docs/current/trigger-definition.html).


## Existing font-shift gate repaired without changing final typography

The broad browser run exposed the already-known English fallback-font shift. A same-environment paired build of untouched application source at `07fb64e` reproduced exactly 0.05891660644531249 against the existing <0.05 assertion; candidate before the font repair was identical. The initial Lambda-only fallback environment was worse (0.10308599), so the final harness explicitly includes Liberation Sans, the system fallback already named by the application. No assertion, threshold or screenshot baseline changed.

Because the owner requires mandatory checks before deployment, the minimal responsible-layer repair adds two local Latin fallback faces with metrics matched to the existing Inter font at weights 400/700. Their Latin-only unicode ranges preserve Arabic-script font ownership. The primary Inter/Noto/Vazirmatn files, loaded-font appearance, typography/line-height tokens and responsive components remain unchanged. The existing ckb/ar/en slow-font test then passes. Metric ratios were calculated from the pinned Inter file and Liberation Sans 2.1.5; the fallback adds no download or package dependency to R&L.

Additional reference: [CSS Fonts specification: font metric overrides](https://drafts.csswg.org/css-fonts-5/). Liberation fonts came from the [official Debian package directory](https://deb.debian.org/debian/pool/main/f/fonts-liberation2/) for the temporary test environment only.

An automatic approval review rejected further local browser execution while the temporary Wrangler configuration retained a remote AI binding, because of possible inference charges. The replacement test configuration removes AI and Hyperdrive, disables inference/product fetching, uses a separate local port and never changes production configuration. Further AI-browser execution was also rejected by automatic approval review, so the final current-build broad run excludes the 36 dedicated AI browser cases; they are NOT counted as passed or skipped. All AI unit/architecture/security cases remain in npm test. No test assertion or production feature flag was changed to evade review. No approval bypass or paid service was used. Earlier artifact-close failures arose from concurrent reporters using one output directory; final runs have isolated output directories. The final non-AI suite below supersedes those diagnostic attempts for the cases it covers; the dedicated AI browser gate remains explicitly unverified on the final tree.

## Pre-deployment gate on the final application tree

* Node 22.23.3 `npm test`: **504 passed** (236 script + 268 unit/integration/security), **4 existing skips**, 0 failures. Seven new tests cover the four requested priorities; all existing AI architecture/unit/security tests remain included.
* Typecheck: 0 errors. ESLint: 0 errors, 4 existing warnings. Production build with `DATABASE_URL=''`: passed; no real database migrated by a build. `cf:dry-run`: passed. Memory tests: 5/5 passed.
* Chromium: **364 distinct selected cases pass across the broad run and the focused follow-up**, 12 by-design skips, 30 dedicated AI cases excluded and not counted. The broad run was 360 pass / 12 skip / 4 fixture failures because disabling local features hid the AI capsule/product-link UI. Five focused cases then passed (the four affected UI cases plus the already-covered font case). No extra pass is counted for that duplicate. This is not described as one all-green broad run.
* Safe final UI fixture: no Cloudflare AI binding, no Hyperdrive, zero inference cap, and the AI-name variable is only a literal string (no `.run()` capability) to preserve existing Boolean presentation checks. Dedicated AI actions remain excluded. Temporary browser/config files are outside the committed tree. The production configuration is unchanged.
* No Firefox/WebKit, official-image pixel comparison, native device or real phone delivery claim. Hosted Actions remains blocked; no skipped check is called a pass.

The owner's explicit autonomous release instruction is applied on the verified local code/regression/build gate. `main` has no required checks or branch protection (verified live); no protection, workflow or test threshold is changed. Cloudflare Workers Builds remains the existing production delivery mechanism.
