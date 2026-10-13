# Integrations — status summary

Full inventory, capability map and usage policy: [docs/integrations/](../integrations/inventory.md)
([capabilities](../integrations/capabilities.md), [usage policy](../integrations/usage-policy.md),
[verification report](../integrations/verification-report.md)). Connector state belongs to the
claude.ai account/session, not the repo — **re-check every session; never assume it works.**

| Integration | Status (last verified) | Use for |
|---|---|---|
| GitHub MCP | working, re-verified 2026-10-13 (branches, PRs, Actions runs/jobs, draft PR #85) | PRs, CI, logs. No `gh` CLI in cloud sessions |
| Cloudflare REST API (env token) | working, partial scope, re-verified 2026-10-11 15:14 (deployments, bindings, `wrangler tail`); deployments/versions read again 2026-10-13 09:58. **Cannot read/edit Hyperdrive** (API and `wrangler hyperdrive get`) | Read-only Worker checks |
| Wrangler CLI | via `npm ci`; `cf:dry-run` used in CI | Bundle check, `tail`. Deploy = owner approval |
| Neon MCP | working, **write mode**, re-verified 2026-10-11 15:20 (read-only SQL on `old-cherry`, `misty`) | Schema/data checks. Writes = owner approval |
| Workers AI (`AI` binding) | live in production, 2026-10-11 (`/api/ai/status`) | R&L AI identification |
| Docker | 2026-10-13: CLI 29.8 present, **daemon unreachable** in cloud agent sessions (official-image layout lock cannot run there) | `npm run quality:local` official mode on machines with Docker |
| Playwright browsers (cloud session) | 2026-10-13: Chromium 1194 preinstalled, Playwright 1.63 expects 1243, no WebKit; geometry only via the shim in issues I-7 | Local geometry checks |
| Sentry MCP | org exists, 0 projects (2026-10-11 report) | Not used; app not instrumented |
| Context7 | working (2026-10-11 report) | Library/platform docs |
| Figma | View seat only (2026-10-11 report) | Read designs; never edit the logo |
| Playwright + Chromium | `/opt/pw-browsers/chromium` | Production browser QA |
| Supabase, Lovable, TinyFish, Canva, Adobe | available but **not used** (other stack, metered, or marketing only) | — |
| WhatsApp / Twilio / Turnstile | **not configured** in production | Phone sign-in stays closed |

Free-tier constraints: Neon free projects (0.25–2 CU, 1 GiB/branch), Workers + Hyperdrive on the
current plan (staging `limits.cpu_ms` implies Workers Paid on that account — verify before relying on it).
