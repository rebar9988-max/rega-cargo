import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

test("bundled catalogue, copy and seed data contain no clear prohibited match (scan script)", () => {
  const root = new URL("../../../", import.meta.url);
  const env = { ...process.env, DATABASE_URL: "" };
  const out = execFileSync(
    process.execPath,
    ["--experimental-strip-types", "--no-warnings", "scripts/compliance-scan.mjs"],
    { cwd: root, env, encoding: "utf8" },
  );
  assert.match(out, /# Bundled data: 0 clear/);
  assert.match(out, /unpublished 0, sent to review 0/);
});
