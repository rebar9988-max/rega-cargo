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

async function isStaff(sql: Sql, userId: string) {
  const rows =
    await sql`select 1 as ok from user_roles where user_id = ${userId} and role = 'admin' and status = 'approved'`;
  return rows.length > 0;
}

async function requireStaff(sql: Sql, userId: string) {
  if (!(await isStaff(sql, userId))) throw new MarketError("forbidden");
}

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
async function addEvent(sql: Sql, requestId: string, title: string, titleKu: string, place = "") {
  await sql`update tracking_events set phase = 'done' where shipment_id = ${requestId} and phase = 'now'`;
  await sql`
    insert into tracking_events (id, shipment_id, title, title_ku, place, place_ku, phase)
    values (${crypto.randomUUID()}, ${requestId}, ${title}, ${titleKu}, ${place}, ${place}, 'now')`;
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
    select title, title_ku, place, phase, created_at from tracking_events where shipment_id = ${row.id} order by created_at`;
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
  const updated = await sql<{ id: string }>`
    update request_quotes set status = 'accepted', decided_at = now()
    where id = ${id} and request_id = ${request.id} and status = 'sent' and valid_until > now()
    returning id`;
  if (!updated[0]) throw new MarketError("invalid");
  const moved =
    await sql`update shipment_requests set status = 'accepted', updated_at = now() where id = ${request.id} and status = 'quoted' returning id`;
  if (!moved[0]) throw new MarketError("invalid");
  await logStatus(sql, request.id, "accepted", "customer");
  await addEvent(sql, request.id, ...EVENT_TITLE.accepted);
  await sql`
    insert into notifications (id, user_id, body_ku, body_en)
    select md5(user_id || ${`accept:${id}`}), user_id, ${`نرخ پەسەند کرا: ${request.tracking_id}`}, ${`Quote accepted: ${request.tracking_id}`}
    from user_roles where role = 'admin' and status = 'approved'
    on conflict (id) do nothing`;
  return { ok: true as const };
}

/** The customer declines a sent quote; the request goes back to staff review. */
export async function declineQuote(userId: string, value: unknown, quoteId: unknown) {
  const sql = await getSql();
  const request = await ownRequest(sql, userId, value);
  const id = cleanText(quoteId, 80);
  const updated = await sql<{ id: string }>`
    update request_quotes set status = 'declined', decided_at = now()
    where id = ${id} and request_id = ${request.id} and status = 'sent' returning id`;
  if (!updated[0]) throw new MarketError("invalid");
  await sql`update shipment_requests set status = 'reviewing', updated_at = now() where id = ${request.id} and status = 'quoted'`;
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
  await sql`update request_quotes set status = 'superseded', decided_at = now() where request_id = ${request.id} and status = 'sent'`;
  const id = crypto.randomUUID();
  await sql`
    insert into request_quotes (id, request_id, amount_iqd, customs_included, note, valid_until, created_by)
    values (${id}, ${request.id}, ${amount}, ${input.customsIncluded}, ${note}, now() + make_interval(days => ${days}), ${userId})`;
  await sql`update shipment_requests set status = 'quoted', updated_at = now() where id = ${request.id}`;
  await logStatus(sql, request.id, "quoted", "staff");
  await addEvent(sql, request.id, ...EVENT_TITLE.quoted);
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
  await addEvent(sql, request.id, title, titleKu);
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
  await addEvent(sql, rows[0].id, title, title, place);
  return { ok: true as const };
}
