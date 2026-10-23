# Marketplace refinement (existing UX audit) — 2026-10-22

Owner brief "R&L MARKETPLACE — EXISTING UX AUDIT & PREMIUM REFINEMENT" (chat, 2026-10-22, with a
reference screen recording of a large retailer's mobile shopping flow, used for usability
patterns only). Rule of the brief: **refine, never rebuild** — audit, fix verified issues in the
existing code, keep every journey, route, data model, colour, font, logo, header, hero, footer
and the homepage. Branch `claude/marketplace-refinement-20261022`, PR #152, based on `main`
@ `499b48d` (includes PR #150 and #151).

The brief explicitly asks for spacing, card, logo, button and hierarchy refinements of the
Marketplace. That is the owner's explicit approval for a visual change in this scope; the
permanent "Modern Web Guidance: non-visual technical scope only" rule is unchanged and the
`modern-web-guidance` skill was not used for these visual changes.

## Audit (before any change)

Evidence: the committed official-image baselines of `main` (`tests/layout/__screenshots__`,
`stores-*` and `stores-request-*`, 9 device projects × ckb/ar/en) and the source. The sandbox
could not install packages (npm registry outside this session's egress allowlist) or reach
`www.rlgo.net`, so builds and browser runs happened in GitHub Actions (official Playwright
image) — see "How it was rendered".

| # | Finding (verified) | Where |
|---|---|---|
| 1 | Retailer logos have very different optical sizes: one fixed height for wordmarks with aspect ratios 1.5 (dm) to 7.7 (Sephora) made dm ≈ 36×24 px and Sephora ≈ 80×10 px; rail tiles had different widths | `/stores` retailer rail, store cards |
| 2 | Store cards did not line up: "country · host" wrapped to two lines on some cards (e.g. 4-column laptop grid, long country names) and categories took one or two lines, so names, meta and buttons sat at different heights in one row | `/stores` store grid |
| 3 | The two quiet links under the buttons had different styles and alignment ("I already bought it" centred and not underlined, "External store" start-aligned and underlined) | store cards |
| 4 | Request form: the chosen store was one muted text line without its logo (in RTL WebKit it read "zalando.de · Zalando"); the buy / "I bought it myself" switch wrapped into two uneven pills; the sent state mixed a system button with an ad-hoc pill link | `/stores/request` |

Checked and kept as is (working, or a product decision): header, hero, category strip, footer,
homepage, country chips, active filters, favourites, filter sheet/sidebar, catalogue examples,
empty state (`rl-empty-state` with reset), loading skeletons, official-site handoff and return
card, Bring For Me links and validation, partner notes (hard rule 2), all copy and i18n.

## Changes (existing tokens and components only)

1. **Even logos.** `STORE_LOGO_RATIO` (viewBox ratios, checked against the SVG files) and
   `storeLogoSize()` in `src/lib/stores.ts`: every logo gets about the same area inside a
   maximum box at its own proportions (rail 900 px² in 76×24, cards 1100 px² in 88×28), set as
   `width`/`height` attributes (no layout shift). Rail tiles have one size (6 rem × 48 px).
2. **Aligned cards.** Country and host are two fixed single lines (ellipsis only as a guard);
   categories reserve two lines; both lines align by the card's direction (RTL host fix).
3. **Quiet links.** One hairline, then both links in the same underlined, centred style with
   44 px targets.
4. **Request form.** Store row with the same logo tile, name and host; the switch is two equal
   halves; sent state: status icon (existing `--rl-success` token), reference, then Track
   (primary) and Back to stores (secondary) as system buttons. No copy, payload or validation
   change.

Files: `src/lib/stores.ts`, `src/components/bazaar-page.tsx`, `src/routes/stores.request.tsx`,
`src/styles/design-system.css`, tests `src/lib/directory.test.ts`,
`tests/layout/premium.spec.ts`, and the 54 re-rendered `stores-*` / `stores-request-*`
baselines.

## Tests added

- `directory.test.ts`: every logo ratio matches its SVG viewBox; every directory logo fits its
  box, keeps its proportions, and unclamped logos share one area.
- `premium.spec.ts` (Chromium premium-360 and Firefox): equal rail tiles, logo height ≤ 24 px,
  equal logo area, contained, ≥ 44 px targets (360/390/820/1280 px × ckb/ar/en); store cards
  in a row share name, meta, meta height, official-site and Bring For Me positions, meta is two
  single lines, the host is never cut off and both lines share their start edge
  (360/820/1280/1440 px × ckb/ar/en); request page shows the store logo and host with a shared
  edge, two equal switch halves on one row, ≥ 44 px, no overflow (320/390/1280 px × ckb/ar/en,
  a German and a French storefront).

## How it was rendered

Same route as PR #150: a temporary workflow on the PR branch (removed before merge) built the
app in the official Playwright image, ran the `layout.spec.ts` page tests for `/stores` and
`/stores/request` on all 9 screenshot projects (geometry assertions first, then
`--update-snapshots=all`), took unmasked review screenshots, ran typecheck, lint and the
store browser tests (report only), and committed exactly the 54 baselines and the review shots
back. Three renders: (1) first version; (2) two-line meta after the review showed truncated
hosts on phones ("Germany · rossmann…"); (3) RTL alignment fix after the review showed the LTR
host aligned to the other edge in ckb/ar. In render 3 typecheck and lint passed, and the store
browser tests passed except one assertion bug in the new request test (`boundingBox().top` →
`.y`), fixed before the hosted gate. Review shots and the workflow were then deleted.

First hosted gate (run 39860755467): `scope` ✓, `verify` ✓, `layout lock` 724 passed / 16
skipped / 2 failed — both the new request-switch test in Chromium and Firefox at 320 px ckb:
one label wrapped, and `.rl-row`'s `align-items: center` set the shorter half 8.5 px lower.
Fixed (`.rl-intent-switch { align-items: stretch }`, equal-height assertion added) and render 4
re-rendered the baselines (4 PNGs changed by a few bytes); its report-only run passed the 12
store browser tests and all 54 page renders. The workflow was removed again.

Baseline review (old `main` vs new, all 54 files): the header, page header and toolbar are
pixel-identical down to the retailer rail (first changed row 655–742 px on `/stores`); footers
differ only by sub-pixel text offset (differences disappear under a 1 px blur). `/stores` pages
grow by 63–232 px (two-line meta), request pages change by −38 to +27 px.

## Hosted gate, merge and release

- Final PR head `267f537` (run 39863179609): `scope` ✓, `verify` ✓ (identity guard, typecheck,
  unit tests, lint, build, wrangler dry-run), `layout lock` ✓ 726 passed / 16 skipped (existing)
  / 0 failed in Chromium, WebKit and Firefox, `Workers Builds: rega-cargo` ✓.
- Squash-merged as **`30011be`** (`main`). `main` run: `scope`, `verify`, `layout lock`
  (726/16/0) all success.
- Cloudflare Workers Build `3c949399-f21a-4760-a537-b0aca02212fa` on `30011be` succeeded, Version
  ID `3cb56beb-8826-4e83-908b-04cf52cdcfb4`. Active-at-100% is not stated (the Cloudflare
  connector available here returns no deployments).
- Live (Firecrawl real browser, `maxAge: 0`; the sandbox proxy refuses rlgo.net):
  `/stores?lang=en&country=DE` 200, `<html lang="en" dir="rtl">`, rail logos at the normalised
  sizes (amazon 55×16, otto 49×18, ebay 47×19, zalando 70×13, dm 36×24, rossmann 76×11,
  douglas 70×13, sephora 76×10, decathlon 67×13, idealo 62×14), store meta
  `<span>Germany</span><bdi dir="ltr">amazon.de</bdi>`; `/stores/request?store=zalando-it&intent=buy&lang=ckb`
  200 with the store row (zalando logo 78×14, "Zalando" / "zalando.it") and
  `nav.rl-intent-switch`.
- Not verified from this session: real-phone rendering, production console logs, the active
  version allocation. Rollback pointer: `main` `499b48d`.

## Follow-up after production verification (2026-10-23, branch `claude/marketplace-logo-tile-20261023`)

A read-only production run (temporary branch `claude/marketplace-live-verify-20261023`, never
merged, deleted afterwards) passed 30/30 checks on `www.rlgo.net` — Chromium desktop, WebKit
iPhone and iPad emulation at 320/375/390/430/820/1280/1440 px, plus Chromium and Firefox
360 px, in ckb/ar/en. Its screenshots showed one remaining issue, present before PR #152 too:
on phones the store-card logo tile shared its row with the 48 px favourite button, so the tile
was only about 34–69 px wide and long wordmarks shrank (Sephora ≈ 8 px tall at 320 px).

Fix: the logo tile spans the whole card; the favourite is a round badge (44 px target, 36 px
circle, existing surface/line tokens) in the card's top corner; card logos are at most 80 px
wide (`CARD_LOGO`, the 320 px tile is 84 px inside). A first attempt (heart on the name row)
was rejected by the tests: names such as Decathlon wrapped at 360 px and rows no longer lined
up. New test: from 320 px every card logo renders at its normalised size (≥ 10 px tall),
inside its tile, the badge keeps a 44 px target and its icon never covers the logo.

Release: PR #154 squash-merged as `9d4c476` after the hosted gate on `4e21e38` (scope, verify,
layout lock 728 passed / 16 skipped / 0 failed, Workers Builds). Cloudflare Workers Build
`5b831d60-a692-4a15-9dee-ea3f9c690796` succeeded, Version `1881b5b7-118b-4b34-a278-ddb034df74d6`.
Production run 2 (GitHub Actions run 39873759891, read-only against `https://www.rlgo.net`):
30/30 passed, including the full-size card logo and favourite-badge checks at every width;
screenshots reviewed (320 px ckb/en, 390 px ar, 1280 px ckb). Not verified: a physical phone and
the active version allocation. The throwaway branch `claude/marketplace-live-verify-20261023`
could not be deleted from the agent session (proxy policy); it is never merged and its workflow
runs only on pushes to that branch.

## Closeout (2026-10-23)

- PRs #152–#155 merged. Store-card and request code is unchanged on `main` through `8b97c45`
  (parallel PRs #156–#161 touched `/market`, empty states and docs only). Latest deployment at
  closeout: Build `1ba36f12`, Version `59ac83f1` (06:45 UTC); Cloudflare `modified_on` matches,
  and the Worker code contained the #154 changes. **Traffic allocation UNVERIFIED** (no
  deployments access from the agent).
- Final production run 3 (GitHub Actions run 39911846868, 06:30 UTC, read-only, nothing submitted):
  **59/59 passed** — Chromium desktop, WebKit iPhone and WebKit iPad (27), Chromium mobile and
  Firefox (18) at 320/375/390/430/820/1280/1440 px × ckb/ar/en: `<html dir="rtl">` with
  `data-textdir` per language, no horizontal overflow, equal rail tiles, aligned store-card
  rows, two-line meta with hosts never cut, card logos at full normalised size, favourite badge
  ≥ 44×44 px not covering the logo, request store row and equal switch; journey stores →
  country → retailer → official-site link (new tab, `noopener noreferrer`) → favourite toggle
  → Bring For Me → request page → ship switch → back keeps the filters. Plus the 7 existing
  store tests from `main` in Chromium and Firefox (14).
- Physical device: **not available** to the agent; all mobile results are browser emulation.
- Observation: Firefox puts the ellipsis of a clamped English category line at the line start
  inside the RTL card (pre-existing). A parallel session opened PR #162 for it; not changed here.
- Branch `claude/marketplace-live-verify-20261023` (temporary files only; never merged) could not
  be deleted: GitHub REST returned HTTP 403 "Write access to this GitHub API path is not
  permitted through this proxy" and `git push --delete` was disconnected. Owner deletion:
  https://github.com/rebar9988-max/rega-cargo/branches

