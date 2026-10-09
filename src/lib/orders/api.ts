import { createServerFn } from "@tanstack/react-start";
import { phoneOrAuthMiddleware } from "@/lib/auth/middleware";
import { MarketError } from "@/lib/market";

function fail(err: unknown) {
  if (err instanceof MarketError) return { error: err.code };
  console.error("[orders]", err instanceof Error ? err.message : "failed");
  return { error: "unavailable" };
}

/** Prices a shipment on the server and returns a signed 30-minute quote token. */
export const issueQuote = createServerFn({ method: "POST" })
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ data }) => {
    const { allow, serverSecret } = await import("@/lib/rate-limit.server");
    const { priceQuote, signQuote } = await import("@/lib/quote-token");
    if (!(await allow("quote"))) return { error: "rate" as const };
    const secret = serverSecret("QUOTE_SECRET");
    if (!secret) return { error: "unavailable" as const };
    const priced = priceQuote(data);
    if (!priced) return { error: "invalid" as const };
    const { token, payload } = await signQuote(priced, secret);
    return { token, total: payload.total, chargeable: payload.chargeable, exp: payload.exp };
  });

/** Books a quote. Only a valid signed token is accepted; the client sends no price. */
export const orderQuote = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ data, context }) => {
    const { serverSecret } = await import("@/lib/rate-limit.server");
    const { verifyQuote } = await import("@/lib/quote-token");
    if (data.declared !== true) return { error: "declare" as const };
    const secret = serverSecret("QUOTE_SECRET");
    if (!secret) return { error: "unavailable" as const };
    const quote = await verifyQuote(data.quote, secret);
    if (!quote) return { error: "expired" as const };
    const contents = typeof data.contents === "string" ? data.contents.slice(0, 20) : "personal";
    const { submitRequest } = await import("./handlers.server");
    return submitRequest(context.userId, "quote", { ...quote, contents, declared: true }, Math.round(quote.total));
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
    const { allow } = await import("@/lib/rate-limit.server");
    if (!(await allow("track"))) return { error: "rate" as const };
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
