# R&L AI — architecture proposal (not implemented)

Status: **design only**. Nothing in this document exists in the code yet, no AI
provider or marketplace API is connected, and no feature below may be shown to
users as working until it is built, tested against the real provider, and
deployed. Facts about third-party services were checked on 2026-10-08 and are
cited inline. Re-check them before signing any contract.

Goal: an "R&L AI" section that lets a shopper

1. **photograph a product** and get what it most likely is (category, brand,
   model, search keywords);
2. **search in natural language** in Sorani (`ckb`), Kurmancî (`ku`), Arabic,
   English and German (Persian and Turkish later; all 7 UI languages keep
   their current RTL/LTR handling);
3. **compare prices from real retailer offers** and see a **landed-cost
   estimate** in Kurdistan/Iraq: item price + R&L shipping (`priceShipment`)
   - duty estimate (`dutyEstimate`), both in `src/lib/corridor.ts`.

---

## 1. Where we are today (measured, not assumed)

| Item               | State                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI provider keys   | **None.** The Worker has one secret (`BETTER_AUTH_SECRET`); GitHub Actions has `CLOUDFLARE_API_TOKEN`. No `OPENAI_*`, `ANTHROPIC_*`, `GEMINI_*`, `AI` binding, Vectorize binding or AI Gateway configured.                                                                                                                                                                                                                                                                                   |
| Marketplace APIs   | **None.** Amazon/eBay/AliExpress/Awin/SHEIN/Trendyol appear only in disclaimer copy and in the curated store directory (`src/lib/stores.ts`, links out to the retailer).                                                                                                                                                                                                                                                                                                                     |
| Product data       | `migrations/0002_market.sql` seeds **demo** sellers/products (`seed-*` rows; descriptions say "sample"). Production currently runs without a database, so these are not live, but they must be deleted or clearly labelled as samples before `/market` is served from a real DB. They must never be presented as real offers.                                                                                                                                                                |
| Landed cost inputs | `priceShipment` (chargeable weight × per-kg rate × origin factor, minimums, bulky surcharge) and `dutyEstimate` (flat 0/5/8 % rules) are **estimates**; `IQD_PER_EUR` is a fixed constant. Any AI price comparison must label the result "estimate" and show its parts.                                                                                                                                                                                                                      |
| Runtime budget     | Cloudflare Workers **Free**: 10 ms CPU per request ([limits](https://developers.cloudflare.com/workers/platform/limits/)). Measured on the live Worker (Workers analytics, current version): CPU p50 ≈ 14.7 ms, p99 ≈ 110 ms for SSR alone. AI routes (image handling, JSON parsing of provider responses, signing marketplace requests) will need **Workers Paid** (5 min CPU cap, default 30 s; $5/month minimum, [pricing](https://developers.cloudflare.com/workers/platform/pricing/)). |

---

## 2. Target architecture

```
 Browser (R&L UI, 7 languages)
   │  photo (client-side resized ≤1024px JPEG/WebP, EXIF stripped) / text query
   ▼
 Worker API  /api/ai/*            ← same Worker, separate route module, lazy-imported
   │  auth/rate-limit → validate → normalise → cache lookup
   ├──► AI Gateway (Cloudflare) ──► vision / LLM provider A (primary)
   │        timeouts, retries,    └► provider B (fallback, via Dynamic Routing)
   │        caching, spend limits
   ├──► Embeddings (Workers AI @cf/baai/bge-m3) ──► Vectorize index (offers)
   ├──► Offer store (Postgres via Hyperdrive) ◄── ingestion jobs (cron/queue)
   │                                               ├ Awin product feeds (CSV)
   │                                               ├ eBay Browse API (if approved)
   │                                               ├ Amazon Creators API (if eligible)
   │                                               └ AliExpress Affiliate API
   └──► priceShipment + dutyEstimate  →  landed-cost estimate (EUR + IQD)
```

Design rules:

- **Modular, provider-agnostic.** One `AiProvider` interface
  (`identifyProduct(image)`, `parseQuery(text, lang)`, `embed(texts)`) with one
  adapter per provider. Each marketplace is one `OfferSource` adapter with its own
  credentials, quotas and licence terms. Turning a source off is a config change.
- **Gateway in front of every model call.** Cloudflare AI Gateway's core features
  (analytics, caching, rate limiting) are free ([pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)).
  It provides per-request **timeouts and retries** ([request handling](https://developers.cloudflare.com/ai-gateway/configuration/request-handling/)),
  **fallback/conditional/budget routing** ([Dynamic Routing](https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/)),
  exact-match **response caching** ([caching](https://developers.cloudflare.com/ai-gateway/features/caching/))
  and **spend limits** that return HTTP 429 once a budget is reached
  ([spend limits](https://developers.cloudflare.com/ai-gateway/features/spend-limits/)).
  With BYOK, the provider bills us directly. Unified Billing adds a 5 % fee on purchased credits.
- **Budgets (proposed defaults, adjustable):**
  - Vision call timeout: 8 s, 1 retry. Text/LLM call: 5 s.
  - Per-user rate limit: 10 photo identifications/hour, 60 searches/hour. Anonymous users get a lower limit or a login requirement (phone sign-in exists).
  - Global spend limit: a hard daily € cap in AI Gateway, plus a monthly provider-side cap.
  - When a limit is hit, the UI says so plainly ("AI search is busy, try the normal search"). Never return a fake answer.
- **Caching:**
  - Query-parse results are cached by `(lang, normalised query)` for 24 h.
  - Embeddings are cached by text hash.
  - Offer lists are cached per product for at most the refresh window each source's licence allows (see §6).
  - Photo results are not cached by image (privacy). Only the resulting keywords may be cached.
- **No AI in the SSR path.** AI routes are client-initiated `fetch` calls to
  `/api/ai/*`. Existing pages and their CPU budget stay unchanged, and a provider
  outage cannot break page rendering.

### 2.1 Photo product recognition

1. The client resizes the photo to at most 1024 px, re-encodes it (this drops EXIF/GPS) and uploads it with `POST /api/ai/identify` (≤ 2 MB, image/jpeg|webp only).
2. The Worker sends the image **inline** to the vision model through AI Gateway, using a fixed system prompt and a **JSON schema** for the output: `{category, brand?, model?, attributes[], keywords{en,de}, confidence}`.
3. The output is validated against the schema; anything else is discarded. Low confidence becomes "we're not sure — here are similar categories".
4. The keywords go into the normal offer search (§2.2). The model never invents prices or offers. Prices come only from offer sources.

Model choice: test 2–3 candidates on a labelled set of real R&L product photos
(EU retail items) before choosing. Licence caution: Meta's Llama 3.2 multimodal
models, including `@cf/meta/llama-3.2-11b-vision-instruct` on Workers AI, are **not
licensed to companies with their principal place of business in the EU**
([Llama 3.2 AUP](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/USE_POLICY.md)).
If the operating company is EU-based, use a commercial vision API (via BYOK in AI
Gateway) or another model whose licence permits it.

### 2.2 Natural-language multilingual search

1. `POST /api/ai/search {q, lang}`. The LLM turns free text into a structured filter: `{keywords[], category?, brand?, maxPriceEur?, destCity?}`. The output is schema-validated, with enums for category and city.
2. **Hybrid retrieval:** a keyword search (Postgres) plus a vector search over offer titles/descriptions. The query is embedded with `@cf/baai/bge-m3`, a multilingual embedding model ([model page](https://developers.cloudflare.com/workers-ai/models/bge-m3/), $0.0118 per M input tokens).
3. Results are merged and re-ranked; each result shows its source retailer and when its price was last refreshed.
4. **Sorani/Kurmancî quality must be measured, not assumed.** Build an evaluation set of about 200 real queries per language, with expected categories. If embedding recall for `ckb`/`ku` is poor, translate the query first (LLM → English/German keywords), then embed.

### 2.3 Price comparison + landed cost

- Offers come **only** from licensed sources (§6), each stored with: source, retailer, URL (affiliate link where required), price, currency, shipping-to-DE cost if known, `fetched_at`.
- The landed-cost estimate is `item price (EUR) + EU shipping to the R&L hub (if known) + priceShipment(mode, origin, dest, weight, dims) + dutyEstimate(contents, declaredEur)`. It is shown as a breakdown, labelled "estimate". It needs the item weight and dimensions: from the source if provided; otherwise the user enters them, or a category default is used and labelled as such.
- Offers older than the source's allowed cache window are hidden or re-fetched, never shown stale as current.

### 2.4 Vector store choice

| Option                   | Fit                                                                 | Cost (official pricing)                                                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cloudflare Vectorize** | Native Worker binding, no servers                                   | Free: 30 M queried + 5 M stored dimensions/month. Paid: 50 M + 10 M included, then $0.01/M queried and $0.05/100 M stored dimensions ([pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)) |
| **pgvector in Postgres** | One store for offers and vectors; SQL filters + vector in one query | Included in the Postgres plan (none provisioned yet)                                                                                                                                                            |

Recommendation: start with **pgvector** if a Postgres database is provisioned for
`/market` anyway (one source of truth, transactional updates when feeds refresh).
Otherwise use **Vectorize**. bge-m3 dense vectors are 1024-dimensional
([model card](https://huggingface.co/BAAI/bge-m3)), so 10 k offers ≈ 10.2 M stored
dimensions.

---

## 3. Prompt-injection and abuse defences

Untrusted inputs: user text, **text inside photos** (a label can say "ignore
your instructions…"), and **retailer data** (titles/descriptions in feeds).

- Models are used only as **classifiers/parsers with schema-constrained JSON output**. No tool use, no free-form answers rendered as HTML, no model-generated links.
- User and retailer text is placed in clearly delimited data fields, never concatenated into the system prompt. The system prompt says that content in those fields is data, not instructions.
- Outputs are validated with zod. Enum fields are checked against allow-lists. Strings are length-limited and rendered as text (React escaping), never `dangerouslySetInnerHTML`.
- Prices, URLs and retailer names in results come **only from the offer store**, never from model output.
- Uploads: size/type limits, image re-encoding client-side and a server-side magic-byte check. Requests per user and IP are rate-limited at the Worker and at AI Gateway.
- The AI Gateway logs any flagged/blocked requests. Optionally, the gateway's DLP profiles can be applied to prompts.

## 4. GDPR: photo handling (no retention by default)

- **Default: no storage.** The photo exists only in the Worker's memory for the duration of the request and is sent inline to the vision provider. It is not written to R2/KV/DB or logs. Identify requests send `cf-aig-collect-log-payload: false` so AI Gateway keeps only metadata (latency, tokens, cost), not the image or response body ([logging](https://developers.cloudflare.com/ai-gateway/observability/logging/)).
- Provider contracts: choose providers that offer a DPA, **no training on API data**, and short or zero retention. Document each provider's processing location and transfer mechanism (EU SCCs / adequacy) in the privacy policy before launch.
- Client-side re-encoding strips EXIF (GPS, device data) before upload.
- Purpose limitation: the photo is used only to produce product keywords. The privacy notice (all 7 languages) states this, names the processors, and offers a text-search alternative.
- Lawful basis: performance of the requested service (Art. 6(1)(b)), with clear notice at the upload button. People in photos are not an intended input; the UI asks for product-only photos.
- Retention of derived data: keywords + category may be kept in aggregate analytics (no user id) for quality evaluation.

---

## 5. Marketplace access (verified 2026-10-08)

| Source                             | Official programmatic access?                                                                                                                                                                                                                                                                                                      | What it takes                                                                                                                                                                                                                                                                     | Notes / limits                                                                                                                                                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Amazon (PA-API → Creators API)** | Yes, but **PA-API 5.0 is deprecated** and now returns 403; the successor is the **Creators API** (OAuth 2.0) ([deprecation notice](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/paapiv5-deprecation), [migration](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/migrating-to-creatorsapi-from-paapi)) | Amazon Associates account for the target marketplace (e.g. amazon.de) **with ≥ 10 qualifying sales in the past 30 days**, then register in Associates Central and generate credentials ([introduction](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction)) | Display must follow the Associates licence (affiliate links, freshness). Not usable until the sales threshold is met.                                                                                                                  |
| **eBay Browse API**                | Yes, **Limited Release**: production use of Buy APIs is "intended for eBay partners only" ([Buy API requirements](https://developer.ebay.com/api-docs/buy/static/buy-requirements.html))                                                                                                                                           | eBay developer account (sandbox is open), eBay Partner Network account, Buy API application with mocks/data flows; EPN answers within ~10 business days, **approval not guaranteed**                                                                                              | Quotas are per app; raising them requires eBay's Application Growth Check. Marketplace-specific delivery restrictions apply.                                                                                                           |
| **AliExpress Affiliate API**       | Yes (`aliexpress.affiliate.product.query`, free API, no user authorisation) ([API doc](https://developer.alibaba.com/docs/api.htm?apiId=45803))                                                                                                                                                                                    | AliExpress account + AliExpress Portals (affiliate) account, developer activation at console.aliexpress.com, app type "Affiliate API", review ~1–2 days → AppKey/AppSecret ([access flow](https://open.alitrip.com/docs/doc.htm?articleId=118193&docType=1&treeId=674))           | Requests are signed (MD5/HMAC). Supports `ship_to_country`, `target_currency`, `target_language`.                                                                                                                                      |
| **Awin (product feeds)**           | Yes, as **product data feeds** (CSV/XML), not a live search API ([product feeds](https://success.awin.com/s/article/How-can-I-access-a-Product-Feed), [Create-a-Feed](https://help.awin.com/developers/docs/downloading-feeds-using-create-a-feed))                                                                                | Awin publisher account (**£5 deposit**, refunded with the first payout or if declined) ([signup](https://www.awin.com/gb/affiliate-marketing/how-to-start-affiliate-marketing)), then **approval by each advertiser**; feed API key ≠ Publisher API token                         | Which German retailers (e.g. OTTO, Zalando, Douglas) currently run Awin programmes with feeds must be checked inside the Awin UI after signup; it is not publicly guaranteed. Ingest with a scheduled job; respect feed refresh times. |
| **SHEIN**                          | **No public product/search API.** The SHEIN Developer Platform is for sellers (publishing products, fulfilment, orders) ([open.sheincorp.com](https://open.sheincorp.com/))                                                                                                                                                        | Only via an affiliate network programme that offers feeds/links, region-dependent                                                                                                                                                                                                 | Scraping is not an option (ToS, bot protection, legal risk).                                                                                                                                                                           |
| **Trendyol**                       | **No public product/search API.** The Trendyol API serves Marketplace sellers with seller-panel credentials ([developers.trendyol.com](https://developers.trendyol.com/), [getting started](https://developers.trendyol.com/v3.0/docs/getting-started-1))                                                                          | Only via an affiliate programme/feed if one is available to R&L                                                                                                                                                                                                                   | Scraping is not an option.                                                                                                                                                                                                             |

Consequence: phase 1 of price comparison realistically runs on **Awin feeds +
AliExpress**. eBay and Amazon follow only after their approvals/thresholds.
SHEIN/Trendyol stay "link out to the store" (as today) unless an affiliate feed is
granted.

---

## 6. What the owner must provide

Nothing below is needed for the current site. Each item unlocks one piece.

| #   | Item                                                                                                               | Why                                                                        | Cost                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Cloudflare Workers Paid** on the account                                                                         | AI routes exceed the Free 10 ms CPU limit (SSR is already above it at p50) | $5/month minimum ([pricing](https://developers.cloudflare.com/workers/platform/pricing/))                                        |
| 2   | **AI Gateway** (create one gateway) + decision on BYOK vs Unified Billing                                          | Timeouts, fallback, caching, spend caps                                    | Free core features; Unified Billing +5 % on credits ([pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)) |
| 3   | **Vision/LLM provider account(s)** with API key(s), DPA signed, "no training" confirmed; a primary and a fallback  | Photo recognition + query parsing                                          | Provider list prices (usage-based); capped by a daily/monthly € spend limit **you choose**                                       |
| 4   | Workers AI binding (embeddings)                                                                                    | Multilingual embeddings                                                    | 10,000 neurons/day free, then $0.011/1,000 neurons ([pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/))   |
| 5   | Postgres (+ pgvector) **or** a Vectorize index                                                                     | Offer store + vector search                                                | Vectorize free tier above; Postgres depends on provider                                                                          |
| 6   | **Awin publisher account** + advertiser approvals                                                                  | First real offer data (DE retailers)                                       | £5 refundable deposit                                                                                                            |
| 7   | **AliExpress Portals + developer app** (AppKey/AppSecret)                                                          | Offer data                                                                 | Free API                                                                                                                         |
| 8   | eBay developer + **EPN** account, Buy API application                                                              | Offer data (if approved)                                                   | Free; approval not guaranteed                                                                                                    |
| 9   | Amazon Associates (amazon.de) reaching **10 qualifying sales/30 days**, then Creators API credentials              | Offer data (when eligible)                                                 | Free; eligibility threshold                                                                                                      |
| 10  | Legal: privacy-policy update (processors, transfers, photo handling) in all 7 languages; affiliate disclosure text | GDPR + affiliate programme rules                                           | Owner/legal time                                                                                                                 |
| 11  | ~200 real labelled queries per language (`ckb`, `ku`, `ar`, `en`, `de`) and ~100 real product photos               | Measure quality before launch                                              | Staff time                                                                                                                       |

Secrets go in as Worker secrets (`wrangler secret put …`). They are never committed and never
exposed to the client. Proposed names: `AI_GATEWAY_ID`, `AI_PROVIDER_PRIMARY_KEY`,
`AI_PROVIDER_FALLBACK_KEY`, `AWIN_FEED_API_KEY`, `AWIN_PUBLISHER_ID`,
`ALIEXPRESS_APP_KEY`, `ALIEXPRESS_APP_SECRET`, `ALIEXPRESS_TRACKING_ID`,
`EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `EBAY_EPN_CAMPAIGN_ID`,
`AMAZON_CREATORS_CREDENTIAL_ID`, `AMAZON_CREATORS_CREDENTIAL_SECRET`,
`AMAZON_PARTNER_TAG`.

## 7. Phased rollout

| Phase                    | Scope                                                                                                                                     | Exit criteria                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 0 — prerequisites        | Items 1–3, 5, 10 above; remove/label seed demo rows                                                                                       | Accounts live, budgets set, privacy text approved                                                   |
| 1 — offer data           | Awin feed + AliExpress ingestion into the offer store; `/market` shows only real offers with source + `fetched_at`; landed-cost breakdown | Real offers for ≥ 3 categories; no seed data in prod                                                |
| 2 — NL search            | Query parsing + hybrid search, behind a feature flag, staging first (`workers_dev` preview version)                                       | Recall@10 ≥ agreed target per language on the evaluation set; p95 latency < 2.5 s; spend within cap |
| 3 — photo search         | `/api/ai/identify`, no-retention pipeline, flagged beta                                                                                   | Top-3 category accuracy ≥ agreed target on the photo set; privacy review passed                     |
| 4 — more sources         | eBay (if approved), Amazon Creators API (when eligible)                                                                                   | Each source passes its licence checklist                                                            |
| 5 — general availability | Remove flags, monitor                                                                                                                     | Error rate, cost/day and latency dashboards in AI Gateway                                           |

Each phase ships as its own PR with tests and CI green, is deployed via `npm run deploy`,
and keeps a recorded rollback version. Nothing is advertised to users before its
phase exit criteria are met.
