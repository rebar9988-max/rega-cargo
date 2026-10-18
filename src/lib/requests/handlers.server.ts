/**
 * Customer request history and staff handling. Authorisation is enforced here,
 * on the server: customers only ever read or act on rows with their own user_id;
 * staff = an approved "admin" role in user_roles.
 */
import { getSql, type Sql } from "@/lib/db";
import { MarketError, cleanOptional, cleanText } from "@/lib/market";
import { submitRequest } from "@/lib/orders/handlers.server";
import { normalizeTrackingId } from "@/lib/orders/tracking-id";
import { NEEDS_ACCEPTED, shippingEstimateEur, staffCanSet, validateRequest } from "./validate";

/** Customer-facing milestone titles written to tracking_events (English + Sorani). */
export const EVENT_TITLE: Record<string, [string, string]> = {
  reviewing: ["Under review", "لە پشکنیندایە"],
  quoted: ["Quote sent", "نرخ نێردرا"],
  accepted: ["Quote accepted by customer", "نرخ لەلایەن کڕیارەوە پەسەند کرا"],
  purchased: ["Item purchased", "کاڵاکە کڕدرا"],
  in_transit: ["In transit", "لە ڕێگادایە"],
  arrived: ["Arrived in destination city", "گەیشتە شاری مەبەست"],
  delivered: ["Delivered", "گەیەنرا"],
  cancelled: ["Cancelled", "هەڵوەشێنرایەوە"],
};

import { isStaff, requireStaff } from "@/lib/auth/authority.server";

function ref(value: unknown) {
  const code = normalizeTrackingId(typeof value === "string" ? value : "");
  if (!code) throw new MarketError("notfound");
  return code;
}

function parsePayload(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object") return raw as Record<string, unknown>;
  try {
    const value = JSON.parse(String(raw ?? "{}"));
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

async function logStatus(
  sql: Sql,
  requestId: string,
  status: string,
  actor: "customer" | "staff" | "system",
  note = "",
) {
  await sql`
    insert into request_status_log (id, request_id, status, actor, note)
    values (${crypto.randomUUID()}, ${requestId}, ${status}, ${actor}, ${note})`;
}

/** Records a milestone; the previous "now" milestone becomes "done". */
async function addEvent(
  sql: Sql,
  requestId: string,
  title: string,
  titleKu: string,
  place = "",
  occurredAt: string | null = null,
) {
  await sql`update tracking_events set phase = 'done' where shipment_id = ${requestId} and phase = 'now' and archived_at is null`;
  await sql`
    insert into tracking_events (id, shipment_id, title, title_ku, place, place_ku, phase, occurred_at)
    values (${crypto.randomUUID()}, ${requestId}, ${title}, ${titleKu}, ${place}, ${place}, 'now', ${occurredAt})`;
}

async function notify(sql: Sql, userId: string, ku: string, en: string) {
  await sql`insert into notifications (id, user_id, body_ku, body_en) values (${crypto.randomUUID()}, ${userId}, ${ku}, ${en})`;
}

export async function createRequest(userId: string, raw: Record<string, unknown>) {
  const checked = validateRequest(raw);
  if (!checked.ok) return { error: checked.error };
  const key = typeof raw.key === "string" && /^[A-Za-z0-9-]{16,64}$/.test(raw.key) ? raw.key : null;
  if (!key) return { error: "invalid" as const };
  return submitRequest(
    userId,
    checked.data.flow,
    { ...checked.data },
    shippingEstimateEur(checked.data),
    { idempotencyKey: key },
  );
}

type QuoteRow = {
  id: string;
  request_id: string;
  amount_iqd: number;
  customs_included: boolean;
  note: string;
  valid_until: string;
  status: string;
  created_at: string;
};

function quoteView(row: QuoteRow) {
  return {
    id: row.id,
    amountIqd: Number(row.amount_iqd),
    customsIncluded: row.customs_included === true,
    note: row.note,
    validUntil: new Date(row.valid_until).toISOString(),
    status: row.status,
    expired: row.status === "sent" && new Date(row.valid_until).getTime() < Date.now(),
    at: new Date(row.created_at).toISOString(),
  };
}

/** The customer's own requests, newest first, with the current (sent or accepted) quote. */
export async function myRequests(userId: string) {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    tracking_id: string;
    kind: string;
    status: string;
    created_at: string;
    estimate_eur: number | null;
    payload: unknown;
  }>`
    select id, tracking_id, kind, status, created_at, estimate_eur, payload
    from shipment_requests where user_id = ${userId} order by created_at desc limit 100`;
  if (!rows.length) return [];
  const quotes = await sql<QuoteRow>`
    select q.* from request_quotes q join shipment_requests r on r.id = q.request_id
    where r.user_id = ${userId} and q.status in ('sent', 'accepted') order by q.created_at desc`;
  return rows.map((row) => {
    const payload = parsePayload(row.payload);
    const quote = quotes.find((item) => item.request_id === row.id);
    return {
      ref: row.tracking_id,
      kind: row.kind,
      status: row.status,
      at: new Date(row.created_at).toISOString(),
      title: String(payload.description || payload.link || payload.url || "").slice(0, 120),
      estimateEur: row.estimate_eur == null ? null : Number(row.estimate_eur),
      quote: quote ? quoteView(quote) : null,
    };
  });
}

/** One request with quotes, recorded status history and recorded tracking events. Owner or staff only. */
export async function requestDetail(userId: string, value: unknown) {
  const code = ref(value);
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    user_id: string;
    tracking_id: string;
    kind: string;
    status: string;
    created_at: string;
    estimate_eur: number | null;
    payload: unknown;
    name: string;
    phone: string;
  }>`
    select id, user_id, tracking_id, kind, status, created_at, estimate_eur, payload, name, phone from shipment_requests where tracking_id = ${code}`;
  const row = rows[0];
  const staff = row ? await isStaff(sql, userId) : false;
  // Someone else's reference looks exactly like a missing one.
  if (!row || (row.user_id !== userId && !staff)) throw new MarketError("notfound");
  const quotes =
    await sql<QuoteRow>`select * from request_quotes where request_id = ${row.id} order by created_at desc`;
  const history = await sql<{ status: string; actor: string; note: string; created_at: string }>`
    select status, actor, note, created_at from request_status_log where request_id = ${row.id} order by created_at, id`;
  const events = await sql<{
    title: string;
    title_ku: string;
    place: string;
    phase: string;
    created_at: string;
  }>`
    select title, title_ku, place, phase, created_at from tracking_events where shipment_id = ${row.id} and archived_at is null order by created_at, id`;
  const payload = parsePayload(row.payload);
  const str = (key: string) => (typeof payload[key] === "string" ? (payload[key] as string) : "");
  return {
    ref: row.tracking_id,
    kind: row.kind,
    status: row.status,
    at: new Date(row.created_at).toISOString(),
    estimateEur: row.estimate_eur == null ? null : Number(row.estimate_eur),
    item: {
      link: str("link") || str("url"),
      description: str("description"),
      qty: typeof payload.qty === "number" ? payload.qty : null,
      origin: str("origin"),
      originNote: str("originNote"),
      dest: str("dest"),
      weightKg: typeof payload.weightKg === "number" ? payload.weightKg : null,
      dims:
        payload.dims && typeof payload.dims === "object"
          ? (payload.dims as { l: number; w: number; h: number })
          : null,
      attachments: Array.isArray(payload.attachments)
        ? payload.attachments.filter((item): item is string => typeof item === "string")
        : [],
      notes: str("notes"),
    },
    // Contact fields only for staff.
    contact: staff ? { name: row.name, phone: row.phone } : null,
    staff,
    owner: row.user_id === userId,
    quotes: quotes.map(quoteView),
    history: history.map((item) => ({
      status: item.status,
      actor: item.actor,
      note: item.note,
      at: new Date(item.created_at).toISOString(),
    })),
    events: events.map((item) => ({
      title: item.title,
      titleKu: item.title_ku,
      place: item.place,
      phase: item.phase,
      at: new Date(item.created_at).toISOString(),
    })),
  };
}

async function ownRequest(sql: Sql, userId: string, value: unknown) {
  const code = ref(value);
  const rows = await sql<{ id: string; status: string; tracking_id: string }>`
    select id, status, tracking_id from shipment_requests where tracking_id = ${code} and user_id = ${userId}`;
  if (!rows[0]) throw new MarketError("notfound");
  return rows[0];
}

/** The customer explicitly accepts a sent, unexpired quote. Nothing starts before this. */
export async function acceptQuote(userId: string, value: unknown, quoteId: unknown) {
  const sql = await getSql();
  const request = await ownRequest(sql, userId, value);
  const id = cleanText(quoteId, 80);
  if (request.status !== "quoted") throw new MarketError("invalid");
  // One statement: the quote is accepted only together with the request leaving "quoted".
  const moved = await sql<{ id: string }>`
    with q as (
      update request_quotes set status = 'accepted', decided_at = now()
      where id = ${id} and request_id = ${request.id} and status = 'sent' and valid_until > now()
        and exists (select 1 from shipment_requests where id = ${request.id} and status = 'quoted')
      returning request_id
    )
    update shipment_requests set status = 'accepted', updated_at = now()
    where id in (select request_id from q) and status = 'quoted'
    returning id`;
  if (!moved[0]) throw new MarketError("invalid");
  await logStatus(sql, request.id, "accepted", "customer");
  await addEvent(sql, request.id, ...EVENT_TITLE.accepted, "", new Date().toISOString());
  await sql`
    insert into notifications (id, user_id, body_ku, body_en)
    select distinct md5(user_id || ${`accept:${id}`}), user_id, ${`نرخ پەسەند کرا: ${request.tracking_id}`}, ${`Quote accepted: ${request.tracking_id}`}
    from user_roles where role in ('admin', 'super_admin') and status = 'approved'
    on conflict (id) do nothing`;
  return { ok: true as const };
}

/** The customer declines a sent quote; the request goes back to staff review. */
export async function declineQuote(userId: string, value: unknown, quoteId: unknown) {
  const sql = await getSql();
  const request = await ownRequest(sql, userId, value);
  const id = cleanText(quoteId, 80);
  // The review transition (including its inbox trigger) and quote decision commit together.
  const updated = await sql<{ id: string }>`
    with locked as (
      select id from shipment_requests where id = ${request.id} and status = 'quoted' for update
    ), q as (
      update request_quotes set status = 'declined', decided_at = now()
      where id = ${id} and request_id in (select id from locked) and status = 'sent'
      returning request_id
    )
    update shipment_requests set status = 'reviewing', updated_at = now()
    where id in (select request_id from q) and status = 'quoted'
    returning id`;
  if (!updated[0]) throw new MarketError("invalid");
  await logStatus(sql, request.id, "reviewing", "customer", "quote declined");
  return { ok: true as const };
}

/** Staff queue: newest first, optional status filter. */
export async function staffRequests(userId: string, status?: unknown) {
  const sql = await getSql();
  await requireStaff(sql, userId);
  const filter = typeof status === "string" && status ? status : null;
  const rows = await sql<{
    tracking_id: string;
    kind: string;
    status: string;
    created_at: string;
    name: string;
    payload: unknown;
  }>`
    select tracking_id, kind, status, created_at, name, payload from shipment_requests
    where (${filter}::text is null or status = ${filter}) order by created_at desc limit 100`;
  return rows.map((row) => {
    const payload = parsePayload(row.payload);
    return {
      ref: row.tracking_id,
      kind: row.kind,
      status: row.status,
      at: new Date(row.created_at).toISOString(),
      name: row.name,
      title: String(payload.description || payload.link || payload.url || "").slice(0, 120),
    };
  });
}

/** Staff send a confirmed quote (IQD). Any earlier open quote is superseded. */
export async function staffQuote(userId: string, input: Record<string, unknown>) {
  const sql = await getSql();
  await requireStaff(sql, userId);
  const code = ref(input.ref);
  const amount = Number(input.amountIqd);
  if (!Number.isInteger(amount) || amount < 1000 || amount > 500_000_000)
    throw new MarketError("invalid");
  if (typeof input.customsIncluded !== "boolean") throw new MarketError("invalid");
  const days = Number(input.validDays ?? 7);
  if (!Number.isInteger(days) || days < 1 || days > 30) throw new MarketError("invalid");
  const note = cleanOptional(input.note, 500);
  const rows = await sql<{
    id: string;
    user_id: string;
    status: string;
  }>`select id, user_id, status from shipment_requests where tracking_id = ${code}`;
  const request = rows[0];
  if (!request) throw new MarketError("notfound");
  if (!["received", "reviewing", "quoted"].includes(request.status))
    throw new MarketError("invalid");
  const id = crypto.randomUUID();
  // One statement: the status guard, the superseded quote and the new quote succeed or fail
  // together, so a customer accepting a quote at the same moment can never be overwritten.
  const created = await sql<{ id: string }>`
    with req as (
      update shipment_requests set status = 'quoted', updated_at = now()
      where id = ${request.id} and status in ('received', 'reviewing', 'quoted')
      returning id
    ), old as (
      update request_quotes set status = 'superseded', decided_at = now()
      where request_id in (select id from req) and status = 'sent'
      returning id
    )
    insert into request_quotes (id, request_id, amount_iqd, customs_included, note, valid_until, created_by)
    select ${id}, req.id, ${amount}, ${input.customsIncluded}, ${note}, now() + make_interval(days => ${days}), ${userId}
    from req
    returning id`;
  if (!created[0]) throw new MarketError("invalid");
  await logStatus(sql, request.id, "quoted", "staff");
  await addEvent(sql, request.id, ...EVENT_TITLE.quoted, "", new Date().toISOString());
  await notify(sql, request.user_id, `نرخ بۆ ${code} ئامادەیە`, `Quote ready for ${code}`);
  return { ok: true as const, id };
}

/** Staff change a status. purchased / in_transit / arrived / delivered need an accepted quote. */
export async function staffSetStatus(userId: string, input: Record<string, unknown>) {
  const sql = await getSql();
  await requireStaff(sql, userId);
  const code = ref(input.ref);
  const to = typeof input.status === "string" ? input.status : "";
  const note = cleanOptional(input.note, 300);
  const rows = await sql<{
    id: string;
    user_id: string;
    status: string;
    kind: string;
  }>`select id, user_id, status, kind from shipment_requests where tracking_id = ${code}`;
  const request = rows[0];
  if (!request) throw new MarketError("notfound");
  const accepted =
    (
      await sql`select 1 as ok from request_quotes where request_id = ${request.id} and status = 'accepted'`
    ).length > 0;
  if (!staffCanSet(request.status, to, request.kind, accepted)) {
    throw new MarketError(NEEDS_ACCEPTED.includes(to) && !accepted ? "forbidden" : "invalid");
  }
  const moved =
    await sql`update shipment_requests set status = ${to}, updated_at = now() where id = ${request.id} and status = ${request.status} returning id`;
  if (!moved[0]) throw new MarketError("invalid");
  if (to === "cancelled")
    await sql`update request_quotes set status = 'superseded', decided_at = now() where request_id = ${request.id} and status = 'sent'`;
  await logStatus(sql, request.id, to, "staff", note);
  const [title, titleKu] = EVENT_TITLE[to] ?? [to, to];
  await addEvent(
    sql,
    request.id,
    title,
    titleKu,
    "",
    ["reviewing", "cancelled"].includes(to) ? new Date().toISOString() : null,
  );
  await notify(sql, request.user_id, `دۆخی ${code}: ${titleKu}`, `Status ${code}: ${title}`);
  return { ok: true as const };
}

/** Staff record a tracking milestone that actually happened (e.g. "Arrived at Erbil hub"). */
export async function staffAddEvent(userId: string, input: Record<string, unknown>) {
  const sql = await getSql();
  await requireStaff(sql, userId);
  const code = ref(input.ref);
  const title = cleanText(input.title, 120, 3);
  const place = cleanOptional(input.place, 80);
  const rows = await sql<{
    id: string;
  }>`select id from shipment_requests where tracking_id = ${code}`;
  if (!rows[0]) throw new MarketError("notfound");
  const { trackingAdminResources } = await import("../tracking/admin-resources.server");
  const spec = trackingAdminResources.tracking;
  const parsed = spec.create.safeParse({
    shipment_id: rows[0].id,
    title,
    title_ku: title,
    place,
    place_ku: place,
    phase: "now",
    occurred_at: input.occurredAt,
    next_action: input.nextAction ?? "none",
    estimate_from: input.estimateFrom || null,
    estimate_to: input.estimateTo || null,
  });
  if (!parsed.success) throw new MarketError("invalid");
  const data = await spec.prepare!(sql, userId, parsed.data, null, "create");
  await sql`
    with recorded as (insert into tracking_events(id, shipment_id, title, title_ku, place, place_ku, phase, occurred_at, next_action, estimate_from, estimate_to)
      values (${crypto.randomUUID()}, ${rows[0].id}, ${title}, ${title}, ${place}, ${place}, 'now', ${data.occurred_at}, ${data.next_action}, ${data.estimate_from}, ${data.estimate_to}) returning id),
    logged as (insert into platform_audit_log(id, actor_id, module, resource, resource_id, action, fields)
      select ${crypto.randomUUID()}, ${userId}, 'tracking', 'tracking', recorded.id, 'create', '["title","place","occurred_at","next_action","estimate_from","estimate_to"]'::jsonb from recorded returning id)
    update tracking_events set phase = 'done' where shipment_id = ${rows[0].id} and phase = 'now' and id not in (select id from recorded) and exists(select 1 from logged)`;
  return { ok: true as const };
}

