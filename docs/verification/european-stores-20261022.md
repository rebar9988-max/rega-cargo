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

## Bring For Me boundary (reported, not changed)

Bring For Me accepts product links only from `STORES` hosts (`lib/orders/store-request.ts`). Adding
the storefronts to `STORES` would also change Bring For Me validation, the global header search
and the R&L AI shop-name filter, which the brief puts out of scope. So storefront cards offer the
official site and an honest note ("Bring For Me is not available for this storefront yet");
German stores keep their Bring For Me action. **Owner decision needed** to enable Bring For Me for
CH/IT/FR/GB storefronts (add them to `STORES`, review search/AI side-effects, customs from CH/GB).

## Design (existing tokens only)

Country chips and the retailer rail are single rows that scroll sideways on narrow screens; rail
items are logo-only buttons (official wordmark, name as accessible label, `aria-pressed`). Cards:
48 px logo tile with `object-fit: contain` (logo ≤ 28 px high), name, country · host, two-line
categories, official-site secondary button, one primary Bring For Me action. Store grid 2 / 3 / 4
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
