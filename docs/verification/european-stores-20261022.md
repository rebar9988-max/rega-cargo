# European stores directory and official-site handoff — 2026-10-22

Owner brief "R&L MARKETPLACE FINAL REFINEMENT — Premium European Stores & Hybrid Smart Browser"
(chat, 2026-10-22). Scope: the existing `/stores` directory (`components/bazaar-page.tsx`,
`lib/stores.ts`, `lib/bazaar-listing.ts`, marketplace CSS) only. Branch
`claude/european-stores-directory-20261022`.

## Audit (before any change)

| Capability | State found on `main` @ `53d863c` | Action |
|---|---|---|
| Retailer directory | 11 stores in `STORES` (10 DE + SHEIN as `INT`); cards with logo, heart, country, host link, categories, notes, Bring For Me | refined |
| Country filter | select with `DE` / `INT` only | replaced by a chip row DE, CH, IT, FR, GB |
| Retailer filter | select of 11 names | replaced by a rail of small official logos |
| Search | header search (`Shell`) bound to `?q=` | kept, no second search bar |
| Category / audience / favourites | category select, audience chips, favourites chip, clear | kept |
| Active-filter indicators | none | added (removable chips + reset) |
| Filter state | URL search params (`replace: true`) | kept; verified through Bring For Me and back |
| Official-site handoff | host text link, `target=_blank rel=noreferrer` | official-site button, `rel="noopener noreferrer"`, return note |
| Embedded browser | none | not added (no iframe, no simulated checkout) |
| Promotional/featured stores | none | none added (brief: only if one already exists) |

## Countries and storefronts

`EUROPEAN_COUNTRIES = DE, CH, IT, FR, GB`. SHEIN (`INT`) stays in `STORES`, so Bring For Me,
search and R&L AI are unchanged; it is not listed in this directory. No China/US store exists.

Country storefronts of retailers already listed (no new brand, logo or partnership claim). Each
URL was opened on its official site on 2026-10-22 (Firecrawl, HTTP 200, title of the retailer's
own site):

| Country | Storefronts |
|---|---|
| CH | zalando.ch, decathlon.ch (`/en`), ebay.ch |
| IT | amazon.it, zalando.it, ebay.it, decathlon.it, sephora.it, douglas.it (`/it`) |
| FR | amazon.fr, zalando.fr, ebay.fr, decathlon.fr, sephora.fr |
| GB | amazon.co.uk, zalando.co.uk, ebay.co.uk, decathlon.co.uk, sephora.co.uk |

Not listed because not verified: amazon.ch (no Swiss storefront), sephora.ch, douglas.ch/.fr,
dm/Rossmann/OTTO outside Germany, idealo outside Germany.

## Bring For Me for all five countries (owner instruction, 2026-10-22, second brief)

First pass kept the storefronts outside `STORES` and showed an honest "not available yet" note,
because Bring For Me validates product links against `STORES`. The owner then explicitly
authorized enabling the existing Bring For Me for supported stores in DE, CH, IT, FR and GB.
Implementation reuses the existing validator: `BRING_FOR_ME_STORES = STORES + REGIONAL_STOREFRONTS`
is what `lib/orders/store-request.ts` checks, so `zalando-it` accepts only `zalando.it` links,
unknown store ids are refused and hosts outside the five countries (e.g. amazon.com, amazon.cn,
zalando.pl) stay refused. `STORES` itself — header search and the R&L AI shop-name filter — is
unchanged. No retailer API, no purchase promise: the request is still reviewed before any price
or purchase is confirmed, as before.

## Design (existing tokens only)

Country chips and the retailer rail are single rows that scroll sideways on narrow screens; rail
items are logo-only buttons (official wordmark, name as accessible label, `aria-pressed`). Cards:
48 px logo tile with `object-fit: contain` (logo ≤ 28 px high), name, country · host, two-line
categories, official-site secondary button, one primary Bring For Me action on every card. Store grid 2 / 3 / 4
columns (phone / tablet / ≥1024 px beside the sidebar); layout lock `storeColumns` added.
Coming back from an official site (visibilitychange/pageshow, `sessionStorage`, this tab only)
shows one dismissible card offering Bring For Me for that store; nothing about the external
visit is claimed.

## Local gate (this session)

- `npm run typecheck` pass; `npm run lint` 0 errors (4 existing warnings); `npm test` 254 + 504
  tests, 0 failures, 4 existing skips (5 new directory tests).
- Playwright, local Chromium (not the official image), `--ignore-snapshots`: premium-360 and all
  six Chromium layout projects — 469 passed, 12 skipped, 0 failed. New tests: five countries,
  no SHEIN/CN/US, country filtering in place, https `noopener noreferrer` official links, honest
  storefront note, removable active filters and reset, keyboard rail, popup handoff → return
  card → Bring For Me → back restores filters; 320/360/390/430 px × ckb/ar/en with no
  horizontal overflow, logos ≤ 28 px and contained, 2 columns, 44 px targets.
- Screenshot baselines for `/stores` change by design and must be re-rendered in the official
  Playwright image. The `update_baselines` dispatch renders them into the `layout-report`
  artifact, but the agent sandbox cannot download Actions artifacts (blob host refused), and a
  temporary commit-back workflow was refused by the session's permission policy. **Blocker:** the
  owner commits `tests/layout/__screenshots__/**/stores-*.png` from that artifact, or explicitly
  authorizes another route. Until then `layout lock` fails only on `/stores` pixel diffs.

Hosted gate, merge, Cloudflare build and production verification: see progress.md / the PR.

## Release and production verification (2026-10-22)

- PR #150 squash-merged as **`d26efeb`** (`main`), 17:33 UTC, after the full gate on head `a6dc806`
  (run 39821232416): `scope` ✓, `verify` ✓ (identity guard, typecheck, unit tests, lint, build,
  wrangler dry-run), `layout lock` ✓ 720 passed / 16 skipped / 0 failed (Chromium, WebKit,
  Firefox), `Workers Builds` ✓. Merged diff: 44 files, no workflow or generated-route change.
- `main` @ `d26efeb` (run 39823755324): `scope`, `verify`, `layout lock` all success.
- Production: Cloudflare Workers Builds `a5e35c83-a0e8-4110-991c-1acb74aeb90c` on `d26efeb`
  succeeded (main builds deploy). The check output carries no version ID and the agent has no
  Workers deployments API, so the active version/allocation is not stated; the live HTML below
  is served by the new code.
- Live checks (real browser via Firecrawl, `maxAge: 0`; the sandbox proxy refuses rlgo.net):
  - `/stores?lang=en&country=IT` 200, `<html lang="en" dir="rtl">`: country chips, retailer rail,
    `data-layout-cols="stores"` grid, active-filter chip; cards amazon-it, zalando-it, ebay-it,
    decathlon-it, sephora-it, douglas-it, each with an official link
    (`target=_blank rel="noopener noreferrer"`, `https://www.<host>.it/`) and a Bring For Me link
    `store=<id>&intent=buy`; no SHEIN card.
  - Screenshots: ckb mobile 390 (header, hero, bottom nav unchanged; chips + rail), ar mobile
    `country=GB` full page (5 UK storefront cards, 2 columns, no overflow), en desktop 1440
    `country=DE` (10 retailer logos, 4-column cards, active "Germany" chip + Reset).
  - `/stores/request?store=zalando-it&intent=buy&lang=ckb` 200, shows "Zalando · zalando.it".
  - `/` (ckb mobile) unchanged reference homepage.
- Not verifiable from this session: browser console/network logs on production (no direct
  browser access); covered by the CI browser suites (Chromium/WebKit/Firefox) on the merged head.

