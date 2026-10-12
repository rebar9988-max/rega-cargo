# R&L access recovery — TinyFish investigation, 2026-10-12

Scope: the owner explicitly requested TinyFish to resolve the billing-access and Hyperdrive release blockers. The existing zero-new-cost rule remains in effect. No paid automation, login/profile change, credential change, database write or production deployment was performed.

## Verified findings

- TinyFish wallet reads at 06:04 and 06:07 UTC report the same balance: **-$0.008 USD**. Auto-reload is unconfigured; no top-up is pending. The reported contract rates are Agent **$0.016/step**, Browser **$0.002/minute**, Search **$0/query** and Fetch **$0/URL**. A paid browser run cannot start at this balance. No top-up was requested or activated.
- The two existing TinyFish profiles have no recorded `signed_in_sites`. This is absence of confirmed Cloudflare/GitHub authentication, not proof that every saved cookie is invalid. No profile was run, modified or created.
- Two zero-rate TinyFish searches and one fetch of official documentation were completed. One requested Cloudflare API-reference URL returned 404; the billing-permissions page, GitHub billing usage and budgets pages were successfully read. This establishes documented access requirements, not authenticated dashboard access.
- At **06:06 UTC**, Cloudflare billing still returned **10000 Authentication error**. Hyperdrive GET succeeded and still identified config `795013d06b38408e87552686a6045291`, the `ep-odd-cherry-b904ppv3-pooler.c-7.eu-central-1.aws.neon.tech` host and database `neondb`.
- Production remained on Worker version `10723cf0-8784-4f54-a439-5093fcd03459`, deployed by another session on 2026-10-11 at 15:28 UTC. This investigation did not change it.
- GitHub personal billing usage returned **403 Resource not accessible by integration**, including with API version `2026-03-10`. Main remains `486e442`; [PR #68](https://github.com/rebar9988-max/rega-cargo/pull/68) remains open, draft and without current-commit remote checks. Active concurrent PRs were read and left untouched.

## Concrete recovery sequence

1. **Billing read access.** Cloudflare's official requirement is `Account > Billing > Read` for billing API reads. GitHub's personal usage endpoint requires the `Plan` user permission with read access and an applicable billing platform/supported user credential. Reauthorize the relevant existing connection through its supported account settings when necessary. Repository access does not grant personal billing access. Do not retrieve or rotate production credentials merely to diagnose these read failures. The complete policies of the current tokens were not retrieved, so the exact missing grant is not asserted as independently inspected.
2. **Zero-spend evidence.** Read the current Cloudflare Workers/AI plan, actual shared allowance and charge behavior. Verify GitHub Actions included minutes/storage and the applicable stop-usage budget, not only an alert. GitHub documents that newly created budgets do not retrospectively include earlier usage; a new budget alone is insufficient evidence about existing charges. Do not change spending limits, add payment methods or start paid automation.
3. **Connected database preview and rollback.** Follow the existing [AI audit's recovery plan](audit-2026-10-11.md) using the existing Cargo and staging targets. The 2026-10-11 evidence found 13 recorded migrations on intended Cargo production and 12 on staging; recheck current compatibility rather than assume parity. Test the real app's compliance, ownership and record-reading paths. Prepare rollback for both Hyperdrive and the matching fallback connection. Keep both database projects; do not run the duplicate's broad cleanup migrations or infer data-loss safety from empty accessible tables alone.
4. **Coordinated recovery.** After the preview, data-safety, cost and rollback gates, point the existing Hyperdrive origin and fallback at the verified Cargo target. Do not change only one connection path or leave fallback mismatched. This operation has not been performed by this task.
5. **CI and release.** Verify the Actions zero-spend guard, preserve current concurrent main changes, retarget draft #68 to main and pass the two existing required quality jobs and reviews. Deploy through the existing workflow and verify actual live inference, negative authorization, search and recorded shipment behavior. The unchanged dedicated review base is not a replacement for these release checks.

## TinyFish execution limits

Paid TinyFish browser automation needs available credit and authenticated access. Neither is established here, and the owner has not waived the zero-new-cost requirement. Free Search/Fetch cannot grant account permissions, inherit a CLI/API login, edit authenticated settings or verify sensitive application workflows. No automation run or dashboard repair is claimed.

## Sources and evidence

- [Cloudflare billing permissions](https://developers.cloudflare.com/billing/understand/billing-permissions/)
- [GitHub personal billing usage](https://docs.github.com/en/rest/billing/usage#get-billing-usage-report-for-a-user)
- [GitHub budgets and alerts](https://docs.github.com/en/billing/concepts/budgets-and-alerts)
- Sanitized session evidence: `/workspace/scratch/rl-evidence/tinyfish-access-2026-10-12.json`. No checkout URLs, cookies, credential values or raw private records are included.

Application runtime, UI, dependencies, database migrations and workflow are unchanged. The prior runtime validation remains dated evidence in [the audit](audit-2026-10-11.md); this documentation lookup is not a new full visual run or live inference test.

Local follow-up on Node 22.23.3: **436 tests passed, zero failed, four existing skips** (scripts 215, application 221); typecheck, lint (same five existing warnings), empty-DB production build and Wrangler dry run passed. The migrator explicitly skipped. All **148 public files are byte-identical** to the previously validated full visual build. The full visual suite was not rerun for this documentation-only update; no remote CI or live model invocation occurred.
