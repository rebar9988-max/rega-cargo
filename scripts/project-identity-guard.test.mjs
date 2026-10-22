import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { SORANI_ERROR, checkProjectIdentity } from "./project-identity-guard.mjs";

// REGA != R&L. The guard must ALLOW only a matching project+repository and BLOCK everything else, before any
// production-changing step. These tests run the guard from either repository's side (`localProject`) and as the CLI.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(join(ROOT, file), "utf8");
const REGA_REPO = "rebar9988-max/Rega";
const RL_REPO = "rebar9988-max/rega-cargo";

test("1. REGA task in the REGA repository is allowed", () => {
  const r = checkProjectIdentity({
    project: "REGA", localProject: "REGA", repos: [REGA_REPO],
    domains: ["www.regaplatform.com"], workers: ["rega-platform"],
  });
  assert.equal(r.allow, true);
  assert.equal(r.code, "OK");
});

test("2. R&L task in the R&L repository is allowed", () => {
  const r = checkProjectIdentity({
    project: "R&L", localProject: "R&L", repos: [RL_REPO],
    domains: ["www.rlgo.net", "rlgo.net"], workers: ["rega-cargo", "rega-cargo-staging"],
  });
  assert.equal(r.allow, true);
});

test("3. REGA task in the R&L repository is blocked", () => {
  const r = checkProjectIdentity({ project: "REGA", localProject: "R&L", repos: [RL_REPO] });
  assert.equal(r.allow, false);
  assert.equal(r.code, "PROJECT_MISMATCH");
});

test("4. R&L task in the REGA repository is blocked", () => {
  const r = checkProjectIdentity({ project: "R&L", localProject: "REGA", repos: [REGA_REPO] });
  assert.equal(r.allow, false);
  assert.equal(r.code, "PROJECT_MISMATCH");
});

test("5. mixed repository / domain / worker / remote identifiers are blocked", () => {
  const mixes = [
    { repos: [RL_REPO, REGA_REPO] },
    { repos: [RL_REPO], domains: ["www.regaplatform.com"] },
    { repos: [RL_REPO], domains: ["regaplatform.com"] },
    { repos: [RL_REPO], workers: ["rega-platform"] },
    { repos: [RL_REPO], remotes: ["https://github.com/rebar9988-max/Rega.git"] },
  ];
  for (const mix of mixes) {
    const r = checkProjectIdentity({ project: "R&L", localProject: "R&L", ...mix });
    assert.equal(r.allow, false, JSON.stringify(mix));
    assert.equal(r.code, "MIXED_IDENTIFIERS", JSON.stringify(mix));
    assert.ok(r.conflicts.length > 0);
  }
  // Same from the REGA side: R&L identifiers (including the retired cargo host) inside a REGA task.
  for (const mix of [{ domains: ["www.rlgo.net"] }, { domains: ["cargo.regaplatform.com"] }, { workers: ["rega-cargo"] }]) {
    const r = checkProjectIdentity({ project: "REGA", localProject: "REGA", repos: [REGA_REPO], ...mix });
    assert.equal(r.allow, false, JSON.stringify(mix));
    assert.equal(r.code, "MIXED_IDENTIFIERS");
  }
});

test("the retired cargo.regaplatform.com host is never a valid R&L target", () => {
  const r = checkProjectIdentity({ project: "R&L", localProject: "R&L", repos: [RL_REPO], domains: ["cargo.regaplatform.com"] });
  assert.equal(r.allow, false);
});

test("6. unknown or ambiguous identity is blocked (fail closed)", () => {
  const cases = [
    { project: undefined, repos: [RL_REPO] },
    { project: "", repos: [RL_REPO] },
    { project: "cargo-or-rega", repos: [RL_REPO] },
    { project: "R&L", repos: [] }, // a project name alone proves nothing
    { project: "R&L", repos: ["someone-else/rega-cargo"] },
    { project: "R&L", repos: [RL_REPO], domains: ["example.com"] },
    { project: "R&L", repos: [RL_REPO], workers: ["some-other-worker"] },
    { project: "R&L", repos: ["not a repository"] },
  ];
  for (const c of cases) {
    const r = checkProjectIdentity({ localProject: "R&L", ...c });
    assert.equal(r.allow, false, JSON.stringify(c));
  }
});

test("a PR number or CI run id never identifies a project", () => {
  const none = checkProjectIdentity({ project: "R&L", localProject: "R&L" });
  assert.equal(none.allow, false);
  assert.equal(none.code, "NO_REPOSITORY_EVIDENCE");
  // The CLI accepts --pr/--run/--commit but they add no identity; the verified repository still decides.
  const run = spawnSync(process.execPath, [
    "scripts/project-identity-guard.mjs", "--project", "R&L", "--pr", "131", "--run", "39757908801", "--commit", "abc1234",
  ], { env: { ...process.env, GITHUB_REPOSITORY: RL_REPO }, encoding: "utf8", timeout: 10000, cwd: ROOT });
  assert.equal(run.status, 0, run.stderr);
});

test("CLI: allows the R&L checkout, blocks REGA and mixed input with the Sorani error and exit code 1", () => {
  const cli = (...args) =>
    spawnSync(process.execPath, ["scripts/project-identity-guard.mjs", ...args], {
      env: { ...process.env, GITHUB_REPOSITORY: RL_REPO }, encoding: "utf8", timeout: 10000, cwd: ROOT,
    });
  const ok = cli("--project", "R&L", "--domain", "www.rlgo.net", "--worker", "rega-cargo");
  assert.equal(ok.status, 0, ok.stderr);

  for (const args of [
    ["--project", "REGA"],
    ["--project", "R&L", "--domain", "www.regaplatform.com"],
    ["--project", "R&L", "--repo", REGA_REPO],
    ["--project", "unknown"],
    [],
    ["--project", "R&L", "--bogus", "x"],
  ]) {
    const blocked = cli(...args);
    assert.equal(blocked.status, 1, args.join(" "));
    assert.ok(blocked.stderr.includes(SORANI_ERROR), args.join(" "));
    assert.match(blocked.stderr, /Expected project/);
    assert.match(blocked.stderr, /Operations already performed: none/);
    assert.equal(blocked.stdout, "", "a blocked run prints nothing on stdout");
  }
});

test("the guard exposes the exact owner-approved Sorani error text", () => {
  assert.equal(
    SORANI_ERROR,
    "هەڵەی گرنگ: پڕۆژەکان تێکەڵ بوون! REGA و R&L دوو پڕۆژەی جیاوازن. کارەکە بە خۆکار وەستێنرا بۆ پاراستنی کۆد و داتابەیس و Production. تکایە پڕۆژەی دروست دیاری بکە.",
  );
});

test("the guard is read-only: no file writes, no network, no child processes except `git remote -v`", () => {
  const src = read("scripts/project-identity-guard.mjs");
  assert.doesNotMatch(src, /writeFile|appendFile|unlink|rmSync|mkdirSync|renameSync|fetch\(|https?\.request|node:net|node:http/);
  assert.equal([...src.matchAll(/execFileSync\(/g)].length, 1);
  assert.match(src, /execFileSync\("git", \["remote", "-v"\]/);
});

test("this repository's own configuration agrees with the guard's R&L identity", () => {
  assert.match(read("scripts/project-identity-guard.mjs"), /^export const LOCAL_PROJECT = "R&L";$/m);
  const wrangler = read("wrangler.jsonc");
  assert.match(wrangler, /^\s*"name":\s*"rega-cargo"/m);
  assert.match(wrangler, /"pattern":\s*"www\.rlgo\.net"/);
  // No REGA Worker or REGA domain in the live config (the retired cargo.regaplatform.com redirect host is R&L's own).
  const live = wrangler.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
  assert.doesNotMatch(live, /rega-platform|\/\/(?:www\.)?regaplatform\.com|"(?:www\.)?regaplatform\.com"/);
});

test("manual deploy scripts and the CI verify job run the guard first, before any production step", () => {
  const { scripts } = JSON.parse(read("package.json"));
  assert.match(scripts.deploy, /^node scripts\/project-identity-guard\.mjs --project "R&L" .*&& npm run release:check && npm run build && wrangler deploy$/);
  assert.match(scripts["deploy:staging"], /^node scripts\/project-identity-guard\.mjs --project "R&L" .*--worker rega-cargo-staging.*&& npm run release:check && npm run build && wrangler deploy -c /);
  assert.equal(scripts["guard:identity"], 'node scripts/project-identity-guard.mjs --project "R&L"');

  const wf = read(".github/workflows/quality.yml");
  const verify = wf.slice(wf.indexOf("\n  verify:"), wf.indexOf("\n  layout:"));
  const guard = verify.indexOf('node scripts/project-identity-guard.mjs --project "R&L"');
  assert.ok(guard > 0, "quality.yml verify job does not run the guard");
  assert.ok(verify.indexOf("actions/checkout") < guard, "the guard needs the checkout first");
  assert.ok(guard < verify.indexOf("npm ci"), "the guard runs before dependencies are installed or anything is built");
});

test("CLAUDE.md and AGENTS.md carry the identical P0 isolation rule with both identities and the Sorani error", () => {
  const marker = "## PERMANENT P0 RULE — STRICT REGA / R&L PROJECT ISOLATION";
  const sections = ["CLAUDE.md", "AGENTS.md"].map((file) => {
    const text = read(file);
    assert.equal(text.split(marker).length, 2, `${file}: missing/duplicate P0 rule`);
    return text.split(marker)[1].split(/\n## /)[0].trim();
  });
  assert.equal(sections[0], sections[1]);
  for (const needle of [
    "rebar9988-max/rega-cargo", "rebar9988-max/Rega", "https://www.rlgo.net", "https://www.regaplatform.com",
    "R&L Marketplace & Delivery", "REGA Platform", SORANI_ERROR, "REGA ≠ R&L",
  ]) assert.ok(sections[0].includes(needle), needle);
  assert.match(read("PROJECT_MEMORY.md"), /PERMANENT P0/);
});
