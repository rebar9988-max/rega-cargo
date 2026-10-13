# R&L Cargo — Claude Code instructions

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

Project rules live in AGENTS.md; follow them as well.

## PERMANENT USER LANGUAGE PREFERENCE
Always respond to the R&L Cargo project owner in Kurdish Sorani (ckb), regardless of the language of the incoming prompt. All status updates, explanations, questions, and final reports must be in Sorani. Keep code and technical identifiers in their original language. Override this preference only when the owner explicitly requests another language.

- This governs chat communication only; it does not change application code, i18n files or locale IDs (ckb = Sorani, ku = Kurmanji).
- Keep source code, identifiers, terminal commands, file paths, commit hashes and commit messages in their original language.

## PROJECT MEMORY (read first, every session)
Memory index: [PROJECT_MEMORY.md](PROJECT_MEMORY.md) → topic files in [docs/project-memory/](docs/project-memory/).
Memory is a guide, not proof. When memory disagrees with the code, GitHub or production, trust the live state and fix the memory.

Every task follows: READ MEMORY → VERIFY CURRENT STATE → IDENTIFY PENDING WORK → CONTINUE SAFELY → TEST → UPDATE MEMORY.

Before work:
1. Read `PROJECT_MEMORY.md` and the topic files relevant to the task.
2. Verify: `git fetch origin main`, open PRs and CI (GitHub MCP), and production when relevant (read-only).
3. Check `progress.md` and Git history so nothing is reimplemented.

During work: record meaningful decisions, verified root causes and checkpoints; keep unrelated code untouched.

After work, in the same branch/PR:
1. Run the quality gate (`docs/project-memory/architecture.md`) and record the real results only.
2. Update the affected files: `progress.md` (status, PR), `issues.md` (root cause/fix), `decisions.md` (append), `deployments.md` (release log), `features.md` / `architecture.md` / `design.md` / `integrations.md` when those facts changed.
3. Update "Current state" and "Next safe continuation point" in `PROJECT_MEMORY.md`, with the date and what was verified.

CI (GitHub Actions, see issues I-7):
- Hosted runners do not start while the account has a billing block (annotation: "recent account payments have failed or your spending limit needs to be increased"). Agents cannot fix or inspect billing and must never pay, raise limits or change payment methods.
- While blocked, merge only on the local gate recorded in `decisions.md`, state what was not run, and never report CI as green.
- Minutes are a paid quota: keep docs-only commits docs-only (they skip the Playwright layout job), push to a PR in batches, keep work-in-progress PRs as drafts (drafts skip CI until ready).
- Recovery once billing is fixed: re-run the newest `main` run, confirm `scope`, `verify` and `layout lock` pass, then update I-7.

Memory rules:
- Never write secrets, tokens, passwords or connection strings; env vars by *name* only.
- Never record a task, test result or deployment that did not actually happen. Mark assumptions as assumptions.
- Link to `DEPLOY.md`, `docs/integrations/` and `docs/redesign/` instead of copying them; use Git history for code detail.
- Append to logs; close or supersede old entries instead of deleting them.
- `scripts/project-memory.test.mjs` (part of `npm test`) checks that memory files exist, links resolve and no secret-like values are committed.

## PERMANENT R&L AI OWNERSHIP

Owner instruction (2026-10-13): **R&L AI — یاریدەدەری زیرەکی کڕیار** is exclusively a customer assistant for R&L Marketplace, Bring For Me, Delivery / Tracking. Read [module rules](src/modules/rl-ai/AGENTS.md) and [architecture](src/modules/rl-ai/README.md) before changing AI. Protected invariants: identity, R&L-only scope, dedicated ownership, authorized domain contracts, privacy/security, official brand and Sorani typography. Changes to invariants require a new explicit owner instruction; preserving maintenance remains allowed. No general answers, fabricated customer information, private table access, cross-domain writes or independent auth/database. Enforce boundaries with server policy and architectural tests, not prompts alone. AI-scoped typography uses existing Vazirmatn v33.003; global typography is preserved. Documentation/CODEOWNERS do not make files technically immutable.
