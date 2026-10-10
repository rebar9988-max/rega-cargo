# Step 6 — Performance, SEO and final verification

Locale URLs now render the selected language on the server, update `<html lang dir>`, and preserve existing query parameters when switching languages. All seven original locale IDs remain; `ckb` is Sorani and `ku` is Kurmanji. English and Sorani message dictionaries moved into the existing lazy message structure without changing their strings. Header/footer and SEO metadata use small i18n tables. Metadata includes localized titles/descriptions, absolute Open Graph URLs, canonical links and ckb/ar/en/ku alternates. The XML sitemap contains 40 locale URLs and excludes `/_design`; the existing AI/request noindex behavior is retained.

The appearance script applies stored theme and announcement dismissal before paint, with its exact CSP hash tested. New directional CSS uses logical properties and reduced motion. Existing WebP/srcset assets and dimensions remain; off-screen sections defer rendering. The home calculator loads when visible and keeps its form state after scrolling, with a full-height loading placeholder. Home-only components are imported by the home route, reducing unnecessary marketplace code. The official TanStack CSS inlining option removes the blocking stylesheet request; bootstrap/asset priorities and a paint-before-hydration client entry keep the rendered page responsive. No application dependency was added.

Safari verification caught an IntersectionObserver issue when the lazy calculator sat inside a `content-visibility: auto` ancestor. The calculator wrapper now retains normal layout while the calculator component itself stays lazy. All three Sorani/Arabic/English mobile Safari cases passed after that correction; other off-screen sections retain rendering deferral.

Inter was reduced from 352,240 bytes to approximately 46KB for common Latin characters and a separate approximately 45KB extended subset, retaining its license and 400–700 variable weights. Font URLs are versioned to avoid an older immutable cache. Fonts stay self-hosted with `font-display: swap`. A measured Sorani headline wrap during font loading was corrected with the existing 30px type token on small phones. A deliberately delayed-font browser check exercises the layout-shift budget. The logo, corridor formulas, rate tables, migrations, database ban triggers and compliance switches are unchanged.

Release verification on the deployed staging Worker also exposed an English fallback-font wrap on Linux Chromium: the headline briefly used three lines before Inter reduced it to two. The Latin body stack now prefers Arial/Liberation Sans before the platform default; the loaded Inter design is unchanged. Delayed-font verification additionally requires the headline height to remain stable. The staging probe measured English CLS 0.0003 after this correction, versus 0.0755 in the failing release check.

## Files

- Foundations: `src/styles.css`, `src/styles/{tokens,design-system}.css`, `src/client.tsx`, `src/routes/__root.tsx`, `vite.config.ts`, `.gitignore`, `public/fonts/inter-*.woff2` and Inter license.
- Locale/appearance: `src/lib/i18n.tsx`, `messages/{en,ckb}.ts`, `locale-search.ts`, `appearance-script.ts`, `theme.tsx`, `site-copy.ts`, `redesign-copy.ts`.
- SEO: `src/lib/{seo,seo-copy,seo-messages}.ts`, `server/routes/sitemap.xml.ts`, head metadata in the home, stores, request, quote, market, AI and legal route files.
- Presentation/performance: `src/components/{bazaar-page,premium-home,quote-panel,site-header,site-footer,ui}.tsx`, `src/lib/stores.ts`, `server/middleware/{0-a-security,0-b-render-priority}.ts`.
- Verification: `src/lib/{html-cache,quote-search,numbers}.test.ts`, `playwright.config.ts`, `tests/layout/{layout.spec,premium.spec,geometry}.ts`, current Chromium/WebKit screenshot baselines, updated typography/layout deployment documentation in `DEPLOY.md`, and this guide/report/metric summary.

## Lighthouse mobile

Measured against the compiled Worker through a temporary local **HTTPS/HTTP2** reverse proxy, using Lighthouse's **default simulated mobile throttling** and Chromium 151. The proxy forwards the application unchanged. The self-signed localhost certificate is accepted only by the test browser (`--allow-insecure-localhost`); application CSP and audit categories remain enabled. This represents the live site's HTTP/2 transport. Runs were sequential, without other active test/build jobs.

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---:|---:|---:|---:|---:|---:|
| `/` | 94 | 100 | 100 | 92 | 2.5s | 0 |
| `/stores` | 97 | 100 | 100 | 92 | 2.4s | 0 |
| `/quote` | 96 | 100 | 100 | 92 | 2.5s | 0 |

Full reports: `/workspace/rega-redesign/lighthouse/{home,stores,quote}-h2.report.{html,json}`. Compact results and exact Lighthouse version/timestamps: `lighthouse.json`. Earlier Step 6 plain local HTTP/1.1 comparison scores were 93/87/89; transport materially affects the simulated result. Do not interpret preview results as deployed-site scores. SEO retains the live canonical origin, which produces the localhost canonical diagnostic. The separate directly throttled mobile homepage run scored 98 with CLS 0.003 after the font fix.

## Validation

- Node 22: lint (zero errors, five warnings), type-check, 387 passing unit/integration tests and four existing skips, successful production build. Cloudflare dry-run packaging succeeded; nothing was deployed.
- Axe: 54 checks (nine routes × ckb/ar/en × light/dark at 360px), zero WCAG 2 A/AA and 2.1 AA violations, page errors or horizontal overflows. Manual screenshot review covered the home, marketplace, quote and request presentation.
- Server HTML: 32 route/locale responses with correct lang/dir; five alternates on indexable redesigned routes; well-formed 40-URL sitemap; design route excluded and robots disallow retained. Footer PDF serves its existing file.
- Browser matrix: generation passed 376 tests with 12 intentional desktop mobile-menu skips. Normal comparison verification passed all 376 cases (375 on the first attempt; one WebKit header-layout timing retry). The geometry helper now waits for the actual expanded header height instead of only its state attribute; that case then passed five repeats with retries disabled. Chromium and WebKit cover 390/375/820/1180/1280/1440px where applicable, plus required routes in three languages and two themes at 360px, category/favorite URL state, language switching, keyboard dialogs, banned search fixtures and dimension/quote handoff.

Evidence and scripts: `/workspace/rega-redesign/`; accessibility screenshots/report in `final/`, browser logs in `step-6-layout*.log`, SSR checks in `final-seo.json`.

## GitHub review follow-up

The redesign is published as [draft PR #47](https://github.com/rebar9988-max/rega-cargo/pull/47). The first GitHub run passed lint/type-check, all 387 unit/integration tests, build and Worker dry-run. Its browser matrix had two initialization failures and three timing retries (371 first-pass successes, 12 intentional skips). The WebKit failures occurred before screenshot comparison: the calculator stayed offscreen because the framework's initial hydration reset an earlier automated scroll.

A delayed-JavaScript reproduction confirmed the scroll changed from about 1100px to zero before the calculator observer mounted. The screenshot fixture now keeps the requested calculator in view until its actual controls mount. The existing calculator dimension/quote-handoff test also exercises delayed bootstrap. Application/router logic, geometry assertions, screenshot tolerances and baselines are unchanged. CI uses three browser workers to leave CPU for workerd and WebKit captures.

After this correction, Node 22 lint/type-check/387 tests (four skips)/build passed again. Focused official-image checks with Node 22 and a two-CPU limit passed 12 WebKit repetitions, three calculator-handoff repetitions and four delayed-bootstrap cases, with retries disabled. Evidence: `github-followup-{checks,types,browser}.log`; the original failure evidence is in `github-layout-first.*` and `safari-startup.log` outside the repo. The complete GitHub rerun status is available on PR #47. This follow-up changes verification code and documentation only, so the application bundle and reported Lighthouse measurements are unchanged.

## Exact URLs and release limits

See [the complete test guide](README.md) for every route and ckb/ar/en instructions. Useful compiled-preview URLs:

- http://localhost:8788/?lang=ckb
- http://localhost:8788/stores?cat=fashion&store=zalando&country=DE&lang=ar
- http://localhost:8788/stores?fav=1&lang=en
- http://localhost:8788/stores/request?store=zalando&intent=ship&lang=ckb
- http://localhost:8788/quote?l=60&w=30&h=20&lang=en
- http://localhost:8788/_design?lang=ar
- http://localhost:8788/rl-cargo.pdf

Missing price/stock/second-image data remains unavailable; the price filter is visibly disabled. Translation-review TODOs and pending real legal owner details remain visible/documented. Unconfigured market sources and separately recorded legacy backend issues remain outside the redesign. No real orders, customer messages, deployment or paid AI requests were sent. Automated accessibility is supplemented by the keyboard/browser checks; it does not certify every assistive-technology combination.
