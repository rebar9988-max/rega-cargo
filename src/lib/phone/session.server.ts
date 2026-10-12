import { createHash, randomBytes } from "node:crypto";
import { getCookie, getRequest, setCookie } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";
import { cleanPin, toE164 } from "@/lib/phone/format";
import { deliverCode } from "@/lib/phone/send.server";
import {
  codeSecret,
  codesMatch,
  hashCode,
  isProduction,
  phoneTestSinkEnabled,
  randomCode,
  verifyTurnstile,
} from "@/lib/phone/codes";
import { messageLines } from "@/lib/phone/send.server";

/**
 * `__Host-` makes the browser refuse a same-named cookie set with a Domain
 * attribute, so a sibling subdomain cannot plant a session here. The prefix
 * requires Secure, so plain-http local dev keeps the bare name.
 */
function cookieName() {
  return secureCookie() ? "__Host-rl_phone" : "rl_phone";
}
const MONTH = 60 * 60 * 24 * 30;
const HOUR_LIMIT = 8;
const IP_HOUR_LIMIT = 30;
const DAY_LIMIT = 10;

function sha(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function secureCookie() {
  if (isProduction()) return true;
  try {
    const request = getRequest();
    const proto = request?.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    if (proto) return proto === "https";
    return request?.url.startsWith("https:") ?? false;
  } catch {
    return false;
  }
}

function clientIp() {
  try {
    const request = getRequest();
    return request?.headers.get("cf-connecting-ip")?.trim() || "unknown";
  } catch {
    return "unknown";
  }
}

function writeCookie(token: string | null) {
  setCookie(cookieName(), token ?? "", {
    path: "/",
    httpOnly: true,
    secure: secureCookie(),
    sameSite: "lax",
    maxAge: token ? MONTH : 0,
  });
}

async function bump(key: string, limit: number, window: "hour" | "day") {
  const sql = await getSql();
  const rows =
    window === "hour"
      ? await sql<{ allowed: boolean }>`
          insert into rate_counters (key, n, window_start, allowed)
          values (${key}, 1, now(), true)
          on conflict (key) do update set
            allowed = case
              when rate_counters.window_start < now() - interval '1 hour' then true
              when rate_counters.n < ${limit} then true
              else false
            end,
            window_start = case
              when rate_counters.window_start < now() - interval '1 hour' then now()
              else rate_counters.window_start
            end,
            n = case
              when rate_counters.window_start < now() - interval '1 hour' then 1
              when rate_counters.n < ${limit} then rate_counters.n + 1
              else rate_counters.n
            end
          returning allowed`
      : await sql<{ allowed: boolean }>`
          insert into rate_counters (key, n, window_start, allowed)
          values (${key}, 1, now(), true)
          on conflict (key) do update set
            allowed = case when rate_counters.n < ${limit} then true else false end,
            n = case when rate_counters.n < ${limit} then rate_counters.n + 1 else rate_counters.n end
          returning allowed`;
  return rows[0]?.allowed !== true && rows[0]?.allowed !== ("t" as unknown);
}

/**
 * Sending codes and checking codes have separate per-IP budgets, so many
 * customers behind one carrier IP (CGNAT) do not use up each other's sign-ins
 * twice, and code guessing cannot starve code sending.
 */
async function limited(phone: string, ip: string, scope: "send" | "pin") {
  const day = new Date().toISOString().slice(0, 10);
  const phoneHour = await bump(`phone:hour:${phone}`, HOUR_LIMIT, "hour");
  const ipHour = await bump(`ip:${scope}:hour:${ip}`, IP_HOUR_LIMIT, "hour");
  const phoneDay = await bump(`phone:day:${phone}:${day}`, DAY_LIMIT, "day");
  return phoneHour || ipHour || phoneDay;
}

async function sweep() {
  const sql = await getSql();
  await sql`
    with gone_codes as (
      delete from phone_codes where expires_at < now() - interval '1 day' returning 1
    ), gone_sessions as (
      delete from phone_sessions where expires_at < now() returning 1
    ), gone_log as (
      delete from action_log where created_at < now() - interval '7 days' returning 1
    ), gone_counters as (
      -- Hourly windows and dated daily keys are dead after two days.
      delete from rate_counters where window_start < now() - interval '2 days' returning 1
    )
    select 1`;
}

export async function currentPhoneUserId() {
  const token = getCookie(cookieName());
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

export function phoneDeliveryConfigured() {
  const lines = messageLines();
  return lines.whatsapp || lines.sms || phoneTestSinkEnabled();
}

async function sendAndStore(phone: string, code: string) {
  const sent = phoneTestSinkEnabled()
    ? ((globalThis as { __rlLastCode?: string }).__rlLastCode = code, { whatsapp: true, sms: false })
    : await deliverCode(phone, code);
  if (!sent.whatsapp && !sent.sms) return null;
  const sql = await getSql();
  const hash = await hashCode(codeSecret(), phone, code);
  await sql`
    insert into phone_codes (phone, code_hash, code_salt, expires_at, attempts, sent_at)
    values (${phone}, ${hash}, 'hmac', now() + interval '10 minutes', 0, now())
    on conflict (phone) do update set
      code_hash = excluded.code_hash,
      code_salt = 'hmac',
      expires_at = excluded.expires_at,
      sent_at = excluded.sent_at,
      attempts = case
        when phone_codes.expires_at > now() then phone_codes.attempts
        else 0
      end`;
  return sent;
}

async function consumeDeliveredCode(phone: string, pin: string) {
  const sql = await getSql();
  const rows = await sql<{ code_hash: string; code_salt: string; attempts: number }>`
    update phone_codes
    set attempts = attempts + 1
    where phone = ${phone} and expires_at > now() and attempts < 5
    returning code_hash, code_salt, attempts`;
  const row = rows[0];
  if (!row || row.code_salt !== "hmac") return false;
  const actual = await hashCode(codeSecret(), phone, pin);
  if (!codesMatch(actual, row.code_hash)) return false;
  await sql`delete from phone_codes where phone = ${phone}`;
  return true;
}

export async function phoneStart(dial: unknown, national: unknown, turnstileToken?: unknown) {
  if (!phoneDeliveryConfigured()) return { error: "unavailable" as const };
  const phone = toE164(String(dial ?? ""), String(national ?? ""));
  if (!phone) return { error: "phone" as const };
  const secret = process.env.TURNSTILE_SECRET?.trim();
  if (isProduction() && !secret) return { error: "unavailable" as const };
  if (secret) {
    const ok = await verifyTurnstile(secret, String(turnstileToken ?? ""), clientIp());
    if (!ok) return { error: "turnstile" as const };
  }
  await sweep();
  const sql = await getSql();
  const cool = await sql<{ ok: boolean }>`
    select sent_at > now() - interval '60 seconds' as ok from phone_codes where phone = ${phone} and expires_at > now()`;
  if (cool[0]?.ok === true) return { error: "rate" as const };
  if (await limited(phone, clientIp(), "send")) return { error: "rate" as const };
  const code = await randomCode();
  const sent = await sendAndStore(phone, code);
  if (!sent) return { error: "unavailable" as const };
  return { phone, sent: true as const, whatsapp: sent.whatsapp, sms: sent.sms };
}

async function openSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const sql = await getSql();
  await sql`
    insert into phone_sessions (token_hash, user_id, expires_at)
    values (${sha(token)}, ${userId}, now() + interval '30 days')`;
  writeCookie(token);
}

export async function phoneConfirm(input: { dial?: unknown; national?: unknown; pin?: unknown; name?: unknown }) {
  if (!phoneDeliveryConfigured()) return { error: "unavailable" as const };
  const phone = toE164(String(input.dial ?? ""), String(input.national ?? ""));
  const pin = cleanPin(String(input.pin ?? ""));
  if (!phone || !pin) return { error: "invalid" as const };
  if (await limited(`pin:${phone}`, clientIp(), "pin")) return { error: "rate" as const };
  if (!(await consumeDeliveredCode(phone, pin))) return { error: "wrong" as const };
  const sql = await getSql();
  const users = await sql<{ id: string; name: string }>`select id, name from phone_users where phone = ${phone}`;
  if (users[0]) {
    await openSession(users[0].id);
    return { name: users[0].name, phone };
  }
  const name = String(input.name ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 40) return { error: "invalid" as const };
  const id = `ph_${crypto.randomUUID()}`;
  const salt = randomBytes(16).toString("hex");
  const placeholder = await hashCode(codeSecret(), phone, randomBytes(8).toString("hex"));
  await sql`
    insert into phone_users (id, phone, name, pin_hash, pin_salt)
    values (${id}, ${phone}, ${name}, ${placeholder}, ${salt})`;
  await sql`
    insert into user_roles (user_id, role, status, display_name, phone)
    values (${id}, 'buyer', 'approved', ${name}, ${phone})
    on conflict (user_id, role) do nothing`;
  await openSession(id);
  return { name, phone };
}

export async function phoneRegister(input: { dial?: unknown; national?: unknown; name?: unknown; pin?: unknown }) {
  return phoneConfirm(input);
}

export async function phoneLogin(input: { dial?: unknown; national?: unknown; pin?: unknown }) {
  return phoneConfirm(input);
}

export async function phoneLogout() {
  const token = getCookie(cookieName());
  if (token) {
    const sql = await getSql();
    await sql`delete from phone_sessions where token_hash = ${sha(token)}`;
  }
  writeCookie(null);
  return { ok: true };
}
