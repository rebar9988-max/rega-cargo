# R&L redesign — review and test

Implementation branch: `design/rl-premium`, published for review in [draft PR #47](https://github.com/rebar9988-max/rega-cargo/pull/47). This branch contains the seven ordered redesign commits. It has not been deployed. Read `step-0.md` through `step-6.md` for scope, evidence and limitations. Current GitHub quality results are shown on the PR.

## Run locally

Use Node 22, matching CI. With dependencies installed:

```sh
DATABASE_URL='' npm run dev
```

Development URL: http://localhost:8080/. To review the compiled Cloudflare Worker without deployment:

```sh
DATABASE_URL='' npm run build
WRANGLER_SEND_METRICS=false DATABASE_URL='' npx wrangler dev --config .output/server/wrangler.json --port 8788 --local --show-interactive-dev-session=false
```

Production preview URL: http://localhost:8788/. Restart the preview after rebuilding. An empty `DATABASE_URL` prevents this local review from running migrations against a configured external database.

## Required route checklist

Open each URL at **360px**, in light and dark mode, with each of `lang=ckb`, `lang=ar`, and `lang=en`. Sorani uses the existing `ckb` ID; `ku` remains Kurmanji and LTR.

| Flow | Exact development URL |
|---|---|
| Home | http://localhost:8080/?lang=ckb |
| Stores | http://localhost:8080/stores?lang=ckb |
| Category | http://localhost:8080/stores?cat=fashion&lang=ckb |
| Favorites | http://localhost:8080/stores?fav=1&lang=ckb |
| Buy request | http://localhost:8080/stores/request?store=zalando&intent=buy&lang=ckb |
| Ship request | http://localhost:8080/stores/request?store=zalando&intent=ship&lang=ckb |
| Quote | http://localhost:8080/quote?lang=ckb |
| Compare | http://localhost:8080/market?lang=ckb |
| AI | http://localhost:8080/ai?lang=ckb |
| Company details | http://localhost:8080/impressum?lang=ckb |
| Privacy | http://localhost:8080/privacy?lang=ckb |
| Terms | http://localhost:8080/terms?lang=ckb |
| Design system | http://localhost:8080/_design?lang=ckb |

For Arabic, replace `lang=ckb` with `lang=ar`; for English, use `lang=en`. Repeat on desktop. Verify one visible h1, readable contrast, focus rings, usable labels, no horizontal scrolling, and correct `<html lang dir>`. The system page is noindex, excluded from the sitemap, and disallowed in robots.

## Interactions

1. Use the header search and category menu with Tab, arrow keys, Enter and Escape. Escape should return focus from dialogs to their trigger. Use the carousel manually by button, keyboard or swipe; it does not autoplay.
2. On `/stores`, choose category `fashion`, store `zalando`, and country `DE`. Reload and check that filters stay in the URL. Favorite a store and open `/stores?fav=1`. Change language in the footer; `cat`, `fav` and other query parameters must remain.
3. Search for `Cigarettes`, `Vape`, `Vodka`, and `Pork bacon`. No catalogue card or suggestion may link to prohibited products. Automated compliance tests also exercise the database and AI/search policy; the policy and database triggers remain enabled.
4. Scroll to the home calculator, change length to **60**, scroll away and back, then follow the full-quote link. Dimensions must survive both scrolling and navigation. With the current default route, 3.2kg actual weight and 60×30×20cm, express volumetric weight is **7.2kg** and express total is **€56.16**. These are checks against existing configured rates, not offers or guarantees. Inspect the EUR/IQD display and larger-of-two-weights explanation.
5. Check both request intents and all existing fields, consent and declarations. Do not submit a real order to test appearance. AI upload remains disabled until consent; no paid model call is needed for this review.
6. Switch the theme, reload, and dismiss the announcement, then reload again. The stored appearance should apply before the first paint. Open legal section links and the footer PDF download.

## Automated checks

```sh
DATABASE_URL='' npm run lint
npm run typecheck
npm test
DATABASE_URL='' npm run build
WRANGLER_SEND_METRICS=false npm run cf:dry-run
```

The browser baselines use the project's existing official Playwright Docker image:

```sh
docker run --rm --ipc=host -v "$PWD":/work -w /work -e CI=1 -e WRANGLER_SEND_METRICS=false mcr.microsoft.com/playwright:v1.63.0-noble sh -c 'npx playwright test --workers=3'
```

No new application dependency was added. The current original photograph assets already have local responsive WebP variants; photographs are labeled examples. The immutable logo and the shipping formulas/rate tables are unchanged.

## Repeat the mobile performance review

With the compiled Worker running on port 8788, use a local HTTPS/HTTP2 transport to match production. The helper uses Node built-ins; the certificate stays outside the repo and changes no application security setting.

```sh
openssl req -x509 -newkey rsa:2048 -nodes -keyout /tmp/rega-preview.key -out /tmp/rega-preview.crt -days 1 -subj '/CN=localhost' -addext 'subjectAltName=DNS:localhost,IP:127.0.0.1'
node docs/redesign/http2-preview.mjs /tmp/rega-preview.key /tmp/rega-preview.crt
```

In another terminal, with Chrome/Chromium available, run this for `/`, `/stores`, and `/quote`, one at a time while other tests/builds are idle:

```sh
npx lighthouse https://localhost:9443/ --chrome-flags='--headless --allow-insecure-localhost' --output=html --output=json --output-path=/tmp/rega-home
```

The browser flag trusts only the self-signed localhost preview. Lighthouse retains its default simulated mobile throttling and enabled audits. Results and the plain HTTP/1.1 comparison are recorded in [step-6.md](step-6.md) and [lighthouse.json](lighthouse.json). Scores must be rechecked on the deployed redesign's actual HTTPS URL after release.

## Data and release limits

Missing catalogue prices and secondary photographs remain unavailable; no invented prices, stock, promotions, ratings or delivery guarantees were added. Store logos retain the visible non-partner notice. Market availability depends on its existing configured source. Legal owner details still need the owner's real information. New Sorani/Arabic copy marked `TODO(translate-review)` requires native-language review. This presentation work does not resolve the separately documented legacy backend audit findings or verify authenticated production workflows.
