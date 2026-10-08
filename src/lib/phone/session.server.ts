import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getCookie, getRequest, setCookie } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";
import { cleanPin, toE164 } from "@/lib/phone/format";
import { deliverCode } from "@/lib/phone/send.server";

const COOKIE = "rl_phone";
const MONTH = 60 * 60 * 24 * 30;

function sha(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hashPin(pin: string, salt: string) {
  return scryptSync(pin, salt, 32).toString("hex");
}

function pinsMatch(pin: string, salt: string, expected: string) {
  const actual = Buffer.from(hashPin(pin, salt), "hex");
  const stored = Buffer.from(expected, "hex");
  return actual.length === stored.length && timingSafeEqual(actual, stored);
}

function secureCookie() {
  const request = getRequest();
  const proto = request?.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (proto) return proto === "https";
  return request?.url.startsWith("https:") ?? false;
}

function writeCookie(token: string | null) {
  setCookie(COOKIE, token ?? "", {
    path: "/",
    httpOnly: true,
    secure: secureCookie(),
    sameSite: "lax",
    maxAge: token ? MONTH : 0,
  });
}

async function limited(key: string) {
  const sql = await getSql();
  const rows = await sql<{ n: number }>`
    select count(*) as n from action_log
    where user_id = ${key} and action = 'phone' and created_at > now() - interval '1 hour'`;
  if (Number(rows[0]?.n ?? 0) >= 8) return true;
  await sql`insert into action_log (id, user_id, action) values (${crypto.randomUUID()}, ${key}, 'phone')`;
  return false;
}

export async function currentPhoneUserId() {
  const token = getCookie(COOKIE);
  if (!token) return null;
  const sql = await getSql();
  const rows = await sql<{ user_id: string }>`
    select user_id from phone_sessions where token_hash = ${sha(token)} and expires_at > now()`;
  return rows[0]?.user_id ?? null;
}

export async function phoneMe() {
  const id = await currentPhoneUserId();
  if (!id) return null;
  const sql = await getSql();
  const rows = await sql<{ name: string; phone: string }>`select name, phone from phone_users where id = ${id}`;
  return rows[0] ? { name: rows[0].name, phone: rows[0].phone } : null;
}

export async function phoneStart(dial: unknown, national: unknown) {
  const phone = toE164(String(dial ?? ""), String(national ?? ""));
  if (!phone) return { error: "phone" as const };
  if (await limited(`look:${phone}`)) return { error: "rate" as const };
  const sql = await getSql();
  const rows = await sql`select id from phone_users where phone = ${phone}`;
  const code = String(Math.floor(1000 + Math.random() * 9000));
  const sent = await deliverCode(phone, code);
  if (!sent.whatsapp && !sent.sms) return { phone, exists: rows.length > 0, sent: false as const, whatsapp: false, sms: false };
  const salt = randomBytes(16).toString("hex");
  await sql`
    insert into phone_codes (phone, code_hash, code_salt, expires_at, attempts)
    values (${phone}, ${hashPin(code, salt)}, ${salt}, now() + interval '10 minutes', 0)
    on conflict (phone) do update set code_hash = excluded.code_hash, code_salt = excluded.code_salt, expires_at = excluded.expires_at, attempts = 0`;
  return { phone, exists: rows.length > 0, sent: true as const, whatsapp: sent.whatsapp, sms: sent.sms };
}

export async function phoneConfirm(input: { dial?: unknown; national?: unknown; pin?: unknown; name?: unknown }) {
  const phone = toE164(String(input.dial ?? ""), String(input.national ?? ""));
  const pin = cleanPin(String(input.pin ?? ""));
  if (!phone || !pin) return { error: "invalid" as const };
  if (await limited(`pin:${phone}`)) return { error: "rate" as const };
  const sql = await getSql();
  const codes = await sql<{ code_hash: string; code_salt: string; attempts: number }>`
    select code_hash, code_salt, attempts from phone_codes where phone = ${phone} and expires_at > now()`;
  const row = codes[0];
  if (!row || Number(row.attempts) >= 5 || !pinsMatch(pin, row.code_salt, row.code_hash)) {
    await sql`update phone_codes set attempts = attempts + 1 where phone = ${phone}`;
    return { error: "wrong" as const };
  }
  await sql`delete from phone_codes where phone = ${phone}`;
  const users = await sql<{ id: string; name: string }>`select id, name from phone_users where phone = ${phone}`;
  if (users[0]) {
    await openSession(users[0].id);
    return { name: users[0].name, phone };
  }
  const name = String(input.name ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 40) return { error: "invalid" as const };
  const id = `ph_${crypto.randomUUID()}`;
  const salt = randomBytes(16).toString("hex");
  await sql`
    insert into phone_users (id, phone, name, pin_hash, pin_salt)
    values (${id}, ${phone}, ${name}, ${hashPin(randomBytes(8).toString("hex"), salt)}, ${salt})`;
  await sql`
    insert into user_roles (user_id, role, status, display_name, phone)
    values (${id}, 'buyer', 'approved', ${name}, ${phone})
    on conflict (user_id, role) do nothing`;
  await openSession(id);
  return { name, phone };
}

async function openSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const sql = await getSql();
  await sql`
    insert into phone_sessions (token_hash, user_id, expires_at)
    values (${sha(token)}, ${userId}, now() + interval '30 days')`;
  writeCookie(token);
}

export async function phoneRegister(input: { dial?: unknown; national?: unknown; name?: unknown; pin?: unknown }) {
  const phone = toE164(String(input.dial ?? ""), String(input.national ?? ""));
  const pin = cleanPin(String(input.pin ?? ""));
  const name = String(input.name ?? "").trim().replace(/\s+/g, " ");
  if (!phone || !pin || name.length < 2 || name.length > 40) return { error: "invalid" as const };
  if (await limited(`reg:${phone}`)) return { error: "rate" as const };
  const sql = await getSql();
  const existing = await sql`select id from phone_users where phone = ${phone}`;
  if (existing.length) return { error: "exists" as const };
  const id = `ph_${crypto.randomUUID()}`;
  const salt = randomBytes(16).toString("hex");
  await sql`
    insert into phone_users (id, phone, name, pin_hash, pin_salt)
    values (${id}, ${phone}, ${name}, ${hashPin(pin, salt)}, ${salt})`;
  await sql`
    insert into user_roles (user_id, role, status, display_name, phone)
    values (${id}, 'buyer', 'approved', ${name}, ${phone})
    on conflict (user_id, role) do nothing`;
  await openSession(id);
  return { name, phone };
}

export async function phoneLogin(input: { dial?: unknown; national?: unknown; pin?: unknown }) {
  const phone = toE164(String(input.dial ?? ""), String(input.national ?? ""));
  const pin = cleanPin(String(input.pin ?? ""));
  if (!phone || !pin) return { error: "invalid" as const };
  if (await limited(`pin:${phone}`)) return { error: "rate" as const };
  const sql = await getSql();
  const rows = await sql<{ id: string; name: string; pin_hash: string; pin_salt: string }>`
    select id, name, pin_hash, pin_salt from phone_users where phone = ${phone}`;
  const user = rows[0];
  if (!user || !pinsMatch(pin, user.pin_salt, user.pin_hash)) return { error: "wrong" as const };
  await openSession(user.id);
  return { name: user.name, phone };
}

export async function phoneLogout() {
  const token = getCookie(COOKIE);
  if (token) {
    const sql = await getSql();
    await sql`delete from phone_sessions where token_hash = ${sha(token)}`;
  }
  writeCookie(null);
  return { ok: true };
}
