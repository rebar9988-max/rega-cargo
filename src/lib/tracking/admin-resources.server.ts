import { z } from "zod";
import type { ResourceSpec } from "../admin/resource.server";
import { MarketError } from "../market";
const event = z
  .object({
    shipment_id: z.string().min(1).max(80),
    title: z.string().trim().min(3).max(120),
    title_ku: z.string().trim().min(3).max(120),
    place: z.string().max(80).default(""),
    place_ku: z.string().max(80).default(""),
    phase: z.enum(["done", "now", "next"]),
    occurred_at: z.iso.datetime({ offset: true }).nullable(),
    next_action: z.enum(["none", "wait", "invoice", "contact", "delivery"]).default("none"),
    estimate_from: z.iso.datetime({ offset: true }).nullable().default(null),
    estimate_to: z.iso.datetime({ offset: true }).nullable().default(null),
  })
  .strict();
export const trackingAdminResources: Record<string, ResourceSpec> = {
  tracking: {
    module: "tracking",
    table: "tracking_events",
    keys: ["id"],
    columns: ["id", ...Object.keys(event.shape), "created_at", "archived_at"],
    create: event,
    update: event.omit({ shipment_id: true }).partial(),
    defaults: () => ({ id: crypto.randomUUID() }),
    remove: () => ({ archived_at: new Date().toISOString() }),
    async prepare(sql, _actor, data, current, operation) {
      if (operation === "delete") return data;
      const merged = { ...current, ...data };
      if (
        !(
          await sql`select id from shipment_requests where id = ${merged.shipment_id} and archived_at is null`
        )[0]
      )
        throw new MarketError("notfound");
      const occurred =
        merged.occurred_at == null ? null : new Date(String(merged.occurred_at)).getTime();
      if (
        merged.phase === "next"
          ? occurred !== null
          : (operation === "create" && occurred === null) ||
            (occurred !== null && occurred > Date.now())
      )
        throw new MarketError("invalid");
      const from = merged.estimate_from,
        to = merged.estimate_to;
      if (
        (from == null) !== (to == null) ||
        (from != null && new Date(String(to)).getTime() < new Date(String(from)).getTime())
      )
        throw new MarketError("invalid");
      return data;
    },
  },
};
