/**
 * Email sign-in codes for customer accounts in the existing Better Auth `user` table.
 *
 * Same guarantees as the phone flow (src/lib/phone/session.server.ts): codes are
 * six digits from crypto.randomInt, stored only as an HMAC, usable for five
 * minutes, at most five guesses per window, a 30-second resend cooldown that
 * concurrent requests cannot evade, and single consumption (one winner even
 * under concurrent verification). A failed delivery never creates a usable code.
 *
 * Identity rule: the public code flow only signs in plain customer accounts.
 * Accounts with a password or other provider account (owner/staff), admin or
 * SUPER_ADMIN roles, a disabled flag, an unverified email or a pending owner
 * invitation are refused with the same answers an unknown address gets, so the
 * flow can neither take over nor reveal a privileged identity.
 */
import type { Sql } from "../db.ts";
import { codesMatch, hmacHex, randomCode } from "../phone/codes.ts";
import {
  CODE_TTL_MINUTES,
  EMAIL_DAY_LIMIT,
  EMAIL_HOUR_LIMIT,
  IP_SEND_HOUR_LIMIT,
  IP_VERIFY_HOUR_LIMIT,
  MAX_ATTEMPTS,
  RESEND_COOLDOWN_SECONDS,
} from "./limits.ts";

export {
  CODE_TTL_MINUTES,
  EMAIL_DAY_LIMIT,
  EMAIL_HOUR_LIMIT,
  MAX_ATTEMPTS,
  RESEND_COOLDOWN_SECONDS,
} from "./limits.ts";

export type Deliver = (email: string, code: string) => Promise<boolean>;
export type SendResult = { sent: true } | { error: "email" | "rate" | "unavailable" };
export type VerifyResult = { ok: true; email: string } | { error: "code" | "expired" | "rate" };
export type Identity = { kind: "new" } | { kind: "customer"; id: string } | { kind: "blocked" };

/** Lower-cased, trimmed address, or null when it is not a plausible single mailbox. */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length < 6 || email.length > 254) return null;
  // One @, a dotted domain, no whitespace, quotes, angle brackets or commas (no header tricks).
  if (
    !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(
      email,
    )
  )
    return null;
  if (email.startsWith(".") || email.includes("..") || email.split("@")[0].endsWith("."))
    return null;
  return email;
}

export function cleanCode(raw: unknown): string | null {
  const code = typeof raw === "string" ? raw.replace(/\s+/g, "") : "";
  return /^\d{6}$/.test(code) ? code : null;
}

/** Domain-separated from phone code hashes even when both use the same secret. */
export function emailCodeHash(secret: string, email: string, code: string) {
  return hmacHex(secret, `email-otp\n${email}\n${code}`);
}

async function bump(sql: Sql, key: string, limit: number, window: "hour" | "day") {
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
            allowed = rate_counters.n < ${limit},
            n = case when rate_counters.n < ${limit} then rate_counters.n + 1 else rate_counters.n end
          returning allowed`;
  // True = over the limit.
  return rows[0]?.allowed !== true;
}

/**
 * Which sign-in a code belongs to. Customer codes and administrative codes live in
 * separate tables with separate rate-limit keys, so traffic aimed at one cannot occupy
 * the other's single row per address or spend its budget.
 */
export type CodeScope = "customer" | "admin";
const TABLE: Record<CodeScope, string> = {
  customer: "email_codes",
  admin: "admin_codes",
};
const KEY: Record<CodeScope, string> = { customer: "email", admin: "admin" };

async function sweep(sql: Sql, scope: CodeScope) {
  await sql.query(`delete from ${TABLE[scope]} where expires_at < now() - interval '1 day'`);
}

/** Which account (if any) a verified code for this address may open. */
export async function identityFor(sql: Sql, email: string): Promise<Identity> {
  const reserved = await sql<{ n: number }>`
    select 1 as n from owner_bootstrap where approved_email = ${email} and consumed_at is null`;
  if (reserved[0]) return { kind: "blocked" };
  const rows = await sql<{
    id: string;
    verified: boolean;
    disabled: boolean;
    linked: boolean;
    privileged: boolean;
  }>`
    select u.id,
      u."emailVerified" as verified,
      u.disabled_at is not null as disabled,
      exists(select 1 from account a where a."userId" = u.id) as linked,
      exists(select 1 from user_roles r where r.user_id = u.id
        and r.role in ('admin', 'super_admin') and r.status <> 'removed') as privileged
    from "user" u where lower(u.email) = ${email}`;
  const row = rows[0];
  if (!row) return { kind: "new" };
  if (row.verified !== true || row.disabled || row.linked || row.privileged)
    return { kind: "blocked" };
  return { kind: "customer", id: row.id };
}

/**
 * Which account an administrative code may open: an approved, verified, enabled holder of
 * an administrative role, and never a plain customer. A pending owner invitation still
 * blocks the address, so an invitation in flight cannot be paired with this entrance.
 */
export async function adminIdentityFor(sql: Sql, email: string): Promise<Identity> {
  const rows = await sql<{ id: string }>`
    select u.id from "user" u
    where lower(u.email) = ${email}
      and u."emailVerified" = true
      and u.disabled_at is null
      and exists(select 1 from user_roles r where r.user_id = u.id
        and r.role in ('admin', 'super_admin') and r.status = 'approved')
      and not exists(select 1 from owner_bootstrap b
        where b.approved_email = ${email} and b.consumed_at is null)`;
  const row = rows[0];
  return row ? { kind: "customer", id: row.id } : { kind: "blocked" };
}

export async function requestEmailCode(
  sql: Sql,
  input: { email: unknown; ip: string; secret: string; deliver: Deliver; scope?: CodeScope },
): Promise<SendResult> {
  const scope = input.scope ?? "customer";
  const table = TABLE[scope];
  const key = KEY[scope];
  const email = normalizeEmail(input.email);
  if (!email) return { error: "email" };
  await sweep(sql, scope);
  // Cooldown first, so a too-early resend does not spend the hourly budget.
  const cool = await sql.query<{ busy: boolean }>(
    `select (sent_at > now() - make_interval(secs => $2)
      or attempts >= $3) as busy
    from ${table} where email = $1 and expires_at > now()`,
    [email, RESEND_COOLDOWN_SECONDS, MAX_ATTEMPTS],
  );
  if (cool[0]?.busy === true) return { error: "rate" };
  const day = new Date().toISOString().slice(0, 10);
  const over =
    (await bump(sql, `${key}:send:hour:${email}`, EMAIL_HOUR_LIMIT, "hour")) ||
    (await bump(sql, `ip:${key}-send:hour:${input.ip}`, IP_SEND_HOUR_LIMIT, "hour")) ||
    (await bump(sql, `${key}:send:day:${email}:${day}`, EMAIL_DAY_LIMIT, "day"));
  if (over) return { error: "rate" };

  const code = await randomCode();
  const hash = await emailCodeHash(input.secret, email, code);
  // Reserve atomically BEFORE delivery: concurrent resends cannot evade the cooldown,
  // and a resend inside a live window keeps that window's guess count.
  const reserved = await sql.query(
    `insert into ${table} (email, code_hash, state, expires_at, attempts, sent_at)
    values ($1, $2, 'pending', now() + make_interval(mins => $3), 0, now())
    on conflict (email) do update set
      code_hash = excluded.code_hash,
      state = 'pending',
      expires_at = excluded.expires_at,
      attempts = case when ${table}.expires_at > now() then ${table}.attempts else 0 end,
      sent_at = excluded.sent_at
    where ${table}.expires_at <= now()
       or (${table}.sent_at <= now() - make_interval(secs => $4)
           and ${table}.attempts < $5)
    returning email`,
    [email, hash, CODE_TTL_MINUTES, RESEND_COOLDOWN_SECONDS, MAX_ATTEMPTS],
  );
  if (!reserved[0]) return { error: "rate" };

  // An address this entrance does not serve gets the same answer, but no mail and no
  // usable code, so neither side reveals who holds an account or a role.
  const who =
    scope === "admin" ? await adminIdentityFor(sql, email) : await identityFor(sql, email);
  if (who.kind === "blocked") return { sent: true };

  let delivered = false;
  try {
    delivered = await input.deliver(email, code);
  } catch {
    delivered = false;
  }
  if (!delivered) return { error: "unavailable" };
  // Never activate a newer reservation.
  const active = await sql.query(
    `update ${table} set state = 'active'
    where email = $1 and code_hash = $2 and state = 'pending' and expires_at > now()
    returning email`,
    [email, hash],
  );
  return active[0] ? { sent: true } : { error: "unavailable" };
}

export async function verifyEmailCode(
  sql: Sql,
  input: { email: unknown; code: unknown; ip: string; secret: string; scope?: CodeScope },
): Promise<VerifyResult> {
  const scope = input.scope ?? "customer";
  const table = TABLE[scope];
  const key = KEY[scope];
  const email = normalizeEmail(input.email);
  const code = cleanCode(input.code);
  if (!email || !code) return { error: "code" };
  if (await bump(sql, `ip:${key}-verify:hour:${input.ip}`, IP_VERIFY_HOUR_LIMIT, "hour"))
    return { error: "rate" };
  // Spend one guess atomically; the attempts < 5 guard holds under concurrency.
  const rows = await sql.query<{ code_hash: string }>(
    `update ${table} set attempts = attempts + 1
    where email = $1 and expires_at > now() and attempts < $2 and state = 'active'
    returning code_hash`,
    [email, MAX_ATTEMPTS],
  );
  const row = rows[0];
  if (!row) {
    const old = await sql.query<{ expired: boolean; locked: boolean }>(
      `select expires_at <= now() as expired, attempts >= $2 as locked
      from ${table} where email = $1 and state = 'active'`,
      [email, MAX_ATTEMPTS],
    );
    if (old[0]?.expired) return { error: "expired" };
    if (old[0]?.locked) return { error: "rate" };
    return { error: "code" };
  }
  const actual = await emailCodeHash(input.secret, email, code);
  if (!codesMatch(actual, row.code_hash)) return { error: "code" };
  // Single winner; an old verification cannot consume a concurrently resent code.
  const consumed = await sql.query(
    `delete from ${table}
    where email = $1 and code_hash = $2 and state = 'active' and expires_at > now()
    returning email`,
    [email, row.code_hash],
  );
  return consumed.length === 1 ? { ok: true, email } : { error: "code" };
}

/**
 * After a verified administrative code: the existing privileged account, and nothing else.
 * This entrance never creates a user and never grants a role.
 */
export async function adminAccount(
  sql: Sql,
  email: string,
): Promise<{ id: string } | { error: "code" }> {
  const who = await adminIdentityFor(sql, email);
  return who.kind === "customer" ? { id: who.id } : { error: "code" };
}

function displayName(raw: unknown, email: string) {
  const name = (typeof raw === "string" ? raw : "").trim().replace(/\s+/g, " ");
  if (name.length >= 2 && name.length <= 40) return name;
  return email.split("@")[0].slice(0, 40);
}

/**
 * After a verified code: the existing customer account, or a new one. Never a
 * privileged account. `createUser` is Better Auth's internal adapter in production.
 */
export async function customerAccount(
  sql: Sql,
  email: string,
  name: unknown,
  createUser: (input: { email: string; name: string }) => Promise<{ id: string }>,
): Promise<{ id: string } | { error: "code" }> {
  let who = await identityFor(sql, email);
  let id: string | null = who.kind === "customer" ? who.id : null;
  if (who.kind === "new") {
    try {
      id = (await createUser({ email, name: displayName(name, email) })).id;
    } catch {
      // A concurrent first sign-in created it (unique lower(email)); re-check its identity.
      who = await identityFor(sql, email);
      id = who.kind === "customer" ? who.id : null;
    }
  }
  if (!id) return { error: "code" };
  await sql`insert into user_roles (user_id, role, status, display_name)
    values (${id}, 'buyer', 'approved', ${displayName(name, email)})
    on conflict (user_id, role) do nothing`;
  return { id };
}
