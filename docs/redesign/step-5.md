# Step 5 — Calculator, comparison, AI and legal

Restyled full calculator cards and actual-versus-volumetric explanation with proportional bars and a formula using the existing mode divisor. Mode prices show EUR and IQD together. Removed the unsupported 'usual choice' badge; computed price comparisons and configured timing ranges remain. No pricing, booking, declaration, customs or persistence logic changed.

Comparison retains its existing query fields, loader, offers, pagination and honest unavailable/empty states, with token-based cards, filters and skeletons. AI retains status, consent, EXIF removal, upload and estimation behavior; file-input labels and disabled appearance are clearer. Legal pages have a readable measure, section links, native direction and the existing visibly pending owner details.

Files: `quote-panel.tsx`, `quote.tsx`, `market.index.tsx`, `ai-page.tsx`, `legal-page.tsx`, delivery tab styling and component CSS.

Validation: lint, type-check, Node 22 tests (384 passed, four skipped), build. Browser checks covered all six pages in ckb/ar/en at 360px and 1280px dark mode (36 combinations), with zero overflow and page errors, calculator recalculation, legal section links, and disabled AI upload without consent. No real booking, order or model call was sent. Evidence: `/workspace/rega-redesign/step-5/`.

Test URLs:
- http://localhost:8080/quote
- http://localhost:8080/market
- http://localhost:8080/ai
- http://localhost:8080/impressum
- http://localhost:8080/privacy
- http://localhost:8080/terms

On `/quote`, set length to 60: express volumetric weight becomes 7.2kg and express total €56.16 at the current default cities, weight and rates. Compare the two bars and the chargeable value. Switch locale/theme, use legal section links and inspect AI consent controls. The local market may show its existing unavailable state when its data source is unconfigured; no data is fabricated.
