/**
 * Bring For Me cart. Carts belong to the signed-in user (every query is scoped by user_id taken
 * from the session, never from the request). Prices, currencies, weights and the screening
 * outcome are decided HERE, on the server:
 *   - an imported price is trusted only through the server-signed import proof;
 *   - everything the customer types is stored as "manual" with the customer's confirmation;
 *   - banned products are rejected before anything is stored;
 *   - items that cannot be classified are stored as needs_review and cannot be quoted until the
 *     owner approves them.
 * One shipment per cart in Phase 1; the limits are enforced here and exposed to the client.
 * No order, payment or purchase happens anywhere in this module.
 */
import type { Sql } from "@/lib/db";
import { auditLog } from "@/lib/compliance/service.server";
import type { CompiledRules } from "@/lib/compliance/check";
import { parseImportUrl } from "../../product-link/ssrf.ts";
import { cleanText, parsePriceToMinor } from "../../product-link/extract.ts";
import {
  CATEGORIES,
  CURRENCIES,
  GOVERNORATE_IDS,
  LIMITS,
  type Category,
  type Currency,
} from "./constants.ts";
import { BfmError } from "./errors.ts";
import { parseScaled } from "./input.ts";
import { verifyProof } from "./proof.ts";
import { screenItem } from "./screening.ts";
import { matchStore, type StoreRow } from "./store-match.ts";

export type CartCtx = {
  now: Date;
  /** QUOTE_SECRET; null = proofs cannot be verified, so every item is stored as customer-typed. */
  secret: string | null;
  rules: CompiledRules;
  stores: StoreRow[];
};

export type ItemRow = {
  id: string;
  store_key: string;
  store_name: string;
  store_known: boolean;
  source_url: string;
  source_host: string;
  title: string;
  image_url: string | null;
  price_minor: number | string;
  currency: string;
  quantity: number | string;
  options: string | null;
  category: string;
  weight_g: number | null;
  length_mm: number | null;
  width_mm: number | null;
  height_mm: number | null;
  origin: string;
  price_source: string;
  retrieved_at: string | Date | null;
  screening: string;
  review_reason: string | null;
};

export const ITEM_COLUMNS = `id, store_key, store_name, store_known, source_url, source_host, title, image_url,
  price_minor, currency, quantity, options, category, weight_g, length_mm, width_mm, height_mm,
  origin, price_source, retrieved_at, screening, review_reason`;

export function toClientItem(r: ItemRow) {
  return {
    id: r.id,
    storeKey: r.store_key,
    storeName: r.store_name,
    storeKnown: r.store_known,
    sourceUrl: r.source_url,
    title: r.title,
    imageUrl: r.image_url,
    priceMinor: Number(r.price_minor),
    currency: r.currency as Currency,
    quantity: Number(r.quantity),
    options: r.options,
    category: r.category as Category,
    weightG: r.weight_g,
    lengthMm: r.length_mm,
    widthMm: r.width_mm,
    heightMm: r.height_mm,
    origin: r.origin,
    priceSource: r.price_source,
    retrievedAt: r.retrieved_at ? new Date(r.retrieved_at).toISOString() : null,
    screening: r.screening,
    needsReview: r.screening === "needs_review",
    reviewReason: r.review_reason,
  };
}

export async function loadStores(sql: Sql): Promise<StoreRow[]> {
  const rows = await sql<{ key: string; name: string; domains: string[]; enabled: boolean }>`
    select key, name, domains, enabled from bfm_stores order by key`;
  return rows.map((r) => ({ key: r.key, name: r.name, domains: r.domains, enabled: r.enabled }));
}

export type CartHead = { id: string; governorate: string | null; couponCode: string | null };

export async function ensureCart(sql: Sql, userId: string): Promise<CartHead> {
  if (typeof userId !== "string" || !userId) throw new BfmError("forbidden");
  const rows = await sql<{ id: string; governorate: string | null; coupon_code: string | null }>`
    insert into bfm_carts (id, user_id) values (${crypto.randomUUID()}, ${userId})
    on conflict (user_id) do update set user_id = excluded.user_id
    returning id, governorate, coupon_code`;
  const r = rows[0]!;
  return { id: r.id, governorate: r.governorate, couponCode: r.coupon_code };
}

export async function activeItems(sql: Sql, cartId: string): Promise<ItemRow[]> {
  return sql.query<ItemRow>(
    `select ${ITEM_COLUMNS} from bfm_cart_items where cart_id = $1 and removed_at is null order by created_at, id`,
    [cartId],
  );
}

export function cartCounts(items: readonly { quantity: number | string; store_key: string }[]) {
  return {
    lines: items.length,
    pieces: items.reduce((n, i) => n + Number(i.quantity), 0),
    stores: new Set(items.map((i) => i.store_key)).size,
  };
}

/** What a client needs to show the cart, grouped by store, with the Phase 1 limits stated. */
export async function getCart(sql: Sql, userId: string) {
  const head = await ensureCart(sql, userId);
  const rows = await activeItems(sql, head.id);
  const groups = new Map<
    string,
    { storeKey: string; storeName: string; items: ReturnType<typeof toClientItem>[] }
  >();
  for (const r of rows) {
    const g = groups.get(r.store_key) ?? {
      storeKey: r.store_key,
      storeName: r.store_name,
      items: [],
    };
    g.items.push(toClientItem(r));
    groups.set(r.store_key, g);
  }
  return {
    cartId: head.id,
    destination: head.governorate,
    couponCode: head.couponCode,
    groups: [...groups.values()],
    counts: cartCounts(rows),
    needsReviewCount: rows.filter((r) => r.screening === "needs_review").length,
    // Phase 1 prices ONE shipment per cart; these limits are enforced by the server.
    shipments: 1 as const,
    limits: {
      maxLines: LIMITS.maxLines,
      maxPieces: LIMITS.maxPieces,
      maxDistinctStores: LIMITS.maxDistinctStores,
      maxQuantityPerLine: LIMITS.maxQuantityPerLine,
      maxItemWeightG: LIMITS.maxItemWeightG,
      maxShipmentChargeableG: LIMITS.maxShipmentChargeableG,
      maxDimMm: LIMITS.maxDimMm,
    },
    isEstimateOnly: true as const,
  };
}

const field = (name: string) => new BfmError("invalid", { field: name });

/** Plain single-line text that is refused, not silently cut, when it is too long. */
function strictText(value: unknown, max: number): string | null {
  const text = cleanText(value, max + 1);
  return text && text.length <= max ? text : null;
}

export async function addItem(
  sql: Sql,
  userId: string,
  input: Record<string, unknown>,
  ctx: CartCtx,
) {
  if (!input || typeof input !== "object") throw new BfmError("invalid");
  if (input.confirmed !== true) throw field("confirmed");

  const link = parseImportUrl(input.url);
  if (!link.ok) throw new BfmError("unsafe_url");
  const { url, host } = link.value;
  const sourceUrl = url.href;

  const title = strictText(input.title, 300);
  if (!title) throw field("title");
  const options =
    input.options == null || input.options === "" ? null : strictText(input.options, 200);
  if (input.options != null && input.options !== "" && !options) throw field("options");
  const priceMinor = parsePriceToMinor(input.price);
  if (priceMinor === null) throw field("price");
  if (
    typeof input.currency !== "string" ||
    !(CURRENCIES as readonly string[]).includes(input.currency)
  ) {
    throw field("currency");
  }
  const currency = input.currency as Currency;
  const quantity = input.quantity;
  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > LIMITS.maxQuantityPerLine
  ) {
    throw field("quantity");
  }
  if (
    typeof input.category !== "string" ||
    !(CATEGORIES as readonly string[]).includes(input.category)
  ) {
    throw field("category");
  }
  const category = input.category as Category;

  const weightG = parseScaled(input.weightKg, 3, 1, LIMITS.maxItemWeightG);
  const l = parseScaled(input.lengthCm, 1, 1, LIMITS.maxDimMm);
  const w = parseScaled(input.widthCm, 1, 1, LIMITS.maxDimMm);
  const h = parseScaled(input.heightCm, 1, 1, LIMITS.maxDimMm);
  if (weightG === undefined) throw field("weight");
  if (l === undefined || w === undefined || h === undefined) throw field("size");
  const given = [l, w, h].filter((v) => v !== null).length;
  if (given !== 0 && given !== 3) throw field("size"); // a partly given size is not a size

  // ---- provenance: trust an imported value only through the server's own signed proof
  let origin: "imported" | "imported_edited" | "manual" = "manual";
  let priceSource: "jsonld" | "opengraph" | "microdata" | "manual" = "manual";
  let retrievedAt: string | null = null;
  let imageUrl: string | null = null;
  let categoryTexts: string[] = [];
  if (input.proof !== undefined && input.proof !== null && ctx.secret) {
    const proof = await verifyProof(input.proof, ctx.secret, ctx.now.getTime());
    if (proof && proof.url === sourceUrl) {
      retrievedAt = proof.retrievedAt;
      imageUrl = proof.imageUrl; // only ever the server-read image, never one the client names
      categoryTexts = Array.isArray(proof.categoryTexts) ? proof.categoryTexts.slice(0, 12) : [];
      if (proof.priceMinor === priceMinor && proof.currency === currency && proof.priceSource) {
        origin = "imported";
        priceSource = proof.priceSource;
      } else {
        origin = "imported_edited"; // the customer changed the price or currency: their value
      }
    }
  }

  // ---- prohibited-product screening BEFORE anything is stored
  const screening = screenItem({ title, categoryTexts, category, options, url }, ctx.rules);
  if (screening.decision === "rejected") {
    // Time, category and domain only: no title, no URL, no image, no user.
    await auditLog(sql, "bfm_item_rejected", "bring_for_me", {
      category: screening.category,
      domain: host,
      at: ctx.now.toISOString(),
    });
    throw new BfmError("prohibited");
  }

  // ---- Phase 1 limits (one shipment per cart)
  const head = await ensureCart(sql, userId);
  const current = await activeItems(sql, head.id);
  const store = matchStore(host, ctx.stores);
  const counts = cartCounts(current);
  if (counts.lines + 1 > LIMITS.maxLines) throw new BfmError("limit", { limit: "lines" });
  if (counts.pieces + quantity > LIMITS.maxPieces) throw new BfmError("limit", { limit: "pieces" });
  const stores = new Set(current.map((i) => i.store_key)).add(store.key);
  if (stores.size > LIMITS.maxDistinctStores) throw new BfmError("limit", { limit: "stores" });

  const id = crypto.randomUUID();
  const reason = screening.decision === "needs_review" ? screening.reason : null;
  const rows = await sql.query<ItemRow>(
    `insert into bfm_cart_items (
       id, cart_id, store_key, store_name, store_known, source_url, source_host, title, image_url,
       price_minor, currency, quantity, options, category, weight_g, length_mm, width_mm, height_mm,
       origin, price_source, retrieved_at, confirmed_at, screening, review_reason)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
     returning ${ITEM_COLUMNS}`,
    [
      id,
      head.id,
      store.key,
      store.name,
      store.known,
      sourceUrl,
      host,
      title,
      imageUrl,
      priceMinor,
      currency,
      quantity,
      options,
      category,
      weightG,
      l,
      w,
      h,
      origin,
      priceSource,
      retrievedAt,
      ctx.now.toISOString(),
      screening.decision === "needs_review" ? "needs_review" : "clear",
      reason,
    ],
  );
  await sql`update bfm_carts set updated_at = now() where id = ${head.id}`;
  return { item: toClientItem(rows[0]!), needsReview: screening.decision === "needs_review" };
}

export async function setQuantity(sql: Sql, userId: string, itemId: unknown, quantity: unknown) {
  if (typeof itemId !== "string" || !itemId) throw new BfmError("invalid");
  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > LIMITS.maxQuantityPerLine
  ) {
    throw field("quantity");
  }
  const head = await ensureCart(sql, userId);
  const current = await activeItems(sql, head.id);
  const row = current.find((i) => i.id === itemId);
  if (!row) throw new BfmError("notfound");
  const pieces = cartCounts(current).pieces - Number(row.quantity) + quantity;
  if (pieces > LIMITS.maxPieces) throw new BfmError("limit", { limit: "pieces" });
  const rows = await sql.query<ItemRow>(
    `update bfm_cart_items set quantity = $1, updated_at = now()
     where id = $2 and cart_id = $3 and removed_at is null returning ${ITEM_COLUMNS}`,
    [quantity, itemId, head.id],
  );
  if (!rows[0]) throw new BfmError("notfound");
  await sql`update bfm_carts set updated_at = now() where id = ${head.id}`;
  return { item: toClientItem(rows[0]) };
}

/** Soft removal: the row stays for the audit trail, it just leaves the cart. */
export async function removeItem(sql: Sql, userId: string, itemId: unknown) {
  if (typeof itemId !== "string" || !itemId) throw new BfmError("invalid");
  const head = await ensureCart(sql, userId);
  const rows = await sql<{ id: string }>`
    update bfm_cart_items set removed_at = now(), updated_at = now()
    where id = ${itemId} and cart_id = ${head.id} and removed_at is null returning id`;
  if (!rows[0]) throw new BfmError("notfound");
  await sql`update bfm_carts set updated_at = now() where id = ${head.id}`;
  return { id: itemId };
}

/** The delivery governorate is always the customer's own choice; it is never assumed. */
export async function setDestination(sql: Sql, userId: string, governorate: unknown) {
  if (
    governorate !== null &&
    (typeof governorate !== "string" || !GOVERNORATE_IDS.has(governorate))
  ) {
    throw field("governorate");
  }
  const head = await ensureCart(sql, userId);
  await sql`update bfm_carts set governorate = ${governorate}, updated_at = now() where id = ${head.id}`;
  return { destination: governorate };
}

export async function setCoupon(sql: Sql, userId: string, code: unknown) {
  let clean: string | null = null;
  if (code !== null && code !== undefined && code !== "") {
    clean = typeof code === "string" ? code.trim().toUpperCase() : "";
    if (!/^[A-Z0-9_-]{3,32}$/.test(clean)) throw field("coupon");
  }
  const head = await ensureCart(sql, userId);
  await sql`update bfm_carts set coupon_code = ${clean}, updated_at = now() where id = ${head.id}`;
  return { couponCode: clean };
}
