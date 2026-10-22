#!/usr/bin/env node
// PROJECT IDENTITY GUARD — REGA != R&L. Fail-closed, read-only, no dependencies, no network.
//
// REGA Platform (repo rebar9988-max/Rega, www.regaplatform.com) and R&L (repo rebar9988-max/rega-cargo,
// www.rlgo.net) are two independent projects. Run this before any destructive or production-changing step
// (deploy, migration, secret sync, merge, infrastructure change). It exits 0 only when every identifier it can
// see belongs to the project that was asked for AND to the repository it lives in. Anything else — a project
// mismatch, mixed identifiers, an unknown identifier, or no repository evidence at all — exits 1.
//
// The guard never edits files, never calls GitHub/Cloudflare/the database and never switches project.
//
//   node scripts/project-identity-guard.mjs --project REGA [--repo owner/name] [--domain host]
//        [--worker name] [--remote git-url]
//
// Also read automatically: GITHUB_REPOSITORY, every `git remote` URL of the checkout, and the Worker name and
// route patterns of the local wrangler.jsonc. A PR number, commit or CI run id (--pr/--run/--commit) is accepted
// but is NEVER an identity on its own.
//
// This file is identical in both repositories except for the LOCAL_PROJECT line.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** The project this repository IS. The only line that differs between the two repositories. */
export const LOCAL_PROJECT = "R&L";

export const PROJECTS = {
  REGA: {
    name: "REGA Platform",
    repos: ["rebar9988-max/rega"],
    domains: ["regaplatform.com", "www.regaplatform.com"],
    retiredDomains: [],
    workers: ["rega-platform", "rega-ai-python"],
  },
  "R&L": {
    name: "R&L Marketplace & Delivery",
    repos: ["rebar9988-max/rega-cargo"],
    domains: ["rlgo.net", "www.rlgo.net"],
    // Retired R&L host (detached from the Worker). Still R&L's identifier, never a valid target.
    retiredDomains: ["cargo.regaplatform.com"],
    workers: ["rega-cargo", "rega-cargo-staging"],
  },
};

const ALIASES = {
  rega: "REGA",
  "rega platform": "REGA",
  regaplatform: "REGA",
  "r&l": "R&L",
  rl: "R&L",
  "r and l": "R&L",
  "rega cargo": "R&L",
  "rl cargo": "R&L",
  rlgo: "R&L",
};

/** Kurdish Sorani error required by the owner's P0 rule (printed verbatim on every block). */
export const SORANI_ERROR =
  "هەڵەی گرنگ: پڕۆژەکان تێکەڵ بوون! REGA و R&L دوو پڕۆژەی جیاوازن. کارەکە بە خۆکار وەستێنرا بۆ پاراستنی کۆد و داتابەیس و Production. تکایە پڕۆژەی دروست دیاری بکە.";

/** "REGA", "rega platform", "R&L", "rega-cargo" ... -> "REGA" | "R&L" | null (unknown or ambiguous). */
export function resolveProject(value) {
  if (typeof value !== "string") return null;
  const key = value.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
  return ALIASES[key] ?? null;
}

/** owner/name from "owner/name", https URLs (with or without credentials/.git) and scp-style git URLs. */
export function normalizeRepo(value) {
  if (typeof value !== "string") return null;
  let v = value.trim().toLowerCase();
  if (!v) return null;
  v = v.replace(/^git\+/, "").replace(/^[a-z][a-z0-9+.-]*:\/\/(?:[^@/]*@)?/, "");
  v = v.replace(/^git@/, "").replace(/^github\.com[:/]/, "");
  v = v.replace(/[?#].*$/, "").replace(/\.git$/, "").replace(/\/+$/, "");
  return /^[a-z0-9][a-z0-9-]*\/[a-z0-9._-]+$/.test(v) ? v : null;
}

/** Host only: strips scheme, credentials, port, path and a trailing dot. */
export function normalizeHost(value) {
  if (typeof value !== "string") return null;
  let v = value.trim().toLowerCase();
  v = v.replace(/^[a-z][a-z0-9+.-]*:\/\//, "").replace(/^[^@/]*@/, "");
  v = v.replace(/[/?#].*$/, "").replace(/:\d+$/, "").replace(/\.$/, "");
  return /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(v) ? v : null;
}

const ownerOf = (list, value) =>
  Object.keys(PROJECTS).find((id) => PROJECTS[id][list].includes(value)) ?? null;

const ownerOfDomain = (host) =>
  ownerOf("domains", host) ?? ownerOf("retiredDomains", host);

/**
 * Decide whether an operation may proceed.
 * @param {{ project?: string, localProject?: string, repos?: string[], remotes?: string[],
 *           domains?: string[], workers?: string[] }} input
 * @returns {{ allow: boolean, code: string, reason: string, expected: string|null,
 *             detected: string[], conflicts: { kind: string, value: string, belongsTo: string }[] }}
 */
export function checkProjectIdentity(input = {}) {
  const { project, localProject = LOCAL_PROJECT, repos = [], remotes = [], domains = [], workers = [] } = input;
  const expected = resolveProject(project);
  const local = resolveProject(localProject);
  const detected = new Set();
  const conflicts = [];
  const block = (code, reason) => ({
    allow: false, code, reason, expected, detected: [...detected], conflicts,
  });

  if (!expected) return block("UNKNOWN_PROJECT", `Requested project is missing, unknown or ambiguous: ${JSON.stringify(project ?? null)}.`);
  if (!local) return block("UNKNOWN_LOCAL_PROJECT", "The repository's own project identity is not configured.");
  detected.add(local);

  const unknown = [];
  const classify = (kind, raw, normalized, owner) => {
    if (!normalized || !owner) { unknown.push({ kind, value: String(raw), belongsTo: "unknown" }); return; }
    detected.add(owner);
    if (owner !== expected) conflicts.push({ kind, value: normalized, belongsTo: owner });
    else if (kind === "domain" && PROJECTS[owner].retiredDomains.includes(normalized)) {
      unknown.push({ kind, value: normalized, belongsTo: `${owner} (retired host, not a valid target)` });
    }
  };

  const repoInputs = [...repos, ...remotes];
  for (const raw of repoInputs) { const n = normalizeRepo(raw); classify("repository", raw, n, n && ownerOf("repos", n)); }
  for (const raw of domains) { const n = normalizeHost(raw); classify("domain", raw, n, n && ownerOfDomain(n)); }
  for (const raw of workers) {
    const n = typeof raw === "string" ? raw.trim().toLowerCase() : null;
    classify("worker", raw, n, n && ownerOf("workers", n));
  }

  // 1. Requested project must be the project this repository is. (REGA task in R&L repo, and vice versa.)
  if (expected !== local) {
    return block("PROJECT_MISMATCH", `Task is for ${expected} but this repository is ${local}.`);
  }
  // 2. Identifiers that belong to the other project. (Mixed repository/domain/worker identifiers.)
  if (conflicts.length) {
    return block("MIXED_IDENTIFIERS",
      `Identifiers of another project were found: ${conflicts.map((c) => `${c.kind} ${c.value} -> ${c.belongsTo}`).join("; ")}.`);
  }
  // 3. Anything we cannot attribute to the requested project is ambiguous: fail closed.
  if (unknown.length) {
    conflicts.push(...unknown);
    return block("UNKNOWN_IDENTIFIER", `Identifier(s) not registered for ${expected}: ${unknown.map((u) => `${u.kind} ${u.value}`).join("; ")}.`);
  }
  // 4. A project name alone proves nothing: at least one verified repository identifier is required.
  if (!repoInputs.length) {
    return block("NO_REPOSITORY_EVIDENCE", "No repository identity was provided or detectable (no --repo, GITHUB_REPOSITORY or git remote).");
  }
  return { allow: true, code: "OK", reason: `${expected} verified.`, expected, detected: [...detected], conflicts: [] };
}

/** Human report printed on every block: expected project, detected project, conflicting identifiers, operations performed. */
export function formatBlock(result) {
  const lines = [
    SORANI_ERROR,
    "",
    `Expected project : ${result.expected ?? "(none / unknown)"}`,
    `Detected project : ${result.detected.length ? result.detected.join(", ") : "(none)"}`,
    `Reason           : ${result.code} — ${result.reason}`,
    "Conflicting identifiers:",
    ...(result.conflicts.length
      ? result.conflicts.map((c) => `  - ${c.kind}: ${c.value} (${c.belongsTo})`)
      : ["  (none identified)"]),
    "Operations already performed: none — this guard is read-only and runs before any edit, migration, commit, merge or deployment.",
    "Resume only after explicit owner confirmation. Never switch repositories automatically.",
  ];
  return lines.join("\n");
}

// ----- CLI -----------------------------------------------------------------------------------------------------

function parseArgs(argv) {
  const out = { project: undefined, repos: [], domains: [], workers: [], remotes: [] };
  const multi = { "--repo": "repos", "--domain": "domains", "--worker": "workers", "--remote": "remotes" };
  const ignored = new Set(["--pr", "--run", "--commit"]); // accepted, but never an identity on their own
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (flag !== "--project" && !multi[flag] && !ignored.has(flag)) return { error: `Unknown argument: ${flag}` };
    if (value === undefined) return { error: `Missing value for ${flag}` };
    if (flag === "--project") out.project = value;
    else if (multi[flag]) out[multi[flag]].push(value);
    i++;
  }
  return out;
}

function gitRemotes(cwd) {
  try {
    const text = execFileSync("git", ["remote", "-v"], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return [...new Set(text.split("\n").map((l) => l.split(/\s+/)[1]).filter(Boolean))];
  } catch {
    return [];
  }
}

/** Worker name and route hosts of the local wrangler.jsonc (deployment configuration); comment lines are ignored. */
function wranglerIdentifiers(root) {
  const file = join(root, "wrangler.jsonc");
  if (!existsSync(file)) return { workers: [], domains: [] };
  const text = readFileSync(file, "utf8").split("\n").filter((line) => !/^\s*\/\//.test(line)).join("\n");
  const name = /"name"\s*:\s*"([^"]+)"/.exec(text); // the first "name" is the top-level Worker name
  return {
    workers: name ? [name[1]] : [],
    domains: [...text.matchAll(/"pattern"\s*:\s*"([^"]+)"/g)].map((m) => m[1]),
  };
}

export function runCli(argv, env = process.env, root = join(dirname(fileURLToPath(import.meta.url)), "..")) {
  const args = parseArgs(argv);
  if (args.error) {
    return { status: 1, stderr: `${formatBlock({ expected: null, detected: [], code: "BAD_ARGUMENTS", reason: args.error, conflicts: [] })}\n` };
  }
  const config = wranglerIdentifiers(root);
  const result = checkProjectIdentity({
    project: args.project,
    repos: [...args.repos, ...(env.GITHUB_REPOSITORY ? [env.GITHUB_REPOSITORY] : [])],
    remotes: [...args.remotes, ...gitRemotes(root)],
    domains: [...args.domains, ...config.domains],
    workers: [...args.workers, ...config.workers],
  });
  return result.allow
    ? { status: 0, stdout: `project-identity-guard: OK — ${result.expected} (${PROJECTS[result.expected].name}) verified; no mixed identifiers.\n` }
    : { status: 1, stderr: `${formatBlock(result)}\n` };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { status, stdout, stderr } = runCli(process.argv.slice(2));
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
  process.exit(status);
}
