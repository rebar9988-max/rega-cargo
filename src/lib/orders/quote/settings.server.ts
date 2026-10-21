/**
 * Owner-editable Bring For Me settings, the audit history, coupons and the review queue.
 * Every write here is SUPER_ADMIN only (read from user_roles on every call, never from the
 * client). Settings changes are recorded by a database trigger (bfm_settings_history), so the
 * history cannot be skipped by a code path; coupon and review actions go to bfm_audit_log.
 * Nothing is ever deleted: settings are cleared (NULL), coupons deactivated, items soft-removed.
 */
import type { Sql } from "@/lib/db";
import { requireStaff, requireSuperAdmin } from "@/lib/auth/authority.server";
import { BfmError } from "./errors.ts";
import {
  buildSettings,
  describeSettings,
  parseSettingValue,
  unfilledKeys,
  type SettingRow,
} from "./settings.ts";
import type { QuoteSettings } from "./calc.ts";

type StoredRow = { key: string; value: unknown; revision: number | string };

export async function loadSettingRows(sql: Sql): Promise<SettingRow[]> {
  const rows = await sql<StoredRow>`select key, value, revision from bfm_settings`;
  return rows.map((r) => ({ key: r.key, value: r.value }));
}

export async function loadSettings(sql: Sql): Promise<QuoteSettings> {
  return buildSettings(await loadSettingRows(sql));
}

export async function adminListSettings(sql: Sql, actorId: string) {
  await requireSuperAdmin(sql, actorId);
  const rows = await sql<StoredRow>`select key, value, revision from bfm_settings`;
  const status = describeSettings(
    rows.map((r) => ({ key: r.key, value: r.value, revision: Number(r.revision) })),
  );
  const missing = unfilledKeys(rows.map((r) => ({ key: r.key, value: r.value })));
  return { settings: status, unfilledCount: missing.length };
}

export type SettingEntry = { key: unknown; value: unknown; expectedRevision?: unknown };

/** Validates every entry first, then applies them one by one (each is a single atomic statement). */
export async function adminSetSettings(sql: Sql, actorId: string, entries: unknown) {
  await requireSuperAdmin(sql, actorId);
  if (!Array.isArray(entries) || entries.length < 1 || entries.length > 300)
    throw new BfmError("invalid");
  const parsed = (entries as SettingEntry[]).map((e) => {
    if (!e || typeof e !== "object" || typeof e.key !== "string") throw new BfmError("invalid");
    const v = parseSettingValue(e.key, e.value);
    if (!v.ok) throw new BfmError("invalid", { key: e.key });
    const rev = e.expectedRevision;
    if (rev !== undefined && rev !== null && (!Number.isSafeInteger(rev) || (rev as number) < 0)) {
      throw new BfmError("invalid", { key: e.key });
    }
    return { key: e.key, value: v.value, expectedRevision: (rev ?? null) as number | null };
  });
  if (new Set(parsed.map((p) => p.key)).size !== parsed.length) throw new BfmError("invalid");

  const applied: { key: string; revision: number }[] = [];
  for (const p of parsed) {
    const json = p.value === null ? null : JSON.stringify(p.value);
    // The trigger writes the history row (old value, new value, revision, actor) in the same statement.
    const rows = await sql<{ revision: number | string }>`
      insert into bfm_settings (key, value, revision, updated_by, updated_at)
      values (${p.key}, ${json}::jsonb, 1, ${actorId}, now())
      on conflict (key) do update
        set value = excluded.value,
            revision = bfm_settings.revision + 1,
            updated_by = excluded.updated_by,
            updated_at = now()
        where ${p.expectedRevision}::int is null or bfm_settings.revision = ${p.expectedRevision}::int
      returning revision`;
    if (!rows[0]) throw new BfmError("conflict", { key: p.key });
    applied.push({ key: p.key, revision: Number(rows[0].revision) });
  }
  return { applied };
}

/** Settings hold only a number, a string or nothing (enforced by the table); keep that type. */
function settingValue(v: unknown): string | number | null {
  return typeof v === "string" || typeof v === "number" ? v : null;
}

function iso(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const d = new Date(v as string | number | Date);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export async function adminSettingsHistory(sql: Sql, actorId: string, key?: unknown) {
  await requireSuperAdmin(sql, actorId);
  if (key !== undefined && key !== null && typeof key !== "string") throw new BfmError("invalid");
  const rows = await sql<{
    id: number | string;
    key: string;
    old_value: unknown;
    new_value: unknown;
    revision: number | string;
    actor_id: string;
    created_at: string | Date;
  }>`
    select id, key, old_value, new_value, revision, actor_id, created_at
    from bfm_settings_history
    where (${key ?? null}::text is null or key = ${key ?? null}::text)
    order by id desc limit 200`;
  return {
    history: rows.map((r) => ({
      id: Number(r.id),
      key: r.key,
      oldValue: settingValue(r.old_value),
      newValue: settingValue(r.new_value),
      revision: Number(r.revision),
      actorId: r.actor_id,
      at: new Date(r.created_at).toISOString(),
    })),
  };
}

// ----------------------------------------------------------------------------------- audit

async function audit(
  sql: Sql,
  actor: string,
  action: string,
  resource: string,
  id: string,
  details: object,
) {
  await sql`insert into bfm_audit_log (actor_id, action, resource, resource_id, details)
    values (${actor}, ${action}, ${resource}, ${id}, ${JSON.stringify(details)}::jsonb)`;
}

// ----------------------------------------------------------------------------------- coupons

const COUPON_CODE = /^[A-Z0-9_-]{3,32}$/;
const intIn = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= min && v <= max ? v : null;

export async function adminCreateCoupon(sql: Sql, actorId: string, input: Record<string, unknown>) {
  await requireSuperAdmin(sql, actorId);
  const code = typeof input.code === "string" ? input.code.trim().toUpperCase() : "";
  if (!COUPON_CODE.test(code)) throw new BfmError("invalid", { field: "code" });
  const kind = input.kind;
  if (kind !== "fixed_iqd" && kind !== "percent_bp")
    throw new BfmError("invalid", { field: "kind" });
  const value = intIn(input.value, 1, kind === "percent_bp" ? 10_000 : 100_000_000);
  if (value === null) throw new BfmError("invalid", { field: "value" });
  const maxDiscount =
    input.maxDiscountIqd == null ? null : intIn(input.maxDiscountIqd, 1, 100_000_000);
  if (input.maxDiscountIqd != null && maxDiscount === null)
    throw new BfmError("invalid", { field: "maxDiscountIqd" });
  const minItems = input.minItemsIqd == null ? null : intIn(input.minItemsIqd, 1, 10_000_000_000);
  if (input.minItemsIqd != null && minItems === null)
    throw new BfmError("invalid", { field: "minItemsIqd" });
  const expires = typeof input.expiresAt === "string" ? new Date(input.expiresAt) : null;
  if (!expires || Number.isNaN(expires.getTime()))
    throw new BfmError("invalid", { field: "expiresAt" });
  const starts = input.startsAt == null ? null : new Date(String(input.startsAt));
  if (starts && (Number.isNaN(starts.getTime()) || starts >= expires))
    throw new BfmError("invalid", { field: "startsAt" });

  const rows = await sql<{ code: string }>`
    insert into bfm_coupons (code, kind, value, max_discount_iqd, min_items_iqd, starts_at, expires_at, created_by)
    values (${code}, ${kind}, ${value}, ${maxDiscount}, ${minItems}, ${starts?.toISOString() ?? null}, ${expires.toISOString()}, ${actorId})
    on conflict (code) do nothing returning code`;
  if (!rows[0]) throw new BfmError("conflict", { field: "code" });
  await audit(sql, actorId, "coupon_create", "coupon", code, {
    kind,
    value,
    maxDiscount,
    minItems,
  });
  return { code };
}

export async function adminDeactivateCoupon(sql: Sql, actorId: string, codeIn: unknown) {
  await requireSuperAdmin(sql, actorId);
  const code = typeof codeIn === "string" ? codeIn.trim().toUpperCase() : "";
  if (!COUPON_CODE.test(code)) throw new BfmError("invalid");
  const rows = await sql<{
    code: string;
  }>`update bfm_coupons set active = false where code = ${code} returning code`;
  if (!rows[0]) throw new BfmError("notfound");
  await audit(sql, actorId, "coupon_deactivate", "coupon", code, {});
  return { code };
}

export async function adminListCoupons(sql: Sql, actorId: string) {
  await requireSuperAdmin(sql, actorId);
  const rows = await sql<{
    code: string;
    kind: string;
    value: number | string;
    max_discount_iqd: number | string | null;
    min_items_iqd: number | string | null;
    starts_at: string | Date | null;
    expires_at: string | Date;
    active: boolean;
    created_at: string | Date;
  }>`
    select code, kind, value, max_discount_iqd, min_items_iqd, starts_at, expires_at, active, created_at
    from bfm_coupons order by created_at desc limit 200`;
  const num = (v: number | string | null) => (v === null ? null : Number(v));
  return {
    coupons: rows.map((r) => ({
      code: r.code,
      kind: r.kind,
      value: Number(r.value),
      maxDiscountIqd: num(r.max_discount_iqd),
      minItemsIqd: num(r.min_items_iqd),
      startsAt: iso(r.starts_at),
      expiresAt: iso(r.expires_at),
      active: r.active === true,
      createdAt: iso(r.created_at),
    })),
  };
}

// ------------------------------------------------------------------------------- review queue

export async function adminReviewQueue(sql: Sql, actorId: string) {
  await requireSuperAdmin(sql, actorId);
  const rows = await sql<{
    id: string;
    store_name: string;
    source_host: string;
    title: string;
    category: string;
    quantity: number | string;
    review_reason: string | null;
    created_at: string | Date;
  }>`
    select id, store_name, source_host, title, category, quantity, review_reason, created_at
    from bfm_cart_items
    where screening = 'needs_review' and removed_at is null
    order by created_at asc limit 100`;
  return {
    items: rows.map((r) => ({
      id: r.id,
      storeName: r.store_name,
      sourceHost: r.source_host,
      title: r.title,
      category: r.category,
      quantity: Number(r.quantity),
      reviewReason: r.review_reason,
      createdAt: iso(r.created_at),
    })),
  };
}

export async function adminDecideReview(
  sql: Sql,
  actorId: string,
  itemId: unknown,
  decision: unknown,
) {
  await requireSuperAdmin(sql, actorId);
  if (typeof itemId !== "string" || !itemId || (decision !== "approve" && decision !== "reject")) {
    throw new BfmError("invalid");
  }
  const rows =
    decision === "approve"
      ? await sql<{ id: string }>`
          update bfm_cart_items
          set screening = 'owner_approved', reviewed_by = ${actorId}, reviewed_at = now(), updated_at = now()
          where id = ${itemId} and screening = 'needs_review' and removed_at is null returning id`
      : await sql<{ id: string }>`
          update bfm_cart_items
          set removed_at = now(), reviewed_by = ${actorId}, reviewed_at = now(), updated_at = now()
          where id = ${itemId} and screening = 'needs_review' and removed_at is null returning id`;
  if (!rows[0]) throw new BfmError("notfound");
  await audit(sql, actorId, `review_${decision}`, "cart_item", itemId, {});
  return { id: itemId, decision };
}

// ----------------------------------------------------------------------------- quote approval

/** R&L staff reviews a stored estimate. Phase 1: this records the decision only, nothing else. */
export async function staffDecideQuote(
  sql: Sql,
  actorId: string,
  quoteId: unknown,
  decision: unknown,
) {
  await requireStaff(sql, actorId);
  if (
    typeof quoteId !== "string" ||
    !quoteId ||
    (decision !== "approve" && decision !== "reject")
  ) {
    throw new BfmError("invalid");
  }
  const status = decision === "approve" ? "approved" : "rejected";
  const rows = await sql<{ id: string }>`
    update bfm_quotes set approval_status = ${status}, approved_by = ${actorId}, approved_at = now()
    where id = ${quoteId} and approval_status = 'pending' returning id`;
  if (!rows[0]) throw new BfmError("notfound");
  await audit(sql, actorId, `quote_${decision}`, "quote", quoteId, {});
  return { id: quoteId, approvalStatus: status };
}
