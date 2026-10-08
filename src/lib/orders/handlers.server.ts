import { getSql } from "@/lib/db";
import { MarketError, cleanText } from "@/lib/market";
import { phoneMe } from "@/lib/phone/session.server";

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

export async function submitRequest(userId: string, kind: "quote" | "store", payload: Record<string, unknown>, estimateEur: number | null) {
  try {
    let me: { name?: string; phone?: string } | null = null;
    try {
      me = await phoneMe();
    } catch {
      me = null;
    }
    const name = cleanText(me?.name ?? payload.name, 80);
    const phone = cleanText(me?.phone ?? payload.phone, 20);
    await rate(userId);
    const sql = await getSql();
    const id = crypto.randomUUID();
    const tracking = `RG-${id.replace(/-/g, "").slice(0, 5).toUpperCase()}`;
    await sql`
      with req as (
        insert into shipment_requests (id, user_id, kind, name, phone, payload, estimate_eur, tracking_id)
        values (${id}, ${userId}, ${kind}, ${name}, ${phone}, ${JSON.stringify(payload).slice(0, 4000)}, ${estimateEur}, ${tracking})
        returning id
      )
      insert into tracking_events (id, shipment_id, title, title_ku, place, place_ku, phase)
      select ${crypto.randomUUID()}, req.id, 'Request received', 'داواکاری گەیشت', '', '', 'now' from req`;
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
  const code = id.trim().toUpperCase().slice(0, 40);
  if (!/^RG-[A-Z0-9-]{4,}$/.test(code)) return { error: "notfound" as const };
  try {
    const sql = await getSql();
    const rows = await sql<{ id: string; tracking_id: string; status: string; payload: string; estimate_eur: number | null }>`
      select id, tracking_id, status, payload, estimate_eur from shipment_requests where tracking_id = ${code}`;
    const row = rows[0];
    if (!row) return { error: "notfound" as const };
    const events = await sql<{ title: string; title_ku: string; place: string; place_ku: string; phase: string; created_at: string }>`
      select title, title_ku, place, place_ku, phase, created_at from tracking_events where shipment_id = ${row.id} order by created_at`;
    return {
      id: row.tracking_id,
      status: row.status,
      estimateEur: row.estimate_eur,
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

export async function adminOrders(userId: string) {
  const sql = await getSql();
  const role = await sql`select 1 as ok from user_roles where user_id = ${userId} and role = 'admin' and status = 'approved'`;
  if (!role.length) throw new MarketError("forbidden");
  const rows = await sql<{ id: string; tracking_id: string; kind: string; status: string; name: string }>`
    select id, tracking_id, kind, status, name from shipment_requests order by created_at desc limit 30`;
  return rows.map((row) => ({ id: row.id, trackingId: row.tracking_id, kind: row.kind, status: row.status, name: row.name }));
}

export async function adminOrderStatus(userId: string, id: string, status: string) {
  if (!["received", "confirmed", "in_transit", "delivered", "cancelled"].includes(status)) throw new MarketError("invalid");
  const sql = await getSql();
  const role = await sql`select 1 as ok from user_roles where user_id = ${userId} and role = 'admin' and status = 'approved'`;
  if (!role.length) throw new MarketError("forbidden");
  const rows = await sql<{ user_id: string; tracking_id: string }>`
    update shipment_requests set status = ${status} where id = ${cleanText(id, 80)} and status <> ${status} returning user_id, tracking_id`;
  const row = rows[0];
  if (!row) throw new MarketError("notfound");
  await sql`
    insert into tracking_events (id, shipment_id, title, title_ku, phase)
    values (${crypto.randomUUID()}, ${cleanText(id, 80)}, ${status}, ${status}, 'now')`;
  await sql`
    insert into notifications (id, user_id, body_ku, body_en)
    values (${crypto.randomUUID()}, ${row.user_id}, ${`دۆخی ${row.tracking_id}: ${status}`}, ${`Status ${row.tracking_id}: ${status}`})`;
  return { ok: true };
}

export function readEstimateEur() {
  const raw = Number(process.env.IQD_PER_EUR ?? "");
  return Number.isFinite(raw) && raw > 0 ? raw : null;
}
