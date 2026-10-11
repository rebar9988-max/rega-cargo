import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { hasWorkersDatabase, resolveDatabaseUrl } from "./db-config.server.ts";

type Env = Record<string, unknown>;
const g = globalThis as { __env__?: Env };

/** A Hyperdrive binding whose connection string, like workerd's, may only be read in a request. */
function hyperdrive(inRequest: () => boolean) {
  return {
    get connectionString() {
      if (!inRequest()) throw new Error("Disallowed operation called within global scope.");
      return "postgres://cargo_app:x@hyperdrive.local:5432/cargo";
    },
  };
}

test("hasWorkersDatabase detects the binding without reading its connection string", () => {
  let inRequest = false;
  g.__env__ = { HYPERDRIVE: hyperdrive(() => inRequest) };
  try {
    assert.equal(hasWorkersDatabase(), true);
    inRequest = true;
    assert.equal(resolveDatabaseUrl(), "postgres://cargo_app:x@hyperdrive.local:5432/cargo");
  } finally {
    delete g.__env__;
  }
});

test("hasWorkersDatabase: DATABASE_URL secret counts, blank or missing does not", () => {
  try {
    g.__env__ = { DATABASE_URL: "postgres://u:p@h/db" };
    assert.equal(hasWorkersDatabase(), true);
    g.__env__ = { DATABASE_URL: "   " };
    assert.equal(hasWorkersDatabase(), false);
    g.__env__ = {};
    assert.equal(hasWorkersDatabase(), false);
  } finally {
    delete g.__env__;
  }
});

// workerd evaluates lazily imported chunks in global scope, where reading the
// Hyperdrive connection string throws. These modules load lazily, so none may
// resolve it at module level (production outage 2026-10-11: /market had no DB).
test("no module resolves the database URL at module load", () => {
  for (const file of ["./db.ts", "./auth/verify.server.ts"]) {
    const src = readFileSync(new URL(file, import.meta.url), "utf8");
    const topLevel = src
      .split("\n")
      .filter((line) => /^\S.*resolveDatabaseUrl\(\)/.test(line) && !line.includes("=>"));
    assert.deepEqual(topLevel, [], `${file} resolves the database URL at module level`);
  }
  const auth = readFileSync(new URL("./auth/server.ts", import.meta.url), "utf8");
  assert.match(auth, /^const databaseUrl = workers \? undefined : resolveDatabaseUrl\(\);$/m);
});
