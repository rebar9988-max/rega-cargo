# R&L exclusive public domain — 2026-10-13

Owner explicitly requested closure of old domains: R&L must be publicly served only at `https://www.rlgo.net`. This supersedes the earlier choice to retain the cargo domain and public staging. The previous WebKit paint/domain repair remains intact; no application, UI, auth, pricing, database or branding changes were made here.

## Live routing changes

At 11:48 UTC, disabled staging workers.dev and version preview routing first and verified staging returned 404 while www returned 200. Then disabled R&L Cloudflare Builds branch previews and production workers.dev/version previews, and detached `cargo.regaplatform.com` from `rega-cargo`. Its read-only managed DNS record was removed by Cloudflare. No Worker, secret, database, Durable Object or source branch was deleted.

Only `www.rlgo.net` and redirect-only `rlgo.net` remain attached to R&L. Both REGA Platform domain attachment IDs/certificates remain unchanged. Production application version at the routing change was `66c196ad-5656-4966-b69b-29b8d0a7fde9`, 100%; changing public routing did not deploy different application code.

Source `wrangler.jsonc` disables production/staging workers.dev and version previews and removes the retired custom domain. An existing safe legacy redirect setting prevents app serving if stale cargo routing is restored. Native Builds preview automation is disabled through the account API; all 11 historical native preview records have empty routable URL lists. Isolated preview vars remain as a safety measure. Permanent domain rules in AGENTS.md and CLAUDE.md prohibit future public staging/preview exposure without owner authorization.

## Observed evidence

- Google and Cloudflare public DNS resolvers both returned NXDOMAIN (Status 3) with no A answers for `cargo.regaplatform.com`; the Cloudflare zone API returned no matching records. After retirement, the environment proxy rejected the nonexistent hostname with CONNECT 403, so this is not reported as an origin HTTP 404.
- Twelve closed-endpoint checks returned 404: home, stores/query, service worker, logo asset and AI status on both production/staging workers.dev, plus current production/staging version preview URLs.
- Ten complete-page checks passed after closure: home and Bring For Me request on WebKit/iPhone emulation, Chromium mobile, actual Chrome, Firefox and Edge. Hydrated controls and main content rendered; zero page/console errors, failed requests, bad HTTP responses or horizontal overflow. Browser TLS verification remained enabled.
- All 31 canonical protocol checks passed: full HTML/main/footer and CSP nonce match on primary journeys, assets, fonts, SW v12, sitemap/robots and AI status; exact one-hop GET 301 and POST 308 for HTTP/apex, preserving encoded paths/query strings.
- Typecheck, 432 unit tests (4 intentional skips), lint (0 errors/5 existing warnings), migration-free build, production and staging dry-runs and Worker startup profile passed. Worker types generated outside the repository; npm audit reports zero vulnerabilities. Full official-image layout/screenshot lock passed: 455 passed, 16 existing skips, zero failed attempts or final failures (12.5 minutes). No baselines/tolerances changed.

## Limits and future releases

GitHub Actions run `38391370936` on main `9c08685` did not start: runner IDs 0 and billing/spending-limit annotation. Hosted CI did not pass. The existing owner-authorized full local official Playwright-image gate is required before merging this source persistence change. No screenshot baselines or tolerances are changed.

Native iPhone, direct IPv6 and real OTP provider tests remain unavailable, as recorded in the original repair report. Domain-only exclusivity is not an authenticated private-site mode. Staging stays deployed with no public URL; future verification must use local/isolated access or obtain fresh authorization before exposing another hostname. Code rollback must preserve closed routing flags and cargo detachment.
