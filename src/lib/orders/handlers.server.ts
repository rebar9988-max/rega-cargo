import { getSql } from "@/lib/db";
import { auditLog, checkTextServer } from "@/lib/compliance/service.server";
import { MarketError, cleanOptional, cleanText } from "@/lib/market";
import { phoneMe } from "@/lib/phone/session.server";
import { newTrackingId, publicTrackingId } from "./tracking-id";

/** Version of the restricted-items declaration text the user accepted. */
export const DECLARATION_VERSION = "2026-10-09";

function dbUnavailable(err: unknown) {
  return err instanceof Error && /Database not configured|getSql/i.test(err.message);
}

async function rate(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ allowed: boolean }>`
    insert into rate_counters (key, n, window_start, allowed)
    values (${`order:hour:${userId}`}, 1, now(), true)
    on conflict (key) do update set
      allowed = case
        when rate_counters.window_start < now() - interval '1 hour' then true
        when rate_counters.n < 10 then true
        else false
      end,
      window_start = case
        when rate_counters.window_start < now() - interval '1 hour' then now()
        else rate_counters.window_start
      end,
      n = case
        when rate_counters.window_start < now() - interval '1 hour' then 1
        when rate_counters.n < 10 then rate_counters.n + 1
        else rate_counters.n
      end
    returning allowed`;
  if (rows[0]?.allowed !== true) throw new MarketError("rate");
}

export async function submitRequest(
  userId: string,
  kind: "quote" | "store" | "buy" | "forward",
  payload: Record<string, unknown>,
  estimateEur: number | null,
  options: { idempotencyKey?: string | null } = {},
) {
  const key = options.idempotencyKey ?? null;
  try {
    let me: { name?: string; phone?: string } | null = null;
    try {
      me = await phoneMe();
    } catch {
      me = null;
    }
    if (!me) {
      // No request context (e.g. called from a test or a job): use the stored phone account.
      const sqlForUser = await getSql();
      const rows = await sqlForUser<{
        name: string;
        phone: string;
      }>`select name, phone from phone_users where id = ${userId}`;
      me = rows[0] ?? null;
    }
    const str = (value: unknown) => (typeof value === "string" ? value : "");
    const name = cleanOptional(me?.name ?? str(payload.name), 80);
    const phone = cleanOptional(me?.phone ?? str(payload.phone), 20);
    // Contact details live in their own columns only; the JSON payload keeps the rest.
    const { name: _name, phone: _phone, ...stored } = payload;
    void _name;
    void _phone;
    const sql = await getSql();
    // Same form submission again (double tap, retry after a lost response): return the first request.
    if (key) {
      const existing = await sql<{ tracking_id: string }>`
        select tracking_id from shipment_requests where user_id = ${userId} and idempotency_key = ${key}`;
      if (existing[0])
        return { id: existing[0].tracking_id, estimate: true as const, repeated: true as const };
    }
    await rate(userId);
    // Compliance: no shipping or buying of prohibited goods (item, notes, product link, contents).
    const text = Object.values(stored)
      .flatMap((value) =>
        typeof value === "string"
          ? [value]
          : Array.isArray(value)
            ? value.filter((v) => typeof v === "string")
            : [],
      )
      .join(" \n ");
    const verdict = await checkTextServer(sql, text);
    if (verdict.decision === "block") {
      await auditLog(sql, "rejected_request", "shipment_requests", {
        userId,
        kind,
        matches: verdict.matches,
      });
      throw new MarketError("prohibited");
    }
    const id = crypto.randomUUID();
    const tracking = newTrackingId();
    const inserted = await sql<{ id: string }>`
      with req as (
        insert into shipment_requests (id, user_id, kind, name, phone, payload, estimate_eur, tracking_id, idempotency_key)
        values (${id}, ${userId}, ${kind}, ${name}, ${phone}, ${JSON.stringify(stored).slice(0, 4000)}, ${estimateEur}, ${tracking}, ${key})
        on conflict do nothing
        returning id
      ), ev as (
        insert into tracking_events (id, shipment_id, title, title_ku, place, place_ku, phase)
      select ${crypto.randomUUID()}, req.id, 'Request received', 'داواکاری گەیشت', '', '', 'now' from req
      ), log as (
        insert into request_status_log (id, request_id, status, actor)
        select ${crypto.randomUUID()}, req.id, 'received', 'system' from req
      )
      select id from req`;
    if (!inserted[0]) {
      // Lost a race with the same idempotency key: hand back the request that won.
      const existing = key
        ? await sql<{
            tracking_id: string;
          }>`select tracking_id from shipment_requests where user_id = ${userId} and idempotency_key = ${key}`
        : [];
      if (existing[0])
        return { id: existing[0].tracking_id, estimate: true as const, repeated: true as const };
      throw new Error("request insert failed");
    }
    if (payload.declared === true) {
      await sql`
        insert into declarations (id, user_id, kind, ref_id, version)
        values (${crypto.randomUUID()}, ${userId}, ${kind}, ${id}, ${DECLARATION_VERSION})`;
    }
    await sql`
      insert into notifications (id, user_id, body_ku, body_en)
      select md5(user_id || ${tracking}), user_id, ${`داواکاری ${tracking}`}, ${`Request ${tracking}`}
      from user_roles where role = 'admin' and status = 'approved'`;
    return { id: tracking, estimate: true as const };
  } catch (err) {
    if (err instanceof MarketError) return { error: err.code };
    if (dbUnavailable(err)) return { error: "unavailable" as const };
    console.error("[orders]", err instanceof Error ? err.message : "failed");
    return { error: "unavailable" as const };
  }
}

export async function lookupTracking(id: string) {
  const code = publicTrackingId(id);
  if (!code) return { error: "notfound" as const };
  try {
    const sql = await getSql();
    // Public view: status and milestones only. No name, phone, payload or price.
    const rows = await sql<{ id: string; tracking_id: string; status: string }>`
      select id, tracking_id, status from shipment_requests where tracking_id = ${code}`;
    const row = rows[0];
    if (!row) return { error: "notfound" as const };
    const events = await sql<{
      title: string;
      title_ku: string;
      place: string;
      place_ku: string;
      phase: string;
      created_at: string;
    }>`
      select title, title_ku, place, place_ku, phase, created_at from tracking_events where shipment_id = ${row.id} order by created_at`;
    return {
      id: row.tracking_id,
      status: row.status,
      events: events.map((event) => ({
        title: event.title,
        titleKu: event.title_ku,
        place: event.place,
        placeKu: event.place_ku,
        phase: event.phase,
        at: String(event.created_at),
      })),
    };
  } catch (err) {
    if (dbUnavailable(err)) return { error: "unavailable" as const };
    console.error("[orders]", err instanceof Error ? err.message : "failed");
    return { error: "unavailable" as const };
  }
}

/** The stored product link, only if it is still a plain https URL. Shown as text, never fetched. */
function productLink(payload: unknown): string | null {
  let value: unknown = payload;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  const url = value && typeof value === "object" ? (value as { url?: unknown }).url : null;
  return typeof url === "string" && url.startsWith("https://") && url.length <= 2000 ? url : null;
}

export async function adminOrders(userId: string) {
  const sql = await getSql();
  const role =
    await sql`select 1 as ok from user_roles where user_id = ${userId} and role = 'admin' and status = 'approved'`;
  if (!role.length) throw new MarketError("forbidden");
  const rows = await sql<{
    id: string;
    tracking_id: string;
    kind: string;
    status: string;
    name: string;
    payload: unknown;
  }>`
    select id, tracking_id, kind, status, name, payload from shipment_requests order by created_at desc limit 30`;
  return rows.map((row) => ({
    id: row.id,
    trackingId: row.tracking_id,
    kind: row.kind,
    status: row.status,
    name: row.name,
    link: productLink(row.payload),
  }));
}

/**
 * Legacy admin status change by row id. Now goes through the same rules as the staff
 * panel: work statuses need a quote the customer accepted (see requests/handlers.server).
 */
export async function adminOrderStatus(userId: string, id: string, status: string) {
  const sql = await getSql();
  const rows = await sql<{
    tracking_id: string;
  }>`select tracking_id from shipment_requests where id = ${cleanText(id, 80)}`;
  if (!rows[0]) throw new MarketError("notfound");
  const { staffSetStatus } = await import("@/lib/requests/handlers.server");
  return staffSetStatus(userId, { ref: rows[0].tracking_id, status });
}

export function readEstimateEur() {
  const raw = Number(process.env.IQD_PER_EUR ?? "");
  return Number.isFinite(raw) && raw > 0 ? raw : null;
}
