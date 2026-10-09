import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";

const root = new URL("../../../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");

test("no setting, flag, env var or toggle can turn the compliance system off", () => {
  const dir = "src/lib/compliance/";
  for (const f of readdirSync(new URL(dir, root)).filter(
    (n) => n.endsWith(".ts") && !n.includes(".test."),
  )) {
    const src = read(dir + f);
    assert.doesNotMatch(
      src,
      /process\.env|import\.meta\.env|globalThis\.|localStorage|getJson\(/,
      `${f} reads configuration`,
    );
    assert.doesNotMatch(
      src,
      /\b(enabled|disabled?|bypass|killSwitch|featureFlag)\b\s*[:=?]/i,
      `${f} has a switch`,
    );
  }
  // no compliance variable in any deploy config
  for (const f of [
    "wrangler.jsonc",
    "wrangler.json",
    "wrangler.toml",
    ".dev.vars.example",
    ".env.example",
  ]) {
    if (existsSync(new URL(f, root))) assert.doesNotMatch(read(f), /COMPLIANCE|HALAL|PROHIBIT/i, f);
  }
  // the callers never make the check optional
  const handlers = read("src/lib/market/handlers.server.ts");
  assert.match(handlers, /checkProductServer\(sql,/);
  assert.doesNotMatch(
    handlers,
    /if \([^)]*(compliance|halal)[^)]*\b(enabled|flag|toggle|switch)\b/i,
  );
});
