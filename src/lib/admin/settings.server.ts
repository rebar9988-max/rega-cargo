import { z } from "zod";
import type { ResourceSpec } from "./resource.server";
import { MarketError } from "../market";
const setting = z
  .object({
    key: z.enum(["ai.assistant.enabled", "ai.assistant.daily_cap", "operations.note"]),
    value: z.union([z.boolean(), z.number().int().min(1).max(200), z.string().max(1000)]),
  })
  .strict();
export const settingsAdminResources: Record<string, ResourceSpec> = {
  settings: {
    module: "settings",
    table: "platform_settings",
    keys: ["key"],
    columns: ["key", "value", "updated_by", "updated_at", "archived_at"],
    create: setting,
    update: setting.omit({ key: true }),
    defaults: (actor) => ({ updated_by: actor }),
    remove: (actor) => ({ archived_at: new Date().toISOString(), updated_by: actor }),
    async prepare(_sql, actor, data, current, operation) {
      if (operation === "delete") return data;
      const key = data.key ?? current?.key;
      if (
        (key === "ai.assistant.enabled" && typeof data.value !== "boolean") ||
        (key === "ai.assistant.daily_cap" && typeof data.value !== "number") ||
        (key === "operations.note" && typeof data.value !== "string")
      )
        throw new MarketError("invalid");
      return {
        ...data,
        value: JSON.stringify(data.value),
        updated_by: actor,
        updated_at: new Date().toISOString(),
      };
    },
  },
};
