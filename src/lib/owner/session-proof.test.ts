/**
 * First-owner activation for an existing account that signs in with an emailed code (no password):
 * the proof is a fresh, verified session for exactly the invited email. Pure checks first, then the
 * real database function through activateOwner. All emails and ids are test fixtures.
 */
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { after, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import type { Sql } from "../db.ts";
import {
  SESSION_PROOF_MAX_AGE_MS,
  activateOwner,
  invitationHash,
  ownerInvitation,
  sessionProof,
} from "./service.server.ts";

const NOW = Date.parse("2026-10-22T08:00:00Z");
const live = (over: Record<string, unknown> = {}, ageMs = 60_000) => ({
  user: { id: "u1", email: "Owner@Example.test", emailVerified: true, ...over },
  session: { createdAt: new Date(NOW - ageMs) },
});

describe("sessionProof (pure)", () => {
  it("accepts a fresh verified session for the invited email, ignoring case", () => {
    assert.equal(sessionProof(live(), "owner@example.test", NOW), "u1");
  });
  it("refuses anything else", () => {
    const refuse = (current: Parameters<typeof sessionProof>[0], email = "owner@example.test") =>
      assert.throws(() => sessionProof(current, email, NOW));
    refuse(null);
    refuse({});
    refuse(live(), "someone@example.test");
    refuse(live({ emailVerified: false }));
    refuse(live({ emailVerified: undefined }));
    refuse(live({ id: "" }));
    refuse(live({ email: undefined }));
    refuse(live({}, SESSION_PROOF_MAX_AGE_MS + 1)); // signed in too long ago
    refuse(live({}, -5 * 60_000)); // created in the future
    refuse({ user: live().user, session: {} });
    refuse({ user: live().user, session: { createdAt: "not a date" } });
  });
  it("accepts exactly at the freshness limit", () => {
    assert.equal(sessionProof(live({}, SESSION_PROOF_MAX_AGE_MS), "owner@example.test", NOW), "u1");
  });
});

const root = new URL("../../../", import.meta.url);
const pg = new PGlite();
await pg.waitReady;
for (const file of readdirSync(new URL("migrations/", root))
  .filter((name) => name.endsWith(".sql"))
  .sort()) {
  await pg.exec(readFileSync(new URL(`migrations/${file}`, root), "utf8"));
}
const sql = Object.assign(
  async (strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0]!;
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return (await pg.query(text, values)).rows;
  },
  { query: async (text: string, params: unknown[] = []) => (await pg.query(text, params)).rows },
) as never as Sql;
after(() => pg.close());

const EMAIL = "owner@example.test";
async function approve(token: string) {
  await sql`insert into owner_bootstrap(approved_email, approved_by, ownership_proof, invitation_hash, expires_at)
    values(${EMAIL}, 'test-operator', '{"fixture":true}'::jsonb, ${createHash("sha256").update(token).digest("hex")}, now() + interval '1 hour')`;
}

describe("activation of an existing account without a password", () => {
  const token = randomBytes(32).toString("hex");
  it("reports hasPassword correctly", async () => {
    await sql`insert into "user"(id, name, email, "emailVerified", "createdAt", "updatedAt")
      values('u1', 'Owner', ${EMAIL}, true, now(), now())`;
    await approve(token);
    assert.equal(await invitationHash(token), createHash("sha256").update(token).digest("hex"));
    const code = await ownerInvitation(sql, token);
    assert.equal(code.existing, true);
    assert.equal(code.hasPassword, false);
    await sql`insert into "account"(id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
      values('a1', 'u1', 'credential', 'u1', null, now(), now())`;
    assert.equal((await ownerInvitation(sql, token)).hasPassword, false); // no password stored
    await sql`update "account" set password = 'hash-fixture' where id = 'a1'`;
    assert.equal((await ownerInvitation(sql, token)).hasPassword, true);
    await sql`delete from "account" where id = 'a1'`;
  });

  const authenticate =
    (current: Parameters<typeof sessionProof>[0]) =>
    async (input: { email: string; hasPassword: boolean; existing: boolean }) => {
      assert.equal(input.existing, true);
      assert.equal(input.hasPassword, false);
      return sessionProof(current, input.email, Date.now());
    };
  const fresh = () => ({
    user: { id: "u1", email: EMAIL, emailVerified: true },
    session: { createdAt: new Date() },
  });

  it("refuses a stale session, another account, and no session; nothing changes", async () => {
    const stale = { ...fresh(), session: { createdAt: new Date(Date.now() - 3_600_000) } };
    const other = {
      ...fresh(),
      user: { id: "u2", email: "other@example.test", emailVerified: true },
    };
    for (const current of [stale, other, null]) {
      await assert.rejects(activateOwner(sql, { token, name: "x" }, authenticate(current)));
    }
    assert.equal((await sql`select 1 from user_roles where role = 'super_admin'`).length, 0);
    assert.equal(
      (await sql`select 1 from owner_bootstrap where consumed_at is not null`).length,
      0,
    );
  });

  it("activates with a fresh verified session, then the invitation is closed for good", async () => {
    assert.deepEqual(await activateOwner(sql, { token, name: "x" }, authenticate(fresh())), {
      activated: true,
    });
    assert.equal(
      (
        await sql`select 1 from user_roles where user_id = 'u1' and role = 'super_admin' and status = 'approved'`
      ).length,
      1,
    );
    assert.equal(
      (await sql`select 1 from platform_audit_log where id = 'owner-bootstrap-activation'`).length,
      1,
    );
    await assert.rejects(activateOwner(sql, { token, name: "x" }, authenticate(fresh())));
    await assert.rejects(sql`update owner_bootstrap set consumed_at = null, user_id = null`);
  });
});
