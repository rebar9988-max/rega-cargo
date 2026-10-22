import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { register } from "node:module";
import { after, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import type { Sql } from "../db.ts";

// Email sign-in runs for real: the service against an in-memory Postgres (PGLite) built
// from the repo's own migrations/*.sql, and a real Better Auth instance with the
// rl-email-otp plugin, so sessions, sign-out and origin checks are Better Auth's own.
const root = new URL("../../../", import.meta.url);
const pg = new PGlite({ parsers: { 20: Number } });
await pg.waitReady;
for (const file of readdirSync(new URL("migrations/", root))
  .filter((name) => name.endsWith(".sql"))
  .sort())
  await pg.exec(readFileSync(new URL(`migrations/${file}`, root), "utf8"));

async function getSql(): Promise<Sql> {
  const sql = async <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return (await pg.query<T>(text, values)).rows;
  };
  return Object.assign(sql, {
    query: async <T = Record<string, unknown>>(text: string, params: unknown[] = []) =>
      (await pg.query<T>(text, params)).rows,
  }) as Sql;
}
(globalThis as { __emailTestSql__?: typeof getSql }).__emailTestSql__ = getSql;
// The plugin imports `../db` (Vite-only import.meta.glob); point it at PGLite.
register(
  "data:text/javascript," +
    encodeURIComponent(`
      const DB = "data:text/javascript," + encodeURIComponent("export const getSql = () => globalThis.__emailTestSql__();");
      export async function resolve(specifier, context, next) {
        if (specifier === "../db" && context.parentURL?.endsWith("/auth/email-otp-plugin.ts"))
          return { url: DB, shortCircuit: true };
        return next(specifier, context);
      }
    `),
);

process.env.NODE_ENV = "test";
process.env.RL_EMAIL_TEST_SINK = "1";
process.env.EMAIL_CODE_SECRET = "test-email-code-secret";

const svc = await import("./service.server.ts");
const mail = await import("./send.server.ts");
const { EMAIL_OTP_COPY } = await import("./copy.ts");
const { LANGS } = await import("../langs.ts");
const { ownerAuthRequestAllowed } = await import("../owner/http.ts");
const { betterAuth } = await import("better-auth");
const { pgliteDialect } = await import("../auth/pglite-dialect.ts");
const { rlEmailOtp } = await import("../auth/email-otp-plugin.ts");

const SECRET = "test-email-code-secret";
const ORIGIN = "https://www.rlgo.net";
const SESSION = "__Host-grok-auth.session_token";
const auth = betterAuth({
  baseURL: ORIGIN,
  secret: "test-better-auth-secret-0123456789abcdef",
  database: { dialect: pgliteDialect(async () => pg), type: "postgres" },
  trustedOrigins: [ORIGIN],
  session: { cookieCache: { enabled: false } },
  emailAndPassword: { enabled: true, minPasswordLength: 16, maxPasswordLength: 128 },
  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: { session_token: { name: SESSION } },
  },
  plugins: [rlEmailOtp()],
});

let ipSeq = 0;
const nextIp = () => `198.51.100.${(ipSeq += 1)}`;
const lastCode = () =>
  (globalThis as { __rlLastEmailCode?: { email: string; code: string } }).__rlLastEmailCode;

async function sql() {
  return getSql();
}
async function call(
  path: string,
  init: { body?: unknown; cookie?: string; origin?: string; ip?: string; method?: string } = {},
) {
  const headers: Record<string, string> = { "cf-connecting-ip": init.ip ?? nextIp() };
  if (init.body !== undefined) headers["content-type"] = "application/json";
  if (init.origin !== "") headers.origin = init.origin ?? ORIGIN;
  if (init.cookie) headers.cookie = init.cookie;
  const response = await auth.handler(
    new Request(`${ORIGIN}/api/auth/${path}`, {
      method: init.method ?? (init.body === undefined ? "GET" : "POST"),
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    }),
  );
  const text = await response.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  const cookie = response.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .find((c) => c.startsWith(`${SESSION}=`) && c.length > SESSION.length + 1);
  return { status: response.status, json, cookie };
}

/** Service-level send with a capturing delivery. */
async function send(
  email: string,
  opts: { ip?: string; deliver?: (e: string, c: string) => Promise<boolean> } = {},
) {
  let code: string | null = null;
  const result = await svc.requestEmailCode(await sql(), {
    email,
    ip: opts.ip ?? nextIp(),
    secret: SECRET,
    deliver:
      opts.deliver ??
      (async (_e, c) => {
        code = c;
        return true;
      }),
  });
  return { result, code: code as string | null };
}
const verify = async (email: string, code: string, ip = nextIp()) =>
  svc.verifyEmailCode(await sql(), { email, code, ip, secret: SECRET });
const age = async (email: string, seconds: number) =>
  (await sql())`update email_codes set sent_at = sent_at - make_interval(secs => ${seconds}) where email = ${email}`;
const createUser = async (input: { email: string; name: string }) => {
  const id = `u_${crypto.randomUUID()}`;
  await (await sql())`insert into "user" (id, name, email, "emailVerified") values (${id}, ${input.name}, ${input.email}, true)`;
  return { id };
};

after(async () => {
  await pg.close();
});

describe("email normalisation and copy", () => {
  it("accepts single mailboxes only, lower-cased", () => {
    assert.equal(svc.normalizeEmail("  Rebar@Example.COM "), "rebar@example.com");
    for (const bad of [
      "",
      "a@b",
      "no-at.example.com",
      "a@@b.com",
      "a b@c.com",
      "x@y.com, z@w.com",
      "<a@b.com>",
      "a..b@c.com",
      ".a@b.com",
      "a@b..com",
      42,
      null,
    ])
      assert.equal(svc.normalizeEmail(bad), null, String(bad));
    assert.equal(svc.cleanCode("123 456"), "123456");
    assert.equal(svc.cleanCode("12345"), null);
    assert.equal(svc.cleanCode("12345a"), null);
  });

  it("is complete and translated in all seven languages", () => {
    const leaves = (o: unknown, p = ""): [string, string][] =>
      o && typeof o === "object"
        ? Object.entries(o).flatMap(([k, v]) => leaves(v, `${p}.${k}`))
        : [[p, String(o)]];
    const en = leaves(EMAIL_OTP_COPY.en);
    assert.equal(LANGS.length, 7);
    for (const { id } of LANGS) {
      const c = leaves(EMAIL_OTP_COPY[id]);
      assert.deepEqual(
        c.map(([k]) => k),
        en.map(([k]) => k),
        `${id}: keys`,
      );
      for (const [k, v] of c) assert.ok(v.trim(), `${id}${k} empty`);
      if (id !== "en")
        assert.notEqual(EMAIL_OTP_COPY[id].lede, EMAIL_OTP_COPY.en.lede, `${id}: lede`);
      assert.match(EMAIL_OTP_COPY[id].resendIn, /\{s\}/, `${id}: resendIn placeholder`);
      assert.match(EMAIL_OTP_COPY[id].mail.subject, /R&L/, `${id}: subject`);
    }
  });

  it("builds the email with the code, RTL direction and a sender on rlgo.net only", () => {
    const m = mail.signInMessage("ckb", "482913");
    assert.match(m.text, /482913/);
    assert.match(m.html, /dir="rtl"/);
    assert.match(mail.signInMessage("de", "482913").html, /dir="ltr"/);
    assert.equal(mail.senderAddress(), "R&L <no-reply@rlgo.net>");
    process.env.EMAIL_FROM = "Evil <noreply@attacker.test>";
    assert.equal(mail.senderAddress(), "R&L <no-reply@rlgo.net>");
    process.env.EMAIL_FROM = "R&L <hello@rlgo.net>";
    assert.equal(mail.senderAddress(), "R&L <hello@rlgo.net>");
    delete process.env.EMAIL_FROM;
  });
});

describe("code generation, storage and verification", () => {
  it("sends a six-digit code, stores only its HMAC, and accepts it exactly once", async () => {
    const email = "new.customer@example.com";
    const { result, code } = await send(email);
    assert.deepEqual(result, { sent: true });
    assert.match(code ?? "", /^\d{6}$/);
    const rows = await (await sql())<{ code_hash: string; state: string; ttl: number }>`
      select code_hash, state, extract(epoch from expires_at - now())::int as ttl from email_codes where email = ${email}`;
    assert.equal(rows[0].state, "active");
    assert.notEqual(rows[0].code_hash, code);
    assert.ok(!rows[0].code_hash.includes(code as string));
    assert.equal(rows[0].code_hash, await svc.emailCodeHash(SECRET, email, code as string));
    assert.ok(rows[0].ttl > 290 && rows[0].ttl <= 300, `ttl ${rows[0].ttl}`);
    assert.deepEqual(await verify(email, code as string), { ok: true, email });
    // Replay: the same code never works twice.
    assert.deepEqual(await verify(email, code as string), { error: "code" });
  });

  it("generates codes from crypto randomness across the full six-digit range", async () => {
    const { randomCode } = await import("../phone/codes.ts");
    const seen = new Set<string>();
    for (let i = 0; i < 200; i += 1) {
      const c = await randomCode();
      assert.match(c, /^[1-9]\d{5}$/);
      seen.add(c);
    }
    assert.ok(seen.size > 190);
  });

  it("rejects a wrong code and locks the window after five attempts, even for the right code", async () => {
    const email = "guesser@example.com";
    const { code } = await send(email);
    const wrong = code === "111111" ? "222222" : "111111";
    for (let i = 0; i < 5; i += 1) assert.deepEqual(await verify(email, wrong), { error: "code" });
    assert.deepEqual(await verify(email, code as string), { error: "rate" });
    // No resend while locked.
    await age(email, 120);
    assert.deepEqual((await send(email)).result, { error: "rate" });
  });

  it("rejects an expired code", async () => {
    const email = "late@example.com";
    const { code } = await send(email);
    await (await sql())`update email_codes set expires_at = now() - interval '1 second' where email = ${email}`;
    assert.deepEqual(await verify(email, code as string), { error: "expired" });
  });

  it("enforces the resend cooldown; a resend replaces the code and keeps the guess count", async () => {
    const email = "resend@example.com";
    const first = await send(email);
    assert.deepEqual((await send(email)).result, { error: "rate" });
    const wrong = first.code === "111111" ? "222222" : "111111";
    assert.deepEqual(await verify(email, wrong), { error: "code" });
    await age(email, svc.RESEND_COOLDOWN_SECONDS + 1);
    const second = await send(email);
    assert.deepEqual(second.result, { sent: true });
    const rows = await (await sql())<{
      attempts: number;
    }>`select attempts from email_codes where email = ${email}`;
    assert.equal(rows[0].attempts, 1);
    if (first.code !== second.code)
      assert.deepEqual(await verify(email, first.code as string), { error: "code" });
    assert.deepEqual(await verify(email, second.code as string), { ok: true, email });
  });

  it("concurrent resends cannot both pass the cooldown", async () => {
    const email = "race-send@example.com";
    const results = await Promise.all(Array.from({ length: 6 }, () => send(email)));
    assert.equal(results.filter((r) => "sent" in r.result).length, 1);
  });

  it("concurrent verifications of the right code have exactly one winner", async () => {
    const email = "race-verify@example.com";
    const { code } = await send(email);
    const results = await Promise.all(
      Array.from({ length: 8 }, () => verify(email, code as string)),
    );
    assert.equal(results.filter((r) => "ok" in r).length, 1);
  });

  it("rate-limits sends per address per hour and per IP", async () => {
    const email = "busy@example.com";
    // Read the limit from the module: a future change to the number must not need a
    // matching edit here, and must not quietly stop this from testing the limit.
    for (let i = 0; i < svc.EMAIL_HOUR_LIMIT; i += 1) {
      assert.deepEqual((await send(email)).result, { sent: true }, `send ${i + 1}`);
      await age(email, svc.RESEND_COOLDOWN_SECONDS + 1);
    }
    assert.deepEqual((await send(email)).result, { error: "rate" });
    const ip = "203.0.113.77";
    let limited = false;
    for (let i = 0; i < 25 && !limited; i += 1)
      limited = "error" in (await send(`ip${i}@example.com`, { ip })).result;
    assert.ok(limited, "per-IP send limit applies");
  });

  it("a failed delivery never leaves a usable code", async () => {
    const email = "bounce@example.com";
    let code = "";
    const result = await send(email, {
      deliver: async (_e, c) => {
        code = c;
        return false;
      },
    });
    assert.deepEqual(result.result, { error: "unavailable" });
    assert.deepEqual(await verify(email, code), { error: "code" });
    const thrown = await send("bounce2@example.com", {
      deliver: async () => {
        throw new Error("network");
      },
    });
    assert.deepEqual(thrown.result, { error: "unavailable" });
  });
});

describe("accounts and privilege isolation", () => {
  it("registers a new customer once, and signs the same customer in again", async () => {
    const email = "repeat@example.com";
    const a = await svc.customerAccount(await sql(), email, "Rebaz Ali", createUser);
    const b = await svc.customerAccount(await sql(), email, "Other", createUser);
    assert.ok("id" in a && "id" in b);
    assert.equal(a.id, b.id);
    const roles = await (await sql())<{
      role: string;
      status: string;
    }>`select role, status from user_roles where user_id = ${a.id}`;
    assert.deepEqual(roles, [{ role: "buyer", status: "approved" }]);
    const users = await (await sql())<{
      n: number;
    }>`select count(*)::int as n from "user" where lower(email) = ${email}`;
    assert.equal(users[0].n, 1);
  });

  it("a concurrent first sign-in that loses the unique-email race reuses the winner", async () => {
    const email = "first-race@example.com";
    const winner = await createUser({ email, name: "Winner" });
    const result = await svc.customerAccount(await sql(), email, "", async () => {
      throw new Error("duplicate key");
    });
    assert.deepEqual(result, { id: winner.id });
  });

  async function privileged(
    email: string,
    kind: "password" | "admin" | "super_admin" | "disabled" | "unverified" | "invited",
  ) {
    const s = await sql();
    if (kind === "invited") {
      await s`insert into owner_bootstrap (approved_email, approved_by, ownership_proof, invitation_hash, expires_at)
        values (${email}, 'test', '{"t":1}'::jsonb, ${"a".repeat(64)}, now() + interval '1 day')`;
      return null;
    }
    const id = `p_${crypto.randomUUID()}`;
    await s`insert into "user" (id, name, email, "emailVerified", disabled_at)
      values (${id}, 'Staff', ${email}, ${kind !== "unverified"}, ${kind === "disabled" ? new Date() : null})`;
    if (kind === "password")
      await s`insert into account (id, "accountId", "providerId", "userId", password, "updatedAt")
        values (${crypto.randomUUID()}, ${id}, 'credential', ${id}, 'hash', now())`;
    if (kind === "admin" || kind === "super_admin")
      await s`insert into user_roles (user_id, role, status) values (${id}, ${kind}, 'approved')`;
    return id;
  }

  it("never mails, signs in, or reveals owner, admin, password, disabled, unverified or invited identities", async () => {
    for (const kind of [
      "password",
      "admin",
      "super_admin",
      "disabled",
      "unverified",
      "invited",
    ] as const) {
      const email = `${kind.replace("_", "")}@staff.example.com`;
      const id = await privileged(email, kind);
      let mailed = false;
      const { result } = await send(email, {
        deliver: async () => {
          mailed = true;
          return true;
        },
      });
      // Same answer as for any other address: no enumeration.
      assert.deepEqual(result, { sent: true }, kind);
      assert.equal(mailed, false, `${kind}: no mail`);
      const state = await (await sql())<{
        state: string;
      }>`select state from email_codes where email = ${email}`;
      assert.equal(state[0].state, "pending", `${kind}: code never becomes usable`);
      // Even with a valid code the account is refused.
      const account = await svc.customerAccount(await sql(), email, "", createUser);
      assert.deepEqual(account, { error: "code" }, kind);
      if (id) {
        const roles = await (await sql())<{
          role: string;
        }>`select role from user_roles where user_id = ${id} and role = 'buyer'`;
        assert.equal(roles.length, 0, `${kind}: no role added`);
      }
    }
  });
});

describe("Better Auth integration (real handler)", () => {
  it("registers via code, keeps the session across requests, and signs out", async () => {
    const email = "rebar.e2e@example.com";
    const status = await call("rl-email/status");
    assert.deepEqual(status.json, { available: true });
    const sent = await call("rl-email/send", {
      body: { email: "Rebar.E2E@example.com", lang: "ckb" },
    });
    assert.equal(sent.status, 200);
    assert.deepEqual(sent.json, { sent: true });
    const code = lastCode();
    assert.equal(code?.email, email);
    const wrong = await call("rl-email/verify", {
      body: { email, code: code?.code === "111111" ? "222222" : "111111" },
    });
    assert.equal(wrong.status, 400);
    assert.deepEqual(wrong.json, { error: "code" });
    assert.equal(wrong.cookie, undefined);
    const ok = await call("rl-email/verify", { body: { email, code: code?.code, name: "Rebar" } });
    assert.equal(ok.status, 200);
    assert.deepEqual(ok.json, { ok: true, name: "Rebar", email });
    assert.ok(ok.cookie, "HttpOnly session cookie set");
    // A fresh request (refresh / new tab) with the cookie resolves the same user.
    const again = await call("get-session", { cookie: ok.cookie });
    assert.equal((again.json?.user as { email?: string })?.email, email);
    const userId = (again.json?.user as { id: string }).id;
    const roles = await (await sql())<{
      role: string;
    }>`select role from user_roles where user_id = ${userId}`;
    assert.deepEqual(
      roles.map((r) => r.role),
      ["buyer"],
    );
    // Replay of the consumed code opens nothing.
    const replay = await call("rl-email/verify", { body: { email, code: code?.code } });
    assert.equal(replay.status, 400);
    assert.equal(replay.cookie, undefined);
    // Logout invalidates the session server-side.
    const out = await call("sign-out", { body: {}, cookie: ok.cookie });
    assert.equal(out.status, 200);
    const gone = await call("get-session", { cookie: ok.cookie });
    assert.equal(gone.json, null);
  });

  it("an existing customer signs in to the same account with a new code", async () => {
    const email = "returning@example.com";
    const first = await call("rl-email/send", { body: { email } });
    assert.equal(first.status, 200);
    const a = await call("rl-email/verify", { body: { email, code: lastCode()?.code } });
    const idA = ((await call("get-session", { cookie: a.cookie })).json?.user as { id: string }).id;
    await age(email, 61);
    await call("rl-email/send", { body: { email } });
    const b = await call("rl-email/verify", { body: { email, code: lastCode()?.code } });
    const idB = ((await call("get-session", { cookie: b.cookie })).json?.user as { id: string }).id;
    assert.equal(idA, idB);
  });

  it("the owner's password identity cannot be opened by an email code", async () => {
    const email = "owner@rlgo.net";
    const s = await sql();
    await s`insert into "user" (id, name, email, "emailVerified") values ('owner-1', 'Owner', ${email}, true)`;
    await s`insert into account (id, "accountId", "providerId", "userId", password, "updatedAt") values ('acc-owner', 'owner-1', 'credential', 'owner-1', 'x', now())`;
    await s`insert into user_roles (user_id, role, status) values ('owner-1', 'super_admin', 'approved')`;
    const sent = await call("rl-email/send", { body: { email } });
    assert.deepEqual(sent.json, { sent: true });
    // Force a known valid code into the table: identity rules still refuse the session.
    await s`update email_codes set state = 'active', code_hash = ${await svc.emailCodeHash(SECRET, email, "135790")} where email = ${email}`;
    const attempt = await call("rl-email/verify", { body: { email, code: "135790" } });
    assert.equal(attempt.status, 400);
    assert.deepEqual(attempt.json, { error: "code" });
    assert.equal(attempt.cookie, undefined);
    const sessions = await s<{
      n: number;
    }>`select count(*)::int as n from session where "userId" = 'owner-1'`;
    assert.equal(sessions[0].n, 0);
  });

  it("Better Auth rejects a cross-origin verification", async () => {
    const email = "csrf@example.com";
    await call("rl-email/send", { body: { email } });
    const forged = await call("rl-email/verify", {
      body: { email, code: lastCode()?.code },
      origin: "https://attacker.test",
    });
    assert.equal(forged.status, 403);
    assert.equal(forged.cookie, undefined);
    const noOrigin = await call("rl-email/verify", {
      body: { email, code: lastCode()?.code },
      origin: "",
    });
    assert.equal(noOrigin.status, 403);
    const sendForged = await call("rl-email/send", {
      body: { email: "victim@example.com" },
      origin: "https://attacker.test",
    });
    assert.equal(sendForged.status, 403);
    // The real code still works afterwards: the rejected requests spent no guess.
    const ok = await call("rl-email/verify", { body: { email, code: lastCode()?.code } });
    assert.equal(ok.status, 200);
  });
});

describe("route allowlist", () => {
  const request = (
    path: string,
    method = "POST",
    headers: Record<string, string> = { origin: ORIGIN },
  ) => new Request(`${ORIGIN}/api/auth/${path}`, { method, headers });
  it("opens only the R&L email-code routes, same-origin", () => {
    assert.equal(ownerAuthRequestAllowed(request("rl-email/send")), true);
    assert.equal(ownerAuthRequestAllowed(request("rl-email/verify")), true);
    assert.equal(ownerAuthRequestAllowed(request("rl-email/status", "GET", {})), true);
    const attacks: Record<string, string>[] = [
      {},
      { origin: "https://attacker.test" },
      { origin: ORIGIN, "sec-fetch-site": "cross-site" },
    ];
    for (const headers of attacks)
      for (const path of ["rl-email/send", "rl-email/verify"])
        assert.equal(
          ownerAuthRequestAllowed(request(path, "POST", headers)),
          false,
          `${path} ${JSON.stringify(headers)}`,
        );
    assert.equal(ownerAuthRequestAllowed(request("rl-email/verify", "GET", {})), false);
    // Better Auth's stock email-OTP and other account routes stay closed.
    for (const path of [
      "email-otp/send-verification-otp",
      "sign-in/email-otp",
      "email-otp/verify-email",
      "sign-up/email",
    ])
      assert.equal(ownerAuthRequestAllowed(request(path)), false, path);
  });
});
