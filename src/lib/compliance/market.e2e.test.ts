import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { register } from "node:module";
import { describe, it } from "node:test";
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

const market = await import("../market/handlers.server.ts");
const service = await import("./service.server.ts");
const sql = await getSql();

const seller = "compliance-seller";
const admin = "compliance-admin";
await sql`insert into user_roles (user_id, role, status, display_name) values (${seller}, 'seller', 'approved', 'Shop'), (${admin}, 'admin', 'approved', 'Admin')`;

const base = {
  nameKu: "کاڵا",
  brand: "Brand",
  category: "home",
  description: "",
  specs: "",
  price: 10000,
  shipping: 0,
  stock: "in",
  contact: "tel:+9647501111111",
};
const statusOf = async (slug: string) =>
  (
    await sql<{
      status: string;
      compliance_status: string;
    }>`select status, compliance_status from products where slug = ${slug}`
  )[0];

describe("compliance: market writes", () => {
  it("rejects a clearly prohibited product (any field) and logs it", async () => {
    const before = (await sql<{ n: number }>`select count(*)::int n from products`)[0]?.n;
    for (const p of [
      { nameEn: "Vodka gift box" },
      { nameEn: "Gift box", description: "with whisky glasses and a bottle of whisky" },
      { nameEn: "Gift box", brand: "Marlboro cigarettes" },
      { nameEn: "Party set", specs: "flavour: rum" },
      { nameEn: "Gift", nameKu: "جگەرە" },
    ]) {
      await assert.rejects(
        market.saveProduct(seller, { ...base, ...p }),
        (e: Error & { code?: string }) => e.code === "prohibited",
      );
    }
    const n = (await sql<{ n: number }>`select count(*)::int n from products`)[0]?.n;
    assert.equal(n, before);
    const logged = (
      await sql<{
        n: number;
      }>`select count(*)::int n from compliance_audit_log where action = 'rejected_product'`
    )[0]?.n;
    assert.equal(logged, 5);
  });

  it("allows normal products; ginger and hammer are not gin and ham", async () => {
    const a = await market.saveProduct(seller, { ...base, nameEn: "Ginger tea" });
    const b = await market.saveProduct(seller, {
      ...base,
      nameEn: "Hammer drill",
      category: "home",
    });
    assert.equal((await statusOf(a.slug))?.compliance_status, "ok");
    assert.equal(b.review, false);
  });

  it("sends unclear wording to pending_review, unpublished; admin can clear it after review", async () => {
    const r = await market.saveProduct(seller, { ...base, nameEn: "Alcohol-free beer" });
    assert.equal(r.review, true);
    assert.deepEqual(await statusOf(r.slug), {
      status: "pending",
      compliance_status: "pending_review",
    });
    // the DB refuses to publish a non-ok product even by a direct update
    await sql`update products set status = 'approved' where slug = ${r.slug} and compliance_status = 'pending_review'`;
    assert.equal((await statusOf(r.slug))?.status, "pending");
    // a human approval clears the review flag
    const w = await market.saveProduct(seller, { ...base, nameEn: "Alcohol wipes" });
    await market.adminSet(admin, { kind: "product", id: w.slug, status: "approved" });
    assert.deepEqual(await statusOf(w.slug), { status: "approved", compliance_status: "ok" });
  });

  it("admin cannot approve a product that contains a prohibited word", async () => {
    // simulate a row written before the check existed
    await sql`insert into products (id, slug, owner_id, category_id, name_ku, name_en, brand) values ('old', 'old-beer', ${seller}, 'home', 'x', 'Beer crate', 'x')`;
    await assert.rejects(
      market.adminSet(admin, { kind: "product", id: "old-beer", status: "approved" }),
      (e: Error & { code?: string }) => e.code === "prohibited",
    );
    assert.equal((await statusOf("old-beer"))?.status, "pending");
  });

  it("bulk import gate drops prohibited rows and routes unclear ones to review", async () => {
    const out = await service.screenProducts(null, [
      { title: "Nivea Creme", brand: "Nivea" },
      { title: "Bacon bits" },
      { title: "Gift", category: "Wein & Spirituosen" },
      { title: "Gelatin sheets" },
    ]);
    assert.deepEqual(
      out.accepted.map((p) => p.title),
      ["Nivea Creme"],
    );
    assert.deepEqual(
      out.rejected.map((r) => r.item.title),
      ["Bacon bits", "Gift"],
    );
    assert.deepEqual(
      out.review.map((r) => r.item.title),
      ["Gelatin sheets"],
    );
  });

  it("uses DB keywords on top of the bundled list", async () => {
    await sql`insert into prohibited_keywords (category_id, keyword, language) select id, 'zzforbidden', 'en' from prohibited_categories where slug = 'drugs'`;
    service.resetComplianceCache();
    await assert.rejects(
      market.saveProduct(seller, { ...base, nameEn: "zzforbidden kit" }),
      (e: Error & { code?: string }) => e.code === "prohibited",
    );
    // without a DB the bundled list still protects
    assert.equal((await service.checkTextServer(null, "vodka")).decision, "block");
  });
});

describe("compliance: market search and detail", () => {
  it("never lists prohibited or pending_review products, and a prohibited query returns nothing", async () => {
    // legacy rows written before the check existed (approved, compliance 'ok' by default)
    await sql`insert into products (id, slug, owner_id, category_id, name_ku, name_en, brand, status) values
      ('legacy-1', 'legacy-vodka', ${seller}, 'home', 'x', 'Vodka set', 'Brand', 'approved'),
      ('legacy-2', 'legacy-mug', ${seller}, 'home', 'x', 'Ginger mug', 'Brand', 'approved')`;
    const r = await market.saveProduct(seller, { ...base, nameEn: "Gelatin dessert mix" });
    await sql`update products set status = 'approved' where slug = ${r.slug}`; // the DB guard keeps it pending
    const all = await market.listProducts({});
    const slugs = all.items.map((i) => i.slug);
    assert.ok(!slugs.includes("legacy-vodka"));
    assert.ok(!slugs.includes(r.slug));
    for (const q of ["vodka", "جگەرە", "sigara", "خمر", "Vodka set"]) {
      const res = await market.listProducts({ q });
      assert.equal(res.items.length, 0, q);
    }
    assert.deepEqual(
      (await market.listProducts({ q: "ginger" })).items.map((i) => i.slug),
      ["legacy-mug"],
    );
    await assert.rejects(
      market.getProduct("legacy-vodka", null),
      (e: Error & { code?: string }) => e.code === "notfound",
    );
    await assert.rejects(
      market.getProduct(r.slug, null),
      (e: Error & { code?: string }) => e.code === "notfound",
    );
  });
});
