import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { register } from "node:module";
import { after, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const root = new URL("../../../", import.meta.url);
const pg = new PGlite({ parsers: { 20: Number } });
await pg.waitReady;
for (const file of readdirSync(new URL("migrations/", root))
  .filter((name) => name.endsWith(".sql"))
  .sort()) {
  await pg.exec(readFileSync(new URL(`migrations/${file}`, root), "utf8"));
}
for (const file of readdirSync(new URL("migrations/dev/", root))
  .filter((name) => name.endsWith(".sql"))
  .sort()) {
  await pg.exec(readFileSync(new URL(`migrations/dev/${file}`, root), "utf8"));
}

async function getSql() {
  async function sql<T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return (await pg.query<T>(text, values)).rows;
  }
  return Object.assign(sql, {
    query: async <T = Record<string, unknown>>(text: string, params: unknown[] = []) =>
      (await pg.query<T>(text, params)).rows,
  });
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
          try { return await next(local + ext, context); } catch {}
        }
        return next(local, context);
      }
    `),
);

const sql = await getSql();
process.env.NODE_ENV = "test";
process.env.PHONE_CODE_SECRET = "admin-test-only-secret";
const { managePlatform } = await import("./handlers.server.ts");
const { trackingEvent, trackingAction } = await import("../tracking/presentation.ts");
const { listProducts } = await import("../market/handlers.server.ts");
const { adminQueue, requestRole } = await import("../market/handlers.server.ts");
after(() => pg.close());
await sql`insert into phone_users(id, phone, name, pin_hash, pin_salt) values ('owner', '+9647501234501', 'Owner', 'test-only', 'test-only'), ('buyer', '+9647501234502', 'Buyer', 'test-only', 'test-only'), ('staff', '+9647501234503', 'Staff', 'test-only', 'test-only')`;
await sql`insert into user_roles(user_id,role,status) values ('owner','super_admin','approved'),('owner','admin','approved'),('buyer','buyer','approved'),('staff','admin','approved')`;
const call = (
  resource: string,
  operation: string,
  data?: Record<string, unknown>,
  key?: Record<string, unknown>,
  actor = "owner",
) => managePlatform(sql, actor, { resource, operation, data, key });
const row = (result: Awaited<ReturnType<typeof call>>) => {
  assert.ok("row" in result && result.row);
  return result.row;
};

describe("Authenticated SUPER_ADMIN management through domain adapters", () => {
  it("refuses public, buyer, ordinary admin, pending super, forged resource and sensitive fields", async () => {
    for (const actor of ["anonymous", "buyer", "staff"])
      await assert.rejects(call("users", "list", undefined, undefined, actor), /forbidden/);
    await sql`insert into user_roles(user_id,role,status) values ('buyer','super_admin','pending')`;
    await assert.rejects(
      call("settings", "create", { key: "ai.assistant.enabled", value: true }, undefined, "buyer"),
      /forbidden/,
    );
    await assert.rejects(call("__proto__", "list"), /invalid/);
    await assert.rejects(
      call("users", "update", { pin_hash: "attacker" }, { id: "buyer" }),
      /invalid/,
    );
    await assert.rejects(requestRole("buyer", { role: "super_admin" }), /invalid/);
    const users = await call("users", "list");
    assert.ok("rows" in users);
    assert.ok(users.rows!.every((user) => !("pin_hash" in user) && !("pin_salt" in user)));
  });
  it("manages compliant marketplace data without a separate seller role or duplicate offers", async () => {
    const product = row(
      await call("products", "create", {
        slug: "admin-kettle",
        category_id: "home",
        name_en: "Electric kettle",
        name_ku: "کتری",
        brand: "Acme",
        status: "approved",
      }),
    );
    await assert.rejects(
      call("products", "create", {
        slug: "forbidden-item",
        category_id: "home",
        name_en: "Whisky bottle",
        name_ku: "Whisky",
        brand: "Acme",
      }),
      /prohibited/,
    );
    const offer = row(
      await call("offers", "create", {
        product_id: product.id,
        price_iqd: 50000,
        shipping_iqd: 1000,
        stock: "in",
        contact: "https://www.rlgo.net/contact",
        status: "approved",
      }),
    );
    assert.ok(
      (await listProducts({ q: "kettle", userId: null })).items.some(
        (p) => p.slug === "admin-kettle",
      ),
    );
    await sql`insert into price_alerts(id,user_id,product_id,target_iqd) values ('admin-test-alert','buyer',${product.id},45000)`;
    await call("offers", "update", { price_iqd: 40000 }, { id: offer.id });
    assert.equal(
      (await sql`select status from offers where id = ${offer.id}`)[0].status,
      "approved",
    );
    assert.equal(
      (await sql`select notified from price_alerts where id = 'admin-test-alert'`)[0].notified,
      true,
    );
    assert.equal((await sql`select id from notifications where user_id = 'buyer'`).length, 1);
    assert.equal((await sql`select id from price_history where offer_id = ${offer.id}`).length, 2);
    await call("offers", "delete", undefined, { id: offer.id });
    assert.equal(
      (await sql`select status from offers where id = ${offer.id}`)[0].status,
      "removed",
    );
    await call("products", "delete", undefined, { id: product.id });
    assert.ok(
      (await sql`select archived_at from products where id = ${product.id}`)[0].archived_at,
    );
    assert.equal((await adminQueue("owner")).superAdmin, true);
  });
  it("creates real requests but refuses shipment work before customer accepts a quote", async () => {
    const { submitRequest } = await import("../orders/handlers.server.ts");
    const legacySubmission = await submitRequest(
      "buyer",
      "buy",
      { description: "Electric kettle", declared: true },
      null,
    );
    assert.ok("id" in legacySubmission);
    assert.equal((await sql`select id from notifications where user_id = 'owner'`).length, 1);
    const order = row(
      await call("orders", "create", {
        flow: "buy",
        description: "Electric kettle",
        qty: 1,
        origin: "ber",
        dest: "ebl",
        declared: true,
      }),
    );
    await call("orders", "update", { status: "reviewing" }, { id: order.id });
    await assert.rejects(
      call("orders", "update", { status: "purchased" }, { id: order.id }),
      /forbidden/,
    );
    assert.equal((await sql`select id from declarations where ref_id = ${order.id}`).length, 1);
    const tracking = row(
      await call("tracking", "create", {
        shipment_id: order.id,
        title: "Reviewed by staff",
        title_ku: "پشکنرا",
        phase: "now",
        occurred_at: "2026-10-13T12:00:00Z",
        next_action: "contact",
      }),
    );
    await sql`insert into tracking_events(id,shipment_id,title,title_ku,phase) values ('legacy-unknown-time',${order.id},'Recorded milestone','تۆماری بار','done')`;
    const legacy = row(
      await call("tracking", "update", { next_action: "invoice" }, { id: "legacy-unknown-time" }),
    );
    assert.equal(
      legacy.occurred_at,
      null,
      "legacy instructions can be corrected without inventing an event time",
    );
    await assert.rejects(
      call("tracking", "update", { occurred_at: "2099-01-01T12:00:00Z" }, { id: tracking.id }),
      /invalid/,
    );
    await assert.rejects(
      call(
        "tracking",
        "update",
        { estimate_from: "2026-11-04T12:00:00Z", estimate_to: "2026-11-02T12:00:00Z" },
        { id: tracking.id },
      ),
      /invalid/,
    );
    await call("tracking", "delete", undefined, { id: tracking.id });
    assert.ok(
      (await sql`select archived_at from tracking_events where id = ${tracking.id}`)[0].archived_at,
    );
  });
  it("manages both delivery domains with true transitions and approved dispatch", async () => {
    for (const kind of ["delivery", "transport"]) {
      const data =
        kind === "delivery"
          ? {
              pickup: "Erbil centre",
              dropoff: "Erbil west",
              item_desc: "Electric kettle",
              declared: true,
            }
          : {
              origin: "Erbil centre",
              destination: "Duhok centre",
              load_desc: "Electric kettle",
              declared: true,
            };
      const job = row(await call(kind, "create", data));
      await assert.rejects(
        call(kind, "update", { status: "delivered", courier_id: "owner" }, { id: job.id }),
        /invalid/,
      );
      await call(kind, "update", { status: "accepted", courier_id: "owner" }, { id: job.id });
      await assert.rejects(call(kind, "update", { courier_id: null }, { id: job.id }), /invalid/);
      await call(kind, "delete", undefined, { id: job.id });
      assert.equal((await sql`select status from job_status where job_id = ${job.id}`).length, 2);
    }
  });
  it("manages AI configuration without increasing the existing cap, preserves audits and final authority", async () => {
    await call("settings", "create", { key: "ai.assistant.enabled", value: false });
    const { configureAssistant } = await import("./ai-contract.server.ts");
    const disabled = await configureAssistant(
      { env: { RL_AI_ENABLED: "true", RL_AI_DAILY_CAP: "200" } },
      sql,
    );
    assert.equal(disabled.env.RL_AI_ENABLED, "false");
    await call("settings", "create", { key: "ai.assistant.daily_cap", value: 100 });
    const reduced = await configureAssistant(
      { env: { RL_AI_ENABLED: "true", RL_AI_DAILY_CAP: "50" } },
      sql,
    );
    assert.equal(reduced.env.RL_AI_DAILY_CAP, "50");
    await call("settings", "update", { value: true }, { key: "ai.assistant.enabled" });
    await assert.rejects(
      call("settings", "create", { key: "ai.assistant.daily_cap", value: 201 }),
      /invalid/,
    );
    await assert.rejects(
      call("roles", "create", { user_id: "nonexistent", role: "super_admin", status: "approved" }),
      /forbidden/,
    );
    await assert.rejects(
      call("roles", "delete", undefined, { user_id: "owner", role: "super_admin" }),
      /last approved/,
    );
    await assert.rejects(call("users", "delete", undefined, { id: "owner" }), /forbidden/);
    const pending = row(
      await call("users", "create", { phone: "+9647501234599", name: "Pending account" }),
    );
    assert.ok(pending.disabled_at && pending.provisioned_at);
    assert.ok(!("pin_hash" in pending) && !("pin_salt" in pending));
    await assert.rejects(
      call("users", "update", { disabled_at: null }, { id: pending.id }),
      /forbidden/,
    );
    await assert.rejects(
      call("roles", "create", { user_id: pending.id, role: "super_admin", status: "approved" }),
      /forbidden/,
    );
    await call("users", "delete", undefined, { id: pending.id });
    await assert.rejects(
      call("users", "update", { disabled_at: null }, { id: pending.id }),
      /forbidden/,
    );
    const metadata = await call("users", "list");
    assert.ok("editable" in metadata && metadata.editable.includes("name"));
    assert.ok(
      !metadata.editable.includes("provisioned_at") &&
        !metadata.editable.includes("requires_verification"),
    );
    const requestMetadata = await call("orders", "list");
    assert.ok(
      "editable" in requestMetadata &&
        requestMetadata.editable.includes("status") &&
        !requestMetadata.editable.includes("name"),
    );
    await call("users", "update", { name: "Updated buyer" }, { id: "buyer" });
    await call("users", "delete", undefined, { id: "buyer" });
    const audit = await call("audit", "list");
    assert.ok("rows" in audit && audit.rows!.length > 10);
    assert.ok(
      audit.rows!.every(
        (item) => Array.isArray(item.fields) && !JSON.stringify(item).includes("test-only"),
      ),
    );
    // The editor's pager steps by 50. The audit list has to honour that offset, or an
    // owner can only ever see the newest page of their own accountability record.
    const firstPage = await managePlatform(sql, "owner", {
      resource: "audit",
      operation: "list",
      offset: 0,
    });
    const secondPage = await managePlatform(sql, "owner", {
      resource: "audit",
      operation: "list",
      offset: 50,
    });
    assert.ok("rows" in firstPage && "rows" in secondPage);
    assert.equal(firstPage.rows!.length, 50);
    assert.ok(secondPage.rows!.length > 0, "a second page of audit history is reachable");
    const firstIds = new Set(firstPage.rows!.map((item) => item.id));
    assert.ok(
      secondPage.rows!.every((item) => !firstIds.has(item.id)),
      "pages do not repeat entries",
    );
    await assert.rejects(
      managePlatform(sql, "owner", { resource: "audit", operation: "list", offset: -1 }),
    );
    await assert.rejects(
      managePlatform(sql, "owner", { resource: "audit", operation: "list", offset: 1.5 }),
    );
    // Only listing is open on the audit resource; it is not an editable table.
    for (const operation of ["read", "create", "update", "delete"]) {
      await assert.rejects(
        managePlatform(sql, "owner", { resource: "audit", operation, key: { id: "x" } }),
      );
    }
    await assert.rejects(sql`delete from platform_audit_log`, /immutable/);
    const before = (await sql`select count(*) as n from platform_audit_log`)[0].n;
    await assert.rejects(call("users", "update", { pin_hash: "injected" }, { id: "staff" }));
    assert.equal((await sql`select count(*) as n from platform_audit_log`)[0].n, before);
  });
});

it("does not turn creation time into an arrival estimate or actual event timestamp", () => {
  const event = trackingEvent({
    title: "Next hub",
    title_ku: "ناوەند",
    place: "",
    place_ku: "",
    phase: "next",
    created_at: "2026-10-13T12:00:00Z",
    occurred_at: null,
    next_action: "none",
    estimate_from: null,
    estimate_to: null,
  });
  assert.equal(event.at, null);
  assert.equal(event.estimateFrom, null);
  assert.equal(event.recordedAt, "2026-10-13T12:00:00.000Z");
  assert.equal(trackingAction("quoted", "none"), "quote");
  assert.equal(trackingAction("in_transit", "invoice"), "invoice");
});
