import type { Sql } from "../db";
import { MarketError } from "../market";
import { adminResource } from "./resource.server";
import { requireSuperAdmin } from "../auth/authority.server";
import { identityAdminResources } from "../auth/admin-resources.server";
import { marketAdminResources } from "../market/admin-resources.server";
import { orderAdminResources } from "../orders/admin-resources.server";
import { deliveryAdminResources } from "../delivery/admin-resources.server";
import { trackingAdminResources } from "../tracking/admin-resources.server";
import { settingsAdminResources } from "./settings.server";
const resources = {
  ...marketAdminResources,
  ...orderAdminResources,
  ...deliveryAdminResources,
  ...trackingAdminResources,
  ...identityAdminResources,
  ...settingsAdminResources,
};
export async function managePlatform(sql: Sql, actor: string, input: Record<string, unknown>) {
  await requireSuperAdmin(sql, actor);
  if (input.resource === "audit" && input.operation === "list")
    return {
      rows: await sql`select id, actor_id, module, resource, resource_id, action, fields, created_at from platform_audit_log order by created_at desc limit 100`,
      keys: ["id"],
    };
  const resource = typeof input.resource === "string" ? input.resource : "";
  const spec = Object.hasOwn(resources, resource)
    ? resources[resource as keyof typeof resources]
    : null;
  if (!spec) throw new MarketError("invalid");
  return adminResource(sql, actor, resource, spec, input);
}
