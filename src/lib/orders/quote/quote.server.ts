/**
 * cartQuote: the one place a customer gets a cost ESTIMATE.
 *
 * - Prices, weights, rates and settings are all read from the database here; nothing the client
 *   sends reaches the calculator. The result of the pure calculateQuote() is stored as an
 *   immutable snapshot (items, settings used and their revisions, coupon, breakdown, version,
 *   expiry, destination, approval status).
 * - No total is returned while a required setting is missing or while an item still needs the
 *   owner's review.
 * - The same input (items, settings, destination, coupon) returns the same stored quote instead
 *   of piling up new versions.
 * - It is only an estimate until R&L reviews it. No order, payment or purchase is created.
 */
import type { Sql } from "@/lib/db";
import {
  calculateQuote,
  type Coupon,
  type Quote,
  type QuoteError,
  type QuoteItem,
} from "./calc.ts";
import { activeItems, ensureCart, type ItemRow } from "./cart.server.ts";
import { ENGINE_VERSION, LIMITS, type Category, type Currency } from "./constants.ts";
import { BfmError } from "./errors.ts";
import { buildSettings } from "./settings.ts";

export type CartQuoteError =
  | QuoteError
  | { code: "review_pending"; itemIds: string[] }
  | { code: "item_changed" };

type CouponRow = {
  code: string;
  kind: "fixed_iqd" | "percent_bp";
  value: number | string;
  max_discount_iqd: number | string | null;
  min_items_iqd: number | string | null;
  starts_at: string | Date | null;
  expires_at: string | Date;
  active: boolean;
};

const num = (v: number | string | null) => (v === null ? null : Number(v));
const iso = (v: string | Date | null) => (v === null ? null : new Date(v).toISOString());

function toCoupon(r: CouponRow): Coupon {
  return {
    code: r.code,
    kind: r.kind,
    value: Number(r.value),
    maxDiscountIqd: num(r.max_discount_iqd),
    minItemsIqd: num(r.min_items_iqd),
    startsAt: iso(r.starts_at),
    expiresAt: iso(r.expires_at),
    active: r.active,
  };
}

function toQuoteItem(r: ItemRow): QuoteItem {
  return {
    id: r.id,
    storeKey: r.store_key,
    priceMinor: Number(r.price_minor),
    currency: r.currency as Currency,
    quantity: Number(r.quantity),
    category: r.category as Category,
    weightG: r.weight_g,
    lengthMm: r.length_mm,
    widthMm: r.width_mm,
    heightMm: r.height_mm,
  };
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Stable JSON (sorted keys) so equal inputs always hash equally. */
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stable(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function itemSnapshot(r: ItemRow) {
  return {
    id: r.id,
    title: r.title,
    storeKey: r.store_key,
    sourceUrl: r.source_url,
    priceMinor: Number(r.price_minor),
    currency: r.currency,
    quantity: Number(r.quantity),
    options: r.options,
    category: r.category,
    weightG: r.weight_g,
    lengthMm: r.length_mm,
    widthMm: r.width_mm,
    heightMm: r.height_mm,
    origin: r.origin,
    priceSource: r.price_source,
    retrievedAt: r.retrieved_at ? new Date(r.retrieved_at).toISOString() : null,
    screening: r.screening,
  };
}

type Stored = {
  id: string;
  version: number | string;
  approval_status: string;
  created_at: string | Date;
  expires_at: string | Date;
  quote: Quote;
  items_snapshot: ReturnType<typeof itemSnapshot>[];
  governorate: string;
};

function present(row: Stored, now: Date) {
  const items = row.items_snapshot;
  const byId = new Map(items.map((i) => [i.id, i]));
  const groups = new Map<string, { storeKey: string; items: object[] }>();
  for (const line of row.quote.lines) {
    const item = byId.get(line.id);
    if (!item) continue;
    const g = groups.get(item.storeKey) ?? { storeKey: item.storeKey, items: [] };
    g.items.push({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      priceMinor: item.priceMinor,
      currency: item.currency,
      itemsIqd: line.itemsIqd,
      customsIqd: line.customsIqd,
      chargeableG: line.chargeableG,
      weightSource: line.weightSource,
      sizeSource: line.sizeSource,
    });
    groups.set(item.storeKey, g);
  }
  const expiresAt = new Date(row.expires_at);
  return {
    id: row.id,
    version: Number(row.version),
    isEstimate: true as const,
    approvalStatus: row.approval_status,
    createdAt: new Date(row.created_at).toISOString(),
    expiresAt: expiresAt.toISOString(),
    expired: expiresAt.getTime() <= now.getTime(),
    validityHours: row.quote.validityHours,
    destination: row.quote.destination,
    breakdown: row.quote.breakdown,
    freight: row.quote.freight,
    freeDelivery: row.quote.freeDelivery,
    coupon: row.quote.coupon,
    groups: [...groups.values()],
    ratesUsed: row.quote.settingsUsed,
    rounding: row.quote.rounding,
    shipments: 1 as const,
    limits: {
      maxLines: LIMITS.maxLines,
      maxPieces: LIMITS.maxPieces,
      maxDistinctStores: LIMITS.maxDistinctStores,
      maxShipmentChargeableG: LIMITS.maxShipmentChargeableG,
    },
    notice: "estimate_until_rl_approval" as const,
  };
}

export type CartQuoteResult =
  | { ok: true; quote: ReturnType<typeof present>; reused: boolean }
  | { ok: false; error: CartQuoteError };

export async function cartQuote(sql: Sql, userId: string, now: Date): Promise<CartQuoteResult> {
  const head = await ensureCart(sql, userId);
  const rows = await activeItems(sql, head.id);
  if (!rows.length) return { ok: false, error: { code: "empty_cart" } };
  const pending = rows.filter((r) => r.screening === "needs_review").map((r) => r.id);
  if (pending.length) return { ok: false, error: { code: "review_pending", itemIds: pending } };

  const settingRows = await sql<{ key: string; value: unknown; revision: number | string }>`
    select key, value, revision from bfm_settings`;
  const settings = buildSettings(settingRows.map((r) => ({ key: r.key, value: r.value })));

  let coupon: Coupon | null = null;
  let couponRow: CouponRow | null = null;
  if (head.couponCode) {
    const found = await sql<CouponRow>`
      select code, kind, value, max_discount_iqd, min_items_iqd, starts_at, expires_at, active
      from bfm_coupons where code = ${head.couponCode}`;
    couponRow = found[0] ?? null;
    if (!couponRow) return { ok: false, error: { code: "coupon_not_eligible", reason: "unknown" } };
    coupon = toCoupon(couponRow);
  }

  const result = calculateQuote(rows.map(toQuoteItem), settings, {
    governorate: head.governorate,
    coupon,
    now,
  });
  if (!result.ok) return { ok: false, error: result.error };
  const q = result.quote;

  const revisions: Record<string, number> = {};
  for (const r of settingRows) if (r.key in q.settingsUsed) revisions[r.key] = Number(r.revision);
  const itemsSnap = rows.map(itemSnapshot);
  const settingsSnap = {
    values: q.settingsUsed,
    revisions,
    coupon: couponRow ? toCoupon(couponRow) : null,
  };
  const inputHash = await sha256Hex(
    stable({
      engine: ENGINE_VERSION,
      gov: head.governorate,
      items: itemsSnap,
      settings: settingsSnap,
    }),
  );

  const reuse = async () => {
    const existing = await sql<Stored>`
      select id, version, approval_status, created_at, expires_at, quote, items_snapshot, governorate
      from bfm_quotes
      where cart_id = ${head.id} and input_hash = ${inputHash} and expires_at > ${now.toISOString()}
      order by version desc limit 1`;
    return existing[0] ?? null;
  };
  const same = await reuse();
  if (same) return { ok: true, quote: present(same, now), reused: true };

  const b = q.breakdown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const inserted = await sql<Stored>`
        insert into bfm_quotes (
          id, user_id, cart_id, version, input_hash, engine_version, governorate, zone,
          items_iqd, customs_iqd, freight_iqd, rl_fee_iqd, home_delivery_iqd, coupon_iqd,
          raw_total_iqd, total_iqd, coupon_code, quote, settings_snapshot, items_snapshot, expires_at)
        select ${crypto.randomUUID()}::text, ${userId}::text, ${head.id}::text, coalesce(max(version), 0) + 1,
          ${inputHash}::text, ${ENGINE_VERSION}::int, ${q.destination.governorate}::text, ${q.destination.zone}::text,
          ${b.itemsIqd}::bigint, ${b.customsIqd}::bigint, ${b.freightIqd}::bigint, ${b.rlFeeIqd}::bigint,
          ${b.homeDeliveryIqd}::bigint, ${b.couponIqd}::bigint, ${b.rawTotalIqd}::bigint, ${b.totalIqd}::bigint,
          ${q.coupon?.code ?? null}::text, ${JSON.stringify(q)}::jsonb, ${JSON.stringify(settingsSnap)}::jsonb,
          ${JSON.stringify(itemsSnap)}::jsonb, ${q.expiresAt}::timestamptz
        from bfm_quotes where cart_id = ${head.id}
        returning id, version, approval_status, created_at, expires_at, quote, items_snapshot, governorate`;
      return { ok: true, quote: present(inserted[0]!, now), reused: false };
    } catch (err) {
      // Two simultaneous requests picked the same version: the unique key refused one of them.
      const again = await reuse();
      if (again) return { ok: true, quote: present(again, now), reused: true };
      if (attempt === 1) throw err;
    }
  }
  throw new BfmError("unavailable");
}

/** A stored quote, only for its owner. Includes `expired` so the client never shows a stale total as live. */
export async function getQuote(sql: Sql, userId: string, quoteId: unknown, now: Date) {
  if (typeof quoteId !== "string" || !quoteId) throw new BfmError("invalid");
  const rows = await sql<Stored>`
    select id, version, approval_status, created_at, expires_at, quote, items_snapshot, governorate
    from bfm_quotes where id = ${quoteId} and user_id = ${userId}`;
  if (!rows[0]) throw new BfmError("notfound");
  return present(rows[0], now);
}
