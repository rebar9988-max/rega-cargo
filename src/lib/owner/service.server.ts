import type { Sql } from "../db.ts";

export class OwnerError extends Error {
  constructor() {
    super("Owner activation unavailable");
  }
}
export async function invitationHash(token: string): Promise<string> {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new OwnerError();
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}
/** An email-code sign-in must be this recent to count as proof of the mailbox. */
export const SESSION_PROOF_MAX_AGE_MS = 15 * 60 * 1000;

/**
 * Proof for an existing account that has no password (it signs in with an emailed code): the
 * request must carry a live session for exactly the invited, verified email, created a moment
 * ago. Returns the user id; throws OwnerError otherwise. Pure, so every refusal is unit-tested.
 */
export function sessionProof(
  current: {
    user?: { id?: string; email?: string; emailVerified?: boolean } | null;
    session?: { createdAt?: Date | string | number } | null;
  } | null,
  email: string,
  now: number = Date.now(),
): string {
  const user = current?.user;
  const created = current?.session?.createdAt;
  const at = created === undefined ? Number.NaN : new Date(created).getTime();
  if (
    !user?.id ||
    typeof user.email !== "string" ||
    user.email.toLowerCase() !== email.toLowerCase() ||
    user.emailVerified !== true ||
    !Number.isFinite(at) ||
    at > now + 60_000 ||
    now - at > SESSION_PROOF_MAX_AGE_MS
  ) {
    throw new OwnerError();
  }
  return user.id;
}

export async function ownerInvitation(sql: Sql, token: string) {
  const hash = await invitationHash(token);
  const row = (
    await sql<{ email: string; existing: boolean; hasPassword: boolean }>`
    select approved_email as email, exists(select 1 from "user" where lower(email) = approved_email) as existing,
    exists(select 1 from "account" a join "user" u on u.id = a."userId"
      where lower(u.email) = approved_email and a."providerId" = 'credential' and a."password" is not null) as "hasPassword"
    from owner_bootstrap where singleton = 1 and invitation_hash = ${hash} and consumed_at is null and expires_at > now()
    and not exists(select 1 from user_roles where role = 'super_admin' and status = 'approved')`
  )[0];
  if (!row) throw new OwnerError();
  return { ...row, hash };
}
/** Credentials remain in Better Auth. Never replace an existing account/password. */
export async function activateOwner(
  sql: Sql,
  input: { token: string; name: string; password?: string },
  authenticate: (input: {
    email: string;
    name: string;
    password: string;
    existing: boolean;
    hasPassword: boolean;
  }) => Promise<string>,
) {
  const ticket = await ownerInvitation(sql, input.token);
  const userId = await authenticate({
    email: ticket.email,
    existing: ticket.existing,
    hasPassword: ticket.hasPassword,
    name: input.name,
    password: input.password ?? "",
  });
  const result = (
    await sql<{
      activated: boolean;
    }>`select rl_activate_first_owner(${ticket.hash}, ${userId}) as activated`
  )[0];
  if (!result?.activated) throw new OwnerError();
  return { activated: true as const };
}
