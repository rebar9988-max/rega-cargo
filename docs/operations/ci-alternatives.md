# CI while GitHub-hosted Actions is blocked (I-7) — alternatives

Status 2026-10-15: every hosted run of the "Cargo quality gate" ends in about 3 s with `runner_id: 0` and no log. No runner is ever assigned (account billing block, owner-only to fix). `main` has no branch protection or required checks, so nothing is bypassed today; it also means nothing *enforces* the gate. This page lists the legitimate replacements, in priority order, and what each needs from the owner. None of them marks a GitHub check as passed when it did not run.

## Coverage of the hosted gate

| Hosted job | What it checks | Option A: Workers Builds | Option B: local gate | Option C: self-hosted runner |
|---|---|---|---|---|
| `scope` | docs-only changes skip layout | n/a (Builds watch paths) | built in | identical |
| `verify` | `npm ci`, typecheck, `npm test` (incl. banned-product tests), lint, build without DB, `cf:dry-run` | **yes**, plus compliance scan and `npm audit`, as a GitHub check run on every PR commit once enabled (tests on Node 22 like the hosted gate) | yes | identical |
| `layout lock` | Playwright geometry + screenshots, Chromium + WebKit, official image | no (no browsers, 20 min limit) | geometry on Chromium only without Docker; full parity only on a machine with Docker | identical, if the machine has Docker |

## Option A — existing Cloudflare Workers Builds (owner-approved 2026-10-15, not yet enabled)

Owner chat 2026-10-15: "I approve Option A: Cloudflare Workers Builds as an alternative CI verification system". Constraints: preserve production and all existing configuration, never deploy PR branches, keep screenshot and WebKit verification as separate gates, verify real GitHub check reporting before relying on it, no paid upgrade.

**Current state (verified 2026-10-15 ~05:00 UTC):** the Worker `rega-cargo` builds `main` through Workers Builds (`npm run build`, then `npm run release:check && npx wrangler deploy`). Non-production (preview) builds are **off**: PR #103 and #104 carry only the three blocked Actions checks (`scope`, `verify`, `layout lock`) and no Workers Builds check run. DEPLOY.md "Branch previews" records the owner decision that disabled them. The agent cannot change this: the only Cloudflare credential in agent sessions is DNS-scoped and gets HTTP 403 (code 10000) on `workers/scripts` and `builds/workers/rega-cargo/triggers`. **The configuration below is an owner dashboard action.**

### Owner steps (Workers & Pages → `rega-cargo` → Settings → Build)

Change **only** these two settings, in one save:

1. **Non-production branch deploy command** (the "preview command"). Replace the default `npx wrangler preview` with:
   ```sh
   DATABASE_URL= npm exec --yes --package=node@22 -c 'node --version && npm run typecheck && npm test && npm run lint && npm run compliance:scan && npm audit --audit-level=high && npm run cf:dry-run'
   ```
   It uploads nothing: `cf:dry-run` is `wrangler deploy --dry-run`, so no Preview URL, Version URL, version or hostname is created and the exclusive-domain rule stays intact. Set the command **before or in the same save** as step 2, never after; with the default command a branch build would create a preview.
2. **Builds for non-production branches: on** (all non-production branches; PR branches are `claude/*`).

Leave everything else exactly as it is: production branch `main`, build command `npm run build`, deploy command `npm run release:check && npx wrangler deploy`, root directory, API token, **no build variables** (in particular never a `DATABASE_URL`: the build runs `db:migrate` when it is set), no `NODE_VERSION`, custom domain, `preview_urls: false`, workers.dev off. The production build and deploy therefore run the same commands on the same Node version as today.

Why the checks run on Node 22 through `npm exec`: Workers Builds' default image uses Node 24, while the hosted gate (`quality.yml`) pins Node 22. On Node 24 the whole chain passes except one unit-test file: `src/lib/ai/ai.test.ts` passes every assertion but is marked failed because Node 24's built-in fetch throws `ERR_INVALID_STATE: ReadableStream is already closed` asynchronously after the oversized-upload test cancels a `FormData` request body (issues I-12). Production runs on workerd, not Node. Setting `NODE_VERSION=22` as a build variable would also change the production build, so it is not used. The production-identical build itself (`npm run build`) still runs on the default Node in every branch build, which also proves the build works there.

### What it verifies, and what it does not

| Check | In the branch build | Measured locally on PR #104 head `8cbd4f1` with the exact command (Node 24 base, `npm exec` → Node 22.23.3), 54 s |
|---|---|---|
| `npm ci` | yes (Builds installs from the lockfile) | pass |
| `npm run build` (no DB) | yes, the build command | pass on Node 24 |
| typecheck | yes | pass |
| `npm test` (incl. compliance, banned-product, i18n, R&L AI boundary and project-memory tests) | yes | 486 passed, 4 existing skips, 0 failed |
| lint | yes | 0 errors, 5 existing warnings |
| compliance scan (bundled data + throw-away PGLite) | yes | 0 clear violations; 4 known "review" false positives (de "Lager", ar "الكل") |
| `npm audit --audit-level=high` | yes | 0 vulnerabilities |
| `cf:dry-run` | yes | pass, nothing uploaded |
| Playwright geometry + screenshots, Chromium + WebKit (`layout lock`) | **no**: no browsers in the build image, 20 min limit | separate gate, see below |

**Screenshot and WebKit stay separate required gates.** They run only in the official Playwright image: hosted `layout lock` once billing is fixed (I-7), or `npm run quality:local` (Option B) on a machine with Docker. A green Workers Builds check never stands in for them; without them a PR is reported **PARTIAL**, not passed.

### Acceptance before relying on it (agent, after the owner saves)

1. Push the next commit to PR #104 (or ask Cloudflare to retry the latest commit). Confirm on GitHub that a Workers Builds check run for `rega-cargo` appears on that exact head SHA, with conclusion `success`, and that its log shows `v22.x`, the test summary and `--dry-run: exiting now`.
2. Confirm that the Cloudflare PR comment shows **no** Preview URL or Deployment URL, that the Worker's versions/deployments list is unchanged, and that `https://www.rlgo.net` still serves the same version.
3. Negative test: on a throw-away draft branch, a deliberately failing unit test must turn the check red. Delete the branch afterwards.
4. Record the check name, build ID and results in `docs/project-memory/deployments.md`, then update DEPLOY.md "Branch previews" and the `wrangler.jsonc` comment (builds on, non-deploying command).

Until steps 1–3 pass, nothing relies on Workers Builds and the merge policy stays the local gate of decision 2026-10-12.

### Limitations

- Each check is a dashboard setting, not repository code: anyone with Cloudflare dashboard access can change the command. Re-check it after any account change.
- Branch builds run PR code with the build's Cloudflare API token in the environment. The repository is private and only the owner and agents push to it; do not enable builds for fork PRs.
- Docs-only pushes trigger a full branch build unless build watch paths are set (they are not; leaving them unset keeps production behaviour unchanged). A few minutes per push, within the 3,000 free minutes per month.
- `main` has no branch protection, so the check is informative, not enforced. Making it required is a repository-rule change that needs a separate owner approval.
- `npm audit` depends on the npm advisory service; a newly published high advisory will turn a previously green commit red. That is intended.

## Option B — complete local gate (available now, used for every merge since I-7)

`scripts/quality-local.mjs` from draft PR #85 (`npm run quality:local`) runs the same `verify` steps plus a compliance scan of the bundled data and `npm audit`. It runs the layout lock in the official Playwright image when Docker is available. Without Docker it reports **PARTIAL** (exit 2): geometry only, no screenshots or WebKit. It never reports PASS in that case. The agent environment has no Docker daemon, so agent runs are always PARTIAL. A full PASS needs a machine with Docker (the owner's computer).

## Option C — self-hosted runner (only if A and B are not enough)

Needs an always-on machine controlled by the owner (with Docker for the layout lock), a runner registered by a repository admin, and `runs-on: [self-hosted, linux]` in `quality.yml`, which is a workflow change. Caveats:
- It is not documented whether the current billing block also stops self-hosted jobs.
- GitHub announced a per-minute charge for self-hosted runners on private repositories and then postponed it. Check [GitHub's Actions billing docs](https://docs.github.com/en/actions/reference/usage-limits-billing-and-administration) first.
- A runner that executes PR code needs isolation (a dedicated user or VM; the repository stays private).

An ephemeral agent container is not a suitable runner.

## What stays the same

No check is renamed, skipped or reported as green. Hosted CI results remain "blocked" until billing is fixed (CLAUDE.md I-7 recovery: re-run the newest `main` run, confirm `scope`, `verify` and `layout lock`, update I-7).
