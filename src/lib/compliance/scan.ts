/**
 * One-time (and re-runnable) compliance scan of existing data. Shared by the admin server
 * function (/admin → "Run compliance scan") and scripts/compliance-scan.mjs.
 *
 * - products: a clear match → compliance_status 'blocked' and unpublished; an unclear match →
 *   'pending_review' and unpublished (skipped when an admin already cleared it after review).
 * - reviews and offers (contact link): a clear match → status 'removed'.
 * - seller / courier names: a clear match → role back to 'pending' for an admin to look at.
 * Idempotent: running it again changes nothing new.
 */
import { checkProduct, checkText, type CompiledRules, type Match } from "./check.ts";

export type Query = <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<T[]>;
export type ScanItem = {
  table: string;
  id: string;
  label: string;
  decision: "block" | "review";
  matches: Match[];
  changed: boolean;
};
export type ScanReport = {
  at: string;
  scanned: Record<"products" | "reviews" | "offers" | "roles", number>;
  blocked: ScanItem[];
  review: ScanItem[];
};

const s = (v: unknown) => (v == null ? "" : String(v));

export async function scanDatabase(
  query: Query,
  rules: CompiledRules,
  actor: string,
): Promise<ScanReport> {
  const report: ScanReport = {
    at: new Date().toISOString(),
    scanned: { products: 0, reviews: 0, offers: 0, roles: 0 },
    blocked: [],
    review: [],
  };

  const products = await query(
    `select id, slug, name_en, name_ku, brand, category_id, description_ku, specs, status, compliance_status, compliance_reason
     from products where status <> 'removed'`,
  );
  report.scanned.products = products.length;
  for (const p of products) {
    const verdict = checkProduct(
      {
        title: s(p.name_en),
        titleKu: s(p.name_ku),
        brand: s(p.brand),
        category: s(p.category_id),
        description: s(p.description_ku),
        attributes: s(p.specs),
      },
      rules,
    );
    if (verdict.decision === "allow") continue;
    const label = `${s(p.name_en)} (${s(p.slug)})`;
    const reason = JSON.stringify({ scan: report.at, by: actor, matches: verdict.matches });
    if (verdict.decision === "block") {
      const rows = await query(
        `update products set compliance_status = 'blocked', compliance_reason = $2::jsonb,
           status = case when status = 'approved' then 'pending' else status end
         where id = $1 and compliance_status <> 'blocked' returning id`,
        [p.id, reason],
      );
      report.blocked.push({
        table: "products",
        id: s(p.slug),
        label,
        decision: "block",
        matches: verdict.matches,
        changed: rows.length > 0,
      });
    } else {
      const cleared = (p.compliance_reason as { cleared_by?: unknown } | null)?.cleared_by;
      if (cleared) continue;
      const rows = await query(
        `update products set compliance_status = 'pending_review', compliance_reason = $2::jsonb,
           status = case when status = 'approved' then 'pending' else status end
         where id = $1 and compliance_status = 'ok' returning id`,
        [p.id, reason],
      );
      report.review.push({
        table: "products",
        id: s(p.slug),
        label,
        decision: "review",
        matches: verdict.matches,
        changed: rows.length > 0,
      });
    }
  }

  const simple: {
    table: "reviews" | "offers" | "user_roles";
    key: "reviews" | "offers" | "roles";
    select: string;
    text: (r: Record<string, unknown>) => string;
    id: (r: Record<string, unknown>) => string;
    update: string;
  }[] = [
    {
      table: "reviews",
      key: "reviews",
      select: `select id, body from reviews where status <> 'removed' and coalesce(body, '') <> ''`,
      text: (r) => s(r.body),
      id: (r) => s(r.id),
      update: `update reviews set status = 'removed' where id = $1 and status <> 'removed' returning id`,
    },
    {
      table: "offers",
      key: "offers",
      select: `select id, contact from offers where status <> 'removed'`,
      text: (r) => s(r.contact),
      id: (r) => s(r.id),
      update: `update offers set status = 'removed' where id = $1 and status <> 'removed' returning id`,
    },
    {
      table: "user_roles",
      key: "roles",
      select: `select user_id || ':' || role as id, display_name, city from user_roles where status = 'approved' and role in ('seller', 'courier')`,
      text: (r) => `${s(r.display_name)} \n ${s(r.city)}`,
      id: (r) => s(r.id),
      update: `update user_roles set status = 'pending' where user_id || ':' || role = $1 and status = 'approved' returning user_id`,
    },
  ];
  for (const t of simple) {
    const rows = await query(t.select);
    report.scanned[t.key] = rows.length;
    for (const r of rows) {
      const verdict = checkText(t.text(r), rules);
      if (verdict.decision !== "block") continue;
      const changed = await query(t.update, [t.id(r)]);
      report.blocked.push({
        table: t.table,
        id: t.id(r),
        label: t.text(r).slice(0, 80),
        decision: "block",
        matches: verdict.matches,
        changed: changed.length > 0,
      });
    }
  }

  await query(
    `insert into compliance_audit_log (action, table_name, details) values ('scan', 'products', $1::jsonb)`,
    [
      JSON.stringify({
        by: actor,
        at: report.at,
        scanned: report.scanned,
        blocked: report.blocked.length,
        review: report.review.length,
      }),
    ],
  );
  return report;
}
