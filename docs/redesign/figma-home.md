# Figma home concept — implementation report

Source: Figma file "R&L Cargo — Global Shopping + Delivery UX Concept"
(`s0oZjiB9l12dAuEkPXVFyu`), page 1, frame `1:2` "R&L Cargo — Mobile Home Concept" (390×844).
Access was read-only (View seat), so nothing was changed in Figma; the design was read through
the Figma MCP (`get_metadata`, `get_design_context`) and implemented in code.

## What was taken from the concept

| Figma node | Implementation |
|---|---|
| Top brand header 1:3, search bar 1:6 | Already present (`site-header.tsx`): official logo and the existing search. The concept's text "R&L" wordmark is **not** used; the logo stays unmodified. |
| Hero 1:8 (red card, white title, white "Explore" button 1:11) | `.rl-ai-hero-inner` is now a brand-red card inside the page gutter. White title/subtitle, white primary button with red type, white-outlined secondaries, white badge. Same markup, copy, links and AI flag logic as before. |
| Your parcels 1:31 | New `.rl-track-card` after the hero: icon tile, existing i18n strings `trackKicker`/`trackTitle`/`trackButton`, link to `/track`. |
| Bottom navigation 1:39 | Already present (`rl-bottom-nav`) with the active tab in brand red. Tabs unchanged. |

## Deliberately not taken (hard rules / owner decisions)

- **Fake parcel data.** The concept's "Package #RL-2026-104 · In transit • Arriving soon" and the
  65% progress bar are invented data and a delivery promise (hard rule 1). The card shows no
  number, status or progress; real data exists only on `/track` for a real shipment number. A
  layout test asserts this.
- **"Explore" category tiles 1:13–1:29.** Commit 2d02a7d moved the category list to one place,
  the marketplace (`/stores`). Re-adding it to the home page would reverse that decision, so it
  waits for the owner.
- **Colour #c8192e / radius 20px.** The brand red stays `--rl-brand` (#dd0303, sampled from the
  logo) and cards keep the 16px card radius from the design-system rules.
- **Start-aligned hero text.** The hero stays centred: the layout lock requires the same
  position in every language.
- **Bottom tab "Track".** The current tabs are unchanged; `/track` is reached from the new card
  and the menu.

## Changed files

- `src/components/premium-home.tsx` — card wrapper and track entry.
- `src/styles/tokens.css` — `--rl-hero-card`, `--rl-on-hero`, `--rl-hero-ink`, `--rl-track-icon`.
- `src/styles/design-system.css` — hero card, on-card buttons, track card.
- `tests/layout/premium.spec.ts` — track card test; baselines re-rendered.

## Test URLs

- http://localhost:8788/?lang=ckb
- http://localhost:8788/?lang=ar
- http://localhost:8788/?lang=en
- http://localhost:8788/track?lang=ckb

Check at 360px and desktop, in light and dark mode.
