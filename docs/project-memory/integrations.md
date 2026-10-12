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
| Official Figma MCP | real auth, metadata, design context/screenshot and read-only Plugin API passed, 2026-10-12; Starter/View; Code Connect denied | Preferred visual workspace; reuse [verified existing file and workflow](../integrations/figma-workflow.md); never edit the logo or upgrade plans |
| Playwright + Chromium | `/opt/pw-browsers/chromium` | Production browser QA |
| Supabase, Lovable, TinyFish, Canva, Adobe | available but **not used** (other stack, metered, or marketing only) | — |
| WhatsApp / Twilio / Turnstile | **not configured** in production | Phone sign-in stays closed |

Free-tier constraints: Neon free projects (0.25–2 CU, 1 GiB/branch), Workers + Hyperdrive on the
current plan (staging `limits.cpu_ms` implies Workers Paid on that account — verify before relying on it).

Codex verification, 2026-10-12: GitHub MCP read the private repository and its
instructions as `rebar9988-max`; `gh`, HTTPS clone and `git fetch` also worked in
this session. The older CLI/browser availability rows above describe prior cloud
sessions, not guaranteed current tooling. Figma returned handle `Danial`, unlike
the older `Ben` snapshot in the historical integration report. Do not assume
accounts or permissions carry between sessions. Actions run `38216868321` failed
before jobs started with a billing/spending-limit annotation; no paid change made.
