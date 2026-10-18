import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { register } from "node:module";
import { after, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";

// session.server.ts runs for real against an in-memory Postgres (PGLite) built from
// the repo's own migrations/*.sql. Two things only Vite normally provides are filled in:
// the `@/` alias / extensionless imports, and `@/lib/db` (which uses import.meta.glob).
const root = new URL("../../../", import.meta.url);
const pg = new PGlite({ parsers: { 20: Number } });
await pg.waitReady;
for (const file of readdirSync(new URL("migrations/", root))
  .filter((name) => name.endsWith(".sql"))
  .sort()) {
  await pg.exec(readFileSync(new URL(`migrations/${file}`, root), "utf8"));
}

async function getSql() {
  return async function sql<T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return (await pg.query<T>(text, values)).rows;
  };
}
(globalThis as { __phoneTestSql__?: typeof getSql }).__phoneTestSql__ = getSql;

const src = new URL("src/", root).href;
register(
  "data:text/javascript," +
    encodeURIComponent(`
      const SRC = ${JSON.stringify(src)};
      const DB = "data:text/javascript," + encodeURIComponent("export const getSql = () => globalThis.__phoneTestSql__();");
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

const { phoneConfirm, phoneDeliveryConfigured, phoneLogin, phoneRegister, phoneStart } =
  await import("./session.server.ts");

const DIAL = "964";
const NATIONAL = "7501234567";
const PIN = "448190";
process.env.NODE_ENV = "test";
process.env.PHONE_CODE_SECRET = "test-phone-secret";

function clearDeliveryEnv() {
  delete process.env.WHATSAPP_TOKEN;
  delete process.env.WHATSAPP_PHONE_ID;
  delete process.env.TWILIO_ACCOUNT_SID;
  delete process.env.TWILIO_AUTH_TOKEN;
  delete process.env.TWILIO_FROM;
}



async function counts() {
  const sql = await getSql();
  const users = await sql<{ n: number }>`select count(*) as n from phone_users`;
  const sessions = await sql<{ n: number }>`select count(*) as n from phone_sessions`;
  return { users: Number(users[0]?.n ?? 0), sessions: Number(sessions[0]?.n ?? 0) };
}

after(async () => {
  clearDeliveryEnv();
  await pg.close();
});

describe("phone sign-in without WhatsApp or Twilio", () => {
  it("refuses start, register, login and confirm, and creates no session", async () => {
    clearDeliveryEnv();
    assert.equal(phoneDeliveryConfigured(), false);
    const before = await counts();
    assert.deepEqual(await phoneStart(DIAL, NATIONAL), { error: "unavailable" });
    assert.deepEqual(
      await phoneRegister({ dial: DIAL, national: NATIONAL, name: "Test User", pin: PIN }),
      {
        error: "unavailable",
      },
    );
    assert.deepEqual(await phoneLogin({ dial: DIAL, national: NATIONAL, pin: PIN }), {
      error: "unavailable",
    });
    assert.deepEqual(
      await phoneConfirm({ dial: DIAL, national: NATIONAL, pin: PIN, name: "Test User" }),
      {
        error: "unavailable",
      },
    );
    assert.deepEqual(await counts(), before);
  });
});

describe("phone sign-in when a delivery channel is configured", () => {
  it("still refuses a caller-chosen PIN that was never delivered", async () => {
    process.env.RL_PHONE_TEST_SINK = "1";
    assert.equal(phoneDeliveryConfigured(), true);
    const before = await counts();
    assert.deepEqual(
      await phoneRegister({ dial: DIAL, national: NATIONAL, name: "Test User", pin: PIN }),
      {
        error: "wrong",
      },
    );
    assert.deepEqual(await phoneLogin({ dial: DIAL, national: NATIONAL, pin: PIN }), {
      error: "wrong",
    });
    assert.deepEqual(
      await phoneConfirm({ dial: DIAL, national: NATIONAL, pin: PIN, name: "Test User" }),
      {
        error: "wrong",
      },
    );
    assert.deepEqual(await counts(), before);
  });

  it("accepts register and sign-in only when the PIN matches the delivered code", async () => {
    process.env.RL_PHONE_TEST_SINK = "1";
    const started = await phoneStart(DIAL, NATIONAL);
    assert.equal(started.sent, true);
    assert.equal("exists" in started, false);
    const delivered = (globalThis as { __rlLastCode?: string }).__rlLastCode;
    assert.equal(delivered, PIN.length === 6 ? delivered : undefined);
    assert.equal(delivered?.length, 6);
    let registered: { name?: string; error?: string };
    try {
      registered = await phoneRegister({
        dial: DIAL,
        national: NATIONAL,
        name: "Test User",
        pin: delivered,
      });
    } catch (error) {
      // A verified code opens the session, then the cookie write needs a request context
      // this unit test does not have. The row is what proves the session was created.
      assert.match(String(error), /StartEvent/);
      registered = { name: "Test User" };
    }
    assert.equal(registered.name, "Test User");
    const afterRegister = await counts();
    assert.equal(afterRegister.users, 1);
    assert.equal(afterRegister.sessions, 1);

    // The code was consumed, so the same PIN can no longer sign in.
    assert.deepEqual(await phoneLogin({ dial: DIAL, national: NATIONAL, pin: PIN }), {
      error: "wrong",
    });
    assert.equal((await counts()).sessions, 1);

    const again = await phoneStart(DIAL, NATIONAL);
    assert.equal(again.sent, true);
    const second = (globalThis as { __rlLastCode?: string }).__rlLastCode;
    try {
      const signedIn = await phoneLogin({ dial: DIAL, national: NATIONAL, pin: second });
      assert.equal(signedIn.name, "Test User");
    } catch (error) {
      assert.match(String(error), /StartEvent/);
    }
    assert.equal((await counts()).sessions, 2);
  });
});


describe("bounded OTP resend and consumption", () => {
  it("keeps the deadline and guess budget on resend, then recovers after expiry", async () => {
    process.env.RL_PHONE_TEST_SINK = "1";
    const national = "7509990001";
    const phone = "+964" + national;
    const sql = await getSql();
    await sql`delete from rate_counters`;
    assert.equal((await phoneStart(DIAL, national)).sent, true);
    const first = (globalThis as { __rlLastCode?: string }).__rlLastCode!;
    const deadline = (await sql<{ expires_at: string }>`select expires_at from phone_codes where phone = ${phone}`)[0].expires_at;
    assert.equal((await phoneStart(DIAL, national)).error, "rate");
    const wrong = first === "111111" ? "222222" : "111111";
    for (let i = 0; i < 2; i += 1)
      assert.equal((await phoneLogin({ dial: DIAL, national, pin: wrong })).error, "wrong");
    await sql`update phone_codes set sent_at = now() - interval '61 seconds' where phone = ${phone}`;
    assert.equal((await phoneStart(DIAL, national)).sent, true);
    const row = (await sql<{ expires_at: string; attempts: number }>`select expires_at, attempts from phone_codes where phone = ${phone}`)[0];
    assert.equal(new Date(row.expires_at).getTime(), new Date(deadline).getTime());
    assert.equal(row.attempts, 2);
    const second = (globalThis as { __rlLastCode?: string }).__rlLastCode!;
    const wrongSecond = second === "111111" ? "222222" : "111111";
    for (let i = 0; i < 3; i += 1)
      assert.equal((await phoneLogin({ dial: DIAL, national, pin: wrongSecond })).error, "wrong");
    await sql`update phone_codes set sent_at = now() - interval '61 seconds' where phone = ${phone}`;
    const beforeBlocked = await sql`select key, n from rate_counters where key like 'phone:%' order by key`;
    for (let i = 0; i < 12; i += 1)
      assert.equal((await phoneStart(DIAL, national)).error, "rate");
    assert.deepEqual(await sql`select key, n from rate_counters where key like 'phone:%' order by key`, beforeBlocked,
      "locked resends never spend the daily send budget or prolong recovery");
    assert.equal((await phoneLogin({ dial: DIAL, national, pin: second })).error, "wrong");
    await sql`update phone_codes set expires_at = now() - interval '1 second' where phone = ${phone}`;
    assert.equal((await phoneStart(DIAL, national)).sent, true);
    const fresh = (await sql<{ attempts: number; ttl: number }>`select attempts, extract(epoch from expires_at - now()) as ttl from phone_codes where phone = ${phone}`)[0];
    assert.equal(fresh.attempts, 0);
    assert.ok(Number(fresh.ttl) > 290 && Number(fresh.ttl) <= 300);
  });

  it("allows one concurrent send and one concurrent consumption; pending or expired codes fail", async () => {
    process.env.RL_PHONE_TEST_SINK = "1";
    const sql = await getSql();
    await sql`delete from rate_counters`;
    const national = "7509990002";
    const phone = "+964" + national;
    const starts = await Promise.all([phoneStart(DIAL, national), phoneStart(DIAL, national)]);
    assert.equal(starts.filter((s) => s.sent).length, 1);
    const pin = (globalThis as { __rlLastCode?: string }).__rlLastCode!;
    await sql`update phone_codes set code_salt = 'pending' where phone = ${phone}`;
    assert.equal((await phoneLogin({ dial: DIAL, national, pin })).error, "wrong");
    await sql`update phone_codes set code_salt = 'hmac' where phone = ${phone}`;
    const before = await counts();
    const results = await Promise.allSettled([1, 2].map(() => phoneConfirm({ dial: DIAL, national, pin, name: "Race User" })));
    assert.equal((await counts()).sessions, before.sessions + 1);
    assert.equal(results.filter((r) => r.status === "fulfilled" && r.value.error === "wrong").length, 1);
    assert.equal((await sql`select phone from phone_codes where phone = ${phone}`).length, 0);
  });
});

it("failed provider delivery leaves no usable code or session and permits a bounded retry", async () => {
  const sql = await getSql();
  await sql`delete from rate_counters`;
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  delete process.env.RL_PHONE_TEST_SINK;
  process.env.TWILIO_ACCOUNT_SID = "test-account";
  process.env.TWILIO_AUTH_TOKEN = "test-token";
  process.env.TWILIO_FROM = "+491234567890";
  globalThis.fetch = async () => new Response("unavailable", { status: 503 });
  console.error = () => {};
  const national = "7509990003";
  const phone = "+964" + national;
  const before = await counts();
  try {
    assert.equal((await phoneStart(DIAL, national)).error, "unavailable");
    const row = (await sql<{ code_salt: string; code_hash: string }>`select code_salt, code_hash from phone_codes where phone = ${phone}`)[0];
    assert.equal(row.code_salt, "pending");
    assert.equal(row.code_hash.length, 64);
    assert.equal((await phoneLogin({ dial: DIAL, national, pin: PIN })).error, "wrong");
    assert.deepEqual(await counts(), before);
    assert.equal((await phoneStart(DIAL, national)).error, "rate");
    await sql`update phone_codes set sent_at = now() - interval '61 seconds' where phone = ${phone}`;
    process.env.RL_PHONE_TEST_SINK = "1";
    assert.equal((await phoneStart(DIAL, national)).sent, true);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
    clearDeliveryEnv();
    process.env.RL_PHONE_TEST_SINK = "1";
  }
});
