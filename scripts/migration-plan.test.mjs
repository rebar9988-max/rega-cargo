import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  isMigrationFile,
  migrationGate,
  migrationName,
  pendingMigrations,
} from "./migration-plan.mjs";
import { projectRoot } from "./with-app-env.mjs";

const AUTH_MIGRATION = "0001_auth.sql";

/**
 * The auth-on copy of the Better Auth schema and its source, or null when the
 * app has not turned sign-in on (the shipped state).
 */
function authSchemaCopy(root) {
  const copy = join(root, "migrations", AUTH_MIGRATION);
  const source = join(root, "migrations/auth", AUTH_MIGRATION);
  if (!existsSync(copy) || !existsSync(source)) return null;
  return { copy: readFileSync(copy, "utf8"), source: readFileSync(source, "utf8") };
}

test("_migrations keys on basename, not path", () => {
  assert.equal(migrationName("/migrations/0002_todos.sql"), "0002_todos.sql");
  assert.equal(migrationName("migrations/auth/0001_auth.sql"), "0001_auth.sql");
  assert.equal(migrationName("0001_auth.sql"), "0001_auth.sql");
});

test("a file already applied from another directory does not re-apply", () => {
  // The auth-on path copies migrations/auth/0001_auth.sql into the globbed
  // directory; a database that already has it must not run it twice.
  assert.deepEqual(pendingMigrations(["/migrations/0001_auth.sql"], ["0001_auth.sql"]), []);
});

test("pending migrations are returned in name order", () => {
  assert.deepEqual(
    pendingMigrations(
      ["/migrations/0003_c.sql", "/migrations/0001_a.sql", "/migrations/0002_b.sql"],
      ["0001_a.sql"],
    ),
    [
      { name: "0002_b.sql", path: "/migrations/0002_b.sql" },
      { name: "0003_c.sql", path: "/migrations/0003_c.sql" },
    ],
  );
});

test("non-.sql entries are dropped (readdir also yields the auth/ directory)", () => {
  assert.equal(isMigrationFile("auth"), false);
  assert.deepEqual(pendingMigrations(["auth", "README.md"], []), []);
});

test("the auth schema ships outside the globbed directory", () => {
  // App migrations (0002_market.sql, …) live in migrations/ by design, so the
  // globbed set is not empty. The invariant is that the opt-in Better Auth
  // schema's source stays in auth/ (out of both appliers' non-recursive reads);
  // a copied-up 0001_auth.sql is checked against it by the next test.
  const migrationsDir = join(projectRoot(), "migrations");
  assert.ok(readdirSync(join(migrationsDir, "auth")).includes(AUTH_MIGRATION));
  const globbed = pendingMigrations(readdirSync(migrationsDir), []).map((m) => m.name);
  assert.ok(
    globbed.every((name) => name !== "auth"),
    "readdir's auth/ entry must not be applied",
  );
});

test("this workspace's auth schema copy is byte-identical to its source", () => {
  // An edited copy diverges silently: basename keying skips it on a database
  // that already ran the original, and applies it on a fresh PGLite preview.
  const pair = authSchemaCopy(projectRoot());
  if (pair === null) return; // sign-in off — nothing has been copied up
  assert.equal(
    pair.copy,
    pair.source,
    "migrations/0001_auth.sql has been edited — it must stay a verbatim copy of migrations/auth/0001_auth.sql",
  );
});

test("the copy check reads both files and catches an edit", () => {
  const root = mkdtempSync(join(tmpdir(), "auth-schema-"));
  mkdirSync(join(root, "migrations/auth"), { recursive: true });
  writeFileSync(join(root, "migrations/auth", AUTH_MIGRATION), "create table t ();\n");
  assert.equal(authSchemaCopy(root), null);

  writeFileSync(join(root, "migrations", AUTH_MIGRATION), "create table t ();\n");
  const same = authSchemaCopy(root);
  assert.equal(same.copy, same.source);

  writeFileSync(join(root, "migrations", AUTH_MIGRATION), "create table t (x int);\n");
  const drifted = authSchemaCopy(root);
  assert.notEqual(drifted.copy, drifted.source);
});

const URL_SET = { DATABASE_URL: "postgres://user@db.invalid:5432/prod" };

test("migration gate: no DATABASE_URL never migrates", () => {
  assert.equal(migrationGate({}).run, false);
  assert.equal(
    migrationGate({ DATABASE_URL: "", WORKERS_CI: "1", WORKERS_CI_BRANCH: "main" }).run,
    false,
  );
});

test("migration gate: Workers Builds migrates only the production branch", () => {
  const ci = { ...URL_SET, CI: "true", WORKERS_CI: "1" };
  assert.equal(migrationGate({ ...ci, WORKERS_CI_BRANCH: "main" }).run, true);
  for (const branch of ["claude/some-pr", "Main", "main-copy", "", undefined]) {
    assert.equal(migrationGate({ ...ci, WORKERS_CI_BRANCH: branch }).run, false, String(branch));
  }
});

test("migration gate: other CI (GitHub Actions, self-hosted) never migrates", () => {
  assert.equal(migrationGate({ ...URL_SET, CI: "true", GITHUB_ACTIONS: "true" }).run, false);
  assert.equal(migrationGate({ ...URL_SET, CI: "1" }).run, false);
});

test("migration gate: a manual run outside CI is unchanged", () => {
  assert.equal(migrationGate(URL_SET).run, true);
  assert.equal(migrationGate({ ...URL_SET, CI: "false" }).run, true);
});

test("migrate.mjs in a branch build exits 0 without connecting", () => {
  // db.invalid cannot resolve: an attempted connection would fail with exit 1.
  const env = {
    ...process.env,
    ...URL_SET,
    CI: "true",
    WORKERS_CI: "1",
    WORKERS_CI_BRANCH: "claude/pr",
  };
  const out = execFileSync(process.execPath, [join(projectRoot(), "scripts/migrate.mjs")], {
    env,
    encoding: "utf8",
  });
  assert.match(out, /non-production branch "claude\/pr" — skipping/);
});
