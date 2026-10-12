# R&L Cargo — Claude Code instructions

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
