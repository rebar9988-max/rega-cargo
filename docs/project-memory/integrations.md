# Integrations — status summary

Full inventory, capability map and usage policy: [docs/integrations/](../integrations/inventory.md)
([capabilities](../integrations/capabilities.md), [usage policy](../integrations/usage-policy.md),
[verification report](../integrations/verification-report.md)). Connector state belongs to the
claude.ai account/session, not the repo — **re-check every session; never assume it works.**

| Integration | Status (last verified) | Use for |
|---|---|---|
| GitHub MCP / CLI | session-dependent; this session's `gh` can read refs/PRs/Actions and publish draft #68 | Actions billing-usage/protection reads return 403; no allowance or zero-spend guarantee inferred |
| Cloudflare REST / connector | session-dependent; this session's connector read Worker settings/deployments, Hyperdrive origin (GET 200) and bounded privacy-safe telemetry | Billing/usage reads fail 10000. Hyperdrive edit/credential rollback not verified; earlier token failures remain historical, not universal |
| Wrangler CLI | via `npm ci`; `cf:dry-run` used in CI | Bundle check, `tail`. Deploy = owner approval |
| Neon MCP | working, **write mode**, re-verified 2026-10-11 15:20 (read-only SQL on `old-cherry`, `misty`) | Schema/data checks. Writes = owner approval |
| Workers AI (`AI` binding) | live in production, 2026-10-11 (`/api/ai/status`) | R&L AI identification |
| Sentry MCP | org exists, 0 projects (2026-10-11 report) | Not used; app not instrumented |
| Context7 | working (2026-10-11 report) | Library/platform docs |
| Figma | View seat only (2026-10-11 report) | Read designs; never edit the logo |
| Playwright + Chromium | `/opt/pw-browsers/chromium` | Production browser QA |
| TinyFish | 2026-10-12: wallet -$0.008, auto-reload unconfigured; no recorded Cloudflare/GitHub sign-in. Search/Fetch contract rate zero; two searches and one official-doc fetch completed | Paid browser automation not started; [recovery evidence](../ai/access-recovery-2026-10-12.md) |
| Supabase, Lovable, Canva, Adobe | available but **not used** (other stack, metered, or marketing only) | — |
| WhatsApp / Twilio / Turnstile | **not configured** in production | Phone sign-in stays closed |

Neon `free_v3`, three existing branches / limit ten, and bounded usage were independently verified in this session. Current official Free limits are 100 CU-hours/month/project, 1 GB/project and 5 GB transfer/month/project; exhaustion suspends/fails operations rather than automatically upgrading. No branch, compute, extension, credential or paid plan was created. See [the audit](../ai/audit-2026-10-11.md) for the dated evidence.

Cloudflare `standard` usage model and staging CPU limits do not establish billing/free quota or actual AI neurons. No paid inference, new provider or top-up was activated. CLI auth is unavailable here; the prior session's CLI availability must not be generalized.

At 2026-10-12 06:06 UTC, Cloudflare billing still returns 10000 while Hyperdrive GET succeeds; GitHub billing usage still returns 403 with the current API version. Official documentation requires Account/Billing/Read and personal Plan/read respectively. Those requirements were read with TinyFish, not granted by it; actual complete token policies were not retrieved.
