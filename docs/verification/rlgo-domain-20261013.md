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
