#!/usr/bin/env node
/**
 * Local quality gate: `npm run quality:local`
 *
 * Runs the same checks as the "Cargo quality gate" workflow (.github/workflows/quality.yml)
 * on this machine, so a change can be verified without spending GitHub-hosted minutes
 * (and while hosted runners are blocked, issues.md I-7). It reuses the project's own
 * scripts; nothing here replaces or weakens a check.
 *
 *   verify (CI job "verify"): typecheck · npm test (unit + integration, incl. the banned-
 *     products tests) · lint · build without DB migrations · wrangler dry-run
 *   extra local checks (not in CI): compliance scan of the bundled data on a throw-away
 *     PGLite · npm audit (high and above)
 *   layout lock (CI job "layout lock"): Playwright geometry + screenshot baselines on
 *     Chromium and WebKit, run in the official Playwright image (same image as CI).
 *
 * Parity: the result is only "pass" when the layout lock ran in the official image.
 * Without a reachable Docker daemon it runs geometry only on the local Chromium and
 * reports "partial" (exit 2): screenshots and WebKit were NOT checked. That is never
 * equivalent to the hosted gate and must be reported as such.
 *
 * Flags: --geometry-only  skip the official image even when Docker is available
 *        --no-layout      verify + extra checks only (result is at best "partial")
 *        --no-audit       skip npm audit (needs the npm registry; result is "partial")
 * Exit:  0 pass · 1 a check failed · 2 every check that ran passed but parity is incomplete
 * Report: .quality/local-report.json (git-ignored): commit, Node, mode, steps, timings.
 *
 * Safety: DATABASE_URL is always emptied, so neither the build's migrations nor the
 * compliance scan can touch a real database.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isMainModule, projectRoot } from "./with-app-env.mjs";

const ROOT = projectRoot();

export const OFFICIAL_IMAGE = "mcr.microsoft.com/playwright:v1.63.0-noble";
/** Node major used by quality.yml (`setup-node` 22) and the deploys recorded in memory. */
export const CI_NODE_MAJOR = 22;

/** Environment for every step: never a real database, no wrangler telemetry. */
export function safeEnv(base = process.env) {
  return { ...base, DATABASE_URL: "", WRANGLER_SEND_METRICS: "false" };
}

/**
 * The ordered steps. `group` mirrors the CI job; `ci: false` marks stricter local extras.
 * Layout runs last: it is the slowest and needs the build output.
 */
export function planSteps({ layout, audit }) {
  const npm = (id, label, script, extra = {}) => ({
    id,
    label,
    cmd: "npm",
    args: ["run", "-s", script],
    group: "verify",
    ci: true,
    ...extra,
  });
  const steps = [
    npm("typecheck", "TypeScript", "typecheck"),
    npm("test", "Unit + integration tests", "test"),
    npm("lint", "ESLint", "lint"),
    npm("build", "Build without production DB migrations", "build"),
    npm("cf-dry-run", "Cloudflare Worker bundle check (wrangler dry-run, no deploy)", "cf:dry-run"),
    npm("compliance", "Compliance scan of bundled data (throw-away PGLite)", "compliance:scan", {
      group: "security",
      ci: false,
    }),
  ];
  if (audit) {
    steps.push({
      id: "audit",
      label: "npm audit (high and above)",
      cmd: "npm",
      args: ["audit", "--audit-level=high"],
      group: "security",
      ci: false,
    });
  }
  if (layout === "official") {
    // Same image and browsers as the CI job. Dependencies are installed into a container-only
    // volume, so the host node_modules stay untouched; the build output from the step above
    // is reused instead of building a second time.
    steps.push({
      id: "layout",
      label: `Layout lock: geometry + screenshots, Chromium + WebKit (${OFFICIAL_IMAGE})`,
      cmd: "docker",
      args: [
        "run",
        "--rm",
        "--ipc=host",
        "-e",
        "CI=1",
        "-e",
        "WRANGLER_SEND_METRICS=false",
        "-e",
        "DATABASE_URL=",
        "-v",
        `${ROOT}:/work`,
        "-v",
        "/work/node_modules",
        "-w",
        "/work",
        OFFICIAL_IMAGE,
        "sh",
        "-c",
        "npm ci --no-audit --no-fund && npx playwright test",
      ],
      group: "layout",
      ci: true,
    });
  } else if (layout === "geometry") {
    steps.push({
      id: "layout-geometry",
      label: "Layout geometry only, local Chromium (NO screenshots, NO WebKit)",
      cmd: "npx",
      args: [
        "playwright",
        "test",
        "--ignore-snapshots",
        "--project=chromium-*",
        "--project=premium-360",
      ],
      group: "layout",
      ci: true,
      partial: true,
    });
  }
  return steps;
}

/** What a run means. Only a full run in CI parity counts as "pass". */
export function verdict(results, { layout, audit, nodeMajor }) {
  const failed = results.filter((r) => r.status === "fail").map((r) => r.id);
  const gaps = [];
  if (layout === "geometry")
    gaps.push("layout screenshots and WebKit not checked (no official image)");
  if (layout === "none") gaps.push("layout lock not run");
  if (!audit) gaps.push("npm audit not run");
  if (nodeMajor !== CI_NODE_MAJOR)
    gaps.push(`Node ${nodeMajor} instead of CI's Node ${CI_NODE_MAJOR}`);
  if (failed.length) return { status: "fail", exitCode: 1, failed, gaps };
  if (gaps.length) return { status: "partial", exitCode: 2, failed, gaps };
  return { status: "pass", exitCode: 0, failed, gaps };
}

function dockerAvailable() {
  const r = spawnSync("docker", ["info", "--format", "{{.ServerVersion}}"], {
    stdio: ["ignore", "pipe", "ignore"],
    timeout: 15_000,
  });
  return r.status === 0;
}

function git(args) {
  const r = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
}

function main() {
  const argv = new Set(process.argv.slice(2));
  const audit = !argv.has("--no-audit");
  const layout = argv.has("--no-layout")
    ? "none"
    : !argv.has("--geometry-only") && dockerAvailable()
      ? "official"
      : "geometry";
  const nodeMajor = Number(process.versions.node.split(".")[0]);
  const env = safeEnv();
  const results = [];
  const started = Date.now();

  console.log(`R&L local quality gate · layout: ${layout} · Node ${process.versions.node}`);
  if (layout === "geometry" && !argv.has("--geometry-only")) {
    console.log("Docker daemon not reachable: the official-image layout lock cannot run here.");
  }

  let stop = false;
  for (const step of planSteps({ layout, audit })) {
    // Layout needs a good build; everything else keeps running so one report shows all failures.
    if (stop && step.group === "layout") {
      results.push({ id: step.id, label: step.label, status: "not-run", reason: "build failed" });
      continue;
    }
    console.log(`\n▶ ${step.label}\n  $ ${step.cmd} ${step.args.join(" ")}`);
    const t0 = Date.now();
    const r = spawnSync(step.cmd, step.args, { cwd: ROOT, env, stdio: "inherit" });
    const seconds = Math.round((Date.now() - t0) / 100) / 10;
    const status = r.status === 0 ? "pass" : "fail";
    if (status === "fail" && (step.id === "build" || step.id === "cf-dry-run")) stop = true;
    results.push({
      id: step.id,
      label: step.label,
      status,
      seconds,
      ci: step.ci,
      partial: !!step.partial,
    });
    console.log(`  ${status === "pass" ? "✔" : "✘"} ${step.id} ${status} (${seconds}s)`);
  }

  const v = verdict(results, { layout, audit, nodeMajor });
  const report = {
    finishedAt: new Date().toISOString(),
    commit: git(["rev-parse", "HEAD"]),
    branch: git(["rev-parse", "--abbrev-ref", "HEAD"]),
    dirty: Boolean(git(["status", "--porcelain"])),
    node: process.versions.node,
    layout,
    image: layout === "official" ? OFFICIAL_IMAGE : null,
    totalSeconds: Math.round((Date.now() - started) / 1000),
    ...v,
    steps: results,
  };
  mkdirSync(join(ROOT, ".quality"), { recursive: true });
  writeFileSync(join(ROOT, ".quality/local-report.json"), `${JSON.stringify(report, null, 2)}\n`);

  console.log("\n── Summary ──");
  for (const r of results)
    console.log(`  ${r.status.padEnd(7)} ${r.id}${r.seconds != null ? ` (${r.seconds}s)` : ""}`);
  for (const g of v.gaps) console.log(`  gap     ${g}`);
  console.log(
    `\nResult: ${v.status.toUpperCase()} on ${report.commit?.slice(0, 7)}${report.dirty ? " (uncommitted changes)" : ""} · ${report.totalSeconds}s · .quality/local-report.json`,
  );
  if (v.status === "partial")
    console.log("Not equivalent to the hosted gate: report the gaps above.");
  process.exit(v.exitCode);
}

if (isMainModule(import.meta.url)) main();
