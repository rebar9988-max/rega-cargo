import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

// Keeps the project memory (CLAUDE.md → PROJECT_MEMORY.md → docs/project-memory/) discoverable,
// its relative links valid and free of secret-looking values.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS = [
  "architecture",
  "decisions",
  "features",
  "design",
  "integrations",
  "issues",
  "progress",
  "deployments",
];
const FILES = [
  "CLAUDE.md",
  "PROJECT_MEMORY.md",
  ...TOPICS.map((name) => `docs/project-memory/${name}.md`),
];

const read = (file) => readFileSync(join(ROOT, file), "utf8");

test("every memory file exists", () => {
  for (const file of FILES) assert.ok(existsSync(join(ROOT, file)), `${file} is missing`);
});

test("CLAUDE.md and AGENTS.md lead to the memory index", () => {
  assert.match(read("CLAUDE.md"), /\]\(PROJECT_MEMORY\.md\)/);
  assert.match(read("AGENTS.md"), /PROJECT_MEMORY\.md \(repo root\)/);
});

test("PROJECT_MEMORY.md links every topic file", () => {
  const index = read("PROJECT_MEMORY.md");
  for (const name of TOPICS) {
    assert.ok(index.includes(`(docs/project-memory/${name}.md)`), `index does not link ${name}.md`);
  }
});

test("relative links in memory files resolve", () => {
  for (const file of FILES) {
    for (const [, target] of read(file).matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^[a-z]+:/i.test(target) || target.startsWith("#")) continue;
      const path = resolve(ROOT, dirname(file), target.split("#")[0]);
      assert.ok(existsSync(path), `${file} links to missing ${target}`);
    }
  }
});

test("memory files hold no secret-looking values", () => {
  const patterns = [
    /postgres(?:ql)?:\/\/[^\s`'"]*:[^\s`'"@]+@/i, // connection string with a password
    /\b(?:ghp|gho|github_pat)_[A-Za-z0-9_]{20,}/, // GitHub tokens
    /\bsk-[A-Za-z0-9]{20,}/, // API keys
    /\bnpg_[A-Za-z0-9]{8,}/, // Neon passwords
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  ];
  for (const file of FILES) {
    const text = read(file);
    for (const pattern of patterns)
      assert.doesNotMatch(text, pattern, `${file} matches ${pattern}`);
  }
});
