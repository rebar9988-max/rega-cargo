import type { Sql } from "../db.ts";
/** Fresh database identity, independent of client state and session-cookie caches. */
export async function verifiedEmailAccount(
  sql: Sql,
  userId: string,
): Promise<{ email: string } | null> {
  return (
    (
      await sql<{
        email: string;
      }>`select email from "user" where id = ${userId} and "emailVerified" = true and disabled_at is null`
    )[0] ?? null
  );
}
