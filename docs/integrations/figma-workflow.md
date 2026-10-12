# Official Figma workflow and verification

Initial repository/Figma verification in the Codex session on 2026-10-12 used
`main` at `54e505bb3d6a8982a65efa37922f964ea6a2e1ad`; the first review sync used
`238b755b20da69737e2fc164769692b38f637ce6`. On continuation, the review branch was
rebased onto `0b19931a48d18547f509e516d3c9fff043cb78e5`, preserving the current
Nitro dependency update, project memory and CI/payment safeguards from main.
The full local quality gate and targeted browser tests were repeated on this
latest base. Figma `whoami` and the existing frame metadata were also read again
successfully; the original context/screenshot/inventory findings remain dated
results from the real reads in this task. This does not guarantee another
session's connection. Policy: [AGENTS.md](../../AGENTS.md).

## Real access tests

| Check                                       | Result                              | Evidence                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub authentication and repository access | PASS                                | GitHub MCP `get_user_login` returned `rebar9988-max`; `get_repo` read the private `rebar9988-max/rega-cargo` repository and reported pull/push/admin permissions. `fetch_file` read existing AGENTS.md, CLAUDE.md and PROJECT_MEMORY.md. HTTPS `git ls-remote`, clone and `git fetch origin main` succeeded.                                      |
| Official Figma authentication               | PASS                                | Connected Figma MCP `whoami` returned handle `Danial`, team `Danial's team`, Starter tier, View seat. No credentials saved.                                                                                                                                                                                                                       |
| Existing project design file access         | PASS                                | `get_metadata` listed page `0:1`; the page read returned frame `1:2`, named `R&L Cargo — Mobile Home Concept`, 390 × 844, with children `1:3`–`1:43`. `get_design_context` returned actual React reference code and a rendered screenshot, which was inspected.                                                                                   |
| Local design-system discovery               | PASS                                | Read-only `use_figma` returned one page, one top-level FRAME and empty component, component-set, variable-collection, variable, paint-style and text-style lists. It returned no created or mutated node IDs. This file is a concept, not a reusable component library.                                                                           |
| Published Code Connect access               | FAIL                                | `get_code_connect_map` for frame `1:2`, label `React`, responded: access requires a Dev or Full seat on an Organization or Enterprise plan. Debug UUID `36739681-46b4-441f-8974-18af96c8d470`. The tool response had `isError: false`, but its content denied access; this is not a successful mapping read. No upgrade or publication attempted. |
| Persistent instructions                     | PASS (review branch; merge pending) | Permanent policy appended to AGENTS.md, original content preserved, relative links and secret checks passed. The documentation branch is the persistence target; main adoption requires an authorized merge.                                                                                                                                      |

Only read operations were performed in the existing Figma file. Editing permissions
were not tested with a mutation. Team-admin role and a successful read-only
`use_figma` call do not prove write permission. Available tools do not establish
plan entitlement.

## Existing file and implementation references

The file key was discovered in the existing [home implementation report](../redesign/figma-home.md),
then tested through the live Figma tools. That report calls the file
"R&L Cargo — Global Shopping + Delivery UX Concept"; the read-only Plugin API
returned document name `Document`. The frame name and IDs below were verified live.

- [Existing design file](https://www.figma.com/design/s0oZjiB9l12dAuEkPXVFyu)
- [Page 1](https://www.figma.com/design/s0oZjiB9l12dAuEkPXVFyu?node-id=0-1)
- [Mobile Home Concept](https://www.figma.com/design/s0oZjiB9l12dAuEkPXVFyu?node-id=1-2)

These are documented implementation correspondences, **not published Code Connect
mappings**. The Figma node IDs were read live and the code paths were inspected.

| Verified Figma node        | Existing implementation                                                                                    | Constraints                                                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Header `1:3`, search `1:6` | `src/components/site-header.tsx`, `src/components/search-box.tsx`, `src/components/site-mark.tsx`          | Use the original artwork. The concept's text wordmark `1:4` does not replace the logo.                                                |
| Hero `1:8`, action `1:11`  | `src/components/premium-home.tsx` (`PremiumHome`), `src/styles/design-system.css`, `src/styles/tokens.css` | Existing `.rl-ai-hero-inner`, `--rl-hero-card`, `--rl-on-hero`, `--rl-hero-ink`; retain routes, AI flag behavior and centered layout. |
| Shipment overview `1:31`   | `src/components/premium-home.tsx` (`.rl-track-card`), `src/routes/track.tsx`                               | Keep the real `/track` entry. Never copy the invented parcel ID, status, progress or delivery promise from `1:34`–`1:37`.             |
| Bottom navigation `1:39`   | `src/components/site-header.tsx` (`.rl-bottom-nav`)                                                        | Retain the existing tabs and destinations; the concept does not authorize changing them.                                              |

Repository foundations remain [design.md](../project-memory/design.md):
`src/styles/tokens.css`, `src/styles.css`, `src/styles/design-system.css`,
`src/components/ui.tsx` (Button, Input, Select, Card, Modal, BottomSheet, Icon),
`src/components/lang-picker.tsx`, and the existing forms, dashboards and routes.
The concept uses `#c8192e` and 20px hero corners; code retains `--rl-brand #dd0303`,
existing semantic tokens and the 16px card radius. Keep Noto Sans Arabic / Inter,
the unchanged logo, seven locale IDs, fixed `<html dir="rtl">`, and locale-specific
`data-textdir` (including English LTR text). Do not re-add home category tiles
removed by an existing product decision. Do not infer a desktop or tablet design
from this single mobile frame.

Only one project file reference was found in the checked-out repository's tracked
text and instruction files. The exposed Figma tools require known file keys and
do not provide account-wide file/project listing in this session. No claim is made
that this is every file in the Figma account. No duplicate file was created.

## Reuse in future authorized sessions

1. Read the project memory and existing code first. Re-check GitHub and the active
   Figma tools; call `whoami`, then read the relevant saved file/node. Avoid
   repeating setup when the installed official plugin already works.
2. Discover page/node IDs with `get_metadata` when needed. Before
   `get_design_context`, load the installed `figma-design-to-code` skill, request
   the screenshot and pass the skill logging parameter as instructed. Before
   `use_figma`, load `figma-use` and its required references. Use read-only scripts
   for inspection. Never guess file/node IDs or edit a file just to test access.
3. Reuse code tokens and primitives. Review Figma components/variables when
   available. Adapt reference code to React/TanStack and the existing styling;
   do not paste generated prototypes over functioning code. Brand and data rules
   in AGENTS.md take precedence over concept details.
4. If Code Connect becomes supported on the already authorized plan, load the
   installed `figma-code-connect` skill, inspect existing mappings and real
   component properties, and reuse them. Do not create guessed templates for
   ordinary shapes or frame nodes. The current access denial is not a configuration
   bug that can be fixed without changing entitlements.
5. Implement targeted authorized improvements and run the
   [quality gate](../project-memory/architecture.md), affected tests and real-browser
   checks. Use desktop/tablet/mobile, light/dark and ckb/ar/en text directions;
   check keyboard access, focus, accessible names and WCAG contrast. Run visual
   baselines in the pinned official Playwright image; never overwrite them just
   to get a pass. Record exact checks, failures and scope limits.
6. If authentication, file permissions or quota fail, record the real response
   and continue safely from the repository. Do not claim Figma was accessed.
   Never enable paid services, change subscriptions, merge or deploy as part of
   connection recovery. Never store tokens, passwords or short-lived asset URLs.

## Connection and limits

This session used the installed official Figma plugin/connector and its Figma MCP
tools. Real reads succeeded, so no duplicate MCP configuration or authentication
setup was added. The official remote endpoint is `https://mcp.figma.com/mcp`;
authentication belongs to the host account/session, not AGENTS.md or the repository.
For an independent client with no working connection, use Figma's official setup
instructions and OAuth; do not substitute unofficial servers or commit credentials.

Official references checked on 2026-10-12:

- [Figma MCP documentation](https://developers.figma.com/docs/figma-mcp-server/)
- [Official remote setup, including Codex](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)
- [Rate limits and access](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/)
- [Code Connect](https://developers.figma.com/docs/code-connect/)
- [Figma Help: MCP guide](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)

The current documentation gives Starter/View accounts up to 20 read calls/month;
the remaining allowance was not exposed or verified. Keep reads focused and reuse
the evidence from an unchanged node within a task. Never upgrade to avoid a limit.

GitHub Actions on inspected `main` failed before either job ran. Run
`38216868321`, verify check `114703539477`, had an annotation reporting failed
account payments or the spending limit. This is separate from GitHub repository
access. No billing changes, paid services or workflow reruns were made.

## Persistence and validation evidence

Only seven Markdown instruction/documentation files changed. The original AGENTS.md
content remains an exact byte prefix; CLAUDE.md is unchanged. Source, logo/artwork,
styles, routes, business logic, dependency manifests, runtime configuration and
screenshot baselines have no diff against final `main` base `0b19931`. Relative links in
all changed documents resolve and a secret-pattern scan passed.

Validation actually executed and repeated after the latest rebase on 2026-10-12:

| Check                                            | Result       | Scope / evidence                                                                                                                                                                                                              |
| ------------------------------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck` (Node 22.23.3)               | PASS, exit 0 | `tsc --noEmit`                                                                                                                                                                                                                |
| `npm run lint` (Node 22.23.3)                    | PASS, exit 0 | 0 errors; 5 existing warnings in unchanged source files                                                                                                                                                                       |
| `npm test` (Node 22.23.3)                        | PASS         | 417 passed, 4 skipped, 0 failed across the two test runners                                                                                                                                                                   |
| Memory checks                                    | PASS         | `node --test scripts/project-memory.test.mjs`: 5 passed; original instruction preservation and all changed-document link/secret checks passed                                                                                 |
| `DATABASE_URL='' npm run build`                  | PASS         | Complete client/server/Worker build; migration runner explicitly skipped because DATABASE_URL was unset. No production migration.                                                                                             |
| `WRANGLER_SEND_METRICS=false npm run cf:dry-run` | PASS, exit 0 | Installed Wrangler 4.149.0 bundled the Worker and exited at `--dry-run`; no upload or deploy.                                                                                                                                 |
| Existing browser/visual regression tests         | PASS, exit 0 | 45 passed, 3 skipped in 1.6 minutes. Pinned official `mcr.microsoft.com/playwright:v1.63.0-noble`, Node 22.23.3; image digest `sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27`. No baseline updates. |
| Public production HTTP smoke                     | PASS         | 14 GETs following existing redirects returned actual final HTTP 200 and `<html dir="rtl">`; homepage ckb/ar/en returned the correct lang and data-textdir (en = ltr). No submissions or business writes.                      |
| New workflow document formatting                 | PASS         | Prettier formatted the new document only; existing instruction content preserved.                                                                                                                                             |

Exact browser selection (existing tests, no new test implementation):

```sh
npx playwright test \
  --project=chromium-iphone --project=chromium-ipad-portrait \
  --project=chromium-laptop --project=webkit-iphone --project=premium-360 \
  --grep 'home|language picker|menu sheet|required routes at 360px|language switches preserve|hero: one static|product link: the panel' \
  --workers=3 --update-snapshots=none
```

This exercised existing home/menu/language screenshots and geometry on
390px phone, 820px tablet and 1280px desktop, Chromium plus phone WebKit, and
360px functional checks. It covered ckb/ar/en light/dark required routes,
locale/query persistence, fixed RTL layout with locale-specific RTL/LTR text,
seven-language hero positioning, the honest parcel entry, keyboard dismissal and
focus restoration, visible headings, image descriptions, named homepage landmarks
and the server-rendered product-link panel/layout-shift guard. The three skips are
intentional desktop menu-sheet skips. This is targeted regression evidence, not
a full WCAG audit or the entire layout suite. Local Worker tests use the existing
no-production-database layout fixture; real database/auth/provider functionality
was not revalidated.

Production smoke URLs: `https://cargo.regaplatform.com` with `/?lang=ckb`,
`/?lang=ar`, `/?lang=en`, `/stores`, `/stores?cat=fashion`, `/stores?fav=1`,
`/stores/request?store=zalando&intent=buy`,
`/stores/request?store=zalando&intent=ship`, `/quote`, `/market`, `/ai`,
`/impressum`, `/privacy`, `/terms`. `/market` first returned its existing HTTP
307 search-parameter normalization, then 200 after following the redirect.
An initial Python HTTP probe returned 403 during environment configuration
changes; the subsequent normal curl probes above succeeded without changing TLS
verification or bypassing the configured proxy. Production browser pixels were
not compared; the browser regression evidence is from the local built Worker.

Persistence target: `claude/figma-workflow-20261012`, with documentation-only
[Draft PR #73](https://github.com/rebar9988-max/rega-cargo/pull/73).
The rebase resolved the PROJECT_MEMORY.md and decisions.md insertion conflicts
by retaining the latest main entries and the new Figma policy entry together.
No application changes from main were removed. An intermediate build and a
continuation dependency install encountered root-owned Docker-generated build
state / `node_modules/.mf` cache. Ownership of generated build/test/dependency
directories was restored. The locked dependency install and build then passed;
the final browser run used the workspace UID and temporary writable cache paths
to avoid recreating root-owned artifacts. No source or lockfile changes were made. No merge or deployment is authorized by this task. The
workflow becomes part of `main` only after an authorized merge; repository
documentation cannot make OAuth permanent. Re-check the branch's AGENTS.md and
this report through GitHub before declaring persistence complete.

## Payment restriction

AGENTS.md explicitly prohibits payment activation, subscriptions, seat/plan
upgrades, payment-method changes and spending-limit increases. The current
CLAUDE.md billing instructions and `.github/workflows/quality.yml` draft/CI-minute
safeguards are preserved byte-for-byte from main. The PR stays a draft; all
verification runs here were local. No manual hosted workflow run, billing change,
paid integration, duplicate Figma file or Figma mutation was performed. Code
Connect remains outside the observed Starter/View entitlement; its previous
real denial was not retried or worked around with an upgrade.
