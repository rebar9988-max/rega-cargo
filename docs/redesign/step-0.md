# Step 0 — Audit and implementation map

Branch: design/rl-premium. Baseline: 6c785bc. No application source changes in this step; AGENTS.md records the user's rules.

The stack is React 19, TypeScript, TanStack React Start/file-based routing, Vite 8, Tailwind 4, Nitro's Cloudflare module preset and Workers. Postgres/pg backs production data; PGLite is used in local development and tests. No new runtime dependency is planned.

Styling currently lives in src/styles.css and Tailwind classes, with shared Field/Button classes in src/components/field.tsx. Tokens exist for layout and light colors, but no complete dark theme. Arabic-script fonts are already self-hosted; Latin currently uses Outfit. The current layout tests enforce the old layout geometry; redesign updates must retain useful overflow, focus and sizing checks rather than asserting obsolete screenshots.

i18n is in src/lib/i18n.tsx, src/lib/messages and domain copy files. Sorani is ckb; ku is Kurmanji. Seven existing languages remain supported to preserve preferences and links. Sorani/Arabic currently change text direction while html remains ltr, which must become actual html dir=rtl for the requested design. New strings will live in a dedicated i18n copy file; uncertain Sorani/Arabic additions will carry TODO(translate-review). SEO will use correct language identities, including ckb for Sorani and ku for the existing Kurmanji language.

Data: src/lib/stores.ts supplies store IDs, URLs, origins/country, category membership, caution labels and sample goods; src/lib/catalog.ts supplies licensed/self-hosted logo references and search links. GOODS are catalogue examples, not live stock. Store prices, inventory, ratings and secondary images are absent. Do not invent them: label examples, leave price filters unavailable with an explanation, and show secondary images only if real data becomes available. Market products/offers are DB-backed; requests, quotes, auth and AI use the existing server APIs. src/lib/corridor.ts is the shared pricing source (actual/volumetric, minimum, surcharge, EUR/IQD); its formulas and rate table are out of redesign scope.

Permanent bans: src/lib/compliance/rules.ts and check.ts; service.server.ts unions DB rules with the bundled baseline; migrations/0011_compliance.sql locks rule rows and migrations/0012_product_compliance.sql prevents non-ok products being published. market/handlers.server.ts screens writes and public reads; search/index.ts screens suggestions; catalog.ts refuses prohibited outbound search links; AI screens results. Existing tests cover these paths. Step 4 adds explicit tobacco/vape/alcohol/non-halal listing + search regression coverage.

| Route | File / renderer |
|---|---|
| / | src/routes/index.tsx → components/bazaar-page.tsx (new home presentation will retain the existing service choice) |
| /stores, cat/fav/who/q | routes/stores.tsx + stores.index.tsx → components/bazaar-page.tsx |
| /stores/request?store=otto&intent=buy or ship | routes/stores.request.tsx |
| /quote | routes/quote.tsx → components/quote-panel.tsx |
| /market | routes/market.tsx + market.index.tsx; details market.$slug.tsx, selling market.sell.tsx |
| /ai | routes/ai.tsx → components/ai-page.tsx |
| /impressum, /privacy, /terms | matching routes → components/legal-page.tsx |
| /track, /move, /contact, /customs, /prohibited-items | corresponding src/routes files; keep working |
| /request, /account, /account/$ref, /admin | corresponding src/routes files; keep working |
| /_design (new) | escaped literal route filename; noindex and robots disallow, never in sitemap |

| Step | Planned files |
|---|---|
| 1 | styles.css, new styles/tokens.css and design-system.css, fonts + licenses, components/ui.tsx, lib/redesign-copy.ts, lib/theme.tsx, i18n.tsx, routes/__root.tsx, literal /_design route, robots.txt.ts, generated route tree, token/layout checks |
| 2 | shell.tsx, new site-header/mega-menu/navigation config, search-box.tsx, lang-picker.tsx, redesign-copy.ts, design-system.css |
| 3 | new premium-home.tsx and site-footer.tsx, bazaar-page.tsx home rendering, hero/category data config, redesign-copy.ts, design-system.css |
| 4 | bazaar-page.tsx, bazaar-search.ts (additive filter params), shared catalogue presentation/filter helper, stores.request.tsx styling, styles/copy, compliance regression test and npm test list |
| 5 | quote-panel.tsx, quote.tsx, market.index.tsx, ai-page.tsx, legal-page.tsx, shared styles/copy; no API or pricing formula changes |
| 6 | images/assets only as needed, seo.ts, sitemap/robots, root metadata and locale handling, browser verification scripts/tests, layout geometry and current baselines as needed, final report |

Risks: production /request and /market currently show unavailable/error states, so redesign cannot claim those services are operational. Protected workflows cannot be validated with real customer data here. Previous code audit identified backend defects; those remain outside this presentation change. The logo remains byte-for-byte unchanged. Filters can only use catalogue fields. No unsupported delivery deadlines, fake discounts or partner claims will be added. Dark mode must cover legacy surfaces as well as new components. Changing the old forced-LTR chrome requires fresh RTL checks on forms, menus and price isolation. Lighthouse scores must be measured on the production build, not claimed from code inspection. Existing CI Node 22 is used for tests because Node 24 currently exposes an unrelated AI stream incompatibility.

Fresh pre-redesign captures (2026-10-10): /workspace/rega-redesign/before/01-home-viewport.png, 02-stores-viewport.png, 03-quote-viewport.png. Home: navigation and service entry points exist, but the headline does not explain shopping and shipping together; trust claims need to be tied to actual process. Stores: samples and real store links share the page; improve separation and keep the non-partnership note beside logos. Quote: the existing calculator is the correct reuse target; improve input hierarchy and make both currencies and weight explanation easier to scan. Screenshots cannot establish full accessibility or authenticated workflow correctness.

Validation passed: lint (0 errors, 3 pre-existing warnings), typecheck, npm test under Node 22 (382 passed, 4 skipped) and build with DATABASE_URL empty. Log: /workspace/rega-redesign/step-0-checks.log. No production migration or deploy. Code inventory: /workspace/rega-redesign/code-inventory.json (242 source/config/test/migration files).

How to inspect the unchanged baseline: http://localhost:8080/ · http://localhost:8080/stores?cat=beauty · http://localhost:8080/stores?fav=1 · http://localhost:8080/stores/request?store=otto&intent=buy · http://localhost:8080/stores/request?store=otto&intent=ship · http://localhost:8080/quote?from=ber&to=ebl&kg=3.2 · http://localhost:8080/market · http://localhost:8080/ai · http://localhost:8080/impressum · http://localhost:8080/privacy · http://localhost:8080/terms. Same public paths exist at https://cargo.regaplatform.com.
