import { z } from "zod";
import type { Sql } from "../db.ts";
import { MarketError } from "../market.ts";
import { requireSuperAdmin } from "../auth/authority.server.ts";

export type AdminOperation = "list" | "read" | "create" | "update" | "delete";
export type ResourceSpec = {
  module: "market" | "orders" | "delivery" | "tracking" | "ai" | "identity" | "settings";
  table: string;
  keys: string[];
  columns: string[];
  writeOnly?: string[];
  create: z.ZodType<Record<string, unknown>>;
  update: z.ZodType<Record<string, unknown>>;
  defaults?: (actor: string) => Record<string, unknown>;
  filter?: string;
  effects?: (context: {
    actor: string;
    current: Record<string, unknown> | null;
    data: Record<string, unknown>;
    operation: AdminOperation;
    param: (value: unknown) => string;
  }) => string;
  remove: Record<string, unknown> | ((actor: string) => Record<string, unknown>);
  prepare?: (
    sql: Sql,
    actor: string,
    data: Record<string, unknown>,
    current: Record<string, unknown> | null,
    operation: AdminOperation,
  ) => Promise<Record<string, unknown>>;
};

const identifier = (text: string) => {
  if (!/^[a-z_][a-z0-9_]*$/.test(text)) throw new MarketError("invalid");
  return `"${text}"`;
};

/** Closed resource adapters own table/column/schema selection. No client SQL, table or field names. */
export async function adminResource(
  sql: Sql,
  actor: string,
  resource: string,
  spec: ResourceSpec,
  input: Record<string, unknown>,
) {
  await requireSuperAdmin(sql, actor);
  const operation = input.operation as AdminOperation;
  if (!["list", "read", "create", "update", "delete"].includes(operation))
    throw new MarketError("invalid");
  const table = identifier(spec.table),
    columns = spec.columns.map(identifier).join(", ");
  const keys =
    input.key && typeof input.key === "object" && !Array.isArray(input.key)
      ? (input.key as Record<string, unknown>)
      : {};
  const keyValues = spec.keys.map((key) => keys[key]);
  if (
    operation !== "list" &&
    operation !== "create" &&
    (Object.keys(keys).length !== spec.keys.length ||
      keyValues.some((value) => typeof value !== "string" || !value || value.length > 120))
  )
    throw new MarketError("invalid");
  const where = spec.keys.map((key, i) => `${identifier(key)} = $${i + 1}`).join(" and ");
  if (operation === "list") {
    const offset = Number(input.offset ?? 0);
    if (!Number.isInteger(offset) || offset < 0 || offset > 100000)
      throw new MarketError("invalid");
    return {
      rows: await sql.query(
        `select ${columns} from ${table}${spec.filter ? ` where ${spec.filter}` : ""} order by ${spec.keys.map(identifier).join(", ")} limit 50 offset $1`,
        [offset],
      ),
      keys: spec.keys,
    };
  }
  const current =
    operation === "create"
      ? null
      : (
          await sql.query(
            `select ${columns}, xmin::text as _version from ${table} where ${where}${spec.filter ? ` and (${spec.filter})` : ""}`,
            keyValues,
          )
        )[0];
  if (operation !== "create" && !current) throw new MarketError("notfound");
  if (operation === "read") {
    const { _version, ...safe } = current!;
    void _version;
    return { row: safe, keys: spec.keys };
  }
  let data: Record<string, unknown>;
  if (operation === "delete")
    data = typeof spec.remove === "function" ? spec.remove(actor) : { ...spec.remove };
  else {
    const parsed = (operation === "create" ? spec.create : spec.update).safeParse(input.data);
    if (!parsed.success) throw new MarketError("invalid");
    const explicit =
      operation === "update"
        ? Object.fromEntries(
            Object.entries(parsed.data).filter(([field]) =>
              Object.hasOwn(input.data as object, field),
            ),
          )
        : parsed.data;
    data = { ...(operation === "create" ? spec.defaults?.(actor) : {}), ...explicit };
  }
  if (spec.prepare) data = await spec.prepare(sql, actor, data, current ?? null, operation);
  const entries = Object.entries(data);
  if (
    !entries.length ||
    entries.some(([field]) => !spec.columns.includes(field) && !spec.writeOnly?.includes(field))
  )
    throw new MarketError("invalid");
  const params: unknown[] = [actor];
  const value = (v: unknown) => {
    params.push(v);
    return `$${params.length}`;
  };
  const gate =
    "select user_id from user_roles where user_id = $1 and role = 'super_admin' and status = 'approved' for share";
  let mutation: string;
  if (operation === "create") {
    mutation = `insert into ${table} (${entries.map(([field]) => identifier(field)).join(", ")}) select ${entries.map(([, v]) => value(v)).join(", ")} from permitted returning ${columns}`;
  } else {
    const assignments = entries
      .map(([field, v]) => `${identifier(field)} = ${value(v)}`)
      .join(", ");
    const predicate = spec.keys
      .map((key, i) => `${identifier(key)} = ${value(keyValues[i])}`)
      .join(" and ");
    // Compare-and-swap status prevents a stale edit from skipping domain transitions.
    const versionGuard = current ? ` and xmin::text = ${value(current._version)}` : "";
    const statusGuard =
      current && "status" in current ? ` and status = ${value(current.status)}` : "";
    mutation = `update ${table} set ${assignments} where ${predicate}${statusGuard}${versionGuard} and exists(select 1 from permitted) returning ${columns}`;
  }
  const auditId = value(crypto.randomUUID()),
    module = value(spec.module),
    name = value(resource),
    action = value(operation),
    fields = value(JSON.stringify(entries.map(([field]) => field)));
  const id = spec.keys.map((key) => `changed.${identifier(key)}::text`).join(" || ':' || ");
  // Mutation and immutable audit entry commit atomically; an audit failure rolls back the mutation.
  const effects =
    spec.effects?.({ actor, current: current ?? null, data, operation, param: value }) ?? "";
  const rows = await sql.query(
    `with permitted as (${gate}), changed as (${mutation}), logged as (
    insert into platform_audit_log(id, actor_id, module, resource, resource_id, action, fields)
    select ${auditId}, $1, ${module}, ${name}, ${id}, ${action}, ${fields}::jsonb from changed returning id
  )${effects} select changed.* from changed where exists(select 1 from logged)`,
    params,
  );
  if (!rows[0]) throw new MarketError("forbidden");
  return { row: rows[0], keys: spec.keys };
}
