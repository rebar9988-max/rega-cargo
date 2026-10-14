# R&L AI verification — 2026-10-13

Source branch: `codex/rl-ai-domain-lock-20261013`, application commits `e4b0820` + `0af8793`, based on `main` `631549f`. Review: [PR #92](https://github.com/rebar9988-max/rega-cargo/pull/92). Canonical production: https://www.rlgo.net. This report records source work and local verification; it does not claim a production rollout.

## Changes and ownership

Continuation 2026-10-14: managed environment restart interrupted the first full run at case 391; preserved its artifacts and restarted. Generated Playwright trace JavaScript made a resumed ESLint run inspect build reports. Reports were archived outside the source tree; no source lint rule was suppressed. The completed full run then exposed two genuine WebKit first-interaction defects: a shortcut click was lost and image consent reset during hydration. Reused the existing `useHydrated` contract solely in AI controls and added a test holding all JavaScript until disabled SSR controls are observed, then proving the first shortcut/checkbox works. Final affected suite passed 72/72 in the official image. The final whole-platform run passed 499 cases with 16 existing skips and one unchanged navigation-harness failure: an early next `page.goto` cancelled the previous lazy import, provoking TanStack’s reload of the previous URL. The trace recorded “Importing a module script failed”; the existing `tests/layout/domain.spec.ts` already documents this exact timing risk and waits for usable controls. Navigation/i18n/header/source tests are unchanged from main. The original failing case then passed three consecutive independent runs with no retry or code change; this initial failure is retained in the report, not concealed. All 500 unique required cases have passed across the run and focused confirmation. No unrelated implementation or screenshot baseline changed.


- `src/modules/rl-ai/`: owner-protected purpose, deterministic scope preflight, bounded typed model plan, server-approved short response keys and links, read-only orchestration, seven-language welcome/chat and scoped Vazirmatn styling.
- `/api/ai/chat`: thin transport; existing Workers AI Gemma binding, challenge, per-IP limiter and Durable Object budgets. No new provider, paid service, database, authentication system or infrastructure setting.
- `src/lib/market/assistant-contract.server.ts`: necessary public read integration, delegating to existing Marketplace filtering with `userId: null`. Only public product names, slug and verified offer total projected. Marketplace implementation, authorization and tables unchanged.
- `src/components/ai-page.tsx`: preserve camera, image identification and original cost estimate. Validate source type/size, re-encode on device to remove metadata, preview/remove before explicit processing; cancellation, deadline and duplicate-request guard.
- Existing AI infrastructure: fail closed on safety/storage outages, no-store challenge, retain inference-attempt budget after refunds and prevent stale-day resets. Image output containing instruction attacks is rejected; no retrieved content or private order record enters inference.
- Root agent instructions, module AGENTS/README, CODEOWNERS and AST import tests protect identity and ownership. CODEOWNERS is review guidance until repository protections enforce it; files are not immutable.
- Shared SEO edits affect only `/ai` in the seven existing locales. Homepage, navigation, footer, brand/font assets, route conventions and other business logic remain unchanged.

## Verification recorded so far

| Check | Observed result |
|---|---|
| TypeScript | Passed, Node 22 |
| ESLint | 0 errors; 5 existing unrelated warnings |
| Existing + new unit/integration/security tests | 460 passed, 4 existing skips, 0 failures |
| Actual Durable Object workerd harness | 10 passed: attempt budget, concurrency, stale UTC refunds, signing key and challenge outages |
| Module tests | 15 passed: allowed intents, refusal, multi-turn, injection, retrieved/image injection, missing data, no invented prices/dates, private orders, gates, timeout and seven-language shortcuts |
| AST import/ownership tests | 3 passed |
| Migration-free production build | Passed with `DATABASE_URL=''`; no remote migration |
| Worker dry run | Passed; no remote deployment |
| Focused actual browser interactions | 12 passed in official Playwright 1.63 image, Chromium phone/laptop and WebKit phone, no retries |
| Intentional `/ai` baseline rendering | 27 passed in official image, ckb/ar/en across existing Chromium/WebKit projects; only `/ai` baseline files changed |
| Full platform browser run | 489 passed, 16 existing skips; 2 R&L AI first-interaction failures reproduced and fixed, no baseline/tolerance changes |
| Final affected AI/readiness/visual gate | 72 passed with no retries, including held-JavaScript first-interaction checks on all Chromium/WebKit projects; final typecheck, 460 unit/security tests, lint/build/dry run passed |
| Final full platform confirmation | 499 passed, 16 existing skips; one unchanged WebKit navigation harness race. The original failing case then passed 3 consecutive runs without retries or code changes. All 500 unique required cases have passed across the full run and focused confirmation. |

Focused browser checks send actual local refusal/workflow requests. Image provider failures are simulated, and provider planning/timeouts are unit fixtures; no local paid-capable inference is performed. Real production provider inference remains unverified for this change.

Local Chromium measurements (unthrottled developer environment, not field data): at 390px LCP 1.688s, CLS 0.0051 and observed interaction durations 88ms; at 1280px LCP 1.460s, CLS 0 and observed interactions 72–80ms. These interactions are not a statistically representative INP result. No horizontal overflow. Screenshots visually reviewed. Native mobile camera hardware, field Core Web Vitals and a complete WCAG conformance audit are not claimed.

## Production baseline and release preflight

- Read-only production browser confirmed `/` and `/ai` HTTP 200, Sorani `lang=ckb`, `dir=rtl`, functional existing `/ai` homepage link and existing photo/estimate workflow. The current production page is still the pre-change photo experience. HTTP clients without a browser user-agent initially received 403; browser requests succeeded.
- Current `main` Actions run [38394746826](https://github.com/rebar9988-max/rega-cargo/actions/runs/38394746826) failed before jobs started. Check-run annotation: “The job was not started because recent account payments have failed or your spending limit needs to be increased.” Account billing is outside authorized engineering scope. No billing/payment/limit change was attempted.
- Direct CLI access: managed environment has no Cloudflare token and `wrangler whoami` is unauthenticated. This initial direct-CLI blocker is superseded by the authenticated existing Cloudflare connector, which reads the correct account, Worker bindings, versions, Builds trigger and deployment state. No new credential or infrastructure is necessary.
- Existing Cloudflare Builds trigger `4b2f7874-0d8a-45d4-85d5-c322060ef6a1` is bound to verified `rebar9988-max/rega-cargo`, production branch `main`, `npm run build` + `npx wrangler deploy`. Build environment variables are empty. Most recent build `28d8c847` succeeded for base `631549f`; live rollback version `5791d60b-76b4-448b-a922-0d4d928df592`, 100%, deployed 12:05 UTC. No build or deployment is currently running; recheck immediately before merge.
- Fine-grained GitHub protection/ruleset reads return 403. The current branch resource authoritatively reports `main protected:false`, SHA `631549f`; a normal merge must still respect any platform safeguard and must never use admin bypass or force. Hosted Actions remains blocked by billing; root CLAUDE.md and existing decisions authorize the full local official-image gate in that case. Never call hosted CI green.

Release continuation: complete the full local gate on the exact reviewed source, recheck main and concurrent Cloudflare deployments, perform a normal authorized merge through existing infrastructure, monitor the existing Builds result, and verify actual `/ai` responses/refusals, image inference, private authorization and unrelated journeys at https://www.rlgo.net. Keep production bindings/secrets and private staging/preview state intact.

## Limitations

Scope preflight deliberately rejects ambiguous requests and may ask the customer to name the product again. Model prose is never displayed, even when classification is wrong; final output remains within approved R&L responses. Only existing verified Marketplace names and offer totals are supported; no stock/specification/seller/date claims are invented. Tracking/private changes stay in existing authorized workflows. No general AI fallback or automatic retry exists. Inference-attempt caps do not guarantee a provider's free compute/token allowance. The owner-specified orthography source document is not attached; native review of new translations remains appropriate.
