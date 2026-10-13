# R&L domain reliability verification — 2026-10-13

Scope: `rega-cargo` only. Owner authorized audit, minimal fix, staging, gated production deployment and rollback. No REGA Platform, pricing, branding, database or routes changed.

## Verified diagnosis

At audit start, main `5d39d9d` and live Worker `db08bc5b-31d3-460f-b7ea-7fdf9b0eb750` had an incomplete domain cutover:

- `www.rlgo.net` and `rlgo.net` were attached to `rega-cargo`, but `SITE_URL`, `BETTER_AUTH_URL` and SEO fallback still used `https://cargo.regaplatform.com`. Browser DOM confirmed the old canonical URL.
- Both apex HTTPS and both HTTP variants returned the application instead of redirecting. No zone redirect rules or conflicting Worker routes existed.
- The source configuration declared only `cargo.regaplatform.com`; the new custom domains existed only in live configuration. A later deployment could diverge from the intended domain configuration.
- The HTML cache host allowlist excluded `www.rlgo.net`, so the new host never used the existing SSR cache. This is a verified performance defect, not proof of the owner's intermittent blank screen.
- Worker static assets normally bypass the script. Host/scheme redirects must run before assets as well as pages.

DNS: active Cloudflare zone, Google public resolver returned Cloudflare A and AAAA for both names, delegated to autumn/max Cloudflare nameservers. Cloudflare-managed proxied AAAA `100::` records are valid originless Worker placeholders, not erroneous IPv6 origins. IPv6, HTTP/2 and HTTP/3 were enabled; Rocket Loader disabled. Universal and custom-domain certificate packs were active for both names. The zone was activated at 10:14 UTC; custom domains attached at 10:22 UTC. Recent activation alone does not prove that DNS propagation caused the reported failure.

Initial top-of-page checks did not reproduce a blank screen. Scrolling the live page then **reproduced a blank viewport in WebKit with the iPhone 13 device profile**. In the paired control, the Bring For Me section intersected the viewport (`top=-4`, `bottom=668`, `innerHeight=664`), contained 411 characters in `textContent`, but `innerText` was empty and the screenshot showed only the fixed navigation around a blank body. Turning off `content-visibility:auto` in that same live document, without reloading, scrolling again, changing JavaScript or waiting for new assets, restored 432 characters of painted text and the section's actual 924.97px height. [Before](rlgo-paint-before.png) · [After](rlgo-paint-after.png).

The verified rendering cause is the `.rl-defer` CSS optimization retaining a skipped/empty subtree as it enters the viewport in WebKit. The existing screenshot lock expands the viewport to the whole document, so it missed this actual mobile scrolling failure. A native iPhone and the owner's network are unavailable; this reproduces the symptom in the Safari engine, not a native-device confirmation.

## Minimal fix

Reuse the reviewed six-file domain migration from open PR #88 without modifying that branch. Align source routes, canonical SEO, auth base URL and cache allowlist. Add HTTP www normalization, one-hop encoded path/query preservation, method-preserving 308 for non-GET/HEAD, and Worker-first static asset routing. Keep the existing HTTPS legacy `/sw.js` recovery exception so installed PWAs can unregister and move. Keep `cargo.regaplatform.com` serving for the existing reversible cutover mechanism. Restrict extra redirect hosts to Cargo's own legacy domain; REGA hosts cannot be redirected even by misconfiguration. No auth trust widening or database writes. Remove the failing content-visibility/placeholder-size optimization while retaining all components, styles, lazy images and content. Bump the existing service-worker cache version to v12 so cached HTML cannot retain the faulty CSS on slow networks. Add an actual device-viewport repeated-scroll paint regression; do not change screenshot tolerances or baselines.

Regression coverage includes repeated and delayed-module complete rendering, hydrated request controls, page errors, asset errors, method/path/query preservation, canonical loop prevention and protected REGA hosts.

## Gates and limitations

Hosted GitHub Actions run `38383410302` failed before jobs started: account billing/spending-limit annotation. Main is unprotected (`protected: false`); rulesets require a plan upgrade. Existing project policy permits the full official-image local gate while billing blocks Actions. No CI/protection/billing setting is changed and no hosted success is claimed.

Use official `mcr.microsoft.com/playwright:v1.63.0-noble` (digest `sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27`) with Node 22.23.3, matching the CI major. The image ships Node 24, which reproduces the already-documented AI-stream test incompatibility; that attempt failed and is not counted as a passed gate. Browser certificate trust is configured for the session's HTTPS proxy; TLS validation is not disabled.

Native Safari/iPhone testing, a direct IPv6 connection, and a successful real OTP/authenticated write are unavailable here. Read-only public browser checks and fail-closed auth states are tested. Phone-provider credentials remain an existing external blocker.

Final results and deployment identifiers are appended below after execution.

## Verified staging and release gate

- Staging build `15bd6fa6-7777-45c7-b398-b7038f13d452` succeeded for application commit `35c4547`. Worker `rega-cargo-staging`, version `75511c45-4f5e-4081-8d02-8edc3a777379`, deployment `b4c68270`, 100%, 11:06 UTC. Migration skipped; startup/upload succeeded; no production binding/secret changes.
- The existing native feature-preview command returned success with only a configuration suggestion, not a usable preview artifact. Attempting to deploy staging through that preview's build was correctly refused by Cloudflare's Worker identity guard. Its original settings were restored. A temporary trigger targeted the existing staging Worker using the existing repository connection and build credential; its normal identity check passed. That task-created trigger was removed after successful staging verification. No guard, CI step, authentication or approval check was disabled.
- Official-image gate: typecheck, 432 unit tests / 4 existing skips / 0 failures, lint 0 errors / 5 existing warnings, migration-free build, Worker dry run and startup profile passed. Full screenshot/layout lock exited successfully with **449 passed, 6 passed on the configured retry, 16 intentional skips, 0 final failures**; no baselines or tolerances changed.
- Three initial layout retries were caused by my launching a second Playwright job into the same output directory: it removed active trace files (ENOENT). Subsequent jobs use separate output directories. Other first-attempt navigation failures exposed premature synthetic document navigation: network idle and SSR visibility did not prove hydration. TanStack's missing-module recovery reloaded the old page after an interrupted import. The added test now waits for each journey's actual enabled controls; errors are still asserted, not suppressed. A focused no-retry rerun on the corrected harness is recorded below.
- Staging browser audit: **40/40 complete pages**, WebKit iPhone profile, Chromium Android profile, real Chrome, Firefox and Edge desktop; no page/console errors, HTTP asset errors or horizontal overflow after waiting for actual hydration. Slow checks: WebKit with 750ms request delay; Chromium at 300ms RTT / 150kB/s down / 50kB/s up. Both painted every section and footer and enabled the request form, with zero page/console/HTTP errors. The corrected staged WebKit delayed-module and repeated-scroll regressions passed 2/2 without retry. Public protocol probes passed 19/19; `/market` retains its existing default-query normalization redirect and its final page renders normally.

Final focused official-image gate: **45/45 passed with retries disabled**, across all nine Chromium/WebKit device projects, including delayed/repeated rendering, real viewport painting, navigation, form validation and the previously flaky search sheet. The repeated typecheck/unit/lint gate passed (432 unit passes, 4 existing skips, 0 lint errors). ESLint initially inspected generated Playwright report JavaScript; that report was preserved outside the source tree and lint rerun normally. Memory link/secret checks passed 5/5. `npm audit` reported zero vulnerabilities, including dev dependencies. Staged Chromium and WebKit cache recovery both removed seeded v11 caches, activated v12 and rendered the full page.

## Verified production release

PR #89 merged normally as `4465ba7da46ce7965d4f4c29303c00302dd5f527` at 11:26 UTC, without admin override or protection changes. Existing production Cloudflare build `ed9dc719-e5ce-4dcc-848c-cb236225f14c` succeeded; migration explicitly skipped because no build `DATABASE_URL` existed; Worker startup 9ms. Production version `ddde9ad1-6555-4ee4-afe4-b7ac5043efcc`, deployment `b5bed8a3-1b82-4e34-80b9-36bd071139d8`, 100%, 11:27 UTC. Hyperdrive ID, all existing secret binding names, AI, rate limit and Durable Object bindings were preserved; `SITE_URL` and `BETTER_AUTH_URL` are now the canonical HTTPS www origin.

Actual production verification after deployment:

- **40/40 complete-page browser cases passed** across WebKit iPhone, Chromium Android, real Chrome, Firefox and Edge. Actual main/footer rendering, enabled controls, mobile/desktop sizing, zero page/console errors, zero HTTP asset errors and zero overflow. Marketplace rendered its genuine empty state.
- **6/6 production delayed-module/repeat-visit/actual-scroll paint regressions passed** on WebKit iPhone, Chromium phone and laptop, with no retry.
- **2/2 slow-network checks passed**; every section and footer painted, request controls hydrated, zero page/console/asset errors.
- **31/31 protocol checks passed**: 19 public page/API/asset probes (following the existing marketplace query normalization), nine exact single-hop GET redirects for HTTP/apex pages/assets with encoded query preservation, and three method-preserving POST 308 responses. Canonical HTTPS did not loop. AI status remained enabled. HTML CSP nonces matched the response policy. CSS/JS/images/fonts loaded correctly.
- **2/2 stale-cache recovery checks passed**: seeded v11 caches were removed; v12 page/static/asset caches activated and the complete website rendered in Chromium and WebKit.
- Google and Cloudflare public DNS resolvers both returned Cloudflare IPv4/IPv6 addresses for apex and www. Both custom domains remained enabled on `rega-cargo`; active certificates cover both. No DNS/SSL changes were required.
- Production-only observability query (dry/non-persistent), 11:27:32–11:33:46 UTC: 1,017 sampled invocations on `ddde9ad1`, all `ok`, no other outcome group; active Cargo issue list empty.
- Hosted main run `38390191118` did not start any runner (billing annotation; runner_id 0). The full official-image local substitute gate governed this permitted release. Hosted CI is not reported as passed.

No rollback was needed. Tested rollback baseline remains `db08bc5b-31d3-460f-b7ea-7fdf9b0eb750`; use a normal 100% deployment of the previous version if a future production failure requires rollback, without forcing past secret/version checks. No database data/schema, pricing, branding, route contracts, REGA Platform resource, account plan or credential was changed.

This documentation update can trigger another existing main build with identical application code. The version above is the verified functional release, not a promise that a later metadata-only deployment ID cannot change; inspect live deployments before any future operation.
