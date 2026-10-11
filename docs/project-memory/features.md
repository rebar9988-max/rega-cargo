# Features and status (verified 2026-10-11)

Status: **live** = works in production · **degraded** = deployed but its backend is unavailable · **gated** = code exists, off until configured/approved · **planned**.
Routes in AGENTS.md "ROUTES THAT MUST KEEP WORKING" must never break.

| Route / feature | Files | Status | Notes |
|---|---|---|---|
| `/` home (AI shopping hero, catalogue, calculator) | `routes/index.tsx`, `components/premium-home.tsx`, `bazaar-page.tsx` | live | Hero art is inline SVG; calculator lazy-loads |
| `/stores`, `?cat=`, `?sub=`, `?who=`, `?fav=1`, `?q=` | `routes/stores*.tsx`, `components/bazaar-page.tsx`, `lib/stores.ts`, `lib/catalogue.ts` | live | Ten catalogue groups; `food` + some subcategories held for owner approval. Photos are examples, no prices/stock |
| `/stores/request?store=..&intent=buy\|ship` | `routes/stores.request.tsx`, `lib/orders/` | degraded | Needs DB; mandatory prohibited-items declaration |
| `/quote` | `routes/quote.tsx`, `components/quote-panel.tsx`, `lib/corridor.ts` | live (pricing) / degraded (saving) | Chargeable weight = max(actual, volumetric); EUR + IQD |
| `/market`, `/market/$slug`, `/market/sell` | `routes/market*.tsx`, `lib/market/` | **degraded** | Shows error state until DB is repointed (issues I-1) |
| `/ai` (R&L AI product identification) | `routes/ai.tsx`, `components/ai-page.tsx`, `server/routes/api/ai/*` | UI/status live; inference unverified in this audit | Provider/model, cap 200 and consent preserved. P0 safety repairs in draft #68 are locally tested, not deployed |
| Product-link check | `lib/product-link/` | gated → on (`PRODUCT_LINK_ENABLED=true`) | SSRF-safe URL parsing, shipping estimate |
| Search + autocomplete | `lib/search/`, `components/search-*.tsx` | live | Compliance-screened |
| Banned-products filter | `lib/compliance/`, migrations `0011`, `0012` | live (bundled list) | Permanent, no off switch; DB rules add on top when reachable |
| `/track` | `routes/track.tsx`, `lib/shipments.ts` | degraded | DB |
| `/request`, `/account`, `/account/$ref` | matching routes, `lib/requests/` | degraded / gated | Customer requests, staff quotes, status history (R7) |
| `/admin` | `routes/admin.tsx` | gated | `user_roles.role='admin'` and `status='approved'`; compliance scan button |
| Phone sign-in | `lib/phone/`, `components/phone-gate.tsx` | gated | No WhatsApp/Twilio secrets → cannot send codes |
| `/move`, `/contact`, `/customs`, `/prohibited-items` | matching routes | live | |
| `/impressum`, `/privacy`, `/terms` | `components/legal-page.tsx` | live | Real legal owner details still needed |
| `/_design` design-system page | `routes/[_]design.tsx` | live, noindex | Not in sitemap; robots disallow |
| i18n (ckb default, ku, ar, fa, en, de, tr) | `lib/i18n.tsx`, `lib/messages/` | live | `TODO(translate-review)` strings need native review |
| SEO (canonical, alternates, sitemap of locale URLs) | `lib/seo*.ts`, `server/routes/sitemap.xml.ts` | live | |
| Legacy host redirect + self-unregistering SW | `scripts/legacy-host.mjs` | live | workers.dev → custom domain |
| Error monitoring (Sentry) | — | planned (not approved) | Would need a new dependency |

AI continuation: [#68 audit](../ai/audit-2026-10-11.md) records guarded output/usage repairs and actual live verification limits. Product-link parsing honestly reports unavailable product details; a configured flag is not evidence of live prices or an external provider. No new chat/RAG/recommendation/agent/shipment-AI pipeline was enabled. Postgres vector/trigram/unaccent extensions are available but not installed; verified data, billing and safe preview are still prerequisites.
