import { createServerFn } from "@tanstack/react-start";
import { phoneOrAuthMiddleware } from "@/lib/auth/middleware";
import { MarketError } from "@/lib/market";

function fail(err: unknown) {
  if (err instanceof MarketError) return { error: err.code };
  console.error("[orders]", err instanceof Error ? err.message : "failed");
  return { error: "unavailable" };
}

export const orderQuote = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ data, context }) => {
    const { submitRequest } = await import("./handlers.server");
    const estimate = typeof data.estimateEur === "number" ? Math.round(data.estimateEur) : null;
    return submitRequest(context.userId, "quote", data, estimate);
  });

export const orderStore = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ data, context }) => {
    const { submitRequest } = await import("./handlers.server");
    return submitRequest(context.userId, "store", data, null);
  });

export const orderTrack = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { lookupTracking } = await import("./handlers.server");
    return lookupTracking(String(data.id ?? ""));
  });

export const orderAdmin = createServerFn({ method: "GET" })
  .middleware([phoneOrAuthMiddleware])
  .handler(async ({ context }) => {
    try {
      const { adminOrders } = await import("./handlers.server");
      return { orders: await adminOrders(context.userId) };
    } catch (err) {
      return fail(err);
    }
  });

export const orderAdminSet = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { id: string; status: string }) => input)
  .handler(async ({ data, context }) => {
    try {
      const { adminOrderStatus } = await import("./handlers.server");
      return await adminOrderStatus(context.userId, data.id, data.status);
    } catch (err) {
      return fail(err);
    }
  });
