/**
 * Server side of the compliance check: the bundled rules unioned with the locked DB rules
 * (prohibited_keywords) when a database is connected, cached for 5 minutes. Any DB error falls
 * back to the bundled rules, never to "allow everything".
 */
import type { Sql } from "../db.ts";
import { BUNDLED_KEYWORDS } from "./rules.ts";
import {
  BUNDLED_RULES,
  checkProduct,
  checkText,
  compileRules,
  type CheckResult,
  type CompiledRules,
  type ProductFields,
  type Rule,
} from "./check.ts";

const TTL_MS = 5 * 60 * 1000;
let cache: { at: number; rules: CompiledRules } | null = null;

export async function complianceRules(sql: Sql | null): Promise<CompiledRules> {
  if (!sql) return BUNDLED_RULES;
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rules;
  try {
    const rows = await sql<Rule>`
      select c.slug as category, k.keyword, k.level
      from prohibited_keywords k join prohibited_categories c on c.id = k.category_id`;
    const rules = compileRules([...BUNDLED_KEYWORDS, ...rows]);
    cache = { at: Date.now(), rules };
    return rules;
  } catch (err) {
    console.error("[compliance] DB rules unavailable, using bundled list", (err as Error).message);
    return BUNDLED_RULES;
  }
}

/** Test hook: forget the cached DB rules. */
export function resetComplianceCache() {
  cache = null;
}

export async function checkProductServer(
  sql: Sql | null,
  product: ProductFields,
): Promise<CheckResult> {
  return checkProduct(product, await complianceRules(sql));
}

export async function checkTextServer(sql: Sql | null, text: string): Promise<CheckResult> {
  return checkText(text, await complianceRules(sql));
}

/** Best-effort audit entry (never throws: logging must not break the request). */
export async function auditLog(
  sql: Sql | null,
  action: string,
  tableName: string,
  details: unknown,
) {
  if (!sql) return;
  try {
    await sql`insert into compliance_audit_log (action, table_name, details) values (${action}, ${tableName}, ${JSON.stringify(details)}::jsonb)`;
  } catch (err) {
    console.error("[compliance] audit log failed", (err as Error).message);
  }
}

export type ScreenedBatch<T> = {
  accepted: T[];
  review: { item: T; result: CheckResult }[];
  rejected: { item: T; result: CheckResult }[];
};

/**
 * Bulk import / supplier feed gate. There is no importer in the app today; any future import
 * MUST pass its rows through this before writing: rejected rows are dropped, review rows are
 * written with compliance_status = 'pending_review' (never published).
 */
export async function screenProducts<T extends ProductFields>(
  sql: Sql | null,
  items: readonly T[],
): Promise<ScreenedBatch<T>> {
  const rules = await complianceRules(sql);
  const out: ScreenedBatch<T> = { accepted: [], review: [], rejected: [] };
  for (const item of items) {
    const result = checkProduct(item, rules);
    if (result.decision === "block") out.rejected.push({ item, result });
    else if (result.decision === "review") out.review.push({ item, result });
    else out.accepted.push(item);
  }
  if (out.rejected.length) {
    await auditLog(sql, "rejected_import", "products", {
      count: out.rejected.length,
      matches: out.rejected.map((r) => r.result.matches),
    });
  }
  return out;
}

/** Admin-triggered scan of existing data (see scan.ts). */
export async function runComplianceScan(sql: Sql, actor: string) {
  const { scanDatabase } = await import("./scan.ts");
  resetComplianceCache();
  const rules = await complianceRules(sql);
  return scanDatabase((text, params) => sql.query(text, params), rules, actor);
}
