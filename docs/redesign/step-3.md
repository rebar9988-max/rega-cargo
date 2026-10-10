# Step 3 — Homepage

Added a manual, swipeable, keyboard-accessible two-slide hero; existing-data category tiles; a brand strip with the non-partnership notice; four process steps; warehouse, destination and shipping-restriction information; and a rich footer with contact, legal, language, theme and existing PDF links. Catalogue photographs are explicitly examples. No promotional, inventory or timing claims were invented.

The quick calculator reuses `priceShipment` and the existing origins, destinations, modes, exchange rate and validators. EUR and IQD appear together. Optional validated `l`, `w`, `h` query parameters preserve entered dimensions when opening the full calculator; existing quote parameters and API payloads remain compatible. The remembered delivery-service flow remains available.

Files: `premium-home.tsx`, `site-footer.tsx`, `bazaar-page.tsx`, `delivery-hub.tsx`, `quote-panel.tsx`, `shell.tsx`, `quote.tsx`, `quote-search.ts`, its tests, and token/component CSS.

Validation: lint, type-check, Node 22 tests (383 passed, four skipped), production build. Browser checks covered ckb/ar/en at 360px dark and 1280px light: no overflow or page errors, manual carousel, recalculation, and dimension handoff. Visual evidence: `/workspace/rega-redesign/step-3/`.

Test URLs:
- http://localhost:8080/
- http://localhost:8080/quote?from=ber&to=ebl&kg=3.2&l=60&w=30&h=20

Select Sorani, Arabic or English using the language switch and toggle appearance. Change length from 40 to 60: the three EUR values change from 37.44 / 22.08 / 18.00 to 56.16 / 33.12 / 21.15 with the current unchanged rates. Open the full calculator and confirm 60 is retained. Check category, brand disclaimer, shipping restriction and footer links; no order is submitted during these checks.
