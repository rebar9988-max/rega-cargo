# Integrations — status summary

Full inventory, capability map and usage policy: [docs/integrations/](../integrations/inventory.md)
([capabilities](../integrations/capabilities.md), [usage policy](../integrations/usage-policy.md),
[verification report](../integrations/verification-report.md)). Connector state belongs to the
claude.ai account/session, not the repo — **re-check every session; never assume it works.**

| Integration | Status (last verified) | Use for |
|---|---|---|
| GitHub MCP | working, 2026-10-11 (branches, PRs, Actions runs) | PRs, CI, logs. No `gh` CLI in cloud sessions |
| Cloudflare REST API (env token) | working, partial scope, re-verified 2026-10-11 15:14 (deployments, bindings, `wrangler tail`). **Cannot read/edit Hyperdrive** (API and `wrangler hyperdrive get`) | Read-only Worker checks |
| Wrangler CLI | via `npm ci`; `cf:dry-run` used in CI | Bundle check, `tail`. Deploy = owner approval |
| Neon MCP | working, **write mode**, re-verified 2026-10-11 15:20 (read-only SQL on `old-cherry`, `misty`) | Schema/data checks. Writes = owner approval |
| Workers AI (`AI` binding) | live in production, 2026-10-11 (`/api/ai/status`) | R&L AI identification |
| Sentry MCP | org exists, 0 projects (2026-10-11 report) | Not used; app not instrumented |
| Context7 | working (2026-10-11 report) | Library/platform docs |
| Figma | View seat only (2026-10-11 report) | Read designs; never edit the logo |
| Playwright + Chromium | `/opt/pw-browsers/chromium` | Production browser QA |
| Supabase, Lovable, TinyFish, Canva, Adobe | available but **not used** (other stack, metered, or marketing only) | — |
| WhatsApp / Twilio / Turnstile | **not configured** in production | Phone sign-in stays closed |

Free-tier constraints: Neon free projects (0.25–2 CU, 1 GiB/branch), Workers + Hyperdrive on the
current plan (staging `limits.cpu_ms` implies Workers Paid on that account — verify before relying on it).

## R&L AI ownership and verification — 2026-10-13

The source-stage observations below are historical and superseded by the verified production checkpoint at the end of this section.

This Codex session has working existing GitHub read/source tools and local Docker/Playwright. Cloudflare direct credentials are not configured; `wrangler whoami` is unauthenticated. Hosted Actions cannot start (billing annotation). GitHub protection/deployment reads return 403. Existing Workers AI Gemma and Durable Object binding/config are preserved; no new AI Gateway or paid service introduced. See [verification report](../ai/rl-ai-verification-20261013.md).

Release preflight update: existing authenticated Cloudflare connector resolves the direct-CLI credential gap. Verified R&L main Builds trigger and rollback version `5791d60b`, no concurrent build. GitHub main branch resource reports `protected:false`. Hosted billing failure remains; the standing full local official-image gate policy applies. No release yet.


2026-10-14 verified production checkpoint: PR #92 merged normally as `481bfeb`; existing Cloudflare Builds `7387019a` succeeded, Worker `c87c162d-11e9-4ca7-86e4-f6eca4a600a6`, 100%, 06:57 UTC. Genuine live planner and image inference, strict refusals, five shortcuts, authorized workflow links and eight read-only existing routes passed. Privacy-safe telemetry showed no exceptions/5xx; bindings and secrets preserved. No rollout blocker remains. Hosted Actions billing, native camera/OTP/private-order verification and field performance remain limitations; no billing or unrelated business change. Documentation-only follow-up may deploy an identical app; query current Worker state. [Evidence](../ai/rl-ai-verification-20261013.md).

## Codex + Skyvern + Playwright — 2026-10-16

Owner-requested browser workflow: [runbook](../integrations/browser-automation.md),
[measured evidence](../verification/browser-automation-20261016.md). Official hosted
Skyvern MCP is configured with no static keys; user OAuth is pending, separate
from the working authenticated chat connector. Cloudflare and GitHub dashboard
browsers stopped at login; API reads succeeded for Worker allocation and Actions
annotations. Firefox responsive projects supplement preserved Chromium/WebKit
projects and 366 unchanged pixel baselines. Automated axe checks use the pinned
test-only dependency and retain findings. No app/identity/architecture/data change,
merge, deployment or paid configuration change. Existing memory/central Doc remain
the single documentation layer; this is not another memory system.
