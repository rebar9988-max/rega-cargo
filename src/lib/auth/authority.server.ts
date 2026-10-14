import type { Sql } from "../db.ts";
import { MarketError } from "../market.ts";
import { hasApprovedRole, isSuperAdmin } from "./authority.ts";

/** Always read database authority for the authenticated caller; never trust client roles or cache them. */
export async function authorityRows(sql: Sql, userId: string) {
  if (typeof userId !== "string" || !userId.trim()) throw new MarketError("forbidden");
  return sql<{ role: string; status: string }>`select role, status from user_roles where user_id = ${userId}`;
}
export async function requireSuperAdmin(sql: Sql, userId: string) {
  if (!isSuperAdmin(await authorityRows(sql, userId))) throw new MarketError("forbidden");
}
export async function isStaff(sql: Sql, userId: string) {
  return hasApprovedRole(await authorityRows(sql, userId), "admin");
}
export async function requireStaff(sql: Sql, userId: string) {
  if (!(await isStaff(sql, userId))) throw new MarketError("forbidden");
}
