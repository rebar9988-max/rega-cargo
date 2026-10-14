# R&L AI — یاریدەدەری زیرەکی کڕیار

Owner-established invariants (2026-10-13): this is a customer assistant for the unified R&L Marketplace, Bring For Me, Delivery / Tracking platform. It is never a general chatbot. Changes to identity, R&L-only scope, ownership, authorized contracts, privacy, brand or Sorani typography require an explicit new owner instruction. Maintenance that preserves these invariants is allowed.

## Ownership and contracts

This module owns conversation policy, orchestration, prompts and assistant UI at `/ai`; `server/routes/api/ai/chat.ts` is a thin transport. Existing `src/lib/ai/` remains the shared, explicitly authorized R&L AI provider/vision/budget infrastructure; `src/components/ai-page.tsx` retains the working image and estimate workflow. Do not duplicate it or move working infrastructure just to match a directory diagram.

Marketplace reads use only exported `assistantProductSearch` in `src/lib/market/assistant-contract.server.ts`, through the infrastructure adapter. Request, delivery and private tracking actions navigate to existing `/stores/request`, `/quote`, `/track` and `/account` workflows. No private order data reaches inference. No SQL, cross-domain writes, independent auth, database or new provider is allowed. Domain/application/prompt layers cannot import other business domains. Architecture tests enforce these boundaries, including dynamic imports.

Only typed planner output is accepted; model prose is never displayed. Every current turn is checked server-side, previous turns are untrusted, retrieved descriptions never enter the model, and actions/links are assembled from an allowlist. Refusals avoid inference. Unknown prices, stock, specifications and dates are not invented. Product names remain untrusted plain text. Camera/vision uses the existing Gemma Workers AI binding and shared Durable Object attempt budget; request caps do not guarantee a provider free allowance.

## Visual and language rules

White/red restrained cards, existing official mark and tokens, scoped Vazirmatn v33.003 already in `/fonts`, natural Sorani RTL and isolated mixed text. Preserve every supported locale and global brand/navigation. Orthography reference: پوختەی ڕێنووس — وەزارەتی پەروەردە، ٢٠٢٦ (owner-specified; source document is not present locally). Do not add a mascot or fonts. New translations require native review where marked.

## Verification

`npm test` includes module security/integration tests and import boundaries; `tests/layout/rl-ai.spec.ts` covers interactions and RTL. Follow the repository's full migration-free build and official-image layout gate. Documentation and CODEOWNERS express governance; they do not make files immutable. Repository protections must be checked live before release.

## OWNER-ONLY R&L AI BASELINE — 2026-10-14

Explicit owner instruction: R&L AI is part of the permanent R&L foundation. Preserve its approved identity, customer-only domain, isolated module/contracts, privacy/security, verified-data responses, official red/white design, Sorani Vazirmatn/RTL, five shortcuts and existing image workflow across every unrelated change. A general request to redesign, modernize, refactor or upgrade R&L does not authorize changing this R&L AI baseline. Only a new explicit owner instruction specifically requesting the affected R&L AI change authorizes it; record that instruction and its scope in project memory. Bug fixes, security updates and internal maintenance may proceed only when they preserve the baseline. Never remove or weaken these rules, their tests or owner-review coverage to make another task pass.
