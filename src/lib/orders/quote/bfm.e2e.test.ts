/**
 * Bring For Me Phase 1, end to end against a real Postgres (PGLite, all migrations applied):
 * settings (SUPER_ADMIN only + audit), link import, cart, prohibited-product handling, quote.
 * All numbers below are TEST FIXTURES, not R&L prices.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { register } from "node:module";
import { after, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const root = new URL("../../../../", import.meta.url);
const pg = new PGlite({ parsers: { 20: Number } });
await pg.waitReady;
for (const dir of ["migrations/", "migrations/dev/"]) {
  for (const file of readdirSync(new URL(dir, root))
    .filter((name) => name.endsWith(".sql"))
    .sort()) {
    await pg.exec(readFileSync(new URL(`${dir}${file}`, root), "utf8"));
  }
}

function makeSql() {
  async function sql<T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) {
    let text = strings[0]!;
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return (await pg.query<T>(text, values)).rows;
  }
  return Object.assign(sql, {
    query: async (text: string, params: unknown[] = []) => (await pg.query(text, params)).rows,
  });
}
const sql = makeSql() as never as import("@/lib/db").Sql;
(globalThis as { __bfmTestSql__?: unknown }).__bfmTestSql__ = () => sql;

const src = new URL("src/", root).href;
register(
  "data:text/javascript," +
    encodeURIComponent(`
      const SRC = ${JSON.stringify(src)};
      const DB = "data:text/javascript," + encodeURIComponent("export const getSql = () => globalThis.__bfmTestSql__();");
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

const { BUNDLED_RULES } = await import("../../compliance/check.ts");
const settingsMod = await import("./settings.server.ts");
const cart = await import("./cart.server.ts");
const { cartQuote, getQuote } = await import("./quote.server.ts");
const { importLink } = await import("./import.server.ts");
const { SETTING_DEFS } = await import("./settings.ts");
const { BfmError } = await import("./errors.ts");
const { signProof } = await import("./proof.ts");

after(async () => {
  await pg.close();
});

const SECRET = "t".repeat(40);
const NOW = new Date("2026-10-21T10:00:00.000Z");
const code = (err: unknown) => (err as { code?: string }).code;
const rejectsWith = async (p: Promise<unknown>, c: string) => {
  await assert.rejects(p, (e) => code(e) === c, `expected ${c}`);
};

async function role(userId: string, r: "super_admin" | "admin") {
  await sql`insert into user_roles (user_id, role, status) values (${userId}, ${r}, 'approved')
    on conflict (user_id, role) do update set status = 'approved'`;
}

/** Fixture values for EVERY registry key (the app itself ships none). */
function fixtureEntries(skip: (key: string) => boolean = () => false) {
  const entries: { key: string; value: number | string }[] = [];
  for (const def of SETTING_DEFS) {
    if (skip(def.key)) continue;
    let value: number | string;
    if (def.kind === "enum") {
      value = def.key.endsWith(".zone")
        ? def.key.includes(".erbil.") ||
          def.key.includes(".sulaymaniyah.") ||
          def.key.includes(".duhok.") ||
          def.key.includes(".halabja.")
          ? "kurdistan"
          : "rest_of_iraq"
        : "after_discount";
    } else if (def.key === "fx.EUR") value = 1_600_000_000;
    else if (def.key.startsWith("fx.")) value = 1_500_000_000;
    else if (def.key === "volumetric_divisor") value = 5000;
    else if (def.key.endsWith("_per_kg_iqd")) value = 10_000;
    else if (def.key === "freight.minimum_iqd") value = 20_000;
    else if (def.key.startsWith("customs_bp.")) value = 500;
    else if (def.key === "fee.rl_iqd") value = 5_000;
    else if (def.key.endsWith(".fee_iqd")) value = 4_000;
    else if (def.key === "free_delivery.threshold_iqd") value = 200_000;
    else if (def.key === "quote.validity_hours") value = 48;
    else if (def.key.endsWith("weight_g")) value = 500;
    else if (def.key.endsWith("length_mm")) value = 200;
    else if (def.key.endsWith("width_mm")) value = 150;
    else if (def.key.endsWith("height_mm")) value = 100;
    else throw new Error(`no fixture for ${def.key}`);
    entries.push({ key: def.key, value });
  }
  return entries;
}

const countOf = async (table: string) =>
  (await sql.query<{ n: number }>(`select count(*)::int as n from ${table}`))[0]!.n;
const ordersAtStart = await countOf("shipment_requests");
const stores = await cart.loadStores(sql);
const ctx = { now: NOW, secret: SECRET, rules: BUNDLED_RULES, stores };
const item = (patch: Record<string, unknown> = {}) => ({
  url: "https://www.zara.com/de/en/basic-t-shirt-p01234.html",
  title: "Basic Cotton T-Shirt",
  price: "19.99",
  currency: "EUR",
  quantity: 1,
  category: "fashion",
  options: "size M",
  weightKg: "1",
  lengthCm: "40",
  widthCm: "30",
  heightCm: "20",
  confirmed: true,
  ...patch,
});

describe("settings: SUPER_ADMIN only, audited, never faked", () => {
  it("starts empty: no business number exists until the owner fills it in", async () => {
    const rows = await sql<{ n: number }>`select count(*)::int as n from bfm_settings`;
    assert.equal(rows[0]!.n, 0);
  });
  it("nobody can read or change settings without the SUPER_ADMIN role", async () => {
    await role("staff1", "admin");
    for (const who of ["nobody", "staff1"]) {
      await rejectsWith(settingsMod.adminListSettings(sql, who), "forbidden");
      await rejectsWith(
        settingsMod.adminSetSettings(sql, who, [{ key: "fee.rl_iqd", value: 1 }]),
        "forbidden",
      );
      await rejectsWith(settingsMod.adminCreateCoupon(sql, who, {}), "forbidden");
      await rejectsWith(settingsMod.adminReviewQueue(sql, who), "forbidden");
    }
    const rows = await sql<{ n: number }>`select count(*)::int as n from bfm_settings`;
    assert.equal(rows[0]!.n, 0);
  });
  it("a quote is refused, naming the missing settings, while the owner has not filled them in", async () => {
    await cart.addItem(sql, "cust1", item(), ctx);
    await cart.setDestination(sql, "cust1", "erbil");
    const r = await cartQuote(sql, "cust1", NOW);
    assert.equal(r.ok, false);
    assert.ok(!r.ok && r.error.code === "missing_settings");
    assert.ok(
      !r.ok && r.error.code === "missing_settings" && r.error.missing.includes("fee.rl_iqd"),
    );
    assert.equal("quote" in r, false);
    const stored = await sql<{ n: number }>`select count(*)::int as n from bfm_quotes`;
    assert.equal(stored[0]!.n, 0);
  });
  it("SUPER_ADMIN fills settings in; every change is in the history; bad input is refused", async () => {
    await role("owner1", "super_admin");
    const listed = await settingsMod.adminListSettings(sql, "owner1");
    assert.ok(listed.unfilledCount > 50);
    const res = await settingsMod.adminSetSettings(sql, "owner1", fixtureEntries());
    assert.equal(res.applied.length, SETTING_DEFS.length);
    assert.equal((await settingsMod.adminListSettings(sql, "owner1")).unfilledCount, 0);

    await rejectsWith(
      settingsMod.adminSetSettings(sql, "owner1", [{ key: "made.up", value: 1 }]),
      "invalid",
    );
    await rejectsWith(
      settingsMod.adminSetSettings(sql, "owner1", [{ key: "fee.rl_iqd", value: -1 }]),
      "invalid",
    );
    await rejectsWith(
      settingsMod.adminSetSettings(sql, "owner1", [{ key: "fee.rl_iqd", value: 1.5 }]),
      "invalid",
    );
    await rejectsWith(
      settingsMod.adminSetSettings(sql, "owner1", [{ key: "fee.rl_iqd", value: "5" }]),
      "invalid",
    );
    await rejectsWith(
      settingsMod.adminSetSettings(sql, "owner1", [{ key: "fx.EUR", value: 0 }]),
      "invalid",
    );
    await rejectsWith(
      settingsMod.adminSetSettings(sql, "owner1", [{ key: "free_delivery.basis", value: "x" }]),
      "invalid",
    );
    await rejectsWith(settingsMod.adminSetSettings(sql, "owner1", []), "invalid");

    await settingsMod.adminSetSettings(sql, "owner1", [{ key: "fee.rl_iqd", value: 6_000 }]);
    const hist = await settingsMod.adminSettingsHistory(sql, "owner1", "fee.rl_iqd");
    assert.deepEqual(
      hist.history.map((h) => [h.oldValue, h.newValue, h.revision, h.actorId]),
      [
        [5000, 6000, 2, "owner1"],
        [null, 5000, 1, "owner1"],
      ],
    );
    // back to the fixture value
    await settingsMod.adminSetSettings(sql, "owner1", [{ key: "fee.rl_iqd", value: 5_000 }]);
  });
  it("optimistic revision check refuses a stale edit", async () => {
    await rejectsWith(
      settingsMod.adminSetSettings(sql, "owner1", [
        { key: "fee.rl_iqd", value: 7000, expectedRevision: 1 },
      ]),
      "conflict",
    );
    const ok = await settingsMod.adminSetSettings(sql, "owner1", [
      { key: "fee.rl_iqd", value: 5000, expectedRevision: 3 },
    ]);
    assert.equal(ok.applied[0]!.revision, 4);
  });
  it("history and settings cannot be edited or deleted, even directly in SQL", async () => {
    await assert.rejects(sql`delete from bfm_settings where key = 'fee.rl_iqd'`);
    await assert.rejects(sql`update bfm_settings_history set actor_id = 'x'`);
    await assert.rejects(sql`delete from bfm_settings_history`);
  });
  it("clearing a setting makes quotes refuse again (no silent fallback)", async () => {
    await settingsMod.adminSetSettings(sql, "owner1", [{ key: "fee.rl_iqd", value: null }]);
    const r = await cartQuote(sql, "cust1", NOW);
    assert.ok(
      !r.ok && r.error.code === "missing_settings" && r.error.missing.includes("fee.rl_iqd"),
    );
    await settingsMod.adminSetSettings(sql, "owner1", [{ key: "fee.rl_iqd", value: 5000 }]);
  });
});

describe("cart", () => {
  it("is private to its owner and groups by store", async () => {
    await cart.addItem(
      sql,
      "cust2",
      item({
        url: "https://www.amazon.de/dp/B000123456",
        title: "Mouse M185",
        category: "electronics",
      }),
      ctx,
    );
    await cart.addItem(sql, "cust2", item(), ctx);
    const c = await cart.getCart(sql, "cust2");
    assert.deepEqual(c.groups.map((g) => g.storeKey).sort(), ["amazon", "zara"]);
    assert.equal(c.counts.lines, 2);
    assert.equal(c.shipments, 1);
    assert.equal(c.limits.maxLines, 30);
    assert.equal(c.isEstimateOnly, true);
    const mine = c.groups[0]!.items[0]!;
    // another user can neither see, change nor remove it
    const other = await cart.getCart(sql, "cust3");
    assert.equal(other.counts.lines, 0);
    await rejectsWith(cart.removeItem(sql, "cust3", mine.id), "notfound");
    await rejectsWith(cart.setQuantity(sql, "cust3", mine.id, 2), "notfound");
  });
  it("changes quantity, removes softly, and keeps the removed row", async () => {
    const c = await cart.getCart(sql, "cust2");
    const first = c.groups[0]!.items[0]!;
    const changed = await cart.setQuantity(sql, "cust2", first.id, 3);
    assert.equal(changed.item.quantity, 3);
    await rejectsWith(cart.setQuantity(sql, "cust2", first.id, 0), "invalid");
    await rejectsWith(cart.setQuantity(sql, "cust2", first.id, 21), "invalid");
    await cart.removeItem(sql, "cust2", first.id);
    assert.equal((await cart.getCart(sql, "cust2")).counts.lines, 1);
    const kept = await sql<{
      n: number;
    }>`select count(*)::int as n from bfm_cart_items where id = ${first.id} and removed_at is not null`;
    assert.equal(kept[0]!.n, 1);
    await rejectsWith(cart.removeItem(sql, "cust2", first.id), "notfound");
  });
  it("refuses unconfirmed, malformed and out-of-range items", async () => {
    const bad: Record<string, unknown>[] = [
      { confirmed: false },
      { confirmed: undefined },
      { title: "" },
      { title: 5 },
      { price: "0" },
      { price: "-3" },
      { price: "abc" },
      { price: "1e5" },
      { currency: "SEK" },
      { currency: undefined },
      { quantity: 0 },
      { quantity: 1.5 },
      { quantity: "2" },
      { category: "weapons" },
      { weightKg: "71" },
      { weightKg: "-1" },
      { weightKg: "abc" },
      { lengthCm: "300", widthCm: "10", heightCm: "10" },
      { widthCm: undefined, heightCm: undefined },
      { options: "x".repeat(201) },
      { options: 5 },
    ];
    for (const patch of bad) {
      await assert.rejects(
        cart.addItem(sql, "cust4", item(patch), ctx),
        (e) => code(e) === "invalid",
        JSON.stringify(patch),
      );
    }
    for (const url of [
      "http://www.zara.com/p/1",
      "https://127.0.0.1/x",
      "https://localhost/x",
      "https://u:p@zara.com/x",
      "javascript:alert(1)",
      "",
      5,
    ]) {
      await rejectsWith(cart.addItem(sql, "cust4", item({ url }), ctx), "unsafe_url");
    }
    assert.equal((await cart.getCart(sql, "cust4")).counts.lines, 0);
  });
  it("states and enforces the Phase 1 limits (pieces, lines, different stores)", async () => {
    for (let i = 0; i < 5; i++) {
      await cart.addItem(
        sql,
        "cust5",
        item({ url: `https://shop${i}.example-store.com/p/${i}`, title: `Item number ${i}` }),
        ctx,
      );
    }
    await rejectsWith(
      cart.addItem(sql, "cust5", item({ url: "https://shop9.example-store.com/p/9" }), ctx),
      "limit",
    );
    // same store lines still fine until the line / piece caps
    for (let i = 0; i < 25; i++)
      await cart
        .addItem(sql, "cust5", item({ title: `Zara item ${i}` }), { ...ctx, stores })
        .catch((e) => {
          assert.equal(code(e), "limit");
        });
    assert.ok((await cart.getCart(sql, "cust5")).counts.lines <= 30);
    await rejectsWith(
      cart
        .addItem(sql, "cust6", item({ quantity: 20 }), ctx)
        .then(() => cart.addItem(sql, "cust6", item({ quantity: 20 }), ctx))
        .then(() => cart.addItem(sql, "cust6", item({ quantity: 11 }), ctx)),
      "limit",
    );
  });
  it("destination is the customer's own choice and must be a known governorate", async () => {
    await rejectsWith(cart.setDestination(sql, "cust2", "atlantis"), "invalid");
    await rejectsWith(cart.setDestination(sql, "cust2", 5), "invalid");
    assert.equal((await cart.getCart(sql, "cust2")).destination, null);
    await cart.setDestination(sql, "cust2", "baghdad");
    assert.equal((await cart.getCart(sql, "cust2")).destination, "baghdad");
  });
});

describe("prohibited products", () => {
  it("a banned product is rejected, nothing is stored and only time/category/domain are logged", async () => {
    const before = await sql<{ n: number }>`select count(*)::int as n from bfm_cart_items`;
    await rejectsWith(
      cart.addItem(
        sql,
        "cust7",
        item({ title: "Premium Vodka 70cl", url: "https://shop.example-drinks.com/p/vodka-70cl" }),
        ctx,
      ),
      "prohibited",
    );
    await rejectsWith(
      cart.addItem(sql, "cust7", item({ url: "https://shop.example.com/c/vodka/item-1" }), ctx),
      "prohibited",
    );
    await rejectsWith(
      cart.addItem(sql, "cust7", item({ options: "flavour: tequila" }), ctx),
      "prohibited",
    );
    const after = await sql<{ n: number }>`select count(*)::int as n from bfm_cart_items`;
    assert.equal(after[0]!.n, before[0]!.n);
    const log = await sql<{ details: Record<string, unknown> }>`
      select details from compliance_audit_log where action = 'bfm_item_rejected' order by id desc limit 3`;
    assert.equal(log.length, 3);
    for (const row of log) {
      assert.deepEqual(Object.keys(row.details).sort(), ["at", "category", "domain"]);
      assert.equal(row.details.category, "alcohol");
    }
    const text = JSON.stringify(log);
    assert.ok(
      !/vodka|tequila|cust7|example-drinks/i.test(text.replace(/"domain":"[^"]*"/g, "")),
      "no title/url/user in the log",
    );
  });
  it("an item that cannot be classified waits for the owner and cannot be quoted before", async () => {
    const added = await cart.addItem(
      sql,
      "cust8",
      item({ category: "general", title: "Mystery gadget" }),
      ctx,
    );
    assert.equal(added.needsReview, true);
    assert.equal(added.item.screening, "needs_review");
    await cart.setDestination(sql, "cust8", "erbil");
    const r = await cartQuote(sql, "cust8", NOW);
    assert.ok(
      !r.ok && r.error.code === "review_pending" && r.error.itemIds.includes(added.item.id),
    );
    const queue = await settingsMod.adminReviewQueue(sql, "owner1");
    assert.ok(queue.items.some((i) => i.id === added.item.id));
    await settingsMod.adminDecideReview(sql, "owner1", added.item.id, "approve");
    const ok = await cartQuote(sql, "cust8", NOW);
    assert.equal(ok.ok, true);
  });
  it("food always goes to review; rejecting a review removes the item from the cart", async () => {
    const food = await cart.addItem(
      sql,
      "cust9",
      item({ category: "food", title: "Chocolate bar 100g" }),
      ctx,
    );
    assert.equal(food.needsReview, true);
    await settingsMod.adminDecideReview(sql, "owner1", food.item.id, "reject");
    assert.equal((await cart.getCart(sql, "cust9")).counts.lines, 0);
    await rejectsWith(
      settingsMod.adminDecideReview(sql, "owner1", food.item.id, "approve"),
      "notfound",
    );
  });
});

describe("cartQuote", () => {
  it("returns a full breakdown in whole IQD, the rates used, free-delivery progress and a snapshot", async () => {
    await cart.addItem(sql, "cust10", item(), ctx);
    await cart.setDestination(sql, "cust10", "erbil");
    const r = await cartQuote(sql, "cust10", NOW);
    assert.ok(r.ok);
    const q = r.quote;
    // 19.99 EUR x 1600 = 31,984 ; customs 5% = 1,599 ; 4.8 kg x 10,000 = 48,000 ; fee 5,000 ; delivery 4,000
    assert.equal(q.breakdown.itemsIqd, 31_984);
    assert.equal(q.breakdown.customsIqd, 1_599);
    assert.equal(q.breakdown.freightIqd, 48_000);
    assert.equal(q.breakdown.rlFeeIqd, 5_000);
    assert.equal(q.breakdown.homeDeliveryIqd, 4_000);
    assert.equal(q.breakdown.totalIqd, 90_750);
    assert.equal(q.breakdown.totalIqd % 250, 0);
    assert.equal(q.isEstimate, true);
    assert.equal(q.notice, "estimate_until_rl_approval");
    assert.equal(q.approvalStatus, "pending");
    assert.equal(q.version, 1);
    assert.equal(q.destination.governorate, "erbil");
    assert.equal(q.freeDelivery.spentIqd, 31_984);
    assert.equal(q.freeDelivery.thresholdIqd, 200_000);
    assert.equal(q.freeDelivery.leftIqd, 168_016);
    assert.equal(q.ratesUsed["fx.EUR"], 1_600_000_000);
    assert.equal(q.shipments, 1);
    assert.equal(r.reused, false);
    const stored = await sql<{
      settings_snapshot: { values: Record<string, unknown>; revisions: Record<string, number> };
    }>`
      select settings_snapshot from bfm_quotes where id = ${q.id}`;
    assert.equal(stored[0]!.settings_snapshot.values["fx.EUR"], 1_600_000_000);
    assert.ok(stored[0]!.settings_snapshot.revisions["fx.EUR"]! >= 1);
  });
  it("needs a destination chosen by the customer", async () => {
    await cart.addItem(sql, "cust11", item(), ctx);
    const r = await cartQuote(sql, "cust11", NOW);
    assert.ok(!r.ok && r.error.code === "destination_required");
  });
  it("an empty cart has no quote", async () => {
    const r = await cartQuote(sql, "cust12", NOW);
    assert.ok(!r.ok && r.error.code === "empty_cart");
  });
  it("the same input returns the same stored quote; a change makes a new immutable version", async () => {
    const a = await cartQuote(sql, "cust10", NOW);
    const b = await cartQuote(sql, "cust10", NOW);
    assert.ok(a.ok && b.ok && a.quote.id === b.quote.id && b.reused);
    const c = await cart.getCart(sql, "cust10");
    await cart.setQuantity(sql, "cust10", c.groups[0]!.items[0]!.id, 2);
    const next = await cartQuote(sql, "cust10", NOW);
    assert.ok(next.ok && next.quote.version === 2 && next.quote.id !== a.quote.id);
    assert.ok(next.ok && next.quote.breakdown.itemsIqd === 63_968);
    // the earlier snapshot did not change
    const old = await getQuote(sql, "cust10", a.ok ? a.quote.id : "", NOW);
    assert.equal(old.breakdown.itemsIqd, 31_984);
    await assert.rejects(sql`update bfm_quotes set total_iqd = 1 where id = ${old.id}`);
    await assert.rejects(sql`delete from bfm_quotes where id = ${old.id}`);
  });
  it("a settings change gives a new version and leaves the old snapshot with its old rates", async () => {
    const before = await cartQuote(sql, "cust10", NOW);
    await settingsMod.adminSetSettings(sql, "owner1", [{ key: "fx.EUR", value: 1_700_000_000 }]);
    const after = await cartQuote(sql, "cust10", NOW);
    assert.ok(before.ok && after.ok && after.quote.id !== before.quote.id);
    assert.equal(after.ok && after.quote.ratesUsed["fx.EUR"], 1_700_000_000);
    assert.equal(
      (await getQuote(sql, "cust10", before.ok ? before.quote.id : "", NOW)).ratesUsed["fx.EUR"],
      1_600_000_000,
    );
    await settingsMod.adminSetSettings(sql, "owner1", [{ key: "fx.EUR", value: 1_600_000_000 }]);
  });
  it("quotes expire and are private to their owner", async () => {
    const q = await cartQuote(sql, "cust10", NOW);
    assert.ok(q.ok);
    const later = new Date(NOW.getTime() + 49 * 3600 * 1000);
    assert.equal((await getQuote(sql, "cust10", q.quote.id, later)).expired, true);
    assert.equal((await getQuote(sql, "cust10", q.quote.id, NOW)).expired, false);
    await rejectsWith(getQuote(sql, "cust11", q.quote.id, NOW), "notfound");
  });
  it("coupons: eligible, expired, unknown; never a negative total", async () => {
    await settingsMod.adminCreateCoupon(sql, "owner1", {
      code: "welcome",
      kind: "fixed_iqd",
      value: 5000,
      expiresAt: "2026-12-31T00:00:00.000Z",
    });
    await settingsMod.adminCreateCoupon(sql, "owner1", {
      code: "OLD",
      kind: "fixed_iqd",
      value: 5000,
      expiresAt: "2026-01-01T00:00:00.000Z",
    });
    await settingsMod.adminCreateCoupon(sql, "owner1", {
      code: "HUGE",
      kind: "fixed_iqd",
      value: 99_000_000,
      expiresAt: "2026-12-31T00:00:00.000Z",
    });
    await rejectsWith(
      settingsMod.adminCreateCoupon(sql, "owner1", {
        code: "WELCOME",
        kind: "fixed_iqd",
        value: 1,
        expiresAt: "2026-12-31T00:00:00.000Z",
      }),
      "conflict",
    );
    await rejectsWith(
      settingsMod.adminCreateCoupon(sql, "owner1", { code: "NOEXP", kind: "fixed_iqd", value: 1 }),
      "invalid",
    );
    await rejectsWith(
      settingsMod.adminCreateCoupon(sql, "owner1", {
        code: "BAD",
        kind: "percent_bp",
        value: 10_001,
        expiresAt: "2026-12-31T00:00:00.000Z",
      }),
      "invalid",
    );

    await cart.setCoupon(sql, "cust10", "welcome");
    const ok = await cartQuote(sql, "cust10", NOW);
    assert.ok(
      ok.ok && ok.quote.breakdown.couponIqd === 5000 && ok.quote.coupon?.code === "WELCOME",
    );
    await cart.setCoupon(sql, "cust10", "OLD");
    const old = await cartQuote(sql, "cust10", NOW);
    assert.ok(!old.ok && old.error.code === "coupon_not_eligible");
    await cart.setCoupon(sql, "cust10", "NOPE");
    const unknown = await cartQuote(sql, "cust10", NOW);
    assert.ok(!unknown.ok && unknown.error.code === "coupon_not_eligible");
    await cart.setCoupon(sql, "cust10", "HUGE");
    const huge = await cartQuote(sql, "cust10", NOW);
    assert.ok(huge.ok && huge.quote.breakdown.totalIqd >= 0);
    await rejectsWith(cart.setCoupon(sql, "cust10", "bad code!"), "invalid");
    await cart.setCoupon(sql, "cust10", null);
    await settingsMod.adminDeactivateCoupon(sql, "owner1", "welcome");
    await cart.setCoupon(sql, "cust10", "welcome");
    const inactive = await cartQuote(sql, "cust10", NOW);
    assert.ok(!inactive.ok && inactive.error.code === "coupon_not_eligible");
    await cart.setCoupon(sql, "cust10", null);
  });
  it("R&L staff can record a review of the estimate, once", async () => {
    const q = await cartQuote(sql, "cust10", NOW);
    assert.ok(q.ok);
    await rejectsWith(
      settingsMod.staffDecideQuote(sql, "nobody", q.quote.id, "approve"),
      "forbidden",
    );
    const done = await settingsMod.staffDecideQuote(sql, "staff1", q.quote.id, "approve");
    assert.equal(done.approvalStatus, "approved");
    assert.equal((await getQuote(sql, "cust10", q.quote.id, NOW)).approvalStatus, "approved");
    await rejectsWith(
      settingsMod.staffDecideQuote(sql, "staff1", q.quote.id, "reject"),
      "notfound",
    );
  });
  it("prices are server-owned: nothing the client sends can reach the calculator", async () => {
    const c = await cart.getCart(sql, "cust10");
    const row = c.groups[0]!.items[0]!;
    assert.equal(row.priceMinor, 1999);
    // there is no endpoint to set a price on an existing line; quantity is the only editable number
    const changed = await cart.setQuantity(sql, "cust10", row.id, 1);
    assert.equal(changed.item.priceMinor, 1999);
  });
});

describe("import", () => {
  const fixture = (name: string) =>
    readFileSync(new URL(`../../product-link/fixtures/${name}`, import.meta.url), "utf8");
  const page = (name: string, finalUrl: string) => ({
    ok: true as const,
    finalUrl,
    host: new URL(finalUrl).hostname,
    status: 200,
    contentType: "text/html",
    html: fixture(name),
    redirects: 0,
  });
  function deps(fetchPage: (url: string) => Promise<never>, over: Record<string, unknown> = {}) {
    return {
      fetchPage,
      allow: async () => true,
      secret: SECRET,
      now: NOW,
      rules: BUNDLED_RULES,
      stores,
      ...over,
    } as never;
  }
  const calls: string[] = [];
  const serve = (name: string, url: string) => async (u: string) => {
    calls.push(u);
    return page(name, url) as never;
  };

  it("reads JSON-LD, returns a signed proof, and caches for 10 minutes", async () => {
    const url = "https://www.zara.com/de/en/jersey-tee-p777.html";
    const r = await importLink(sql, deps(serve("jsonld-product.html", url)), {
      userId: "cust20",
      ip: "1.2.3.4",
      url,
    });
    assert.ok(r.status === "imported");
    assert.equal(r.fields.title, "Basic Cotton T-Shirt & Co");
    assert.equal(r.fields.priceMinor, 1999);
    assert.equal(r.fields.currency, "EUR");
    assert.equal(r.fields.priceSource, "jsonld");
    assert.equal(r.store.key, "zara");
    assert.equal(r.mustConfirm, true);
    assert.ok(r.proof);
    assert.equal(r.cached, false);
    const again = await importLink(sql, deps(serve("jsonld-product.html", url)), {
      userId: "cust20",
      ip: "1.2.3.4",
      url,
    });
    assert.ok(again.status === "imported" && again.cached === true);
    assert.equal(calls.length, 1, "the second import did not touch the store");
    // after 10 minutes it is fetched again
    const later = new Date(NOW.getTime() + 11 * 60 * 1000);
    await importLink(sql, deps(serve("jsonld-product.html", url), { now: later }), {
      userId: "cust20",
      ip: "1.2.3.4",
      url,
    });
    assert.equal(calls.length, 2);
  });

  it("an imported item keeps its provenance only through the server's proof", async () => {
    const url = "https://www.zara.com/de/en/jersey-tee-p778.html";
    const r = await importLink(sql, deps(serve("jsonld-product.html", url)), {
      userId: "cust21",
      ip: "1.2.3.4",
      url,
    });
    assert.ok(r.status === "imported");
    const base = {
      url,
      title: r.fields.title,
      price: "19.99",
      currency: "EUR",
      quantity: 1,
      category: "fashion",
      confirmed: true,
    };
    const good = await cart.addItem(sql, "cust21", { ...base, proof: r.proof }, ctx);
    assert.equal(good.item.origin, "imported");
    assert.equal(good.item.priceSource, "jsonld");
    assert.equal(good.item.imageUrl, "https://static.example-shop.com/img/tee-1.jpg");
    assert.equal(good.item.retrievedAt, NOW.toISOString());
    // customer changes the price: their own value, not "imported"
    const edited = await cart.addItem(
      sql,
      "cust21",
      { ...base, price: "9.99", proof: r.proof },
      ctx,
    );
    assert.equal(edited.item.origin, "imported_edited");
    assert.equal(edited.item.priceSource, "manual");
    // a proof for another URL, a forged proof and no proof are all plain manual entries
    const other = await cart.addItem(
      sql,
      "cust21",
      { ...base, url: "https://www.zara.com/other", proof: r.proof },
      ctx,
    );
    const forged = await cart.addItem(sql, "cust21", { ...base, proof: `${r.proof}x` }, ctx);
    const none = await cart.addItem(sql, "cust21", base, ctx);
    for (const x of [other, forged, none]) {
      assert.equal(x.item.origin, "manual");
      assert.equal(x.item.priceSource, "manual");
      assert.equal(x.item.imageUrl, null);
      assert.equal(x.item.retrievedAt, null);
    }
    // an expired proof is ignored
    const stale = await signProof(
      {
        url,
        host: "www.zara.com",
        title: "T",
        imageUrl: null,
        priceMinor: 1999,
        currency: "EUR",
        priceSource: "jsonld",
        retrievedAt: NOW.toISOString(),
        categoryTexts: [],
      },
      SECRET,
      NOW.getTime() - 3 * 3600 * 1000,
    );
    const expired = await cart.addItem(sql, "cust21", { ...base, proof: stale }, ctx);
    assert.equal(expired.item.origin, "manual");
  });

  it("OpenGraph-only and microdata pages prefill what they state", async () => {
    const u1 = "https://www.amazon.de/dp/B000OG0001";
    const og = await importLink(sql, deps(serve("opengraph-only.html", u1)), {
      userId: "cust22",
      ip: "1.2.3.5",
      url: u1,
    });
    assert.ok(
      og.status === "imported" &&
        og.fields.priceMinor === 129950 &&
        og.fields.currency === "TRY" &&
        og.store.key === "amazon",
    );
    const u2 = "https://www.some-small-shop.com/mug";
    const md = await importLink(sql, deps(serve("microdata.html", u2)), {
      userId: "cust22",
      ip: "1.2.3.5",
      url: u2,
    });
    assert.ok(
      md.status === "imported" && md.fields.priceMinor === 750 && md.fields.currency === "GBP",
    );
    assert.deepEqual(md.store, {
      key: "some-small-shop.com",
      name: "some-small-shop.com",
      known: false,
    });
  });

  it("a partial page needs the customer to complete it", async () => {
    const url = "https://www.hm.com/en_de/productpage.1.html";
    const r = await importLink(sql, deps(serve("partial-title-only.html", url)), {
      userId: "cust23",
      ip: "1.2.3.6",
      url,
    });
    assert.ok(r.status === "needs_manual");
    assert.deepEqual(r.missing, ["price", "currency"]);
    assert.equal(r.fields.title, "Nice Jacket");
    assert.equal(r.fields.priceMinor, null);
  });

  it("an unsupported currency or several prices are reported, never guessed", async () => {
    const u1 = "https://www.kettles.example-store.com/k1";
    const sek = await importLink(sql, deps(serve("unsupported-currency.html", u1)), {
      userId: "cust24",
      ip: "1.2.3.7",
      url: u1,
    });
    assert.ok(
      sek.status === "needs_manual" &&
        sek.unsupportedCurrency === "SEK" &&
        sek.fields.priceMinor === null,
    );
    const u2 = "https://www.sneakers.example-store.com/s1";
    const many = await importLink(sql, deps(serve("ambiguous-prices.html", u2)), {
      userId: "cust24",
      ip: "1.2.3.7",
      url: u2,
    });
    assert.ok(
      many.status === "needs_manual" && many.priceAmbiguous && many.fields.priceMinor === null,
    );
  });

  it("a captcha / bot wall and a store that refuses us end as needs_manual, without a retry", async () => {
    const u1 = "https://www.walled.example-store.com/p1";
    const wall = await importLink(sql, deps(serve("blocked-captcha.html", u1)), {
      userId: "cust25",
      ip: "1.2.3.8",
      url: u1,
    });
    assert.ok(wall.status === "needs_manual" && wall.reason === "challenge");

    const u2 = "https://www.blocking.example-store.com/p2";
    let hits = 0;
    const refuse = async () => (
      hits++,
      { ok: false, reason: "blocked_by_store", status: 403 } as never
    );
    const r = await importLink(sql, deps(refuse), { userId: "cust25", ip: "1.2.3.8", url: u2 });
    assert.ok(r.status === "needs_manual" && r.reason === "store_blocked");
    await importLink(sql, deps(refuse), { userId: "cust25", ip: "1.2.3.8", url: u2 });
    assert.equal(hits, 1, "a refusing store is not asked again within the cache window");
    for (const reason of ["timeout", "network", "too_large", "redirect_limit", "dns_failed"]) {
      const u = `https://www.fails-${reason.replace("_", "-")}.example-store.com/p`;
      const x = await importLink(
        sql,
        deps(async () => ({ ok: false, reason }) as never),
        { userId: "cust25", ip: "1.2.3.8", url: u },
      );
      assert.ok(x.status === "needs_manual" && x.reason === reason, reason);
    }
  });

  it("refuses unsafe URLs before any network access, and never explains a private-address block", async () => {
    let fetched = 0;
    const spy = async () => (fetched++, { ok: false, reason: "blocked_host" } as never);
    for (const url of [
      "http://www.zara.com/p",
      "https://127.0.0.1/",
      "https://[::1]/",
      "https://169.254.169.254/latest",
      "https://localhost/",
      "https://u:p@zara.com/",
      "https://zara.com:8443/",
      "a b c",
      "https://a.com/x https://b.com/y",
      "",
      null,
      5,
    ]) {
      await rejectsWith(
        importLink(sql, deps(spy), { userId: "cust26", ip: "1.2.3.9", url }),
        "unsafe_url",
      );
    }
    assert.equal(fetched, 0);
    // a public-looking name that resolves privately: the fetcher says blocked_host
    await rejectsWith(
      importLink(sql, deps(spy), {
        userId: "cust26",
        ip: "1.2.3.9",
        url: "https://rebind.example-store.com/p",
      }),
      "unsafe_url",
    );
    assert.equal(fetched, 1);
    const cached = await sql<{
      n: number;
    }>`select count(*)::int as n from bfm_import_cache where host = 'rebind.example-store.com'`;
    assert.equal(cached[0]!.n, 0, "an unsafe host is never cached");
  });

  it("rate limits per user and per IP", async () => {
    const url = "https://www.zara.com/de/en/rate-p1.html";
    const f = serve("jsonld-product.html", url);
    await rejectsWith(
      importLink(sql, deps(f, { allow: async (scope: string) => scope !== "bfm-import-user" }), {
        userId: "u",
        ip: "ip",
        url,
      }),
      "rate",
    );
    await rejectsWith(
      importLink(sql, deps(f, { allow: async (scope: string) => scope !== "bfm-import-ip" }), {
        userId: "u",
        ip: "ip",
        url,
      }),
      "rate",
    );
    const seen: string[] = [];
    await importLink(
      sql,
      deps(f, { allow: async (scope: string, id: string) => (seen.push(`${scope}:${id}`), true) }),
      { userId: "uu", ip: "9.9.9.9", url },
    );
    assert.deepEqual(seen, ["bfm-import-user:uu", "bfm-import-ip:9.9.9.9"]);
  });

  it("a banned product page is rejected, cached as a bare refusal, logged without content, and never shown", async () => {
    const url = "https://www.bottle-shop.example-store.com/p/premium-vodka";
    const html = `<html><head><meta property="og:title" content="Premium Vodka 70cl"><meta property="og:image" content="https://cdn.example-store.com/vodka.jpg"><meta property="product:price:amount" content="24.90"><meta property="product:price:currency" content="EUR"></head></html>`;
    let n = 0;
    const f = async () => (
      n++,
      {
        ok: true,
        finalUrl: url,
        host: new URL(url).hostname,
        status: 200,
        contentType: "text/html",
        html,
        redirects: 0,
      } as never
    );
    const r = await importLink(sql, deps(f), { userId: "cust27", ip: "1.2.3.10", url });
    assert.deepEqual(r, { status: "rejected" });
    assert.ok(!JSON.stringify(r).match(/vodka|24\.90|image/i));
    const row = await sql<{
      outcome: string;
      data: object;
    }>`select outcome, data from bfm_import_cache where host = 'www.bottle-shop.example-store.com'`;
    assert.deepEqual(row[0], { outcome: "rejected", data: {} });
    const again = await importLink(sql, deps(f), { userId: "cust27", ip: "1.2.3.10", url });
    assert.deepEqual(again, { status: "rejected" });
    assert.equal(n, 1);
    const log = await sql<{
      details: Record<string, unknown>;
    }>`select details from compliance_audit_log where action = 'bfm_import_rejected' order by id desc limit 1`;
    assert.deepEqual(Object.keys(log[0]!.details).sort(), ["at", "category", "domain"]);
    assert.equal(log[0]!.details.category, "alcohol");
  });

  it("a banned product behind a redirect is rejected too", async () => {
    const url = "https://short.example-store.com/x1";
    const final = "https://www.example-store.com/en/spirits/whisky/single-malt-12";
    const f = async () =>
      ({
        ok: true,
        finalUrl: final,
        host: "www.example-store.com",
        status: 200,
        contentType: "text/html",
        html: "<html><head><title>Product</title></head></html>",
        redirects: 1,
      }) as never;
    const r = await importLink(sql, deps(f), { userId: "cust28", ip: "1.2.3.11", url });
    assert.deepEqual(r, { status: "rejected" });
  });

  it("hostile page content comes out inert: no unsafe image, no markup in text", async () => {
    const url = "https://www.hostile.example-store.com/bag";
    const r = await importLink(sql, deps(serve("hostile.html", url)), {
      userId: "cust29",
      ip: "1.2.3.12",
      url,
    });
    assert.ok(r.status === "needs_manual");
    assert.equal(r.fields.imageUrl, null);
    assert.ok(!/[<>]/.test(r.fields.title ?? ""));
    assert.equal(r.fields.priceMinor, null);
  });
});

describe("module boundaries", () => {
  it("never wrote anything outside its own tables", async () => {
    assert.equal(await countOf("shipment_requests"), ordersAtStart, "Phase 1 creates no orders");
  });
  it("error class is the module's own", () => {
    assert.ok(new BfmError("invalid") instanceof Error);
  });
});
