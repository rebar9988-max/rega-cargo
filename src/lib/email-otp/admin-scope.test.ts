/**
 * The administrative sign-in entrance: who may receive a code, and that it is kept apart
 * from the customer entrance. Everything here runs against a real Postgres with the
 * migrations applied; all addresses and names are fixtures.
 */
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { after, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import type { Sql } from "../db.ts";
import {
  adminAccount,
  adminIdentityFor,
  identityFor,
  requestEmailCode,
  verifyEmailCode,
} from "./service.server.ts";

const root = new URL("../../../", import.meta.url);
const pg = new PGlite();
await pg.waitReady;
for (const file of readdirSync(new URL("migrations/", root))
  .filter((name) => name.endsWith(".sql"))
  .sort()) {
  await pg.exec(readFileSync(new URL(`migrations/${file}`, root), "utf8"));
}
after(() => pg.close());

const sql = Object.assign(
  async (strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0]!;
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return (await pg.query(text, values)).rows;
  },
  {
    query: async (text: string, params: unknown[] = []) => (await pg.query(text, params)).rows,
  },
) as never as Sql;

const SECRET = randomBytes(32).toString("hex");
const IP = "203.0.113.9";

async function user(
  id: string,
  email: string,
  options: { role?: string; status?: string; verified?: boolean; disabled?: boolean } = {},
) {
  const { role, status = "approved", verified = true, disabled = false } = options;
  await sql`insert into "user"(id, name, email, "emailVerified", disabled_at, "createdAt", "updatedAt")
    values(${id}, ${id}, ${email}, ${verified}, ${disabled ? new Date().toISOString() : null}, now(), now())`;
  if (role)
    await sql`insert into user_roles(user_id, role, status, display_name) values(${id}, ${role}, ${status}, ${id})`;
}

/** Collects what the server would have mailed, so a test can tell "sent" from "delivered". */
function mailbox() {
  const sent: { email: string; code: string }[] = [];
  return {
    sent,
    deliver: async (email: string, code: string) => {
      sent.push({ email, code });
      return true;
    },
  };
}
const send = (email: string, scope: "customer" | "admin", box: ReturnType<typeof mailbox>) =>
  requestEmailCode(sql, { email, ip: IP, secret: SECRET, scope, deliver: box.deliver });

await user("owner", "owner@example.test", { role: "super_admin" });
await user("staff", "staff@example.test", { role: "admin" });
await user("shopper", "shopper@example.test", { role: "buyer" });
await user("pending", "pending@example.test", { role: "admin", status: "pending" });
await user("shut", "shut@example.test", { role: "admin", disabled: true });
await user("unconfirmed", "unconfirmed@example.test", { role: "admin", verified: false });

describe("who the administrative entrance serves", () => {
  it("serves an approved, verified, enabled administrator", async () => {
    assert.deepEqual(await adminIdentityFor(sql, "owner@example.test"), {
      kind: "customer",
      id: "owner",
    });
    assert.deepEqual(await adminIdentityFor(sql, "staff@example.test"), {
      kind: "customer",
      id: "staff",
    });
    assert.deepEqual(await adminAccount(sql, "owner@example.test"), { id: "owner" });
  });

  it("serves nobody else, and says the same about each", async () => {
    for (const email of [
      "shopper@example.test", // a plain customer
      "pending@example.test", // a role that was never approved
      "shut@example.test", // a disabled account
      "unconfirmed@example.test", // an unverified address
      "nobody@example.test", // no account at all
    ]) {
      assert.deepEqual(await adminIdentityFor(sql, email), { kind: "blocked" }, email);
      assert.deepEqual(await adminAccount(sql, email), { error: "code" }, email);
    }
  });

  it("refuses an address with an owner invitation still open", async () => {
    await sql`insert into owner_bootstrap(approved_email, approved_by, ownership_proof, invitation_hash, expires_at)
      values('staff@example.test', 'test', '{"t":1}'::jsonb, ${"b".repeat(64)}, now() + interval '1 hour')`;
    assert.deepEqual(await adminIdentityFor(sql, "staff@example.test"), { kind: "blocked" });
    await sql`delete from owner_bootstrap`;
    assert.deepEqual(await adminIdentityFor(sql, "staff@example.test"), {
      kind: "customer",
      id: "staff",
    });
  });

  it("still keeps administrators out of the customer entrance", async () => {
    assert.deepEqual(await identityFor(sql, "owner@example.test"), { kind: "blocked" });
    assert.deepEqual(await identityFor(sql, "shopper@example.test"), {
      kind: "customer",
      id: "shopper",
    });
  });
});

describe("administrative codes are kept apart from customer codes", () => {
  it("mails an administrator and stores the code in the administrative table only", async () => {
    const box = mailbox();
    assert.deepEqual(await send("owner@example.test", "admin", box), { sent: true });
    assert.equal(box.sent.length, 1);
    assert.equal(box.sent[0]!.email, "owner@example.test");
    assert.equal(
      (await sql`select 1 from admin_codes where email = 'owner@example.test'`).length,
      1,
    );
    assert.equal(
      (await sql`select 1 from email_codes where email = 'owner@example.test'`).length,
      0,
    );
    assert.deepEqual(
      await verifyEmailCode(sql, {
        email: "owner@example.test",
        code: box.sent[0]!.code,
        ip: IP,
        secret: SECRET,
        scope: "admin",
      }),
      { ok: true, email: "owner@example.test" },
    );
    // Single use: the row is gone with the session.
    assert.equal(
      (await sql`select 1 from admin_codes where email = 'owner@example.test'`).length,
      0,
    );
  });

  it("answers an address it does not serve exactly as it answers one it does, and mails nothing", async () => {
    const box = mailbox();
    assert.deepEqual(await send("shopper@example.test", "admin", box), { sent: true });
    assert.deepEqual(await send("nobody@example.test", "admin", box), { sent: true });
    assert.equal(box.sent.length, 0, "no code leaves the server");
    // And no code is usable, whatever a caller guesses.
    for (const email of ["shopper@example.test", "nobody@example.test"]) {
      assert.deepEqual(
        await verifyEmailCode(sql, {
          email,
          code: "123456",
          ip: IP,
          secret: SECRET,
          scope: "admin",
        }),
        { error: "code" },
      );
    }
  });

  it("public traffic for an administrator's address cannot spend the administrative budget", async () => {
    const box = mailbox();
    // Anyone may ask the public entrance for a code to any address; it answers the same
    // either way and occupies the customer row and its cooldown.
    assert.deepEqual(await send("staff@example.test", "customer", box), { sent: true });
    assert.deepEqual(await send("staff@example.test", "customer", box), { error: "rate" });
    assert.equal(box.sent.length, 0, "the customer entrance mails no administrator");
    // The administrative entrance is unaffected by any of it.
    assert.deepEqual(await send("staff@example.test", "admin", box), { sent: true });
    assert.equal(box.sent.length, 1);
    const code = box.sent[0]!.code;
    // A code from one entrance is not a code for the other.
    assert.deepEqual(
      await verifyEmailCode(sql, {
        email: "staff@example.test",
        code,
        ip: IP,
        secret: SECRET,
        scope: "customer",
      }),
      { error: "code" },
    );
    assert.deepEqual(
      await verifyEmailCode(sql, {
        email: "staff@example.test",
        code,
        ip: IP,
        secret: SECRET,
        scope: "admin",
      }),
      { ok: true, email: "staff@example.test" },
    );
  });

  it("counts guesses per entrance and locks the code after five", async () => {
    const box = mailbox();
    assert.deepEqual(await send("owner@example.test", "admin", box), { sent: true });
    const real = box.sent.at(-1)!.code;
    const wrong = real === "111111" ? "222222" : "111111";
    for (let i = 0; i < 5; i += 1) {
      assert.deepEqual(
        await verifyEmailCode(sql, {
          email: "owner@example.test",
          code: wrong,
          ip: IP,
          secret: SECRET,
          scope: "admin",
        }),
        { error: "code" },
        `guess ${i + 1}`,
      );
    }
    assert.deepEqual(
      await verifyEmailCode(sql, {
        email: "owner@example.test",
        code: real,
        ip: IP,
        secret: SECRET,
        scope: "admin",
      }),
      { error: "rate" },
      "the real code is refused once the guesses are spent",
    );
  });
});
