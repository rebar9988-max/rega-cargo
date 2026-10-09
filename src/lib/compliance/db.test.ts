import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { BUNDLED_KEYWORDS, PROHIBITED } from "./rules.ts";

const MIG = new URL("../../../migrations/", import.meta.url);

async function freshDb() {
  const pg = new PGlite();
  for (const f of readdirSync(MIG)
    .filter((n) => n.endsWith(".sql"))
    .sort()) {
    await pg.exec(readFileSync(new URL(f, MIG), "utf8"));
  }
  return pg;
}

const pgP = freshDb();
const count = async (sql: string) => (await (await pgP).query<{ n: number }>(sql)).rows[0]?.n ?? -1;
const logCount = (action: string) =>
  count(`select count(*)::int n from compliance_audit_log where action = '${action}'`);

test("seed: every bundled category and keyword is in the DB, all locked", async () => {
  assert.equal(await count("select count(*)::int n from prohibited_categories"), PROHIBITED.length);
  const pg = await pgP;
  const rows = (
    await pg.query<{ k: string }>(
      "select c.slug || '|' || k.keyword || '|' || k.language || '|' || k.level as k from prohibited_keywords k join prohibited_categories c on c.id = k.category_id",
    )
  ).rows.map((r) => r.k);
  const db = new Set(rows);
  for (const k of BUNDLED_KEYWORDS)
    assert.ok(
      db.has(`${k.category}|${k.keyword}|${k.language}|${k.level}`),
      `missing ${k.keyword}`,
    );
  assert.equal(
    await count("select count(*)::int n from prohibited_keywords where not is_locked"),
    0,
  );
  assert.equal(
    await count("select count(*)::int n from prohibited_categories where not is_locked"),
    0,
  );
});

test("seed is idempotent (re-running adds nothing)", async () => {
  const pg = await pgP;
  const before = await count("select count(*)::int n from prohibited_keywords");
  const seed = readFileSync(new URL("0011_compliance.sql", MIG), "utf8").split("-- Seed")[1]!;
  await pg.exec(seed.slice(seed.indexOf("\n")));
  await pg.exec(seed.slice(seed.indexOf("\n")));
  assert.equal(await count("select count(*)::int n from prohibited_keywords"), before);
  assert.equal(await count("select count(*)::int n from prohibited_categories"), PROHIBITED.length);
});

test("DELETE of rules is blocked and logged", async () => {
  const pg = await pgP;
  const r = await pg.query("delete from prohibited_keywords where keyword = 'vodka'");
  assert.equal(r.affectedRows, 0);
  assert.ok(
    (await count("select count(*)::int n from prohibited_keywords where keyword = 'vodka'")) > 0,
  );
  await pg.query("delete from prohibited_categories where slug = 'alcohol'");
  assert.equal(
    await count("select count(*)::int n from prohibited_categories where slug = 'alcohol'"),
    1,
  );
  assert.ok((await logCount("blocked_delete")) >= 2);
});

test("unlocking or changing a locked rule is blocked and logged", async () => {
  const pg = await pgP;
  await pg.query("update prohibited_keywords set is_locked = false where keyword = 'beer'");
  await pg.query("update prohibited_keywords set keyword = 'b33r' where keyword = 'beer'");
  await pg.query("update prohibited_categories set slug = 'x' where slug = 'pork'");
  assert.equal(
    await count(
      "select count(*)::int n from prohibited_keywords where keyword = 'beer' and is_locked",
    ),
    await count("select count(*)::int n from prohibited_keywords where keyword = 'beer'"),
  );
  assert.equal(
    await count("select count(*)::int n from prohibited_keywords where keyword = 'b33r'"),
    0,
  );
  assert.equal(
    await count("select count(*)::int n from prohibited_categories where slug = 'pork'"),
    1,
  );
  assert.ok((await logCount("blocked_unlock")) >= 1);
  assert.ok((await logCount("blocked_update")) >= 2);
});

test("TRUNCATE raises (rolled back, so its log is app-side: see DEPLOY.md)", async () => {
  const pg = await pgP;
  for (const t of ["prohibited_keywords", "prohibited_categories", "compliance_audit_log"]) {
    await assert.rejects(pg.query(`truncate ${t} cascade`), /compliance: truncate/);
  }
  assert.ok(
    (await count("select count(*)::int n from prohibited_keywords")) >= BUNDLED_KEYWORDS.length,
  );
});

test("INSERT is allowed and always locked", async () => {
  const pg = await pgP;
  await pg.query(
    "insert into prohibited_keywords (category_id, keyword, language, is_locked) select id, 'zz-test', 'en', false from prohibited_categories where slug = 'drugs'",
  );
  assert.equal(
    await count(
      "select count(*)::int n from prohibited_keywords where keyword = 'zz-test' and is_locked",
    ),
    1,
  );
});

test("audit log is append-only", async () => {
  const pg = await pgP;
  const before = await count("select count(*)::int n from compliance_audit_log");
  assert.ok(before > 0);
  await pg.query("delete from compliance_audit_log");
  await pg.query("update compliance_audit_log set action = 'x'");
  assert.equal(
    await count("select count(*)::int n from compliance_audit_log where action = 'x'"),
    0,
  );
  assert.ok((await count("select count(*)::int n from compliance_audit_log")) > before);
});

test("DROP / DISABLE TRIGGER / DROP TABLE are blocked where event triggers are allowed", async () => {
  const pg = await pgP;
  await assert.rejects(
    pg.query("drop trigger compliance_guard_row on prohibited_keywords"),
    /compliance:/,
  );
  await assert.rejects(
    pg.query("alter table prohibited_keywords disable trigger compliance_guard_row"),
    /compliance:/,
  );
  await assert.rejects(pg.query("drop table prohibited_keywords cascade"), /compliance:/);
  await assert.rejects(
    pg.query("drop function compliance_guard_rule_row() cascade"),
    /compliance:/,
  );
  assert.equal(await count("select count(*)::int n from prohibited_categories"), PROHIBITED.length);
});
