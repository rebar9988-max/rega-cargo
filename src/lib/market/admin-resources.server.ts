import { z } from "zod";
import type { ResourceSpec } from "../admin/resource.server";
import { MarketError, cleanContact, cleanImage } from "../market";
import { checkProductServer, checkTextServer } from "../compliance/service.server";

const text = z.string().trim().min(1).max(1000);
const status = z.enum(["pending", "approved", "removed"]);
const product = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]{1,80}$/),
    category_id: z.enum(["beauty", "fashion", "electronics", "home", "baby", "sports"]),
    name_ku: text.max(80),
    name_en: text.max(80),
    brand: text.max(40),
    description_ku: z.string().max(1000).default(""),
    specs: z.string().max(300).default(""),
    image: z.string().max(300).nullable().default(null),
    status: status.default("pending"),
  })
  .strict();
const offer = z
  .object({
    product_id: text.max(80),
    price_iqd: z.number().int().min(1).max(50000000),
    shipping_iqd: z.number().int().min(0).max(5000000),
    stock: z.enum(["in", "low", "out"]),
    contact: text.max(200),
    status: status.default("pending"),
  })
  .strict();
const archive = () => ({ status: "removed", archived_at: new Date().toISOString() });

export const marketAdminResources: Record<string, ResourceSpec> = {
  products: {
    module: "market",
    table: "products",
    keys: ["id"],
    columns: [
      "id",
      "slug",
      "owner_id",
      "category_id",
      "name_ku",
      "name_en",
      "brand",
      "description_ku",
      "specs",
      "image",
      "status",
      "compliance_status",
      "created_at",
      "archived_at",
    ],
    create: product,
    update: product.partial(),
    defaults: (actor) => ({ id: crypto.randomUUID(), owner_id: actor }),
    remove: archive,
    async prepare(sql, _actor, data, current, op) {
      if (op === "delete") return data;
      const merged = { ...current, ...data };
      if ("image" in data) data.image = cleanImage(data.image);
      const result = await checkProductServer(sql, {
        title: String(merged.name_en),
        titleKu: String(merged.name_ku),
        brand: String(merged.brand),
        category: String(merged.category_id),
        description: String(merged.description_ku ?? ""),
        attributes: String(merged.specs ?? ""),
      });
      if (result.decision === "block" || merged.compliance_status === "blocked")
        throw new MarketError("prohibited");
      return {
        ...data,
        compliance_status: result.decision === "review" ? "pending_review" : "ok",
        ...(result.decision === "review" ? { status: "pending" } : {}),
      };
    },
  },
  offers: {
    module: "market",
    table: "offers",
    keys: ["id"],
    columns: [
      "id",
      "product_id",
      "seller_id",
      "price_iqd",
      "shipping_iqd",
      "stock",
      "contact",
      "status",
      "created_at",
      "updated_at",
      "archived_at",
    ],
    create: offer,
    update: offer.partial(),
    defaults: (actor) => ({ id: crypto.randomUUID(), seller_id: actor }),
    remove: archive,
    async prepare(sql, _actor, data, current, op) {
      if (op === "delete") return data;
      if (data.contact) data.contact = cleanContact(data.contact);
      if ((await checkTextServer(sql, String(data.contact ?? ""))).decision === "block")
        throw new MarketError("prohibited");
      const id = data.product_id ?? current?.product_id;
      const products =
        await sql`select id from products where id = ${id} and compliance_status = 'ok' and status <> 'removed'`;
      if (!products[0]) throw new MarketError("prohibited");
      return { ...data, updated_at: new Date().toISOString() };
    },
    effects({ current, data, operation, param }) {
      if (operation === "delete") return "";
      const priceChanged =
        !current ||
        Number(data.price_iqd ?? current.price_iqd) !== Number(current.price_iqd) ||
        Number(data.shipping_iqd ?? current.shipping_iqd) !== Number(current.shipping_iqd);
      const history = priceChanged
        ? `, price_record as (insert into price_history(id, offer_id, price_iqd, shipping_iqd) select ${param(crypto.randomUUID())}, changed.id, changed.price_iqd, changed.shipping_iqd from changed returning id)`
        : "";
      return (
        history +
        `, alerts as (update price_alerts a set notified = true from changed, products p
        where a.product_id = changed.product_id and p.id = changed.product_id and p.status = 'approved' and p.compliance_status = 'ok'
          and changed.status = 'approved' and changed.stock <> 'out' and a.notified = false
          and changed.price_iqd + changed.shipping_iqd <= a.target_iqd
          and exists(select 1 from user_roles r where r.user_id = changed.seller_id and r.role in ('seller','super_admin') and r.status = 'approved')
        returning a.id, a.user_id), alert_notifications as (insert into notifications(id, user_id, body_ku, body_en)
        select md5(alerts.id || ':admin-price'), alerts.user_id, 'نرخی کاڵای چاودێریکراو نوێ بووەوە؛ لە بازاڕ پشکنە.', 'A watched product price was updated; review the marketplace.' from alerts on conflict(id) do nothing returning id)`
      );
    },
  },
  categories: {
    module: "market",
    table: "categories",
    keys: ["id"],
    columns: ["id", "name_ku", "name_en", "archived_at"],
    create: z
      .object({
        id: z.enum(["beauty", "fashion", "electronics", "home", "baby", "sports"]),
        name_ku: text.max(80),
        name_en: text.max(80),
      })
      .strict(),
    update: z.object({ name_ku: text.max(80), name_en: text.max(80) }).strict(),
    remove: () => ({ archived_at: new Date().toISOString() }),
  },
  reviews: {
    module: "market",
    table: "reviews",
    keys: ["id"],
    columns: [
      "id",
      "user_id",
      "product_id",
      "rating",
      "body",
      "status",
      "created_at",
      "archived_at",
    ],
    create: z
      .object({
        product_id: text.max(80),
        rating: z.number().int().min(1).max(5),
        body: text.max(1000),
      })
      .strict(),
    update: z
      .object({
        rating: z.number().int().min(1).max(5).optional(),
        body: text.max(1000).optional(),
        status: status.optional(),
      })
      .strict(),
    defaults: (actor) => ({ id: crypto.randomUUID(), user_id: actor, status: "pending" }),
    remove: archive,
    async prepare(sql, _actor, data, _current, operation) {
      if (
        operation !== "delete" &&
        (await checkTextServer(sql, String(data.body ?? ""))).decision === "block"
      )
        throw new MarketError("prohibited");
      return data;
    },
  },
  reports: {
    module: "market",
    table: "reports",
    keys: ["id"],
    columns: ["id", "user_id", "subject", "body", "status", "created_at", "archived_at"],
    create: z.object({ subject: text.max(100), body: text.max(2000) }).strict(),
    update: z.object({ status: z.enum(["open", "closed"]) }).strict(),
    defaults: (actor) => ({ id: crypto.randomUUID(), user_id: actor }),
    remove: () => ({ archived_at: new Date().toISOString() }),
  },
};
