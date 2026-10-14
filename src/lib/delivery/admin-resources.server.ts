import { z } from "zod";
import type { ResourceSpec } from "../admin/resource.server";
import { MarketError } from "../market";
import { checkTextServer } from "../compliance/service.server";
const text = z.string().trim().min(3).max(500);
const status = z.enum([
  "requested",
  "accepted",
  "picked_up",
  "on_the_way",
  "delivered",
  "cancelled",
]);
const schemas = {
  delivery: z
    .object({
      product_slug: z.string().max(80).nullable().optional(),
      pickup: text,
      dropoff: text,
      item_desc: text,
      size_note: z.string().max(80).default(""),
      preferred_date: z.string().max(40).default(""),
    })
    .strict(),
  transport: z
    .object({
      origin: text,
      destination: text,
      load_desc: text,
      preferred_date: z.string().max(40).default(""),
    })
    .strict(),
};
function adapter(kind: keyof typeof schemas): ResourceSpec {
  const schema = schemas[kind];
  return {
    module: "delivery",
    table: `${kind}_requests`,
    keys: ["id"],
    columns: [
      "id",
      "user_id",
      ...Object.keys(schema.shape),
      "status",
      "courier_id",
      "created_at",
      "archived_at",
    ],
    create: schema.extend({ declared: z.literal(true) }),
    update: schema
      .partial()
      .extend({ status: status.optional(), courier_id: z.string().max(80).nullable().optional() })
      .strict(),
    defaults: (actor) => ({ id: crypto.randomUUID(), user_id: actor, status: "requested" }),
    remove: () => ({ archived_at: new Date().toISOString() }),
    async prepare(sql, _actor, data, current, operation) {
      if (operation === "delete") return data;
      delete data.declared;
      if (
        (
          await checkTextServer(
            sql,
            Object.values(data)
              .filter((x) => typeof x === "string")
              .join(" "),
          )
        ).decision === "block"
      )
        throw new MarketError("prohibited");
      const flow = ["requested", "accepted", "picked_up", "on_the_way", "delivered"];
      if (
        current &&
        data.status &&
        data.status !== current.status &&
        (data.status === "cancelled"
          ? ["delivered", "cancelled"].includes(String(current.status))
          : flow.indexOf(String(data.status)) !== flow.indexOf(String(current.status)) + 1)
      )
        throw new MarketError("invalid");
      const courier = Object.hasOwn(data, "courier_id") ? data.courier_id : current?.courier_id;
      const resultingStatus = data.status ?? current?.status ?? "requested";
      if (resultingStatus !== "requested" && resultingStatus !== "cancelled" && !courier)
        throw new MarketError("invalid");
      if (
        courier &&
        !(
          await sql`select user_id from user_roles where user_id = ${courier} and role in ('courier', 'super_admin') and status = 'approved'`
        )[0]
      )
        throw new MarketError("forbidden");
      return data;
    },
    effects({ actor, current, data, operation, param }) {
      if (operation === "delete" || (current && (!data.status || data.status === current.status)))
        return "";
      const history = `, job_record as (insert into job_status(id, job_kind, job_id, status, actor_id) select ${param(crypto.randomUUID())}, ${param(kind)}, changed.id, changed.status, ${param(actor)} from changed returning id)`;
      return (
        history +
        (operation === "create"
          ? `, declared as (insert into declarations(id,user_id,kind,ref_id,version) select ${param(crypto.randomUUID())}, ${param(actor)}, ${param(kind)}, changed.id, '2026-10-09' from changed returning id)`
          : "")
      );
    },
  };
}
export const deliveryAdminResources = {
  delivery: adapter("delivery"),
  transport: adapter("transport"),
};
