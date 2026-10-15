import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { register } from "node:module";
import { after, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const root = new URL("../../", import.meta.url);
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
          try { return await next(local + ext, context); } catch {}
        }
        return next(local, context);
      }
    `),
);

process.env.NODE_ENV = "test";
process.env.PHONE_CODE_SECRET = "flow-test-secret";
process.env.RL_PHONE_TEST_SINK = "1";

const { phoneStart, phoneConfirm } = await import("./phone/session.server.ts");
const market = await import("./market/handlers.server.ts");
const orders = await import("./orders/handlers.server.ts");
const { marketCopy } = await import("./market-copy.ts");
const { LANGS } = await import("./langs.ts");

async function user(dial: string, national: string, name: string) {
  const started = await phoneStart(dial, national);
  assert.equal(started.sent, true);
  const pin = (globalThis as { __rlLastCode?: string }).__rlLastCode;
  assert.equal(pin?.length, 6);
  try {
    await phoneConfirm({ dial, national, pin, name });
  } catch (error) {
    assert.match(String(error), /StartEvent/);
  }
  const sql = await getSql();
  const rows = await sql<{
    id: string;
  }>`select id from phone_users order by created_at desc limit 1`;
  const id = rows[0]?.id;
  assert.ok(id);
  return id;
}

after(async () => {
  await pg.close();
});

describe("phone user flow on PGLite", () => {
  it("registers, favorites, alerts, reviews, requests a move, and lets admin change an order", async () => {
    const buyer = await user("964", "7501111111", "Aza");
    const admin = await user("964", "7502222222", "Admin");
    const courier = await user("964", "7503333333", "Driver");
    const sql = await getSql();
    await sql`insert into user_roles (user_id, role, status, display_name) values (${admin}, 'admin', 'approved', 'Admin')`;

    assert.equal((await market.setFavorite(buyer, "earbuds", true)).ok, true);
    assert.equal((await market.setAlert(buyer, "earbuds", 50000)).ok, true);
    const review = await market.addReview(buyer, "earbuds", 5, "باشە");
    assert.equal(review.ok, true);

    // The restricted-items declaration is required and recorded.
    await assert.rejects(
      market.createDelivery(buyer, { pickup: "سلێمانی", dropoff: "هەولێر", item: "بیستۆک" }),
      (err: { code?: string }) => err.code === "invalid",
    );
    const move = await market.createDelivery(buyer, {
      pickup: "سلێمانی, گەڕەکی سەرچنار, ژمارە ١٢",
      dropoff: "هەولێر، گەڕەکی ئازادی",
      item: "بیستۆک",
      declared: true,
    });
    assert.ok(move.id);
    const declared = await sql<{
      kind: string;
    }>`select kind from declarations where ref_id = ${move.id}`;
    assert.equal(declared[0]?.kind, "delivery");

    await market.requestRole(buyer, {
      role: "seller",
      displayName: "Aza Shop",
      city: "سلێمانی",
      phone: "+9647501111111",
    });
    await market.requestRole(courier, {
      role: "courier",
      displayName: "Driver",
      city: "هەولێر",
      phone: "+9647503333333",
    });

    const queue = await market.adminQueue(admin);
    assert.ok(queue.pendingReviews.some((row) => row.body === "باشە"));
    assert.ok(queue.pendingRoles.some((row) => row.role === "seller"));
    const reviewId = queue.pendingReviews.find((row) => row.body === "باشە")?.id;
    assert.ok(reviewId);
    await market.adminSet(admin, { kind: "review", id: reviewId, status: "approved" });
    await market.adminSet(admin, { kind: "role", id: buyer, role: "seller", status: "approved" });
    await market.adminSet(admin, {
      kind: "role",
      id: courier,
      role: "courier",
      status: "approved",
    });
    const after = await market.adminQueue(admin);
    assert.equal(
      after.pendingReviews.some((row) => row.id === reviewId),
      false,
    );

    const me = await market.getMe(buyer);
    assert.ok(me.roles.some((row) => row.role === "seller" && row.status === "approved"));
    const jobs = await market.listJobs(courier);
    const open = jobs.openDeliveries.find((row) => row.id === move.id);
    assert.ok(open);
    assert.equal(open.pickup.includes("١٢"), false);
    assert.equal(open.pickup.includes("سلێمانی"), true);

    const submitted = await orders.submitRequest(
      buyer,
      "store",
      { name: "Aza", phone: "+9647501111111", url: "https://example.com/item" },
      null,
    );
    if (!("id" in submitted)) throw new Error("store request was not saved");
    const tracking = submitted.id ?? "";
    assert.match(tracking, /^RG-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    const listed = await orders.adminOrders(admin);
    const row = listed.find((item) => item.trackingId === tracking);
    assert.ok(row);
    // The form's payload-bound retry key uses the existing unique DB constraint.
    const { validateStoreRequest, storeSubmissionKey } = await import("./orders/store-request.ts");
    const checked = validateStoreRequest(
      {
        intent: "buy",
        url: "https://www.zalando.de/shoes",
        qty: "2",
        dest: "sul",
        phone: "+9647501111111",
        size: "42",
        color: "red",
        notes: "Bring For Me regression",
      },
      null,
    );
    assert.ok(checked.ok);
    const key = await storeSubmissionKey(crypto.randomUUID(), checked.data);
    const payload = { ...checked.data, declared: true };
    const first = await orders.submitRequest(buyer, "store", payload, null, {
      idempotencyKey: key,
    });
    const retry = await orders.submitRequest(buyer, "store", payload, null, {
      idempotencyKey: key,
    });
    assert.ok("id" in first && "id" in retry);
    assert.equal(first.id, retry.id);
    const persisted = await sql<{ tracking_id: string; payload: string }>`
      select tracking_id, payload from shipment_requests where user_id = ${buyer} and idempotency_key = ${key}`;
    assert.equal(persisted.length, 1);
    assert.equal(persisted[0].tracking_id, first.id);
    const storedPayload = JSON.parse(persisted[0].payload);
    assert.equal(storedPayload.size, "42");
    assert.equal(storedPayload.notes, "Bring For Me regression");
    assert.ok((await orders.adminOrders(admin)).some((entry) => entry.trackingId === first.id));
    await assert.rejects(orders.adminOrders(buyer));
    // Work only starts after the customer accepts a staff quote.
    await assert.rejects(
      orders.adminOrderStatus(admin, row.id, "in_transit"),
      (err: { code?: string }) => err.code === "forbidden",
    );
    const requests = await import("./requests/handlers.server.ts");
    const quote = await requests.staffQuote(admin, {
      ref: tracking,
      amountIqd: 120000,
      customsIncluded: false,
    });
    await requests.acceptQuote(buyer, tracking, quote.id);
    await orders.adminOrderStatus(admin, row.id, "in_transit");
    const notes = await sql<{
      body_en: string;
    }>`select body_en from notifications where user_id = ${buyer} and body_en like ${"%" + tracking + "%"}`;
    assert.ok(notes.some((note) => /In transit/.test(note.body_en)));
  });
});

describe("admin copy", () => {
  it("has review and order labels in all seven languages", () => {
    for (const lang of LANGS) {
      const t = marketCopy(lang.id);
      for (const key of [
        "reviews",
        "approve",
        "reject",
        "orders",
        "received",
        "transit",
      ] as const) {
        assert.ok(t[key].trim().length > 0, `${lang.id}.${key}`);
      }
    }
  });
});
