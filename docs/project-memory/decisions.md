# Decisions log

Append new decisions at the top. Format: date — decision — who/where (source). Never delete; mark superseded ones.

| Date | Decision | Source |
|---|---|---|
| 2026-10-22 | **P0: REGA ≠ R&L.** Two independent projects; never mix, never silently switch, always verify, stop automatically on mismatch. Identity guard (`scripts/project-identity-guard.mjs`, read-only, fail-closed, Sorani error) runs first in `deploy`, `deploy:staging` and the CI `verify` job; deliberately not in `build` because Cloudflare Workers Builds has no Actions/git context and `build` runs `db:migrate`. Rule identical in `CLAUDE.md` and `AGENTS.md`; guard and test are CODEOWNERS-protected | owner, `CLAUDE.md` / `AGENTS.md` |
| 2026-10-15 | Production DB migrations run only from a Workers Builds build of `main` or by hand outside CI; every other CI context skips even with `DATABASE_URL` (code gate, not just "no build variables"). Workflow, wrangler config, build/deploy commands, domains and secrets unchanged | owner CI/CD permanent-fix prompt, [runbook](../operations/cicd.md) |
| 2026-10-14 | UI refinement stays presentation-only: existing tokens or the homepage sheet's own 2.75rem control size, 44 px minimum touch targets via `--rl-control-h`, footer clears the bottom bar only where it exists, tablet home product grid 2 columns. Bring For Me draft checkbox left to open PR #97; hero gradient contrast reported, not changed (brand colour) | owner refinement prompt, [report](../verification/ui-refinement-20261014.md) |
| 2026-10-13 | Owner authorized critical R&L domain repair through staging and permitted production release. Remove verified WebKit skipped-subtree CSS optimization; keep real content/lazy images and retire old HTML via SW v12. Complete canonical www routing without touching REGA or database. Use existing full official-image local gate under billing-block policy; retain Cloudflare Worker identity guards and remove the temporary staging build trigger after verification | owner critical-domain prompt; [paired production evidence](../verification/rlgo-domain-20261013.md) |
| 2026-10-13 | Preserve production bindings and credentials in branch previews: explicit noindex vars, no database/secrets/AI provider bindings. Existing Preview Base is empty. Fix only the verified shared first-interaction race using the existing readiness hook; no taxonomy/routes/contracts or screenshot tolerances changed | first-click held-module diagnosis, native preview configuration docs, staging regression |
| 2026-10-13 | Owner explicitly authorized end-to-end unified modernization and gated merge/deploy in the current session. Keep all three journeys first-class; `/market` is internal inventory and `/stores` is the external retailer catalogue. Keep all existing deep links, compliance, auth and identity. Run the full official-image local gate under the existing billing-block policy, then use the already configured Cloudflare Builds path; no protection/billing settings change | owner master prompt, [report](../redesign/unified-journeys-20261013.md) |
| 2026-10-13 | Existing Cloudflare Builds preview failed fetching the private repository before build. Preserve that configuration and use the already-authorized existing Workers API version/assets/deployment flow, staging first, preserving bindings/secrets/headers; no new infrastructure or persistent credential | actual build log, current owner release authorization |
| 2026-10-13 | Recover the existing Hyperdrive origin to the verified cargo database with rollback readiness; no data/schema mutation, no migrating/deleting the incomplete duplicate. Preserve config ID/cache/connection limit and coordinate the existing fallback secret only after verifying the same cargo connection | current connected API + SELECT-only diagnostics; owner authorization |
| 2026-10-12 | PR #78 released while Actions is blocked (I-7): owner merged it, then instructed the deploy in chat; staging first, production `2e724d37`. Basis: local gate on the identical tree incl. official-image layout lock (387/12/0); `main` has no branch protection or required checks, so nothing was bypassed | owner messages in chat, PR #78 |
| 2026-10-12 | Phones/tablets: brand-red header bar (the logo's own red square merges into it) with the category strip directly under it, per the owner's reference screenshot. This is a deliberate exception to "red as accent only" for that one bar; content surfaces stay white. Layout stays rtl (menu + logo at the start/right), so the screenshot's left-to-right order appears mirrored | owner task in chat with screenshot, branch `claude/header-category-strip` |
| 2026-10-12 | Owner explicitly approved merging and deploying PR #72 without another pause. Bazaar and shipping have separate page components/designs; calculators and tracking belong to `/quote`. Validate against the latest `main` and preserve the Nitro update from #75 | owner message in chat, [verification](../redesign/shipping-separation.md) |
| 2026-10-12 | CI minutes: docs-only changes skip the Playwright layout job (verify still runs), draft PRs skip CI until ready, superseded PR runs cancel; `main` and manual runs are never cancelled. No gate step removed. Merged on the **local verify gate** (actionlint, typecheck, lint 0 errors, `npm test` 417/0, build, cf dry-run 4804.70 KiB = production) because hosted runs 190–191 were refused by the billing block; layout lock not run (workflow/docs-only, no Worker change, no deploy) | owner instruction "autonomous recovery", PR #77 |
| 2026-10-12 | PR #57 (CLS fix I-8, announcement landmark) merged and deployed while Actions is blocked (I-7), on a **reduced local gate**, because the official Playwright image cannot run in the agent environment (Docker CLI present, daemon unreachable). Run on the merged head: typecheck, lint (0 errors), `npm test` (417), build, cf dry-run, Playwright geometry 262 passed / 9 skipped on the 360px suite and all six Chromium device projects. **Not run:** screenshot comparison, WebKit, official image. The change is visually neutral after load. The #60 decision (full official-image gate) was not met; this is the owner's fresh chat instruction "go fix it, don't stop", with the gap stated here. `main` has no required checks | owner instruction in chat, PR #57 |
| 2026-10-12 | While GitHub Actions cannot start jobs (I-7, billing), PR #60 may merge and deploy on the full quality gate run locally in the official Playwright image (typecheck, lint, `npm test`, build, cf dry-run, layout lock). Repo stays private; no paid change. `main` has no required checks, so nothing is bypassed | owner authorization in chat, PR #60 |
| 2026-10-11 | Correct production database is `old-cherry-79292410` / `cargo`; `misty-recipe-03041407` is an incomplete duplicate. Fix by repointing, never by migrating `misty` | verified evidence, issues I-1 |
| 2026-10-11 | Project-wide memory system: `CLAUDE.md` entry → `PROJECT_MEMORY.md` → `docs/project-memory/`. Memory links to DEPLOY.md / docs/integrations / docs/redesign instead of duplicating them | this memory PR |
| 2026-10-11 | Chat replies to the owner are always in Sorani (ckb); code, commits, identifiers stay in their original language | owner, PR #56 (`CLAUDE.md`) |
| 2026-10-11 | Production database is Neon via Cloudflare Hyperdrive binding `HYPERDRIVE` (fallback `DATABASE_URL`). Connection string read only inside a request (workerd forbids global-scope I/O) | PR #54, PR #58 |
| 2026-10-11 | Product-link check enabled in production behind `PRODUCT_LINK_ENABLED` | PR #53 |
| 2026-10-11 | Integration usage policy: read-only by default; deploys, secrets, Neon writes, merges and paid tools need explicit owner approval | `docs/integrations/usage-policy.md` (PR #59) |
| 2026-10-10 | `<html dir>` is always `rtl`; layout never mirrors on language switch (Sorani primary) | owner, AGENTS.md |
| 2026-10-10 | Locale identity fixed: `ckb` = Sorani, `ku` = Kurmanji. Never relabel | AGENTS.md |
| 2026-10-10 | Ten-group catalogue; `food`, `beauty/health`, `pets/food` held until owner approves (halal/health) | DEPLOY.md "Catalogue" |
| 2026-10-09 | Noto Sans Arabic is the Arabic-script brand font (replaces Vazirmatn, kept as fallback) | owner, DEPLOY.md |
| 2026-10-09 | Custom domain `cargo.regaplatform.com`; old workers.dev host only 301-redirects and unregisters the SW | owner, DEPLOY.md step 7 |
| 2026-10-08 | R&L AI on in production with a hard daily cap of 200 identifications | owner, `wrangler.jsonc` |
| 2026-10-08 | `IQD_PER_EUR` = 1520 (override via env) | `src/lib/corridor.ts` |
| ≤2026-10-08 | Islamic compliance filter is permanent with no off switch; DB rows locked by triggers | PR #42, DEPLOY.md "Compliance" |
| ≤2026-10-08 | Western digits everywhere | PR #40 |
| ≤2026-10-08 | Cargo is fully separate from REGA (own Worker, own DB, never `rega-platform`) | DEPLOY.md |
| standing | No new dependency without a clear need; no paid services without owner authorization | AGENTS.md, owner |

## 2026-10-13 domain exclusivity

Owner explicitly requested closure of old domains and exclusive public service at https://www.rlgo.net. Detach cargo.regaplatform.com and its managed DNS; disable production/staging workers.dev, version preview URLs and Cloudflare Builds branch previews. Keep apex/HTTP canonical redirects, R&L data/bindings/architecture and REGA Platform unchanged. Staging remains deployed without public routing; future tests must use isolation or new explicit owner authorization.

## R&L AI ownership and verification — 2026-10-13

Owner explicitly authorized end-to-end R&L AI modernization only. Preserve identity, R&L-only purpose, isolated ownership, authorized contracts, privacy, brand and Sorani typography. Reuse selected #69 typed-chat primitives and #68 budget hardening without merging stale unrelated branches. No provider prose/private data enters the assistant response. Missing release credentials/protection visibility are external blockers, not permission to bypass safeguards. See [verification report](../ai/rl-ai-verification-20261013.md).


## 2026-10-14 owner-only R&L AI baseline

Owner explicitly reconfirmed that R&L AI must remain a permanent R&L foundation across unrelated changes; only the owner can explicitly request an affected baseline change. Identical rules recorded in root AGENTS/CLAUDE and module AGENTS/README. General modernization/refactor requests do not authorize drift. Preserving maintenance allowed. Exact identity, tool allowlist and Sorani baseline regression checks plus governance CODEOWNERS coverage added; no application/runtime or infrastructure change. Review rules are not technical immutability or branch protection.

Source: owner chat, 2026-10-14 — “دەبێ ئەوە لە بنچینەوە لەناو R&Lتۆمار بكرێ واتا لەگەل هیچ گۆڕانكاریەك نەگۆڕێ مەگەر خۆم داوی بكەم”. The authorized scope is permanent AI baseline preservation and owner-only changes, not a redesign or new architecture. Focused governance/memory tests: 10 passed. Three isolated mutation experiments proved identity, tool expansion and refusal drift fail the baseline check; production sources were never mutated.

## 2026-10-14 five-improvement implementation and held release

Owner authorized implementation/commit/merge/deploy of five approved improvements, superseding the earlier research-only scope, while expressly blocking release with missing verified legal information. Implement on the current main foundation; preserve five module ownership boundaries, existing R&L AI baseline, pricing, branding, canonical domain and one database. Use opt-in short-lived non-sensitive drafts, customer-sent email fallback, additive isolated-tested administration schema, database-backed role checks and atomic immutable audit. Do not invent legal identity/policy, real shipment times, prices or an owner account. Keep the review PR draft and main untouched until verified facts and authenticated owner/OTP checks permit safe release; main auto-deploy does not run the local release gate. No paid provider or quota changes.

## 2026-10-14 explicit beta release authorization

Owner chat: “بكە چونكە ئەو ئەپە beta لە تەواوبوونە لە كۆتای كە بەفەرمی بلاوكرایەوە beta نەما ئەوكات هەموو پر دەكرێتەوە”. This specifically supersedes the earlier incomplete-legal-content deployment hold for the beta phase. Release policy is owner-controlled source configuration: stage=beta plus allowIncompleteLegalInfo=true permits beta release while legal facts remain incomplete/unverified; stage=public still requires complete verified business fields and approved multilingual policies. Existing pending legal/trust notices remain visible and no company facts are invented. Authentication, approved database roles, audit protections and public privilege denial remain mandatory; unavailable real SUPER_ADMIN/OTP verification is an honest beta limitation, not a reason to seed an identity or weaken authorization. No new paid service, public hostname or auth provider is introduced.

## 2026-10-14 reference homepage (owner screenshot)

Owner chat: asked to implement the attached R&L homepage screenshot exactly, then deploy to www.rlgo.net. Decision: `/` (no filters) renders the reference composition (five-control header, headphone hero, 8 category positions, 4 featured products, Bring For Me + CARE+ banners, 4 benefit cards). This supersedes the earlier "categories live only in the marketplace" decision (2d02a7d) and the tracking-form card on the home. Hard rules still win over the screenshot: no invented prices/discounts/stock (real marketplace data, or labelled examples), CARE+ shown as "coming soon", benefits limited to real features. Open owner questions: keyed white logo variant, removed home tracking form. Details: [docs/implementation/RL_DESIGN_PROGRESS.md](../implementation/RL_DESIGN_PROGRESS.md).

## 2026-10-16 PR #109 merged on the local gate (owner chat instruction "deploy")

Owner chat (Sorani, "دیپلۆی بكە") after the PARTIAL report: merge PR #109 and deploy through the existing Cloudflare Workers Builds path. Basis: local gate on the identical tree (typecheck, lint 0 errors, 236 + 255 tests, build, cf dry-run, Chromium layout suite on the built Worker 394 pass / 12 skipped / 0 fail, axe 0 violations, production-vs-branch pixel diff max 0.051 %, page heights identical). **Not run:** official-image layout lock, pixel baselines (stale on `main` already), WebKit - Docker daemon unavailable and hosted Actions billing-blocked (I-7). Source change is one class on the Bring For Me draft label; `main` has no required checks, so nothing was bypassed. [Report](../verification/ui-touch-targets-20261016.md).

## 2026-10-16 PR #111 merged on the local gate (owner chat instruction "Merge و Deploy")

Owner chat (Sorani) after the PARTIAL report: merge PR #111 and deploy through the existing Cloudflare Workers Builds path. Basis: local gate on the identical tree (typecheck, lint 0 errors, 236 + 255 tests, build, cf dry-run, Chromium layout suite on the built Worker 394 pass / 12 skipped / 0 fail, 480-state width matrix overflow 0, production-vs-branch pixels 97/108 identical with only the intended areas differing). **Not run:** Firefox and WebKit (not installed), official-image layout lock and pixel baselines (no Docker; baselines stale), hosted Actions (billing-blocked, I-7). Source change is CSS only (`ref-home.css`); `main` has no required checks, so nothing was bypassed. [Report](../verification/final-hardening-20261016.md).

## 2026-10-18 PR #115 merged on the local gate (owner chat instruction "دیپلۆی بكە")

Owner chat (Sorani) after the code-defect report: merge PR #115 and deploy through the existing Cloudflare Workers Builds path. The four policy items in the report (phone resend lockout, 0.1 kg chargeable rounding, rate-limit fail-open, review-level matches on requests) were NOT changed and remain owner decisions. Basis: local gate on the identical tree (tsc 0 errors, ESLint 0 errors, `npm audit` 0, 236 + 261 tests incl. 6 regression tests that fail on the old code, build, cf dry-run, Chromium layout suite on the built Worker 394 pass / 12 by-design skips / 0 fail). **Not run:** Firefox and WebKit, official-image layout lock and pixel baselines, hosted Actions (billing-blocked, I-7). The compliance change only makes the filter stricter. `main` has no required checks, so nothing was bypassed. [Report](../verification/code-defects-20261017.md).



## 2026-10-18 release continuation after #115/#116

Owner authorized implementation and release of the four previously deferred policy items: fixed five-minute/five-attempt OTP window with atomic 60-second resends and single consumption; decimal-comma weight inputs with all tenth-kilogram boundaries covered and pricing unchanged; fail-closed missing/error rate limits; transactional in-app staff review notices via additive migration 0016. No UI redesign, module boundary change, account grant or paid service. Details, measured checks, deployment state and remaining limitations: [release evidence](../verification/release-hardening-20261018.md).

Gate follow-up: the unchanged-base English slow-font test reproduced CLS 0.0589166 (>0.05). Local Latin fallback metrics repair in `src/styles.css`/`tokens.css` makes that existing test pass while primary fonts and final loaded-font design remain unchanged. Final full browser counts are in the same release report.

## 2026-10-18 digit-input fix merged on the local gate (owner chat instruction)

Owner chat (Sorani, then the English brief): do the inspect-fix-test-deploy-verify task myself. A second session had already released OTP/limit/review/weight fixes (`release-hardening-20261018.md`), so only the remaining defect was shipped: weight and size inputs reject Arabic-Indic/Persian digits and the quote server accepts `1e1`. One shared parser, no pricing change. Basis: local gate (tsc 0, ESLint 0 errors, 236 + 271 tests incl. regressions that fail on `dc5bec0`, build, cf dry-run, Chromium suite on the built Worker 395 passed / 12 by-design skips / 0 failed). **Not run:** Firefox, WebKit, official-image layout lock, hosted Actions (billing-blocked, I-7). [Report](../verification/digit-input-20261018.md).

## 2026-10-18 hero silk continuation — prepared, not merged

Owner requests silk-only motion, preservation, passing checks and verified deployment. PR #122 was found open, not merged; the earlier heading claiming a merge was incorrect. Its procedural replacement folds were changed to subpixel/pixel-scale deformation of the original photograph, with the existing foreground alpha matte protecting headphones and podium. The transparent overlay leaves the original product image below it. No 3D asset exists; no model is fabricated. Original composition, palette, text, layout and functionality are preserved. See the [verification report](../verification/hero-silk-20261018.md) for measured checks and actual release state. Never bypass a failing layout gate. PR #121 is an existing separate test-baseline prerequisite; owner approval to merge it was requested, not inferred.

## 2026-10-18 owner-authorized original silk publication

Owner viewed the actual animated preview and explicitly requested publication on the website. This authorizes the necessary tested #121 baseline prerequisite and #122 release, not unrelated app changes. Both merged normally; the exact final head passed the complete hosted gate before the animation merge. Existing main-only Workers Builds handled delivery. Direct allocation and real production browser checks establish the release; no safeguard waiver, new public hostname, fake 3D model or business change. [Release evidence](../verification/hero-silk-20261018.md).


## 2026-10-19 Owner-requested visible silk repair

Owner explicitly reports imperceptible motion and requests repair; earlier explicit publication authorization persists. Increase only original-silk local deformation and sheen, keep the same 18/26-second timing and all UI/product geometry. Derive smooth protection once from the existing matte rather than replacing folds or assets. Release through existing checks and main-only Builds; no new approval, infrastructure or business scope. [Evidence](../verification/hero-silk-20261019.md).


## 2026-10-19 Urgent quality restoration and isolated renderer repair

Owner reports no motion, low quality and mixed colours and explicitly requests urgent repair. Reuse the verified original static main-built version as an immediate reversible mitigation; git diff proves only the four hero-related runtime files differ. Continue the animation repair, preserve original colours/assets/geometry and existing delivery safeguards; no new permission or unrelated scope is inferred. Native-quality claims require native evidence. [Evidence](../verification/hero-silk-mobile-20261019.md).

## 2026-10-19 — Independently authorized, one-time first owner

Explicit owner instruction requires both independent platform-control confirmation and recipient email proof. Use the existing unified Better Auth identity store; no automatic email-based promotion, public signup, generated owner password or new paid mail provider. Authorize the singleton only through authenticated control-plane access with immutable audit; expire/hash the invitation; atomically verify/grant/consume/audit after native credential authentication; permanently close after success. Preserve the existing phone flow, architecture and AI baseline. [Runbook](../operations/first-owner.md).

## 2026-10-19 Owner-requested persistent mobile bottom navigation

Owner reports the phone bottom navigation disappears at the top of the homepage and asks for a permanent, minimal fix. Root cause (code audit): the homepage is the only route rendered as `<Shell reference>`, and `reference` deliberately skipped the `rl-bottom-nav` element and the footer's bottom-bar clearance (PR #100). The existing fixed/safe-area CSS (`position: fixed`, `--rl-z-header`, `app-bottom-bar`, `viewport-fit=cover`) was already correct. Fix: render the same five-tab bar on every page and always reserve footer clearance; header, hero, R&L AI capsule, routes, icons, labels and desktop (hidden from 1024px) are untouched. Layout tests that asserted "no bottom bar on the home" were inverted. Phone/tablet `/` screenshot baselines must be re-rendered in the official image (`update_baselines` dispatch).


## 2026-10-19 — Customer email OTP inside existing Better Auth

Owner brief "R&L EMAIL OTP PRODUCTION ACTIVATION" authorized implementation, merge, deploy and live verification. Email customers are plain Better Auth `user` rows with native sessions (no second login system); codes are issued/consumed by our own atomic SQL in a narrow plugin because the stock emailOTP plugin signs in any user, including the owner. Public code flow never opens password/provider-linked, admin/super_admin, disabled, unverified or invited identities. Phone code stays isolated and appears only when its provider is configured. Additive migration only, applied after a Neon backup branch. [Evidence](../verification/email-otp-20261019.md).

## 2026-10-21 — Bring For Me Phase 1 design decisions

Owner approved the plan with eight conditions; where the spec was silent: (1) Workers `fetch()` cannot pin DNS, so the import connects through `cloudflare:sockets` to an IP vetted via Cloudflare DoH and fails closed when that is unavailable (some Cloudflare-proxied stores will fall back to manual entry). (2) Every business number is an owner setting; only the volumetric divisor (5000) and the free-delivery basis (`after_discount`) have code defaults, and a missing setting refuses the quote. (3) Exchange rates are stored as micro-IQD integers, product prices as minor units in their source currency (USD/EUR/TRY/GBP). (4) Free-delivery progress is measured after the coupon unless the owner sets `before_discount`; the coupon applies to everything except home delivery and is capped at that base. (5) `general` and `food` categories and any review-level keyword need owner approval before quoting; banned matches are rejected with only time/category/domain logged. (6) Quotes are immutable estimates with version, expiry and a settings/items snapshot; approval is recorded by R&L staff only. (7) Cart removal and coupon/setting changes are soft (nothing is deleted). (8) The marketplace compliance engine is reused as is, never weakened. [Report](../verification/bring-for-me-phase1-20261021.md)


## 2026-10-22 — First-owner activation for an email-code account

Owner approved (chat, option 1) changing activation so an existing account without a password can be activated by a fresh (≤15 min) verified email-code session for exactly the invited email, because the current Rebar account has no credential row and password sign-in could never succeed. Invitation still hash-only, single use, expiring; no SQL role grant; no password created. Code: `sessionProof` in `src/lib/owner/service.server.ts`, tests in `src/lib/owner/session-proof.test.ts`.

## 2026-10-22 — European stores directory scope and Bring For Me boundary

Owner brief (chat) authorized refining only the Marketplace European stores directory and its official-site handoff, countries DE, CH, IT, FR, GB, excluding China/US without deleting shared records. Decisions: (1) country storefronts of retailers already listed are a separate `REGIONAL_STOREFRONTS` list used only by the directory (`DIRECTORY_STORES`), not added to `STORES`, because `STORES` also drives Bring For Me link validation, the global header search and the R&L AI shop-name filter (out of scope); (2) consequently Bring For Me is offered only for `STORES` entries, storefronts show an honest note, and enabling them is an open owner decision; (3) SHEIN (`INT`) is not listed in the European directory but stays in `STORES`; (4) no iframe/embedded browser, no simulated checkout; the official site opens in a new tab with `noopener noreferrer` and a return card offers Bring For Me (sessionStorage, this tab only); (5) the store grid gets its own layout-lock column count `storeColumns` 2/3/4 — a deliberate design change for compact cards; (6) the store and country selects were replaced by the chip row and the rail to avoid duplicate controls.

