import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { register } from "node:module";
import { after, beforeEach, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";

// session.server.ts runs for real against an in-memory Postgres (PGLite) built from the
// repo's own migrations/*.sql, the same harness as src/lib/phone/session.server.test.ts.
const root = new URL("../../../", import.meta.url);
const pg = new PGlite({ parsers: { 20: Number } });
await pg.waitReady;
// An account that existed before email sign-in: it must survive the migration untouched.
const before = readdirSync(new URL("migrations/", root))
  .filter((name) => name.endsWith(".sql"))
  .sort();
for (const file of before.filter((name) => name < "0016")) await pg.exec(readFileSync(new URL(`migrations/${file}`, root), "utf8"));
await pg.exec(
  `insert into phone_users (id, phone, name, pin_hash, pin_salt) values ('ph_existing', '+9647500000001', 'Existing', 'x', 'y');
   insert into phone_sessions (token_hash, user_id, expires_at) values ('existing-session', 'ph_existing', now() + interval '1 day');
   insert into user_roles (user_id, role, status, display_name, phone) values ('ph_existing', 'buyer', 'approved', 'Existing', '+9647500000001');`,
);
for (const file of before.filter((name) => name >= "0016")) await pg.exec(readFileSync(new URL(`migrations/${file}`, root), "utf8"));

async function getSql() {
  return async function sql<T = Record<string, unknown>>(strings: TemplateStringsArray, ...values: unknown[]) {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return (await pg.query<T>(text, values)).rows;
  };
}
(globalThis as { __emailTestSql__?: typeof getSql }).__emailTestSql__ = getSql;

const src = new URL("src/", root).href;
register(
  "data:text/javascript," +
    encodeURIComponent(`
      const SRC = ${JSON.stringify(src)};
      const DB = "data:text/javascript," + encodeURIComponent("export const getSql = () => globalThis.__emailTestSql__();");
      export async function resolve(specifier, context, next) {
        if (specifier === "@/lib/db") return { url: DB, shortCircuit: true };
        const local = specifier.startsWith("@/") ? SRC + specifier.slice(2) : specifier;
        const relative = local.startsWith(".") || local.startsWith("file:") || local !== specifier;
        if (!relative || /\\.[cm]?[jt]sx?$/.test(local)) return next(local, context);
        for (const ext of [".ts", ".tsx", "/index.ts"]) {
          try {
            return await next(local + ext, context);
          } catch {}
        }
        return next(local, context);
      }
    `),
);

process.env.NODE_ENV = "test";
process.env.PHONE_CODE_SECRET = "test-email-secret";
delete process.env.RESEND_API_KEY;

const { emailConfirm, emailDeliveryConfigured, emailStart, emailTestSinkEnabled, normalizeEmail } = await import(
  "./session.server.ts"
);
const { deliverEmailCode, emailHtml, emailText } = await import("./send.server.ts");

const sqlOf = await getSql();
const lastCode = () => (globalThis as { __rlLastEmailCode?: string }).__rlLastEmailCode ?? "";

/** A verified code opens a session; the cookie write then needs a request context this test lacks. */
async function confirm(input: { email?: unknown; code?: unknown; name?: unknown }) {
  try {
    return await emailConfirm(input);
  } catch (error) {
    assert.match(String(error), /StartEvent|event|context/i);
    return { opened: true as const };
  }
}

async function counts() {
  const users = await sqlOf<{ n: number }>`select count(*)::int as n from phone_users`;
  const sessions = await sqlOf<{ n: number }>`select count(*)::int as n from phone_sessions`;
  return { users: Number(users[0].n), sessions: Number(sessions[0].n) };
}

/** Lets the next send skip the one-minute resend cooldown and the hourly counters. */
async function skipCooldown() {
  await sqlOf`update email_codes set sent_at = now() - interval '2 minutes'`;
  await sqlOf`delete from rate_counters`;
}

after(async () => {
  delete process.env.RL_EMAIL_TEST_SINK;
  await pg.close();
});

beforeEach(async () => {
  await sqlOf`delete from rate_counters`;
});

describe("email address handling", () => {
  it("normalizes and rejects malformed addresses", () => {
    assert.equal(normalizeEmail("  Ali@Example.COM "), "ali@example.com");
    for (const bad of ["", "a@b", "no-at.example.com", "a b@example.com", "<a@example.com>", "a@example.com\r\nBcc: x@y.z", `${"x".repeat(65)}@example.com`])
      assert.equal(normalizeEmail(bad), null, bad);
  });
});

describe("email sign-in without Resend", () => {
  it("refuses to send or verify and creates nothing", async () => {
    delete process.env.RL_EMAIL_TEST_SINK;
    assert.equal(emailDeliveryConfigured(), false);
    const start = await counts();
    assert.deepEqual(await emailStart("a@example.com"), { error: "unavailable" });
    assert.deepEqual(await confirm({ email: "a@example.com", code: "123456", name: "Ali" }), { error: "unavailable" });
    assert.deepEqual(await counts(), start);
  });

  it("never enables the test sink in production", () => {
    process.env.RL_EMAIL_TEST_SINK = "1";
    process.env.NODE_ENV = "production";
    assert.equal(emailTestSinkEnabled(), false);
    process.env.NODE_ENV = "test";
    assert.equal(emailTestSinkEnabled(), true);
    delete process.env.RL_EMAIL_TEST_SINK;
  });
});

describe("email one-time codes", () => {
  it("stores only a hash of a six-digit code that expires in five minutes", async () => {
    process.env.RL_EMAIL_TEST_SINK = "1";
    const result = await emailStart("Store@Example.com");
    assert.equal("sent" in result && result.sent, true);
    const code = lastCode();
    assert.match(code, /^[0-9]{6}$/);
    const rows = await sqlOf<{ code_hash: string; ttl: number }>`
      select code_hash, extract(epoch from (expires_at - now()))::int as ttl from email_codes where email = 'store@example.com'`;
    assert.equal(rows.length, 1);
    assert.notEqual(rows[0].code_hash, code);
    assert.ok(!rows[0].code_hash.includes(code));
    assert.match(rows[0].code_hash, /^[0-9a-f]{64}$/);
    assert.ok(rows[0].ttl > 290 && rows[0].ttl <= 300, `ttl ${rows[0].ttl}`);
  });

  it("enforces the resend cooldown without replacing the pending code", async () => {
    process.env.RL_EMAIL_TEST_SINK = "1";
    await emailStart("cool@example.com");
    const first = lastCode();
    const again = await emailStart("cool@example.com");
    assert.equal("error" in again && again.error, "cooldown");
    assert.equal(lastCode(), first);
    await skipCooldown();
    const resent = await emailStart("cool@example.com");
    assert.equal("sent" in resent && resent.sent, true);
    assert.notEqual(lastCode(), "");
  });

  it("registers a new address only with the delivered code and a name, then consumes the code", async () => {
    process.env.RL_EMAIL_TEST_SINK = "1";
    const start = await counts();
    assert.deepEqual(await confirm({ email: "new@example.com", code: "000000", name: "New User" }), { error: "wrong" });
    await emailStart("new@example.com");
    const code = lastCode();
    const wrong = code === "111111" ? "222222" : "111111";
    assert.deepEqual(await confirm({ email: "new@example.com", code: wrong, name: "New User" }), { error: "wrong" });
    // Correct code, unknown address, no name: ask for a name and keep the code.
    assert.deepEqual(await confirm({ email: "new@example.com", code }), { needName: true, email: "new@example.com" });
    assert.deepEqual(await confirm({ email: "new@example.com", code, name: "x" }), { error: "name" });
    assert.deepEqual(await counts(), start);
    await confirm({ email: "NEW@example.com", code, name: "New User" });
    const users = await sqlOf<{ id: string; phone: string | null; name: string }>`select id, phone, name from phone_users where email = 'new@example.com'`;
    assert.equal(users.length, 1);
    assert.equal(users[0].phone, null);
    assert.equal(users[0].name, "New User");
    assert.match(users[0].id, /^em_/);
    const roles = await sqlOf<{ role: string; status: string }>`select role, status from user_roles where user_id = ${users[0].id}`;
    assert.deepEqual(roles, [{ role: "buyer", status: "approved" }]);
    assert.deepEqual(await counts(), { users: start.users + 1, sessions: start.sessions + 1 });
    // Single use.
    assert.deepEqual(await confirm({ email: "new@example.com", code, name: "New User" }), { error: "wrong" });
    assert.equal((await counts()).sessions, start.sessions + 1);
  });

  it("signs an existing email account in without a name and without a duplicate account", async () => {
    process.env.RL_EMAIL_TEST_SINK = "1";
    await skipCooldown();
    await emailStart("new@example.com");
    const start = await counts();
    const result = await confirm({ email: "new@example.com", code: lastCode() });
    assert.ok(!("error" in result), JSON.stringify(result));
    assert.deepEqual(await counts(), { users: start.users, sessions: start.sessions + 1 });
  });

  it("rejects an expired code", async () => {
    process.env.RL_EMAIL_TEST_SINK = "1";
    await skipCooldown();
    await emailStart("late@example.com");
    await sqlOf`update email_codes set expires_at = now() - interval '1 second' where email = 'late@example.com'`;
    assert.deepEqual(await confirm({ email: "late@example.com", code: lastCode(), name: "Late User" }), { error: "wrong" });
  });

  it("locks the code after five wrong guesses", async () => {
    process.env.RL_EMAIL_TEST_SINK = "1";
    await emailStart("guess@example.com");
    const code = lastCode();
    const wrong = code === "123123" ? "321321" : "123123";
    for (let i = 0; i < 5; i += 1)
      assert.deepEqual(await confirm({ email: "guess@example.com", code: wrong, name: "Guess" }), { error: "wrong" });
    assert.deepEqual(await confirm({ email: "guess@example.com", code, name: "Guess" }), { error: "wrong" });
  });

  it("rate-limits code checks per address", async () => {
    process.env.RL_EMAIL_TEST_SINK = "1";
    const results = [];
    for (let i = 0; i < 12; i += 1) results.push(await confirm({ email: "flood@example.com", code: "123456" }));
    assert.deepEqual(results.at(-1), { error: "rate" });
  });

  it("limits sends per address per hour", async () => {
    process.env.RL_EMAIL_TEST_SINK = "1";
    let last: unknown;
    for (let i = 0; i < 6; i += 1) {
      await sqlOf`update email_codes set sent_at = now() - interval '2 minutes'`;
      last = await emailStart("many@example.com");
    }
    assert.deepEqual(last, { error: "rate" });
  });

  it("lets only one of two simultaneous verifications use a code", async () => {
    process.env.RL_EMAIL_TEST_SINK = "1";
    await emailStart("race@example.com");
    const code = lastCode();
    const start = await counts();
    const results = await Promise.all([
      confirm({ email: "race@example.com", code, name: "Race User" }),
      confirm({ email: "race@example.com", code, name: "Race User" }),
    ]);
    assert.equal(results.filter((r) => "error" in r).length, 1, JSON.stringify(results));
    assert.deepEqual(await counts(), { users: start.users + 1, sessions: start.sessions + 1 });
  });

  it("refuses a suspended account", async () => {
    process.env.RL_EMAIL_TEST_SINK = "1";
    await sqlOf`update phone_users set disabled_at = now() where email = 'new@example.com'`;
    await skipCooldown();
    await emailStart("new@example.com");
    assert.deepEqual(await confirm({ email: "new@example.com", code: lastCode() }), { error: "forbidden" });
  });

  it("answers the same for registered and unknown addresses", async () => {
    process.env.RL_EMAIL_TEST_SINK = "1";
    await skipCooldown();
    const known = await emailStart("race@example.com");
    const unknown = await emailStart("nobody@example.com");
    assert.deepEqual(Object.keys(known).sort(), Object.keys(unknown).sort());
  });

  it("leaves the pre-existing phone account, session and role untouched", async () => {
    const user = await sqlOf`select id, phone, email, name from phone_users where id = 'ph_existing'`;
    assert.deepEqual(user, [{ id: "ph_existing", phone: "+9647500000001", email: null, name: "Existing" }]);
    assert.equal((await sqlOf`select 1 from phone_sessions where token_hash = 'existing-session'`).length, 1);
    assert.equal((await sqlOf`select 1 from user_roles where user_id = 'ph_existing'`).length, 1);
  });

  it("refuses an account row with neither phone nor email", async () => {
    await assert.rejects(sqlOf`insert into phone_users (id, name, pin_hash, pin_salt) values ('bad', 'Bad', 'x', 'y')`);
  });
});

describe("Resend delivery", () => {
  it("does not call Resend without a key", async () => {
    const original = globalThis.fetch;
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response("{}");
    }) as typeof fetch;
    try {
      assert.equal(await deliverEmailCode("a@example.com", "123456"), false);
      assert.equal(called, false);
    } finally {
      globalThis.fetch = original;
    }
  });

  it("posts one message with the key in the header only, and reports failures", async () => {
    const original = globalThis.fetch;
    const calls: { url: string; init: RequestInit }[] = [];
    process.env.RESEND_API_KEY = "re_test_key";
    let status = 200;
    globalThis.fetch = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response("{}", { status });
    }) as typeof fetch;
    try {
      assert.equal(await deliverEmailCode("a@example.com", "654321"), true);
      assert.equal(calls[0].url, "https://api.resend.com/emails");
      assert.equal((calls[0].init.headers as Record<string, string>).Authorization, "Bearer re_test_key");
      const body = JSON.parse(String(calls[0].init.body));
      assert.deepEqual(body.to, ["a@example.com"]);
      assert.equal(body.from, "R&L <no-reply@rlgo.net>");
      assert.ok(!String(calls[0].init.body).includes("re_test_key"));
      status = 422;
      assert.equal(await deliverEmailCode("a@example.com", "654321"), false);
    } finally {
      globalThis.fetch = original;
      delete process.env.RESEND_API_KEY;
    }
  });

  it("writes the code and the five-minute single-use notice in Sorani and English", () => {
    const text = emailText("246810");
    assert.match(text, /246810/);
    assert.match(text, /5 خولەک/);
    assert.match(text, /expires in 5 minutes/);
    assert.match(emailHtml("246810"), /dir="rtl"/);
  });
});
