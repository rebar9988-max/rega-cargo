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

Baseline review (old `main` vs new, all 54 files): the header, page header and toolbar are
pixel-identical down to the retailer rail (first changed row 655–742 px on `/stores`); footers
differ only by sub-pixel text offset (differences disappear under a 1 px blur). `/stores` pages
grow by 63–232 px (two-line meta), request pages change by −38 to +27 px.

## Hosted gate, merge and release

Recorded in the PR description and progress.md / deployments.md once they happen.
