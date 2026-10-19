import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { betterAuth } from "better-auth";
import { pgliteDialect } from "../auth/pglite-dialect.ts";
import { activateOwner, invitationHash, ownerInvitation } from "./service.server.ts";
import { verifiedEmailAccount } from "../auth/verified-email.server.ts";
import type { Sql } from "../db.ts";
const root = new URL("../../../", import.meta.url);
async function fixture() {
  const pg = new PGlite();
  await pg.waitReady;
  for (const file of readdirSync(new URL("migrations/", root))
    .filter((x) => x.endsWith(".sql"))
    .sort())
    await pg.exec(readFileSync(new URL(`migrations/${file}`, root), "utf8"));
  const sql = Object.assign(
    async (strings: TemplateStringsArray, ...values: unknown[]) => {
      let text = strings[0];
      for (let i = 0; i < values.length; i++) text += `$${i + 1}${strings[i + 1]}`;
      return (await pg.query(text, values)).rows;
    },
    { query: async (text: string, values: unknown[] = []) => (await pg.query(text, values)).rows },
  ) as Sql;
  const auth = betterAuth({
    database: { dialect: pgliteDialect(() => pg), type: "postgres" },
    baseURL: "https://owner.test",
    secret: randomBytes(32).toString("hex"),
    emailAndPassword: { enabled: true, minPasswordLength: 16 },
    session: { cookieCache: { enabled: false } },
  });
  const token = randomBytes(32).toString("hex"),
    password = randomBytes(24).toString("hex"),
    email = "owner@example.test";
  const hash = await invitationHash(token);
  async function approve() {
    await sql`insert into owner_bootstrap(approved_email, approved_by, ownership_proof, invitation_hash, expires_at) values(${email}, 'github:test-owner', '{"repository_id":1,"owner_id":1,"admin":true}'::jsonb, ${hash}, now() + interval '1 hour')`;
  }
  async function authenticate(input: {
    email: string;
    name: string;
    password: string;
    existing: boolean;
  }) {
    const headers = new Headers({ origin: "https://owner.test" });
    const result = input.existing
      ? await auth.api.signInEmail({
          headers,
          body: { email: input.email, password: input.password },
        })
      : await auth.api.signUpEmail({
          headers,
          body: { email: input.email, name: input.name, password: input.password },
        });
    return result.user.id;
  }
  return {
    pg,
    sql,
    auth,
    approve,
    token,
    password,
    email,
    hash,
    authenticate,
    input: { token, password, name: "Test Owner" },
  };
}

test("email/password alone cannot bootstrap; independent approval is required", async () => {
  const f = await fixture();
  try {
    await f.auth.api.signUpEmail({ body: { email: f.email, password: f.password, name: "Test" } });
    await f.sql`update "user" set "emailVerified" = true`;
    await assert.rejects(activateOwner(f.sql, f.input, f.authenticate));
    assert.equal((await f.sql`select * from user_roles`).length, 0);
  } finally {
    await f.pg.close();
  }
});
test("actual Better Auth credentials activate verified owner atomically and replay fails", async () => {
  const f = await fixture();
  try {
    await f.approve();
    assert.deepEqual(await activateOwner(f.sql, f.input, f.authenticate), { activated: true });
    assert.equal((await f.sql`select * from "user" where "emailVerified" = true`).length, 1);
    assert.equal(
      (await f.sql`select * from user_roles where role = 'super_admin' and status = 'approved'`)
        .length,
      1,
    );
    assert.equal(
      (await f.sql`select * from owner_bootstrap where consumed_at is not null`).length,
      1,
    );
    assert.equal(
      (await f.sql`select * from platform_audit_log where id = 'owner-bootstrap-activation'`)
        .length,
      1,
    );
    await assert.rejects(activateOwner(f.sql, f.input, f.authenticate));
    await assert.rejects(f.sql`delete from user_roles where role = 'super_admin'`);
    await assert.rejects(f.sql`delete from platform_audit_log`);
    await assert.rejects(f.sql`update owner_bootstrap set consumed_at = null, user_id = null`);
    const login = await f.auth.api.signInEmail({
      body: { email: f.email, password: f.password },
      returnHeaders: true,
    });
    const session = await f.auth.api.getSession({
      headers: new Headers({
        cookie: login.headers
          .getSetCookie()
          .map((x) => x.split(";")[0])
          .join(";"),
      }),
    });
    assert.equal(session?.user.emailVerified, true);
  } finally {
    await f.pg.close();
  }
});
test("existing account and password are preserved; wrong password cannot consume invitation", async () => {
  const f = await fixture();
  try {
    const existing = await f.auth.api.signUpEmail({
      body: { email: f.email, name: "Existing", password: f.password },
    });
    assert.equal(await verifiedEmailAccount(f.sql, existing.user.id), null);
    const before = await f.sql`select password from "account"`;
    await f.approve();
    assert.equal((await ownerInvitation(f.sql, f.token)).existing, true);
    await assert.rejects(
      activateOwner(
        f.sql,
        { ...f.input, password: randomBytes(24).toString("hex") },
        f.authenticate,
      ),
    );
    assert.equal((await f.sql`select * from owner_bootstrap where consumed_at is null`).length, 1);
    await activateOwner(f.sql, f.input, f.authenticate);
    assert.deepEqual(await verifiedEmailAccount(f.sql, existing.user.id), { email: f.email });
    const users = await f.sql<{ id: string; name: string }>`select id, name from "user"`;
    assert.deepEqual(users, [{ id: existing.user.id, name: "Existing" }]);
    assert.deepEqual(await f.sql`select password from "account"`, before);
  } finally {
    await f.pg.close();
  }
});
test("expired and wrong nonce fail before creating an account", async () => {
  const f = await fixture();
  try {
    await f.approve();
    await assert.rejects(
      activateOwner(f.sql, { ...f.input, token: randomBytes(32).toString("hex") }, f.authenticate),
    );
    await f.sql`update owner_bootstrap set expires_at = now() - interval '1 second'`;
    await assert.rejects(activateOwner(f.sql, f.input, f.authenticate));
    assert.equal((await f.sql`select * from "user"`).length, 0);
  } finally {
    await f.pg.close();
  }
});
test("wrong authenticated identity and disabled account cannot be granted owner", async () => {
  const f = await fixture();
  try {
    await f.approve();
    const other = await f.auth.api.signUpEmail({
      body: { email: "other@example.test", name: "Other", password: f.password },
    });
    assert.equal(
      (
        await f.sql<{
          activated: boolean;
        }>`select rl_activate_first_owner(${f.hash}, ${other.user.id}) as activated`
      )[0].activated,
      false,
    );
    const owner = await f.auth.api.signUpEmail({
      body: { email: f.email, name: "Owner", password: f.password },
    });
    await f.sql`update "user" set disabled_at = now() where id = ${owner.user.id}`;
    assert.equal(await verifiedEmailAccount(f.sql, owner.user.id), null);
    assert.equal(
      (
        await f.sql<{
          activated: boolean;
        }>`select rl_activate_first_owner(${f.hash}, ${owner.user.id}) as activated`
      )[0].activated,
      false,
    );
    assert.equal((await f.sql`select * from user_roles`).length, 0);
  } finally {
    await f.pg.close();
  }
});
test("concurrent nonce consumers produce one grant and one immutable audit", async () => {
  const f = await fixture();
  try {
    await f.approve();
    const owner = await f.auth.api.signUpEmail({
      body: { email: f.email, name: "Owner", password: f.password },
    });
    const results = await Promise.all(
      [1, 2].map(
        () =>
          f.sql<{
            activated: boolean;
          }>`select rl_activate_first_owner(${f.hash}, ${owner.user.id}) as activated`,
      ),
    );
    assert.equal(results.filter((x) => x[0].activated).length, 1);
    assert.equal((await f.sql`select * from user_roles`).length, 1);
    assert.equal((await f.sql`select * from platform_audit_log`).length, 1);
  } finally {
    await f.pg.close();
  }
});
test("audit failure rolls back email verification, authority and consumption", async () => {
  const f = await fixture();
  try {
    await f.approve();
    const owner = await f.auth.api.signUpEmail({
      body: { email: f.email, name: "Owner", password: f.password },
    });
    await f.sql`insert into platform_audit_log(id, actor_id, module, resource, resource_id, action) values('owner-bootstrap-activation', 'test', 'identity', 'test', 'test', 'create')`;
    await assert.rejects(f.sql`select rl_activate_first_owner(${f.hash}, ${owner.user.id})`);
    assert.equal(
      (await f.sql<{ verified: boolean }>`select "emailVerified" as verified from "user"`)[0]
        .verified,
      false,
    );
    assert.equal((await f.sql`select * from user_roles`).length, 0);
    assert.equal((await f.sql`select * from owner_bootstrap where consumed_at is null`).length, 1);
  } finally {
    await f.pg.close();
  }
});
