# Integrations — status summary

Full inventory, capability map and usage policy: [docs/integrations/](../integrations/inventory.md)
([capabilities](../integrations/capabilities.md), [usage policy](../integrations/usage-policy.md),
[verification report](../integrations/verification-report.md)). Connector state belongs to the
claude.ai account/session, not the repo — **re-check every session; never assume it works.**

Shared by Codex and Claude Code; each agent verifies its own column (authentication never
transfers between them).

| Integration | Status (last verified) | Use for |
|---|---|---|
| GitHub MCP | working, 2026-10-13 | PRs, CI, logs. No `gh` CLI in cloud sessions |
| GitHub Actions | **blocked by billing (I-7)**, re-verified 2026-10-13 run 220 | Local full gate governs merges (CLAUDE.md) |
| Cloudflare REST API (env token) | working, partial scope, 2026-10-13. **Hyperdrive and Observability REST denied** | Read-only Worker checks |
| Wrangler CLI 4.149.0 | working, 2026-10-13 (`whoami`, `deployments list`, `cf:dry-run`) | Bundle check, `tail`. Deploy per CLAUDE.md policy |
| Neon MCP | working, **write mode**, 2026-10-13 (read-only SQL on `old-cherry/cargo`) | Schema/data checks. Writes = owner approval |
| Playwright + Chromium | working with `executablePath` `/opt/pw-browsers/chromium-1194/…`, 2026-10-13 | Production browser QA |
| Lighthouse (`npx`) | working, 2026-10-13 (prod `/` perf 0.95, a11y/BP/SEO 1.00) | Audits |
| `npm audit`, compliance scan | pass, 2026-10-13 | Security gate |
| Docker | CLI only, **no daemon** in cloud sessions | Official-image layout lock must run elsewhere |
| Sentry MCP | org exists, 0 projects (2026-10-13) | Not used; app not instrumented |
| Context7 | working (2026-10-13) | Library/platform docs |
| Figma | View seat only (2026-10-13) | Read designs; never edit the logo |
| Supabase, Lovable, TinyFish, Canva, Adobe | available but **not used** (other stack, metered, or marketing only) | — |
| WhatsApp / Twilio / Turnstile | **not configured** in production | Phone sign-in stays closed |
| Codex | **unknown** — must self-verify | Fill the Codex column in `docs/integrations/inventory.md` |

Free-tier constraints: Neon free projects (0.25–2 CU, 1 GiB/branch), Workers + Hyperdrive on the
current plan (staging `limits.cpu_ms` implies Workers Paid on that account — verify before relying on it).
