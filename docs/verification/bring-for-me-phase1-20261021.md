# Bring For Me — Phase 1 (order by link + automatic cost estimate)

Date: 2026-10-21 · Branch `claude/bring-for-me-phase1-20261020` · **Draft PR, not merged, not deployed.**
Scope: server side only. No visual file was created or changed (no CSS, Tailwind class, component, route, icon, colour, logo or layout). Marketplace, Delivery/Tracking, R&L AI, the homepage, `corridor.ts` pricing and the existing `productLinkCheck` are untouched. Nothing creates an order, takes a payment or contacts a store.

## What was added

| Area | Files |
|---|---|
| Quote engine (pure, tested) | `src/lib/orders/quote/{constants,calc,settings}.ts` |
| Link import safety | `src/lib/product-link/{ssrf,http1,safe-fetch,extract}.ts`, `dns.server.ts` (Cloudflare DoH), `transport.server.ts` (`cloudflare:sockets`, verified-IP pinning) |
| Import / cart / quote / settings / admin | `src/lib/orders/quote/{import,cart,quote,settings}.server.ts`, `proof.ts`, `screening.ts`, `store-match.ts`, `input.ts`, `errors.ts` |
| Endpoints | `src/lib/orders/quote/api.ts` (+ `handlers.server.ts` wiring) |
| Database | `migrations/0019_bring_for_me_phase1.sql` (additive only) |
| Tests | `calc`, `ssrf`, `safe-fetch` (http1 + DoH), `extract` (saved sample pages in `src/lib/product-link/fixtures/`), `proof`, `screening`, `bfm.e2e` (all migrations + Postgres) |

## Rules that are enforced in code

- **Money**: BigInt integer arithmetic only; product price stays in its source currency (USD, EUR, TRY, GBP) in minor units; exchange rate is a setting stored as micro-IQD (1 unit × 1,000,000) and snapshotted; line items and customs rounded half-up per line; chargeable weight = max(actual, L×W×H/divisor), summed per shipment, rounded half-up to 0.1 kg; freight = kg × zone rate with a minimum per shipment; total rounded **up** to the next 250 IQD; never negative. All freight/fee/delivery/coupon amounts are whole IQD.
- **No invented business numbers**: only two keys have a code default (volumetric divisor 5000, free-delivery basis `after_discount`). `cartQuote` refuses and lists the missing setting keys; no total is returned.
- **Settings**: SUPER_ADMIN only (read from `user_roles` on every call); every change is written to `bfm_settings_history` by a database trigger (old value, new value, revision, actor, time); rows are never deleted (clearing sets NULL); optimistic revision check.
- **Quote**: estimate only; version, expiry (validity hours setting), destination governorate chosen by the customer, breakdown, rates used, settings snapshot with revisions, items snapshot with provenance, approval status (`pending` until R&L staff records a review). Snapshots are immutable (trigger); identical input returns the stored quote.
- **Cart**: one shipment per cart; limits enforced and returned: 30 lines, 50 pieces, 5 different stores, 20 per line, 70 kg per item and 70 kg chargeable per shipment, 2 m per dimension. Server recomputes everything; a client-supplied price is trusted only through the server-signed import proof (HMAC, 30 min, domain-separated); otherwise the item is stored as customer-typed (`manual`) or `imported_edited`. Customer confirmation (`confirmed: true`) is mandatory. Removal is a soft delete.
- **Link import**: one `https` URL, default port, no credentials, no IP literal, no internal names; DNS through Cloudflare DoH, every answer must be public (IPv4/IPv6 reserved, mapped, NAT64, 6to4, Teredo, documentation ranges refused; one bad answer refuses the host); the TCP/TLS connection goes to the verified IP itself (`startTls` with the host as expected name) so the checked IP is the used IP; **fail-closed** when sockets are unavailable; every redirect re-validated and re-resolved (max 3); 1 MiB body, 16 KiB headers, 8 s total, `identity` encoding only, HTML only. 401/403/429, captcha/bot walls and every fetch problem give `needs_manual` (no retry, no bypass, honest fixed User-Agent). 10-minute cache; per-user and per-IP rate limits (`bfm-import-user`, `bfm-import-ip`). Extraction order JSON-LD → OpenGraph/product:price → microdata; prices parsed as exact decimal strings; ambiguous prices (several offers, `1.299`), unsupported currencies, unsafe image URLs and markup are dropped, never guessed.
- **Prohibited products**: the marketplace compliance engine is reused unchanged (bundled + owner-locked DB keywords, same normalisation). Title, the page's category/breadcrumbs, options, customer category and URL path/query are checked (host names are not). Blocked ⇒ rejected, nothing stored, nothing cached except a bare refusal, nothing shown; only time/category/domain go to `compliance_audit_log`. Unclassifiable (`general`, `food`, review keywords, title < 3 characters) ⇒ `needs_review`: can sit in the cart, cannot be quoted until a SUPER_ADMIN approves; rejecting a review removes it.

## Endpoints (TanStack server functions, signed-in customer unless stated)

`bfmReference` (stores, governorates, limits) · `bfmImportLink {url}` · `bfmCartGet` · `bfmCartAdd {url, title, price, currency, quantity, category, options?, weightKg?, lengthCm?, widthCm?, heightCm?, proof?, confirmed:true}` · `bfmCartSetQuantity` · `bfmCartRemove` · `bfmCartSetDestination {governorate}` · `bfmCartSetCoupon {code}` · `bfmCartQuote` · `bfmQuoteGet {quoteId}` · SUPER_ADMIN: `bfmAdminSettings`, `bfmAdminSetSettings {entries:[{key,value,expectedRevision?}]}`, `bfmAdminSettingsHistory`, `bfmAdminCoupons`, `bfmAdminCouponCreate`, `bfmAdminCouponDeactivate`, `bfmAdminReviewQueue`, `bfmAdminReviewDecide` · R&L staff: `bfmStaffQuoteDecide`. Errors are `{ error: "<code>" }` (`invalid`+`field`, `rate`, `forbidden`, `notfound`, `prohibited`, `conflict`, `unsafe_url`, `limit`+`limit`, `review_pending`, `missing_settings`+`detail.missing`, `unavailable`).

## Tests actually run (2026-10-21)

- `node --experimental-strip-types --test` on the pure suites: **131 new passing** (calc 44, ssrf 20, http1/safe-fetch/DoH 25, extract 15, screening 23, proof 4) plus the existing `product-link`, `compliance/check`, `quote-token`, `orders/store-request`, `corridor` suites unchanged and passing.
- `bfm.e2e.test.ts`: **37/37 passing** against PostgreSQL 16 with migrations 0001–0019 applied. It was run through a local, uncommitted shim (a Bun Postgres driver standing in for `@electric-sql/pglite`) because the npm registry is unreachable from this sandbox; in CI it uses PGLite like the other e2e files. PGLite compatibility of migration 0019 is therefore **not yet proven**.
- Migration 0019 applied twice to a PostgreSQL 16 cluster (idempotent); triggers and constraints checked with direct SQL (immutable history/audit/quote snapshots, no delete, value/key/currency/quantity checks, coupon checks).
- `tsc 6.0.3` over the new modules and tests with stubs for missing packages: no errors in the new code (remaining reports are only about the sandbox lacking `node_modules`).

**Not run (environment limitation, not a code failure):** `npm ci` (registry denied), the repository `npm run typecheck` / `npm run lint` (project ESLint plugins missing) / `npm run build` / `npm run cf:dry-run`, PGLite-backed tests, Playwright, GitHub Actions (also billing-blocked, I-7). `api.ts` / `handlers.server.ts` follow the existing `createServerFn` pattern but have not been type-checked against TanStack types.

## Migration risks

Additive: 9 new tables, 3 functions, 5 triggers, 1 seed (6 stores). Nothing existing is altered. Triggers make audit/history/quote rows append-only, so test data cannot be cleaned up with `delete` in production. No FK to `user` tables (matches the repo convention). `main` auto-migrates on deploy: do not merge until CI is green.

## Missing settings (owner must fill before any quote works)

All of: exchange rates `fx.USD|EUR|TRY|GBP`; `freight.kurdistan_per_kg_iqd`, `freight.rest_of_iraq_per_kg_iqd`, `freight.minimum_iqd`; `customs_bp.<category>` (11); `fee.rl_iqd`; for each of the 19 governorates `delivery.<id>.zone` and `delivery.<id>.fee_iqd`; `free_delivery.threshold_iqd`; `quote.validity_hours`; `estimate.<category>.{weight_g,length_mm,width_mm,height_mm}` (11 × 4) — the last group is only required when a cart item has no weight/size. Production has no approved SUPER_ADMIN yet ([first-owner](first-owner-20261019.md)), so nobody can fill them until owner activation completes.

## UI hook-up needed (not done; visual work is out of scope)

Link-paste + confirm screen; cart screen grouped by store (quantity, remove, needs-review badge); destination (governorate) picker with Sorani labels (server sends English names); coupon field; quote screen (breakdown, "estimate only", expiry, free-delivery progress bar from `freeDelivery`); limit and rejection messages (Sorani); owner screens for settings, coupons and the review queue.

## Known limits and notes

- Workers cannot open sockets to Cloudflare-proxied sites; those stores fall back to `needs_manual` (by design, fail-closed). Amazon/Zara/etc. results depend on their anti-bot behaviour.
- Stores outside the seeded list are accepted as "unknown store" (key = host); only the six seeded stores are `known`.
- Governorate → freight zone mapping is an owner setting (e.g. Kirkuk, Halabja).
- Import cache rows are overwritten, never deleted (no cleanup job).
- `general` category and `food` always need owner review.
- Existing corridor pricing (`/quote`) and these owner-editable rates coexist; Phase 1 does not merge them.
