# Step 4 — Marketplace and requests

Restyled catalogue examples and official-store cards, status labels, request actions, desktop hover/focus quick actions, favorites, empty states and pending skeletons. Added a desktop sidebar and native mobile bottom sheet. Category, audience, store, country, query and favorites filters synchronize with URL parameters; previous `cat`, `fav`, `who` and `q` links remain supported. Country options derive from store records.

No live store prices, inventory or second photographs exist. Price filtering is visibly disabled with an explanation; secondary photographs are omitted rather than invented. Official-store logos retain visible non-partnership notices. Request form fields, checks, server calls and payloads are unchanged.

Files: `bazaar-page.tsx`, `bazaar-listing.ts`, `bazaar-search.ts`, `stores.request.tsx`, two existing compliance test files, and token/component CSS.

Validation: lint, type-check, Node 22 tests (384 passed, four skipped), build. Added fixtures proving cigarettes, vapes, alcohol and haram food never enter catalogue listings, suggestions or outbound search links. Extended real PGLite market listing/search tests for all four families; permanent database rules remain intact. Browser checks: ckb/ar/en, 360/1280px, dark mode, combined filters, empty favorites, banned query, both request intents; zero overflow and page errors. Evidence: `/workspace/rega-redesign/step-4/`.

Test URLs:
- http://localhost:8080/stores
- http://localhost:8080/stores?cat=fashion&store=zalando
- http://localhost:8080/stores?country=INT
- http://localhost:8080/stores?fav=1
- http://localhost:8080/stores?q=Vape
- http://localhost:8080/stores/request?store=zalando&intent=buy
- http://localhost:8080/stores/request?store=zalando&intent=ship

Change filters, reload and verify selection restoration. Favorite a store, then open `fav=1`. A banned query must show no example cards or store links. Check both forms without submitting a real order.
