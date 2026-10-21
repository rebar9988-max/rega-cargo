# UI/UX continuation — 2026-10-21

Continues verified `main@7115ea7`, after the homepage bottom-navigation release (#132), original-silk mobile repair (#127), and official-image baseline reconciliation (#138/#140). The separate read-only matrix PR #141 is reviewed, not duplicated or merged. Open #133 owns the proposed Bring For Me steps; this continuation does not recreate that work.

## Scope and authority

The owner's master UI/UX brief and renewed continuation authorize targeted responsive geometry repairs, preserving existing branding, artwork, typefaces, tokens, data, authentication, business rules and module boundaries. Modern Web Guidance is used only for technical accessibility checks, per AGENTS.md; it does not prescribe visual changes. The supplied homepage screenshot remains the visual reference. No screen recording is available in this session. The existing `ku` locale is Kurmanji and is preserved rather than renamed to `kmr`.

Read: root instructions, repository checkpoint and relevant design/architecture/progress/issues memory, central Google Doc, current GitHub PRs and commits. Cloudflare API discovery returned an internal tool error twice; no active Worker allocation can be claimed from that connector. Public production browser checks are read-only. No merge/deploy is authorized by this task.

## Prioritized findings before implementation

| Route/component | Actual defect and evidence | Root cause | Severity | Proposed correction | Regression risk |
| --- | --- | --- | --- | --- | --- |
| `/contact`, email card, 320px | Fresh production Chromium capture: card x=-3.265625, width=307.265625; document scrollWidth=323 versus clientWidth=320. Its left border is visibly clipped. No overflow on the homepage at 320px. Prior #141 independently observed it in three engines. | The start-aligned flex item is capped at 36rem, not its containing column; the unbroken address contributes its intrinsic width. | P2, narrow-phone usability | Clamp the existing card to its column and let the full address wrap only when needed. Preserve its icon, spacing, borders, text, target and desktop dimensions. | Low, local presentation only; compare wider-width pixels and test all seven locales. |
| Shared desktop language control | Fresh official-image Chromium/axe 4.14 reports `label-content-name-mismatch` on the visible language-code button across public routes. The code is visible, but the accessible name puts it in parentheses, which speech-label matching excludes. | Parenthetical code in the explicit accessible name. | P2, voice-control accessibility | Keep all visible markup/styles and replace parentheses with a spoken separator, so the visible language code is part of the effective accessible name. | Low, accessible attribute only; verify axe and identical screenshots. |
| `/prohibited-items`, category labels in narrow cards | Fresh seven-language matrix and inspected Kurmanji 320px screenshot: document scrollWidth=340; the tobacco category's 136px card has 171px of scrollable content. German also overflows at 320px. | Anonymous flex text keeps a long word's intrinsic minimum width alongside the non-shrinking icon in the existing two-column grid. | P2, multilingual phone readability | Wrap the existing translated label in a shrinkable span with emergency word wrapping; keep the grid, icons, translations and prohibited-product rules. | Low, scoped text geometry; verify every label and all locales/widths without changing business logic. |
| Protected Vazirmatn font | #141 reports Firefox STAT/nameID diagnostics. Existing font still renders; fresh Firefox check pending. | Font metadata, protected asset. | P3, compatibility diagnostic | Record only; preserve font bytes. | Changing the official font would violate scope. |

## Implemented changes

Application source is limited to three existing files, committed as `ad1e5c73daef2f11f5d53367533fd316a37d7ca4` on `fix/rl-responsive-contact-20261021`:

- `src/routes/contact.tsx`: retain the existing 36rem ceiling while clamping it to the column; preserve the entire LTR email and allow a readable break after `@`. No ellipsis or hidden address.
- `src/routes/prohibited-items.tsx`: a shrinkable text span with emergency word wrapping contains translated category names within the existing cards. No category, translation, restriction or grid is removed.
- `src/components/lang-picker.tsx`: replace parentheses around the accessible language code with a comma. Visible content, dimensions, styles, options and language-switch logic remain identical.

`tests/layout/responsive-content.spec.ts` adds two behavioral geometry regressions across all seven locales at 320px. Both fail against unchanged main in Chromium and WebKit. The final focused candidate run passes 4/4, without retries. No existing assertion, snapshot, threshold, timeout, project or business test was changed.

Repository memory and this evidence directory are the other changes. `public/`, brand/font/image assets, design-token/style files, package/lock files, APIs, authentication, pricing, compliance rules, database/migrations, Cloudflare configuration and the isolated R&L AI module are unchanged from main. No application dependency or paid service was added; audit utilities were installed outside the application.

## Responsive, multilingual and accessibility evidence

The official `mcr.microsoft.com/playwright:v1.63.0-noble` image, Node 22.23.3 and the existing built local Worker were used. The before Worker is an isolated copy built from `main@7115ea7`; the after Worker contains the source above. Production was inspected read-only, including fresh home/contact captures at every requested width.

| Check | Actual result |
| --- | --- |
| Required widths | 320, 360, 375, 390, 430, 768, 1024, 1280, 1440px |
| Local Chromium matrix | 19 routes × 7 locales × 9 widths = **1,197** page loads |
| Additional WebKit/Firefox contact matrix | 63 loads per engine = **126** |
| Combined matrix | **1,323/1,323** pages returned 200 after existing redirects; exactly one main h1, no document overflow or JavaScript page error |
| Locale/direction | Seven existing IDs preserved: `ckb`, `ku`, `de`, `en`, `ar`, `tr`, `fa`; global RTL remains the owner's established layout; locale text direction remains RTL for ckb/ar/fa and LTR for ku/de/en/tr |
| Real language-picker interactions | **42/42** across three engines and 390/1440px; preserve `cat=fashion`, selected locale, Escape dismissal and focus return |
| axe-core 4.14.0 | **266** scans: all 19 routes × seven locales at 320/1440px; **zero violations** for WCAG 2 A/AA, 2.1 A/AA and 2.2 AA tags |
| Stable unmasked before/after comparisons | **70** pairs; **59 identical**, 11 show the intended narrow email/category wrapping only; homepage is identical at all nine widths |

Machine evidence: [matrix](ui-continuation-20261021/matrix.json), [stable comparisons](ui-continuation-20261021/stable-comparisons.json), [initial baseline accessibility audit](ui-continuation-20261021/baseline-audit.json), [production-before measurements](ui-continuation-20261021/production-before.json).

Every route below has before/after captures at 320/1440px and the seven-locale/nine-width Chromium checks. The screenshots cover the existing header, hero, cards, service banners, forms, navigation and footer.

| Step | Route / state inspected | Health and limits |
| --- | --- | --- |
| 1 | `/` | Existing premium artwork/composition retained; nine-width unmasked pixels identical |
| 2 | `/stores` | Existing catalog, category and filter presentation retained |
| 3 | `/stores/request` | Existing request form retained; separate proposed steps in #133 are untouched |
| 4 | `/quote` | Existing quote form and truthful rate presentation retained |
| 5 | `/track` | Existing tracking input/empty state retained; no shipment/event invented |
| 6 | `/market` | Existing no-data local state retained; not proof of live inventory |
| 7 | `/ai` | Existing owned assistant interface retained; no live model inference used |
| 8 | `/account` | Existing unauthenticated local state retained; not a real OTP/session check |
| 9 | `/contact` | 320px email-card overflow fixed; complete address remains visible |
| 10 | `/privacy` | Existing beta content retained |
| 11 | `/impressum` | Existing beta content retained |
| 12 | `/terms` | Existing beta content retained |
| 13 | `/customs` | Existing guidance retained |
| 14 | `/prohibited-items` | Translated narrow-card labels contained; restrictions unchanged |
| 15 | `/market/sell` | Existing unauthenticated redirect/guard retained |
| 16 | `/request` | Existing unauthenticated redirect/guard retained |
| 17 | `/move` | Existing unauthenticated redirect/guard retained |
| 18 | `/owner` | Existing public credential form retained; no activation/sign-in submitted |
| 19 | `/admin` | Existing unauthenticated redirect/guard retained |

### Screenshot capture investigation

The first direct full-page capture pass showed 12 tiny, unplanned differences (64–110 pixels) in header language codes/icons. Their bounding boxes were confined to header glyphs. Repeating all 70 pairs with the repository's existing document-sized viewport approach, fixed time before navigation, loaded fonts/images and settled paint eliminated every unplanned difference while preserving main geometry. No application change or baseline update was needed. The original machine differences remain in `matrix.json`, and affected original PNGs remain in [initial-capture-noise](ui-continuation-20261021/initial-capture-noise/).

Accepted evidence: [desktop/mobile before-and-after gallery](ui-continuation-20261021/README.md). Fresh, unedited production-before images are in [production-before](ui-continuation-20261021/production-before/). These audit screenshots do not replace any committed layout baseline.

## Engineering gate

| Check | Actual result |
| --- | --- |
| Typecheck | Passed, Node 22.23.3 |
| Lint | Passed: 0 errors, 4 existing React-refresh warnings |
| Unit/script/integration/security tests | **537 passed, 4 existing skips, 0 failed** |
| Project-memory/link checks | 5/5 passed; rerun after final evidence updates |
| Production build | Passed with `DATABASE_URL=''`; migrator explicitly skipped |
| Worker bundle dry-run | Passed; no deploy |
| New focused Chromium/WebKit regressions | **4/4 passed**, all seven locales inside each case |
| Full existing official-image E2E/pixel gate | **722 passed, 1 flaky passed on the existing retry, 1 failed, 16 existing skips, 8 not run**; hit the unchanged 19-minute global limit. This is not a passing single full run. |
| Unchanged Firefox completion | **23/23 passed**, no retry; includes the failed catalog navigation and all eight unrun cases. Together the final runs cover **732 unique passing cases and 16 existing skips**, with the original WebKit retry retained. Check the PR's current Checks tab for the hosted exact-head gate; local completion is not a substitute for that gate. |

The full-run Firefox failure was `NS_BINDING_ABORTED` in the unchanged catalog-navigation test. The WebKit retry concerned an interrupted navigation in the unchanged journey test. An earlier exploratory run also observed the already documented intermittent owner-denial 500; an unchanged-main focused control passed. No auth logic or test was altered. Earlier partial runs were interrupted as the extra category defect and natural email wrap were verified; their counts are not substituted for a complete gate.

## Measured performance

Lighthouse **13.5.0**, fresh browser profiles, default simulated mobile throttling / standard desktop preset, one sample per row. Local samples ran without the responsive/browser matrices competing for CPU. Results are lab observations, not field Core Web Vitals or proof of an improvement.

| Surface / sample | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Local before, mobile | 59 | 100 | 100 | 92 | 4.390s | 0 | 941ms |
| Local candidate, mobile | 62 | 100 | 100 | 92 | 4.405s | 0 | 813.5ms |
| Local before, desktop | 99 | 100 | 100 | 92 | 1.007s | 0 | 3ms |
| Local candidate, desktop | 98 | 100 | 100 | 92 | 1.111s | 0.000643 | 7.5ms |
| Existing production, mobile, read-only | **81** | **100** | **100** | **100** | **3.190s** | 0.002116 | 345ms |

Local SEO 92 is the documented localhost/production canonical conflict, not a production SEO defect; the production canonical audit passes. Production uses system Chromium through the session proxy, while local comparisons use official-image Chromium, so their performance scores are not directly comparable. The candidate has not been deployed: the production row measures the existing website.

**Mobile Performance ≥90 and LCP ≤2.5s remain unmet in these samples.** No performance improvement is claimed from the small before/after score difference. INP was not measured; TBT is not INP. A diagnostic using the existing reduced-motion preference lowers local mobile TBT to 23.5ms (Performance 83, LCP 4.375s); this points to animation/renderer cost under software rendering, but does not prove the native-device root cause or satisfy the ordinary-motion target. The original approved renderer, its timing, artwork, product colours and fallback remain untouched.

Full raw reports and the reduced-motion diagnostic are in [performance](ui-continuation-20261021/performance/). Follow-up should profile the actual mobile renderer/network on native hardware and preserve the approved output, rather than removing graphics or reducing the measured workload to claim a pass.

## Remaining limitations and review status

- Mobile performance/LCP targets remain open as above; native-device and field INP/LCP evidence is unavailable.
- Protected Vazirmatn Firefox metadata diagnostic from #141 remains reported and unchanged.
- Actual OTP receipt/session, private dashboards, real product/order detail and real shipment timelines require authorized live records/inbox/device context; no positive authenticated verification is claimed.
- Screen-reader/native touch review is not replaced by automated axe scores. No full WCAG certification is claimed.
- The central Doc's old bottom-nav baseline hold is superseded by #138/#140. Existing main `7115ea7` has passing hosted `scope`/`verify` and Workers Builds; its docs-only layout job is skipped. This does not establish current Cloudflare traffic allocation.
- Cloudflare API discovery failed twice in this session; no active Worker version or percentage is claimed. No Cloudflare, database, auth, payment, business-rule or REGA Platform change was made.

Review: [PR #142](https://github.com/rebar9988-max/rega-cargo/pull/142). Its current hosted checks are authoritative for exact-head readiness. **Not merged or deployed.** The targeted UI fixes and their evidence are reviewable; the whole master performance objective is not reported complete.

### Reproduce the additional audit

Use the existing official Playwright image and built local Worker. Keep an isolated before build at port 8789 and the candidate at 8788; do not run either build with production database credentials. Install audit-only tools outside the repository (`axe-core@4.14.0`, `pngjs@7.0.0`, `pixelmatch@8.0.0`), set `RL_QA_TOOLS` to that tools directory, then run `node docs/verification/ui-continuation-20261021/verify.mjs` followed by `node docs/verification/ui-continuation-20261021/stable-capture-session.mjs`. These scripts collect read-only local UI evidence and never update layout baselines or publish a hostname. Existing full gate: `npx playwright test` with the unmodified project configuration.
