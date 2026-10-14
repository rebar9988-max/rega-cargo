import { randomBytes } from "node:crypto";
import { getSql } from "@/lib/db";
import { codeSecret, codesMatch, hmacHex, isProduction, randomCode } from "@/lib/phone/codes";
import { bump, clientIp, openSession, sweep } from "@/lib/phone/session.server";
import { deliverEmailCode, resendConfigured } from "./send.server";

/**
 * Email one-time-code sign-in and registration. Accounts and sessions are the
 * existing phone_users / phone_sessions rows, so every signed-in page, role and
 * middleware works unchanged. Codes: six digits, five minutes, HMAC-only storage,
 * five guesses, deleted on use, one resend per minute.
 */
export const CODE_TTL_SECONDS = 300;
export const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;
const EMAIL_HOUR_LIMIT = 5;
const EMAIL_DAY_LIMIT = 10;
const IP_HOUR_LIMIT = 30;
const PIN_HOUR_LIMIT = 10;

/** Test-only sink. Never active in production, even if the env var is set. */
export function emailTestSinkEnabled() {
  return process.env.NODE_ENV === "test" && process.env.RL_EMAIL_TEST_SINK === "1" && !isProduction();
}

export function emailDeliveryConfigured() {
  return resendConfigured() || emailTestSinkEnabled();
}

/** Lower-cased, trimmed address, or null. Deliberately strict: no spaces, quotes or angle brackets. */
export function normalizeEmail(value: unknown) {
  const email = String(value ?? "")
    .trim()
    .toLowerCase();
  if (email.length < 6 || email.length > 254) return null;
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(email))
    return null;
  if (email.split("@")[0].length > 64) return null;
  return email;
}

function cleanCode(value: unknown) {
  const code = String(value ?? "").trim();
  return /^[0-9]{6}$/.test(code) ? code : null;
}

/** Separate HMAC domain from phone codes, so a code hash for one can never match the other. */
function hashEmailCode(email: string, code: string) {
  return hmacHex(codeSecret(), `email-otp\n${email}\n${code}`);
}

async function sendLimited(email: string, ip: string) {
  const day = new Date().toISOString().slice(0, 10);
  const hour = await bump(`email:hour:${email}`, EMAIL_HOUR_LIMIT, "hour");
  const ipHour = await bump(`ip:email-send:hour:${ip}`, IP_HOUR_LIMIT, "hour");
  const daily = await bump(`email:day:${email}:${day}`, EMAIL_DAY_LIMIT, "day");
  return hour || ipHour || daily;
}

async function checkLimited(email: string, ip: string) {
  const hour = await bump(`email:pin:hour:${email}`, PIN_HOUR_LIMIT, "hour");
  const ipHour = await bump(`ip:email-pin:hour:${ip}`, IP_HOUR_LIMIT, "hour");
  return hour || ipHour;
}

/**
 * Sends a code. The answer is the same whether or not an account exists, so the
 * form cannot be used to discover registered addresses.
 */
export async function emailStart(rawEmail: unknown) {
  if (!emailDeliveryConfigured()) return { error: "unavailable" as const };
  const email = normalizeEmail(rawEmail);
  if (!email) return { error: "email" as const };
  await sweep();
  const sql = await getSql();
  // Cooldown first and atomically: a second request inside the window changes nothing.
  const code = await randomCode();
  const hash = await hashEmailCode(email, code);
  const claimed = await sql<{ email: string }>`
    insert into email_codes (email, code_hash, expires_at, attempts, sent_at)
    values (${email}, ${hash}, now() + make_interval(secs => ${CODE_TTL_SECONDS}), 0, now())
    on conflict (email) do update set
      code_hash = excluded.code_hash,
      expires_at = excluded.expires_at,
      attempts = 0,
      sent_at = excluded.sent_at
    where email_codes.sent_at <= now() - make_interval(secs => ${RESEND_COOLDOWN_SECONDS})
    returning email`;
  if (!claimed[0]) return { error: "cooldown" as const, retryAfter: RESEND_COOLDOWN_SECONDS };
  if (await sendLimited(email, clientIp())) {
    await sql`delete from email_codes where email = ${email} and code_hash = ${hash}`;
    return { error: "rate" as const };
  }
  const sent = emailTestSinkEnabled()
    ? (((globalThis as { __rlLastEmailCode?: string }).__rlLastEmailCode = code), true)
    : await deliverEmailCode(email, code);
  if (!sent) {
    await sql`delete from email_codes where email = ${email} and code_hash = ${hash}`;
    return { error: "unavailable" as const };
  }
  return { email, sent: true as const, expiresIn: CODE_TTL_SECONDS, resendIn: RESEND_COOLDOWN_SECONDS };
}

/** Counts the guess, then compares in constant time. Returns the matching hash, or null. */
async function checkCode(email: string, code: string) {
  const sql = await getSql();
  const rows = await sql<{ code_hash: string }>`
    update email_codes
    set attempts = attempts + 1
    where email = ${email} and expires_at > now() and attempts < ${MAX_ATTEMPTS}
    returning code_hash`;
  const row = rows[0];
  if (!row) return null;
  const actual = await hashEmailCode(email, code);
  return codesMatch(actual, row.code_hash) ? actual : null;
}

/** Single use: of two simultaneous requests with the same code, only one deletes the row. */
async function consume(email: string, hash: string) {
  const sql = await getSql();
  const rows = await sql<{ email: string }>`
    delete from email_codes where email = ${email} and code_hash = ${hash} and expires_at > now() returning email`;
  return Boolean(rows[0]);
}

/**
 * Verifies the code, then signs in (existing account) or registers (new account,
 * name required). A new address without a name answers `needName` and keeps the
 * code, so the form can ask for the name and send the same code once more.
 */
export async function emailConfirm(input: { email?: unknown; code?: unknown; name?: unknown }) {
  if (!emailDeliveryConfigured()) return { error: "unavailable" as const };
  const email = normalizeEmail(input.email);
  const code = cleanCode(input.code);
  if (!email || !code) return { error: "invalid" as const };
  if (await checkLimited(email, clientIp())) return { error: "rate" as const };
  const hash = await checkCode(email, code);
  if (!hash) return { error: "wrong" as const };
  const sql = await getSql();
  const users = await sql<{
    id: string;
    name: string;
    disabled_at: string | null;
    provisioned_at: string | null;
    requires_verification: boolean;
  }>`select id, name, disabled_at, provisioned_at, requires_verification from phone_users where email = ${email}`;
  const user = users[0];
  if (user) {
    if (user.disabled_at && !user.provisioned_at) return { error: "forbidden" as const };
    if (!(await consume(email, hash))) return { error: "wrong" as const };
    if (user.provisioned_at) {
      const activated =
        await sql`update phone_users set disabled_at = null, provisioned_at = null, requires_verification = false where id = ${user.id} and provisioned_at is not null returning id`;
      if (!activated[0]) return { error: "forbidden" as const };
      await sql`insert into user_roles(user_id, role, status, display_name) values (${user.id}, 'buyer', 'approved', ${user.name}) on conflict (user_id, role) do nothing`;
    }
    if (user.requires_verification && !user.provisioned_at)
      await sql`update phone_users set requires_verification = false where id = ${user.id} and disabled_at is null`;
    await openSession(user.id);
    return { name: user.name, email, created: false as const };
  }
  const name = String(input.name ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (!name) return { needName: true as const, email };
  if (name.length < 2 || name.length > 40) return { error: "name" as const };
  if (!(await consume(email, hash))) return { error: "wrong" as const };
  const id = `em_${crypto.randomUUID()}`;
  // pin_hash/pin_salt are legacy NOT NULL columns; an unguessable placeholder, never a credential.
  const placeholder = await hmacHex(codeSecret(), `email-account\n${email}\n${randomBytes(16).toString("hex")}`);
  const created = await sql<{ id: string }>`
    insert into phone_users (id, phone, email, name, pin_hash, pin_salt)
    values (${id}, null, ${email}, ${name}, ${placeholder}, ${randomBytes(16).toString("hex")})
    on conflict do nothing
    returning id`;
  // Lost a race with another registration for the same address: sign into that account instead.
  const userId =
    created[0]?.id ??
    (await sql<{ id: string }>`select id from phone_users where email = ${email} and disabled_at is null`)[0]?.id;
  if (!userId) return { error: "forbidden" as const };
  if (created[0])
    await sql`
      insert into user_roles (user_id, role, status, display_name)
      values (${userId}, 'buyer', 'approved', ${name})
      on conflict (user_id, role) do nothing`;
  await openSession(userId);
  return { name, email, created: Boolean(created[0]) };
}
