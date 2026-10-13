# R&L AI audit and file plan — 2026-10-13

Verified base: `631549f`, `rebar9988-max/rega-cargo`, canonical production https://www.rlgo.net. Root instructions and memory read. `/ai` live is photo identification + existing estimate only. Homepage already links to `/ai` near the top. Baseline desktop/mobile captures are session artifacts in `/workspace/scratch/rl-ai-audit`; no claim that supplied references show production.

Existing unmerged #69 has typed intent planning, streaming and multilingual copy; reuse selected primitives, never merge its stale platform/screenshot diff. #68 contains verified fail-closed budget improvements; port only AI infrastructure and focused tests. Provider remains Workers AI Gemma; no separate AI Gateway integration exists in current source. Existing signed challenge, ratelimit and Durable Object remain.

File-level plan recorded before implementation:

- `src/modules/rl-ai/{domain,application,infrastructure,prompts,ui,tests}/`: isolated policy, typed planner orchestration, public Marketplace adapter, scoped welcome/chat/copy/CSS and adversarial tests.
- `server/routes/api/ai/chat.ts`: thin module transport.
- `src/components/ai-page.tsx`: connect welcome/chat, preserve image/estimate; validate and preview selection before explicit processing, permit removal.
- `src/lib/ai/{identify.server,env.server,usage,gate-client,schema}.ts`, `exports.cloudflare.ts`: existing provider ownership; fail closed, retain failed-attempt budget, stale-day protection, reject injected image output.
- `package.json`, `scripts/rl-ai-boundaries.test.mjs`, `scripts/ai-usage-worker.test.mjs`, `tests/layout/rl-ai.spec.ts`: integrate focused checks. Update only intentional `/ai` pixel baselines in the official image after visual review.
- root `AGENTS.md`, `CLAUDE.md`, `.github/CODEOWNERS` and existing project memory: permanent ownership/governance and truthful verification record.

No Marketplace, Bring For Me, Delivery, Tracking, auth, orders, payment, navigation/footer, global styling, font assets, database schema, infrastructure configuration or public hostname change. Homepage's existing functional entry is preserved to avoid unrelated layout changes.

## Verified integration adjustment

Importing TanStack `marketHome` into a Nitro route made Vite expose unrelated SSR constants as Worker entrypoint exports (`APPEARANCE_SCRIPT`); workerd rejected startup. Replace that import with the necessary explicit public server contract `src/lib/market/assistant-contract.server.ts`: it delegates to the same existing public `listProducts({q,userId:null})` and projects only public product fields. No Marketplace business logic, filtering, authorization or SQL implementation is changed. Test startup and full platform regression again.
