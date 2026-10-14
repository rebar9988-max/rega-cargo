import { z } from "zod";
import type { ResourceSpec } from "../admin/resource.server";
import { MarketError } from "../market";
import { validateRequest, shippingEstimateEur, staffCanSet } from "../requests/validate";
import { checkTextServer } from "../compliance/service.server";
import { newTrackingId } from "./tracking-id";
import { DECLARATION_VERSION } from "./handlers.server";

const create = z
  .object({
    flow: z.enum(["buy", "forward"]),
    link: z.string().optional(),
    description: z.string().optional(),
    qty: z.number(),
    origin: z.string(),
    originNote: z.string().optional(),
    dest: z.string(),
    weightKg: z.number().nullable().optional(),
    l: z.number().optional(),
    w: z.number().optional(),
    h: z.number().optional(),
    attachments: z.array(z.string()).optional(),
    notes: z.string().optional(),
    declared: z.literal(true),
  })
  .strict();
export const orderAdminResources: Record<string, ResourceSpec> = {
  orders: {
    module: "orders",
    table: "shipment_requests",
    keys: ["id"],
    columns: [
      "id",
      "user_id",
      "kind",
      "name",
      "phone",
      "payload",
      "estimate_eur",
      "status",
      "tracking_id",
      "created_at",
      "updated_at",
      "archived_at",
    ],
    create,
    update: z
      .object({
        status: z.enum([
          "reviewing",
          "purchased",
          "in_transit",
          "arrived",
          "delivered",
          "cancelled",
        ]),
      })
      .strict(),
    remove: () => ({ archived_at: new Date().toISOString() }),
    async prepare(sql, actor, data, current, operation) {
      if (operation === "delete") return data;
      if (operation === "create") {
        const checked = validateRequest(data);
        if (!checked.ok) throw new MarketError("invalid");
        if ((await checkTextServer(sql, JSON.stringify(checked.data))).decision === "block")
          throw new MarketError("prohibited");
        const contact = (
          await sql`select name, phone from phone_users where id = ${actor} and disabled_at is null and requires_verification = false`
        )[0];
        if (!contact) throw new MarketError("forbidden");
        return {
          id: crypto.randomUUID(),
          user_id: actor,
          kind: checked.data.flow,
          name: contact.name,
          phone: contact.phone,
          payload: JSON.stringify(checked.data),
          estimate_eur: shippingEstimateEur(checked.data),
          status: "received",
          tracking_id: newTrackingId(),
        };
      }
      const accepted =
        (
          await sql`select id from request_quotes where request_id = ${current!.id} and status = 'accepted'`
        ).length > 0;
      if (
        !staffCanSet(String(current!.status), String(data.status), String(current!.kind), accepted)
      )
        throw new MarketError("forbidden");
      return { ...data, updated_at: new Date().toISOString() };
    },
    effects({ actor, operation, param }) {
      if (operation === "delete") return "";
      return `, status_record as (insert into request_status_log(id, request_id, status, actor) select ${param(crypto.randomUUID())}, changed.id, changed.status, 'staff' from changed returning id)${operation === "create" ? `, receipt as (insert into tracking_events(id,shipment_id,title,title_ku,phase,occurred_at) select ${param(crypto.randomUUID())}, changed.id, 'Request received', 'داواکاری گەیشت', 'now', now() from changed returning id), declaration as (insert into declarations(id, user_id, kind, ref_id, version) select ${param(crypto.randomUUID())}, ${param(actor)}, changed.kind, changed.id, ${param(DECLARATION_VERSION)} from changed returning id)` : ""}`;
    },
  },
};
