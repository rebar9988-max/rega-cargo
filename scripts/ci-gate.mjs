#!/usr/bin/env node
/**
 * Quality gate for Cloudflare Workers Builds, run by npm as `prebuild`.
 *
 * Workers Builds runs only `npm run build` and then deploys, and GitHub Actions cannot start
 * jobs (issues I-7), so without this a broken commit on `main` would go live. When `WORKERS_CI`
 * is set, typecheck and the unit tests must pass first; a failure stops the build, so nothing
 * is deployed. Everywhere else (local builds, the GitHub workflow, which runs these steps
 * itself) this is a no-op.
 */
import { spawnSync } from "node:child_process";
import { isMainModule } from "./with-app-env.mjs";

export const GATE = [
  ["npm", ["run", "typecheck"]],
  ["npm", ["test"]],
];

export function gateApplies(env) {
  return Boolean(env.WORKERS_CI);
}

function main() {
  if (!gateApplies(process.env)) return;
  console.log(`[ci-gate] Workers Builds ${process.env.WORKERS_CI_BRANCH ?? ""} ${process.env.WORKERS_CI_COMMIT_SHA ?? ""}`.trim());
  for (const [cmd, args] of GATE) {
    console.log(`[ci-gate] ${cmd} ${args.join(" ")}`);
    const run = spawnSync(cmd, args, { stdio: "inherit", env: process.env });
    if (run.status !== 0) {
      console.error(`[ci-gate] FAILED: ${cmd} ${args.join(" ")} — nothing will be deployed`);
      process.exit(run.status ?? 1);
    }
  }
  console.log("[ci-gate] passed");
}

if (isMainModule(import.meta.url)) main();
