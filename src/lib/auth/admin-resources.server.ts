import { z } from "zod";
import type { ResourceSpec } from "../admin/resource.server";
import { hashCode, codeSecret } from "../phone/codes";
import { MarketError } from "../market";
const role = z
  .object({
    user_id: z.string().min(1).max(80),
    role: z.enum(["buyer", "seller", "courier", "admin", "super_admin"]),
    status: z.enum(["pending", "approved", "removed"]),
    display_name: z.string().max(80).nullable().optional(),
    city: z.string().max(60).nullable().optional(),
    phone: z.string().max(20).nullable().optional(),
  })
  .strict();
export const identityAdminResources: Record<string, ResourceSpec> = {
  roles: {
    module: "identity",
    table: "user_roles",
    keys: ["user_id", "role"],
    columns: [...Object.keys(role.shape), "created_at"],
    create: role,
    update: role.omit({ user_id: true, role: true }).partial(),
    remove: { status: "removed" },
    async prepare(sql, _actor, data, current, operation) {
      if (operation !== "delete" && data.status === "approved") {
        const account = (
          await sql`select id from phone_users where id = ${data.user_id ?? current?.user_id} and disabled_at is null`
        )[0];
        if (!account) throw new MarketError("forbidden");
      }
      return data;
    },
  },
  users: {
    module: "identity",
    table: "phone_users",
    keys: ["id"],
    columns: ["id", "phone", "name", "created_at", "disabled_at", "provisioned_at"],
    writeOnly: ["pin_hash", "pin_salt"],
    create: z
      .object({
        phone: z.string().regex(/^\+[1-9][0-9]{7,14}$/),
        name: z.string().trim().min(1).max(80),
      })
      .strict(),
    update: z
      .object({
        name: z.string().trim().min(1).max(80).optional(),
        disabled_at: z.iso.datetime({ offset: true }).nullable().optional(),
      })
      .strict(),
    defaults: () => ({
      id: `ph_${crypto.randomUUID()}`,
      provisioned_at: new Date().toISOString(),
      disabled_at: new Date().toISOString(),
    }),
    remove: () => ({ disabled_at: new Date().toISOString(), provisioned_at: null }),
    async prepare(sql, _actor, data, current, operation) {
      if (operation === "create")
        return {
          ...data,
          pin_hash: await hashCode(codeSecret(), String(data.phone), crypto.randomUUID()),
          pin_salt: crypto.randomUUID(),
        };
      if (current?.provisioned_at && data.disabled_at === null) throw new MarketError("forbidden"); // Only the existing delivered OTP can activate a provisioned account.
      if (
        data.disabled_at &&
        (
          await sql`select user_id from user_roles where user_id = ${current!.id} and role = 'super_admin' and status = 'approved'`
        )[0]
      )
        throw new MarketError("forbidden");
      return data;
    },
  },
};
