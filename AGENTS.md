# R&L (Rega Cargo) project rules

## PERMANENT R&L PRODUCT IDENTITY — HIGHEST PRIORITY

Owner-established permanent rule (2026-10-13):

**R&L = MARKETPLACE + BRING FOR ME + DELIVERY / TRACKING**

**Official Kurdish slogan: بازاڕ و گەیاندن**

- This is the highest-priority product identity rule for Codex, Claude Code and all future project work. It takes precedence over any conflicting or narrower product identity or slogan in existing instructions, project memory, documentation or legacy naming, including the repository name `rega-cargo`.
- All future development, UX/UI, navigation and architecture decisions must respect and support all three services as first-class parts of the same R&L product: MARKETPLACE, BRING FOR ME, and DELIVERY / TRACKING.
- Never redefine R&L as cargo-only, marketplace-only or delivery-only. Never remove, hide or demote a core service in a way that changes this identity.
- Never change the core mission, official identity, official Kurdish slogan or these three core services without explicit owner approval.
- Preserve all other existing project instructions. Earlier product descriptions and slogans remain historical context where they conflict with this permanent rule; they do not authorize a different identity.
- Keep this permanent identity rule identical in the repository-root `AGENTS.md` and `CLAUDE.md`.

## PERMANENT PUBLIC DOMAIN RULE

Owner decision (2026-10-13): R&L is publicly served only at `https://www.rlgo.net`.
`rlgo.net` and HTTP variants redirect to canonical HTTPS www, preserving paths and queries.
Do not attach `cargo.regaplatform.com` or enable production/staging workers.dev, version preview URLs or Cloudflare Builds branch previews without explicit owner authorization.
Keep the staging Worker, bindings and data intact; it has no public URL. Use local/isolated checks for future staging work and obtain authorization before exposing another hostname.
Never modify the separate REGA Platform domains or Worker.

Read PROJECT_MEMORY.md (repo root) when continuing work in this workspace; CLAUDE.md describes the memory lifecycle.

## PERMANENT R&L TROUBLESHOOTING & PROJECT CONTEXT RULE

Owner instruction (2026-10-15). Applies to every Codex / Claude Code session and every substantial R&L task. Keep this section identical in the repository-root `AGENTS.md` and `CLAUDE.md`.

- Project: R&L — Marketplace & Delivery · repository `rebar9988-max/rega-cargo` · production `https://www.rlgo.net` · Worker `rega-cargo` · production branch `main` only (unless the owner explicitly changes this rule).
- Central cross-tool memory: Google Doc **R&L — Project Memory & Documentation Hub** (Drive file ID `1Wt2rZdmMTviKNsz1bpDUg3as-Egy7FNB_HatI1Y7kH4`). Google Drive / Docs is a normal part of the workflow, not optional.

Three systems; the central Doc and the repository memory together form the single documentation layer (do not create a new or parallel memory system):

| System | Authoritative for |
|---|---|
| Google Drive / Docs (central Doc) | Durable cross-tool context: decisions, runbooks, incident notes, previous fixes, known blockers, deployment history, continuation point |
| Repository memory (`PROJECT_MEMORY.md`, `docs/project-memory/`) | Detailed in-repo memory; the central Doc summarises and links to it instead of duplicating it |
| GitHub | Code, branches, commits, PRs, workflows, CI, repository configuration |
| Cloudflare | Live Worker state: builds, deployments, versions, domains, routes, bindings, runtime configuration, production |

Precedence: verified live GitHub / Cloudflare state > repository memory and the central Doc. When documentation disagrees with live state, verify live state first, then correct the documentation (both the repo memory and the central Doc).

Mandatory flow: **READ DOCS / MEMORY → VERIFY GITHUB → VERIFY CLOUDFLARE → IDENTIFY ROOT CAUSE → FIX ONLY THE RESPONSIBLE LAYER → TEST → VERIFY LIVE STATE → UPDATE PROJECT MEMORY**.

1. Start: read `CLAUDE.md`, `AGENTS.md`, `PROJECT_MEMORY.md`, relevant `docs/project-memory/` files, `DEPLOY.md` when deployment is involved, and the central Doc.
2. Troubleshooting: check earlier notes/fixes in the Doc and repo memory → inspect current repo/PR/CI state in GitHub → inspect current build/deployment/runtime state in Cloudflare → reproduce where possible → find the real root cause → fix only that layer → run the appropriate tests → verify the real result → record it.
3. If a source cannot be reached from the current session (for example no Cloudflare connector or network access), say so and record it as an environment limitation, never as a code failure. Read-only fallbacks: the `Workers Builds: rega-cargo` check run on a GitHub commit shows the Cloudflare build result and version ID; a public fetch of `https://www.rlgo.net` shows the page is served. Neither proves which version is active at 100%; do not claim that without Cloudflare access.
4. After every material change, append to the central Doc's change log (and the repo memory per the memory lifecycle): date · problem/task · root cause · change made · files changed · GitHub PR/commit · tests run · Cloudflare verification · production impact · remaining blockers · next safe continuation point.

Rules: do not ask the owner to repeat information already in the Doc, GitHub or Cloudflare. No speculative fixes. Do not touch unrelated files, services, modules, secrets, domains, database configuration or production behaviour. Never expose API keys, passwords, tokens, credentials or secret values (names only). Never claim a fix succeeded until it is tested and independently verified. Never bypass GitHub protection, required checks or production safeguards; never merge or deploy unverified changes. Proceed autonomously with safe read, diagnosis, documentation and verified repair work; ask the owner only for unavoidable billing, permission, authentication, destructive or security approvals.

## PRODUCT
- R&L = marketplace + shipping/delivery. Customers in Kurdistan & Iraq order from European stores (later Turkish, Chinese, US brands). We buy/receive goods at our warehouse in Cologne, Germany and ship to Erbil, Sulaymaniyah, Duhok, Kirkuk, Baghdad.
- Slogan: "MOVE SMART. DELIVER FAST." (Europe ↔ Kurdistan ↔ Iraq)
- Logo: red and white (globe, swoosh arrow, letters R and L). Never modify it.
- Languages: Sorani Kurdish (default, RTL), Arabic (RTL), English (LTR).
- Prices in EUR and IQD, based on chargeable weight = max(actual, volumetric).

## ROUTES THAT MUST KEEP WORKING
/ · /stores · /stores?cat=... · /stores?fav=1 · /stores/request?store=..&intent=buy|ship · /quote · /market · /ai · /impressum · /privacy · /terms
Restyle, don't rewrite logic. Do not break routes, query params, APIs, data models or pricing formulas.

## HARD RULES
1. No fake data: no invented reviews, ratings, discounts, prices, stock, stats or delivery promises. If data is missing, show nothing or a clearly labeled placeholder.
2. Never imply partnership with brands. Brand/store logos keep a visible note that R&L is not an official partner of these brands.
3. Products against Islamic principles (all tobacco/smoking, vapes, alcohol, haram food & drink) stay permanently banned: blocked in the database, hidden from search, never linked. Never weaken or bypass this filter; add a test that proves banned products never appear in listings or search.
4. All UI text goes through i18n files. If unsure of a Kurdish/Arabic string, add it with // TODO(translate-review) instead of guessing silently.
5. Match the existing stack; add a dependency only if clearly needed and say why.

## DESIGN SYSTEM RULES
- All values as CSS variables: color, spacing (8px grid), radius (12–16px cards), shadows, type scale, motion. Light + full dark mode.
- Palette: deep brand red as accent only (buttons, badges, highlights); white/off-white surfaces; near-black text; soft neutral grays.
- Fonts: Vazirmatn (or Noto Sans Arabic) for Kurdish/Arabic, Inter for Latin/numbers; self-hosted, font-display: swap.
- CSS logical properties only (margin-inline-start, padding-inline, text-align: start…). Directional icons flip in RTL. <html lang> follows the active locale; <html dir> is always rtl (owner decision 2026-10-10: Sorani is primary and the layout never mirrors on language switch); data-textdir carries the language's own text direction (fonts, bidi).
- Motion 150–250ms, respect prefers-reduced-motion.

## Workflow
- Work through Steps 0–6 in order, one focused commit per step.
- For each step run lint, type-check, tests and build, fix regressions, and write a short report with changed files and exact test URLs before continuing.
- If a change would break a route, logic, data or a hard rule, stop and explain.
- Existing locale identity is ckb = Sorani and ku = Kurmanji. Preserve existing language IDs and saved preferences. Never silently relabel Kurmanji as Sorani.
- Catalogue photographs are examples, not evidence of available inventory. Prices, stock and extra product images may only be displayed when backed by data.

## PERMANENT R&L AI OWNERSHIP

Owner instruction (2026-10-13): **R&L AI — یاریدەدەری زیرەکی کڕیار** is exclusively a customer assistant for R&L Marketplace, Bring For Me, Delivery / Tracking. Read [module rules](src/modules/rl-ai/AGENTS.md) and [architecture](src/modules/rl-ai/README.md) before changing AI. Protected invariants: identity, R&L-only scope, dedicated ownership, authorized domain contracts, privacy/security, official brand and Sorani typography. Changes to invariants require a new explicit owner instruction; preserving maintenance remains allowed. No general answers, fabricated customer information, private table access, cross-domain writes or independent auth/database. Enforce boundaries with server policy and architectural tests, not prompts alone. AI-scoped typography uses existing Vazirmatn v33.003; global typography is preserved. Documentation/CODEOWNERS do not make files technically immutable.

## OWNER-ONLY R&L AI BASELINE — 2026-10-14

Explicit owner instruction: R&L AI is part of the permanent R&L foundation. Preserve its approved identity, customer-only domain, isolated module/contracts, privacy/security, verified-data responses, official red/white design, Sorani Vazirmatn/RTL, five shortcuts and existing image workflow across every unrelated change. A general request to redesign, modernize, refactor or upgrade R&L does not authorize changing this R&L AI baseline. Only a new explicit owner instruction specifically requesting the affected R&L AI change authorizes it; record that instruction and its scope in project memory. Bug fixes, security updates and internal maintenance may proceed only when they preserve the baseline. Never remove or weaken these rules, their tests or owner-review coverage to make another task pass.

## PERMANENT STRICT RULE — MODERN WEB GUIDANCE: NON-VISUAL TECHNICAL SCOPE ONLY

Owner instruction (2026-10-20). Applies to REGA Platform and R&L, to every Claude Code and Codex session, and to every use of the `modern-web-guidance` skill. Keep this section identical in the repository-root `AGENTS.md` and `CLAUDE.md`. No exceptions without explicit user approval.

Modern Web Guidance must operate in NON-VISUAL TECHNICAL SCOPE ONLY.

ABSOLUTELY FORBIDDEN:
- Changing colors, branding, logos or design tokens
- Changing layouts, spacing, typography, icons or animations
- Changing desktop or mobile appearance
- Modifying CSS, Tailwind classes or visual components
- Redesigning, restyling or visually optimizing any page

ALLOWED:
- Non-visual performance analysis and safe improvements
- Accessibility audits without visual changes
- Browser compatibility checks
- Technical code quality and security checks
- Non-visual SEO improvements

Before every change, inspect the diff. If it changes visual appearance, STOP and do not apply it. Visual issues may be reported but never automatically fixed.

Where guidance from `modern-web-guidance` conflicts with this rule, this rule wins. This rule adds to, and never replaces, the other instructions in this file.
