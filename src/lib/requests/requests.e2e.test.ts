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
    query: async (text: string, params: unknown[] = []) => (await pg.query(text, params)).rows,
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

process.env.NODE_ENV = "test";
process.env.PHONE_CODE_SECRET = "requests-test-secret";
process.env.RL_PHONE_TEST_SINK = "1";

const { phoneStart, phoneConfirm } = await import("../phone/session.server.ts");
const requests = await import("./handlers.server.ts");
const orders = await import("../orders/handlers.server.ts");
const { validateRequest, shippingEstimateEur, staffCanSet } = await import("./validate.ts");

async function user(national: string, name: string) {
  const started = await phoneStart("964", national);
  assert.equal(started.sent, true);
  const pin = (globalThis as { __rlLastCode?: string }).__rlLastCode;
  try {
    await phoneConfirm({ dial: "964", national, pin, name });
  } catch (error) {
    assert.match(String(error), /StartEvent/);
  }
  const sql = await getSql();
  const rows = await sql<{
    id: string;
  }>`select id from phone_users where phone = ${"+964" + national}`;
  assert.ok(rows[0]?.id);
  return rows[0].id;
}

const code = (err: unknown) => (err as { code?: string }).code;

after(async () => {
  await pg.close();
});

const buy = {
  flow: "buy",
  link: "https://www.example-shop.de/p/123",
  description: "Running shoes, size 42",
  qty: 1,
  origin: "ber",
  dest: "ebl",
  weightKg: "1.5",
  l: "30",
  w: "20",
  h: "12",
  attachments: ["https://www.example-shop.de/p/123/photo.jpg"],
  declared: true,
};

describe("request validation", () => {
  it("accepts both flows and rejects bad input", () => {
    assert.equal(validateRequest(buy).ok, true);
    assert.equal(validateRequest({ ...buy, flow: "forward", link: "" }).ok, true);
    assert.deepEqual(validateRequest({ ...buy, declared: false }), { ok: false, error: "declare" });
    assert.deepEqual(validateRequest({ ...buy, link: "http://x.example" }), {
      ok: false,
      error: "link",
    });
    assert.deepEqual(validateRequest({ ...buy, link: "", description: "" }), {
      ok: false,
      error: "item",
    });
    assert.deepEqual(validateRequest({ ...buy, flow: "forward", description: "" }), {
      ok: false,
      error: "item",
    });
    assert.deepEqual(validateRequest({ ...buy, qty: 0 }), { ok: false, error: "qty" });
    assert.deepEqual(validateRequest({ ...buy, origin: "xx" }), { ok: false, error: "origin" });
    assert.deepEqual(validateRequest({ ...buy, origin: "other", originNote: "" }), {
      ok: false,
      error: "origin",
    });
    assert.equal(validateRequest({ ...buy, origin: "other", originNote: "Istanbul" }).ok, true);
    assert.deepEqual(validateRequest({ ...buy, dest: "mars" }), { ok: false, error: "dest" });
    assert.deepEqual(validateRequest({ ...buy, l: "30", w: "", h: "" }), {
      ok: false,
      error: "dims",
    });
    assert.deepEqual(validateRequest({ ...buy, attachments: ["javascript:alert(1)"] }), {
      ok: false,
      error: "attachments",
    });
  });

  it("estimates shipping with the unchanged economy formula (4.60/kg, min 22, /5000)", () => {
    const checked = validateRequest({ ...buy, weightKg: "10", l: "", w: "", h: "" });
    assert.ok(checked.ok);
    // 10 kg × 4.60 × Berlin factor 1 = 46.00, Erbil surcharge 0.
    assert.equal(shippingEstimateEur(checked.data), 46);
    const light = validateRequest({ ...buy, weightKg: "1", l: "", w: "", h: "" });
    assert.ok(light.ok);
    assert.equal(shippingEstimateEur(light.data), 22);
    const unknown = validateRequest({ ...buy, origin: "other", originNote: "Istanbul" });
    assert.ok(unknown.ok);
    assert.equal(shippingEstimateEur(unknown.data), null);
  });

  it("only lets work start after acceptance", () => {
    assert.equal(staffCanSet("quoted", "in_transit", "buy", false), false);
    assert.equal(staffCanSet("accepted", "purchased", "buy", true), true);
    assert.equal(staffCanSet("accepted", "purchased", "forward", true), false);
    assert.equal(staffCanSet("in_transit", "purchased", "buy", true), false);
    assert.equal(staffCanSet("delivered", "cancelled", "buy", true), false);
    assert.equal(staffCanSet("received", "cancelled", "buy", false), true);
  });
});

describe("customer requests on PGLite", () => {
  it("runs buy-for-me end to end with ownership, idempotency, quote acceptance and tracking", async () => {
    const aza = await user("7501110001", "Aza");
    const other = await user("7501110002", "Other");
    const staff = await user("7501110003", "Staff");
    const sql = await getSql();
    await sql`insert into user_roles (user_id, role, status, display_name) values (${staff}, 'admin', 'approved', 'Staff')`;

    const key = "test-key-0000000000000001";
    const first = await requests.createRequest(aza, { ...buy, key });
    assert.ok("id" in first && first.id, JSON.stringify(first));
    const again = await requests.createRequest(aza, { ...buy, key });
    assert.ok("id" in again);
    assert.equal(again.id, first.id, "same key returns the same request");
    assert.equal((await sql`select 1 from shipment_requests where user_id = ${aza}`).length, 1);
    const ref = first.id as string;
    assert.match(ref, /^RG-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    assert.equal(
      (await requests.createRequest(aza, { ...buy })).error,
      "invalid",
      "a key is required",
    );

    // Prohibited items are refused and audited.
    const banned = await requests.createRequest(aza, {
      ...buy,
      link: "",
      description: "bottle of whisky",
      key: "test-key-0000000000000002",
    });
    assert.equal("error" in banned && banned.error, "prohibited");

    // Dashboard: own requests only.
    const mine = await requests.myRequests(aza);
    assert.equal(mine.length, 1);
    assert.equal(mine[0].ref, ref);
    assert.equal(mine[0].status, "received");
    assert.equal(mine[0].quote, null);
    assert.equal(typeof mine[0].estimateEur, "number");
    assert.deepEqual(await requests.myRequests(other), []);
    await assert.rejects(requests.requestDetail(other, ref), (err) => code(err) === "notfound");

    // Customers cannot act as staff.
    await assert.rejects(requests.staffRequests(aza), (err) => code(err) === "forbidden");
    await assert.rejects(
      requests.staffQuote(aza, { ref, amountIqd: 100000, customsIncluded: false }),
      (err) => code(err) === "forbidden",
    );
    await assert.rejects(
      requests.staffSetStatus(aza, { ref, status: "in_transit" }),
      (err) => code(err) === "forbidden",
    );

    // Staff cannot start work before a quote is accepted.
    await assert.rejects(
      requests.staffSetStatus(staff, { ref, status: "purchased" }),
      (err) => code(err) === "forbidden",
    );
    await assert.rejects(
      orders.adminOrderStatus(
        staff,
        (await sql<{ id: string }>`select id from shipment_requests where tracking_id = ${ref}`)[0]
          .id,
        "in_transit",
      ),
      (err) => code(err) === "forbidden",
    );

    assert.ok((await requests.staffRequests(staff)).some((row) => row.ref === ref));
    await requests.staffSetStatus(staff, { ref, status: "reviewing" });
    const q1 = await requests.staffQuote(staff, {
      ref,
      amountIqd: 95000,
      customsIncluded: false,
      validDays: 7,
      note: "item + shipping",
    });
    const q2 = await requests.staffQuote(staff, {
      ref,
      amountIqd: 90000,
      customsIncluded: true,
      validDays: 7,
    });
    let detail = await requests.requestDetail(aza, ref);
    assert.equal(detail.status, "quoted");
    assert.equal(detail.contact, null, "customers do not get the staff contact view");
    assert.equal(detail.quotes.find((q) => q.id === q1.id)?.status, "superseded");
    const open = detail.quotes.find((q) => q.id === q2.id);
    assert.equal(open?.status, "sent");
    assert.equal(open?.customsIncluded, true);
    assert.equal(open?.amountIqd, 90000);

    // Another customer cannot accept; superseded quotes cannot be accepted.
    await assert.rejects(
      requests.acceptQuote(other, ref, q2.id),
      (err) => code(err) === "notfound",
    );
    await assert.rejects(requests.acceptQuote(aza, ref, q1.id), (err) => code(err) === "invalid");
    assert.deepEqual(await requests.acceptQuote(aza, ref, q2.id), { ok: true });
    await assert.rejects(requests.acceptQuote(aza, ref, q2.id), (err) => code(err) === "invalid");

    for (const status of ["purchased", "in_transit"])
      await requests.staffSetStatus(staff, { ref, status });
    const statusOnly = await orders.lookupTracking(ref);
    assert.ok("events" in statusOnly);
    const physical = statusOnly.events?.find((event) => event.title === "In transit");
    assert.equal(
      physical?.at,
      null,
      "changing a status does not establish the physical event time",
    );
    assert.ok(physical?.recordedAt);
    await requests.staffAddEvent(staff, {
      ref,
      title: "Arrived at Erbil hub",
      place: "Erbil",
      occurredAt: "2026-10-10T12:00:00Z",
      nextAction: "contact",
    });
    await assert.rejects(
      requests.staffSetStatus(staff, { ref, status: "purchased" }),
      (err) => code(err) === "invalid",
    );
    await requests.staffSetStatus(staff, { ref, status: "delivered" });

    detail = await requests.requestDetail(aza, ref);
    assert.equal(detail.status, "delivered");
    assert.deepEqual(
      detail.history.map((h) => h.status),
      [
        "received",
        "reviewing",
        "quoted",
        "quoted",
        "accepted",
        "purchased",
        "in_transit",
        "delivered",
      ],
    );
    assert.equal(detail.history.find((h) => h.status === "accepted")?.actor, "customer");
    assert.equal(detail.events.at(-1)?.title, "Delivered");
    assert.equal(detail.events.filter((e) => e.phase === "now").length, 1);
    assert.ok(detail.events.some((e) => e.title === "Arrived at Erbil hub"));
    assert.equal(detail.item.attachments.length, 1);

    // Public tracking shows only recorded milestones, no personal data or price.
    const tracked = await orders.lookupTracking(ref);
    assert.ok("events" in tracked);
    assert.equal(tracked.events?.length, detail.events.length);
    assert.equal(JSON.stringify(tracked).includes("90000"), false);
    assert.equal(JSON.stringify(tracked).includes("+964"), false);

    // Staff see contact details.
    assert.equal((await requests.requestDetail(staff, ref)).contact?.name, "Aza");
  });

  it("runs ship-it-for-me with decline and re-quote", async () => {
    const sql = await getSql();
    const aza = (
      await sql<{ id: string }>`select id from phone_users where phone = '+9647501110001'`
    )[0].id;
    const staff = (
      await sql<{ id: string }>`select id from phone_users where phone = '+9647501110003'`
    )[0].id;
    const made = await requests.createRequest(aza, {
      flow: "forward",
      description: "Laptop bag, ordered from my own account",
      qty: 2,
      origin: "ams",
      dest: "sul",
      declared: true,
      key: "test-key-0000000000000003",
    });
    assert.ok("id" in made);
    const ref = made.id as string;
    const q = await requests.staffQuote(staff, { ref, amountIqd: 40000, customsIncluded: false });
    assert.deepEqual(await requests.declineQuote(aza, ref, q.id), { ok: true });
    let detail = await requests.requestDetail(aza, ref);
    assert.equal(detail.status, "reviewing");
    await assert.rejects(
      requests.staffSetStatus(staff, { ref, status: "purchased" }),
      (err) => code(err) === "forbidden",
    );
    const q2 = await requests.staffQuote(staff, { ref, amountIqd: 38000, customsIncluded: false });
    await requests.acceptQuote(aza, ref, q2.id);
    await assert.rejects(
      requests.staffSetStatus(staff, { ref, status: "purchased" }),
      (err) => code(err) === "invalid",
      "nothing to buy in ship-it-for-me",
    );
    await requests.staffSetStatus(staff, { ref, status: "in_transit" });
    detail = await requests.requestDetail(aza, ref);
    assert.equal(detail.kind, "forward");
    assert.equal(detail.estimateEur, null, "no estimate without a weight");
    const declared = await sql<{
      kind: string;
    }>`select d.kind from declarations d join shipment_requests r on r.id = d.ref_id where r.tracking_id = ${ref}`;
    assert.equal(declared[0]?.kind, "forward");
    const list = await requests.myRequests(aza);
    assert.equal(list.length, 2);
    assert.equal(list.find((row) => row.ref === ref)?.quote?.status, "accepted");
  });

  it("expired quotes cannot be accepted", async () => {
    const sql = await getSql();
    const aza = (
      await sql<{ id: string }>`select id from phone_users where phone = '+9647501110001'`
    )[0].id;
    const staff = (
      await sql<{ id: string }>`select id from phone_users where phone = '+9647501110003'`
    )[0].id;
    const made = await requests.createRequest(aza, { ...buy, key: "test-key-0000000000000004" });
    assert.ok("id" in made);
    const q = await requests.staffQuote(staff, {
      ref: made.id,
      amountIqd: 50000,
      customsIncluded: false,
    });
    await sql`update request_quotes set valid_until = now() - interval '1 minute' where id = ${q.id}`;
    await assert.rejects(
      requests.acceptQuote(aza, made.id, q.id),
      (err) => code(err) === "invalid",
    );
    assert.equal((await requests.requestDetail(aza, made.id as string)).quotes[0].expired, true);
  });

  it("records the contents declaration for store orders too", async () => {
    const sql = await getSql();
    const aza = (
      await sql<{ id: string }>`select id from phone_users where phone = '+9647501110001'`
    )[0].id;
    const made = await orders.submitRequest(
      aza,
      "store",
      { intent: "buy", url: "https://www.zalando.de/x", qty: 1, dest: "ebl", declared: true },
      null,
    );
    assert.ok("id" in made);
    const rows = await sql<{
      kind: string;
    }>`select d.kind from declarations d join shipment_requests r on r.id = d.ref_id where r.tracking_id = ${made.id}`;
    assert.equal(rows[0]?.kind, "store");
  });
});
