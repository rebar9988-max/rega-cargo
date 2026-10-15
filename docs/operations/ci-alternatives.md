# CI while GitHub-hosted Actions is blocked (I-7) — alternatives

Status 2026-10-15: every hosted run of the "Cargo quality gate" ends in about 3 s with `runner_id: 0` and no log. No runner is ever assigned (account billing block, owner-only to fix). `main` has no branch protection or required checks, so nothing is bypassed today; it also means nothing *enforces* the gate. This page lists the legitimate replacements, in priority order, and what each needs from the owner. None of them marks a GitHub check as passed when it did not run.

## Coverage of the hosted gate

| Hosted job | What it checks | Option A: Workers Builds | Option B: local gate | Option C: self-hosted runner |
|---|---|---|---|---|
| `scope` | docs-only changes skip layout | n/a (Builds watch paths) | built in | identical |
| `verify` | `npm ci`, typecheck, `npm test` (incl. banned-product tests), lint, build without DB, `cf:dry-run` | **yes**, as a GitHub check run on every PR commit | yes | identical |
| `layout lock` | Playwright geometry + screenshots, Chromium + WebKit, official image | no (no browsers, 20 min limit) | geometry on Chromium only without Docker; full parity only on a machine with Docker | identical, if the machine has Docker |

## Option A — existing Cloudflare Workers Builds (recommended first step)

The Worker `rega-cargo` is already connected to this repo through Workers Builds (production branch `main`: build `npm run build`, deploy `npm run release:check && npx wrangler deploy`). Workers Builds posts **check runs and PR comments on GitHub** and allows a custom non-production command. [Cloudflare docs: configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) · [GitHub integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/) · [limits](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/): included build minutes (3,000 Free / 6,000 Paid per month), 20 min per build, 8 GB RAM.

Proposed settings (Workers & Pages → `rega-cargo` → Settings → Build), **owner action, owner authorization required**. The permanent domain rule forbids enabling Builds branch previews without it, and agents have no Cloudflare credential:

1. **Build command** (production and non-production): `npm run typecheck && npm test && npm run lint && npm run build`. A failing check then also stops a broken `main` from deploying.
2. **Non-production branch builds: on**, with the **non-production command** set to `npm run cf:dry-run` instead of the default `wrangler preview`/`versions upload`. It uploads nothing and creates no Preview URL, Version URL or hostname, so the exclusive-domain rule and `preview_urls: false` stay intact.
3. Keep **no build environment variables** (`DATABASE_URL` must stay unset there; the build's migration step then skips).
4. Optional, later and owner-only: a branch protection rule on `main` requiring the Workers Builds check. That is a repository rule change, so it needs explicit owner approval.

Expected cost: a few build minutes per PR commit, well within the included minutes. Measured locally on PR #104's head: typecheck 11 s, `npm test` 23 s, lint 7 s, build 8 s, dry-run 2 s, plus `npm ci` and the Builds container start. Verification after enabling: push to an open PR and confirm a "Workers Builds" check appears with the four commands in its log and **no** Preview/Version URL in the PR comment.

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
