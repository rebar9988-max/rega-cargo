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

Project rules live in AGENTS.md; follow them as well.

## PERMANENT USER LANGUAGE PREFERENCE
Always respond to the R&L Cargo project owner in Kurdish Sorani (ckb), regardless of the language of the incoming prompt. All status updates, explanations, questions, and final reports must be in Sorani. Keep code and technical identifiers in their original language. Override this preference only when the owner explicitly requests another language.

- This governs chat communication only; it does not change application code, i18n files or locale IDs (ckb = Sorani, ku = Kurmanji).
- Keep source code, identifiers, terminal commands, file paths, commit hashes and commit messages in their original language.

## PROJECT MEMORY (read first, every session)
Memory index: [PROJECT_MEMORY.md](PROJECT_MEMORY.md) → topic files in [docs/project-memory/](docs/project-memory/).
Memory is a guide, not proof. When memory disagrees with the code, GitHub or production, trust the live state and fix the memory.

The "CODEX — NEXT SESSION HANDOFF" section in `PROJECT_MEMORY.md` is the shared cross-agent handoff. Refresh it at the end of every session.

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
- Local gate: `npm run quality:local` runs every CI step plus the compliance scan and `npm audit`, and writes `.quality/local-report.json`. Exit 0 = pass (layout lock ran in the official Playwright image), 2 = partial (no Docker daemon: geometry only, no screenshots/WebKit; never report it as equal to CI), 1 = a check failed.
- Recovery once billing is fixed: re-run the newest `main` run, confirm `verify` (it now includes the docs-only scope step) and `layout lock` pass, then update I-7.

Memory rules:
- Never write secrets, tokens, passwords or connection strings; env vars by *name* only.
- Never record a task, test result or deployment that did not actually happen. Mark assumptions as assumptions.
- Link to `DEPLOY.md`, `docs/integrations/` and `docs/redesign/` instead of copying them; use Git history for code detail.
- Append to logs; close or supersede old entries instead of deleting them.
- `scripts/project-memory.test.mjs` (part of `npm test`) checks that memory files exist, links resolve and no secret-like values are committed.
