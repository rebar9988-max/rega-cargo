# CI/CD runbook — GitHub Actions, Cloudflare Workers Builds, previews

Canonical, verified description of how R&L code is checked and deployed. Read it before
touching `.github/workflows/`, `wrangler.jsonc`, `package.json` build scripts,
`scripts/migrate.mjs` or the Workers Builds settings. Last verified **2026-10-15 ~06:00 UTC**.

## 1. Verified current state

| Item                                               | State                                                                                                                                                                                       | Evidence (2026-10-15)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production                                         | Worker `rega-cargo`, version `4a48cd8c-c337-46e1-9ee8-5cb9994f789e`, built from `main` `5d66eee`                                                                                            | Workers Builds check run on `5d66eee`: build `b8e80818`, success, "Version ID: 4a48cd8c…". 100 % traffic comes from the owner's dashboard inspection; the agent cannot query deployments                                                                                                                                                                                                                                                                                                                                                                                                 |
| Production deploys                                 | Workers Builds, production branch `main` only: build `npm run build`, deploy `npm run release:check && npx wrangler deploy`                                                                 | check runs on `main` commits carry a Version ID                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| PR / branch builds                                 | **On, non-deploying** (owner dashboard change 2026-10-15, planned in PR #103 `docs/operations/ci-alternatives.md`: typecheck, tests, lint, compliance scan, audit, `cf:dry-run` on Node 22) | PR #103 head `c0d7521`: check run `Workers Builds: rega-cargo`, build `11b23adc`, success, **no Version ID**; Cloudflare's PR comment says "No Preview URL". **Not yet verified:** the exact command and that the tests ran (build log is dashboard-only; ~32 s from push to result on `c0d7521`, and **~16 s** on PR #106 `4c478b0` (build `e9397c71`, push ~06:07:27, success 06:07:43 UTC), far too short for `npm ci` + build + tests) and the negative test (a failing test must turn the check red). Until both are confirmed, this check proves only "builds and does not deploy" |
| GitHub Actions (`Cargo quality gate`)              | **Blocked by account billing**. Every job ends in ~3 s, `runner_id: 0`, no log                                                                                                              | check-run annotation: "The job was not started because recent account payments have failed or your spending limit needs to be increased" (PR #104 run `38681317757`, PR #103 run `38689238421`)                                                                                                                                                                                                                                                                                                                                                                                          |
| Branch protection / rulesets / required checks     | **Unavailable on this plan**: private repo on GitHub Free                                                                                                                                   | `GET branches/main/protection`, `rulesets`, `rules/branches/main` → HTTP 403 "Upgrade to GitHub Pro or make this repository public"                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Version preview URLs                               | Off (`preview_urls: false`); `https://<version>-rega-cargo.rebar9988.workers.dev` → 404                                                                                                     | live probe                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `rega-cargo.rebar9988.workers.dev`                 | **Answers**: every path → noindex 301/308 to `https://www.rlgo.net` (legacy-host wrapper). It never serves the app or an API                                                                | live probe. Config says `workers_dev: false` and wrangler posts `enabled:false` on each deploy, so the cause is platform/dashboard state the agent cannot read (§4)                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Staging `rega-cargo-staging.rebar9988.workers.dev` | 404 (error 1042), no public URL                                                                                                                                                             | live probe                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Domains                                            | `www.rlgo.net` 200; `rlgo.net` and `http://` → 301 to canonical HTTPS www, path and query kept                                                                                              | live probe                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

Agent credentials: the only Cloudflare token in agent sessions is DNS-scoped. Workers scripts,
deployments, subdomain and Builds trigger endpoints return code 10000 (Authentication error), so
the trigger configuration itself cannot be read by an agent. Its effect is verified indirectly
through the GitHub check runs and PR comments above. GitHub Actions settings, runners, secrets and
environments are blocked by the agent proxy.

## 2. Invariants and where each is enforced

| Invariant                                                 | Enforced by                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main` is the only production branch                      | Workers Builds setting "production branch" (dashboard). GitHub Actions has no deploy job                                                                                                                                                                                                                                                                                              |
| PRs never deploy to production                            | Non-production command is non-deploying (`cf:dry-run` = `wrangler deploy --dry-run`). Check: a PR build's check run must have **no Version ID**                                                                                                                                                                                                                                       |
| Preview / PR builds never migrate the production database | **Code**: `migrationGate()` in `scripts/migration-plan.mjs`. In any CI only a Workers Builds build with `WORKERS_CI_BRANCH=main` may run `db:migrate`; branch builds, GitHub Actions and self-hosted runners skip, even if `DATABASE_URL` is set. Tests: `scripts/migration-plan.test.mjs`. Second layer: Workers Builds has **no build variables** (in particular no `DATABASE_URL`) |
| Preview URLs disabled                                     | `preview_urls: false` (top level and `env.staging`); version URLs return 404                                                                                                                                                                                                                                                                                                          |
| Previews isolated from production data                    | Root `previews` block: noindex, AI and product-link off. No version is created from branches, so no preview runs against production bindings                                                                                                                                                                                                                                          |
| Production secrets and database protected                 | Secrets only via `wrangler secret put` (never in `vars`, never as build variables). Hyperdrive binding only at top level; `env.staging` has none                                                                                                                                                                                                                                      |
| Domains and routes unchanged                              | `routes` in `wrangler.jsonc` (www.rlgo.net, rlgo.net). Never list `regaplatform.com` hosts (REGA worker `rega-platform`)                                                                                                                                                                                                                                                              |

Why the migration gate matters: Workers Builds runs the **same build command** for every branch
before the deploy or non-production command, and its build variables and secrets are not split
by branch. `npm run build` ends in `npm run db:migrate`. Without the gate, one `DATABASE_URL`
build variable would let unreviewed branch code migrate production.

## 3. Never do

- Never add `DATABASE_URL` (or any production secret) as a Workers Builds build variable. Run
  production migrations by hand per DEPLOY.md ("Database"), after a Neon branch/snapshot.
- Never set the non-production command to `npx wrangler versions upload` or the default
  `npx wrangler preview`: both create a Worker version with the production bindings.
- Never set `NODE_VERSION` as a build variable (it also changes the production build).
- Never mark a blocked GitHub Actions check as passed, skip or disable a test, push an empty
  commit or close/reopen a PR to re-trigger CI.
- Never enable workers.dev, version preview URLs or public preview routing without explicit owner
  authorization (CLAUDE.md domain rule).
- A green `Workers Builds: rega-cargo` check is **not** the layout lock. Screenshot and WebKit
  checks still need hosted `layout lock` (after billing is fixed) or the official Playwright image
  locally; without them a PR is PARTIAL, not passed.

## 4. Owner-only actions (agents cannot do these)

1. **GitHub billing** (Settings → Billing and plans): resolve the failed payment or spending
   limit. Then re-run the newest `main` run and confirm `scope`, `verify` and `layout lock`
   (CLAUDE.md I-7 recovery).
2. **Required checks**: GitHub Free cannot protect `main` in a private repository. Options are
   GitHub Pro or making the repository public (both owner decisions). Until then the gate is
   policy (decisions.md), not enforcement.
3. **Production workers.dev**: Workers & Pages → `rega-cargo` → Settings → Domains & Routes →
   `workers.dev` → Disable, if the owner wants the old host closed rather than redirecting. Then
   expect error 1042 on `https://rega-cargo.rebar9988.workers.dev/`.
4. After any Cloudflare account change, re-check Settings → Build: production branch `main`, the
   two commands in §1, no build variables, non-production builds non-deploying.

## 5. How to verify (repeatable)

```sh
# GitHub check runs on a commit (Workers Builds and Actions)
gh api repos/rebar9988-max/rega-cargo/commits/<sha>/check-runs \
  --jq '.check_runs[] | [.name,.conclusion,.output.summary] | @tsv'
# Why an Actions job failed (billing shows up as an annotation)
gh api repos/rebar9988-max/rega-cargo/check-runs/<id>/annotations
# Domains
for u in https://www.rlgo.net/ https://rlgo.net/ http://www.rlgo.net/ \
  https://rega-cargo.rebar9988.workers.dev/ https://rega-cargo-staging.rebar9988.workers.dev/; do
  curl -sS -o /dev/null -w "$u %{http_code} %{redirect_url}\n" "$u"; done
# Migration gate on a simulated branch build: must print "non-production branch … skipping"
DATABASE_URL=postgres://u@db.invalid/x CI=true WORKERS_CI=1 WORKERS_CI_BRANCH=test node scripts/migrate.mjs
```

A PR build is correct when its check run is `success` **and** shows no Version ID. A `main`
build is correct when it shows a Version ID that later appears at 100% in the deployments list.
