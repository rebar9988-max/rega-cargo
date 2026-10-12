# Features and status (verified 2026-10-11)

Status: **live** = works in production · **degraded** = deployed but its backend is unavailable · **gated** = code exists, off until configured/approved · **planned**.
Routes in AGENTS.md "ROUTES THAT MUST KEEP WORKING" must never break.

| Route / feature | Files | Status | Notes |
|---|---|---|---|
| `/` home (AI shopping hero, catalogue, calculator) | `routes/index.tsx`, `components/premium-home.tsx`, `bazaar-page.tsx` | live | Hero art is inline SVG; calculator lazy-loads |
| `/stores`, `?cat=`, `?sub=`, `?who=`, `?fav=1`, `?q=` | `routes/stores*.tsx`, `components/bazaar-page.tsx`, `lib/stores.ts`, `lib/catalogue.ts` | live | Ten catalogue groups; `food` + some subcategories held for owner approval. Photos are examples, no prices/stock |
| `/stores/request?store=..&intent=buy\|ship` | `routes/stores.request.tsx`, `lib/orders/` | degraded | Needs DB; mandatory prohibited-items declaration (PR #79: simplified 4-step form, declaration confirmed by the send button) |
| `/quote` | `routes/quote.tsx`, `components/quote-panel.tsx`, `lib/corridor.ts` | live (pricing) / degraded (saving) | Chargeable weight = max(actual, volumetric); EUR + IQD |
| `/market`, `/market/$slug`, `/market/sell` | `routes/market*.tsx`, `lib/market/` | **degraded** | Shows error state until DB is repointed (issues I-1) |
| `/ai` (R&L AI product identification) | `routes/ai.tsx`, `components/ai-page.tsx`, `server/routes/api/ai/*` | live | Daily cap 200, Turnstile when configured, upload needs consent |
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

## Pending source change: shipping separation ([PR #72](https://github.com/rebar9988-max/rega-cargo/pull/72), 2026-10-12)

The home calculator and tracking entry move to a dedicated `components/shipping-page.tsx` on `/quote`, with `styles/shipping.css`. `/stores` and legacy filtered home URLs stay catalogue-only. Home navigation continues to link to shopping and shipping. Quote parameters, calculation, local device saves and booking APIs remain supported; this is not a backend recovery. See [verification](../redesign/shipping-separation.md). Not merged or deployed.
