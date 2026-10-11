import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { hasDatabaseConfig, resolveDatabaseUrl } from "./db-config.server.ts";

type Env = { HYPERDRIVE?: { connectionString?: string }; DATABASE_URL?: unknown };
const g = globalThis as { __env__?: Env };

function withEnv<T>(env: Env | undefined, fn: () => T): T {
  const prevEnv = g.__env__;
  const prevUrl = process.env.DATABASE_URL;
  g.__env__ = env;
  delete process.env.DATABASE_URL;
  try {
    return fn();
  } finally {
    g.__env__ = prevEnv;
    if (prevUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = prevUrl;
  }
}

// workerd throws on reading HYPERDRIVE.connectionString outside a request
// handler. Model that with a getter that throws until "inside a request".
function hyperdriveBinding() {
  let inRequest = false;
  const binding = {
    get connectionString(): string {
      if (!inRequest) throw new Error("Disallowed operation called within global scope.");
      return "postgres://user:pw@hyperdrive.local:5432/db";
    },
  };
  return { binding, enterRequest: () => (inRequest = true) };
}

test("hasDatabaseConfig detects Hyperdrive without reading its connection string", () => {
  const { binding, enterRequest } = hyperdriveBinding();
  withEnv({ HYPERDRIVE: binding }, () => {
    assert.equal(hasDatabaseConfig(), true); // must not throw in global scope
    assert.throws(() => resolveDatabaseUrl(), /global scope/);
    enterRequest();
    assert.equal(resolveDatabaseUrl(), "postgres://user:pw@hyperdrive.local:5432/db");
  });
});

test("hasDatabaseConfig agrees with resolveDatabaseUrl for secrets and blanks", () => {
  withEnv({ DATABASE_URL: "postgres://a@b/c" }, () => {
    assert.equal(hasDatabaseConfig(), true);
    assert.equal(resolveDatabaseUrl(), "postgres://a@b/c");
  });
  withEnv({ DATABASE_URL: "   " }, () => {
    assert.equal(hasDatabaseConfig(), false);
    assert.equal(resolveDatabaseUrl(), undefined);
  });
  withEnv(undefined, () => {
    assert.equal(hasDatabaseConfig(), false);
    assert.equal(resolveDatabaseUrl(), undefined);
  });
});

// Static guard: no module-scope `resolveDatabaseUrl()` call anywhere in src/.
// Top-level statements start at column 0; calls inside functions are indented.
test("resolveDatabaseUrl() is never called at module scope", () => {
  const root = new URL("../", import.meta.url).pathname;
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) {
        readFileSync(path, "utf8")
          .split("\n")
          .forEach((line, i) => {
            if (
              /^\S.*\bresolveDatabaseUrl\(/.test(line) &&
              !/^(export )?(async )?function\b/.test(line)
            ) {
              offenders.push(`${path}:${i + 1}`);
            }
          });
      }
    }
  };
  walk(root);
  assert.deepEqual(offenders, []);
});
