# Dedicated shipping and bazaar pages

2026-10-12 · [PR #72](https://github.com/rebar9988-max/rega-cargo/pull/72) · branch `claude/separate-shipping-bazaar` · merged as `3c7ad5a`, deployed as `12dcd05e`.

## Behavior

The homepage previously mounted `QuotePanel` regardless of the Bazaar/Delivery chip choice; a saved delivery preference could also replace the store catalogue with `DeliveryHub`. Shipping now lives on `/quote` in `components/shipping-page.tsx`. `/stores` renders only `components/bazaar-page.tsx`; filtered home URLs remain supported. Home keeps navigation to both services, without a calculator, service switch or parcel-tracking panel.

Shipping has numbered route/package/options sections, a separate responsive stylesheet, a two-column desktop layout with a sticky input card, and stacked mobile cards. Chargeable-weight totals remain visible, with the detailed explanation in an accessible disclosure. Tracking is linked from the shipping page. Existing pricing, booking APIs, prohibited-items declaration, EUR/IQD formatting, URL inputs and local saved quotes are preserved. No dependencies, logo assets or backend configuration changed.

## Verification

Run in `mcr.microsoft.com/playwright:v1.63.0-noble` with Node 22.23.3:

- `npm run typecheck`: passed.
- `npm test`: 417 passed, 4 skipped, 0 failed (211 script tests + 210 TypeScript tests).
- `npm run lint`: 0 errors, 5 existing warnings.
- `DATABASE_URL='' npm run build`: passed; production migrations skipped.
- `npm run cf:dry-run`: passed; no deployment.
- Focused browser checks: 5 passed, including separation with saved service preferences, parameter restoration, rate recalculation, saved-quote persistence/removal, invalid dimensions and mobile form geometry.
- Affected screenshot baselines re-rendered in the official image: 123 passed, 12 expected menu skips.
- Full Chromium/WebKit layout and screenshot suite: 386 passed, 12 expected menu skips, 0 failed (6.9 minutes); includes the 360px light/dark ckb/ar/en checks.

The initial host Node 24 run hit the repository's known AI ReadableStream test failure. The authoritative Node 22 run passed; no AI code was changed.

Test URLs (local Worker on `http://localhost:8788`): `/`, `/?cat=fashion`, `/stores`, `/stores?fav=1`, `/quote?lang=en&l=60&w=30&h=20&kg=3.2`, and all required routes in `tests/layout/premium.spec.ts`, in light/dark ckb/ar/en.

Visual references: [mobile](../../tests/layout/__screenshots__/chromium-iphone/quote-ckb.png) · [desktop](../../tests/layout/__screenshots__/chromium-laptop/quote-ckb.png).

GitHub Actions remains blocked by account billing (latest main check-run annotation verified 2026-10-12). New labels in `lib/shipping-copy.ts` cover all seven existing locales and carry a native-translation-review TODO. Booking/tracking backend availability remains subject to the existing database/auth issues. Owner explicitly approved merge and production deployment on 2026-10-12. Publication completed successfully at 19:05 UTC.

## Release validation after updating from main

Combined with `main` @ `0b19931` (including PR #75 Nitro 3.0.260903-beta and PR #77 CI changes). Merge conflicts were documentation-only; the staging-only I-9 is preserved and shipping separation is tracked as I-10. On the combined source, the official-image/Node 22 gate passed again: typecheck, 417 tests (4 skipped), lint (0 errors, 5 existing warnings), build with migrations skipped, fresh cf dry-run, and all 386 browser/layout/screenshot checks (12 expected menu skips, 6.8 minutes). Assets were uploaded to the existing `rega-cargo` Worker; secrets and domain routing are preserved.

## Production release

- PR #72 merged as `3c7ad5ac115ac0496d63fb0b6d003ddb1a2988b0`.
- Worker version `12dcd05e-a5ee-4b77-8a1d-04d84f01f0d4` (68), deployment `f418d675-cd5b-4257-9c29-a813857fe9e8`, 100% traffic at 2026-10-12 19:05 UTC.
- Published through the connected Cloudflare API. Assets used scoped upload-session credentials passed through hidden stdin, never logged or persisted; Worker metadata retained all three existing secrets and the original Durable Object namespace/migration tag. Domain routing and backend configuration were preserved.
- Production HTTP: 15 public routes and all 24 asset URLs referenced by `/quote` return 200 (following normal redirects). Home/catalogue DOM contains no shipping calculator/options, including with the legacy delivery cookie.
- Production browser: 42 checks passed in Chromium and WebKit at 360px, ckb/ar/en, light/dark; Chromium desktop ckb at 1280px in both themes. No horizontal overflow or page errors, dimensions share one row, three rate cards render, and changing length to 60 recalculates the live rate to €56.16. No booking or record-creating form submission was performed.
- Rollback version: `4242774e-e1c5-4a77-b275-5fc1d2d3329e`.
- Existing database/auth issues remain outside this presentation change. CI remains blocked by account billing; all recorded gate results are local, not hosted CI.
