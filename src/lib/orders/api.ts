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
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ data }) => {
    const { allow, serverSecret } = await import("@/lib/rate-limit.server");
    const { quoteBookingKey, verifyQuote } = await import("@/lib/quote-token");
    const { setResponseStatus } = await import("@tanstack/react-start/server");
    if (!(await allow("book"))) {
      setResponseStatus(429);
      return { error: "rate" as const };
    }
    if (data.declared !== true) {
      setResponseStatus(400);
      return { error: "declare" as const };
    }
    const secret = serverSecret("QUOTE_SECRET");
    if (!secret) return { error: "unavailable" as const };
    // Signature and expiry are checked before auth, so a tampered or expired quote is always refused.
    const quote = await verifyQuote(data.quote, secret);
    if (!quote) {
      setResponseStatus(400);
      return { error: "expired" as const };
    }
    const { resolveUserId } = await import("@/lib/auth/resolve-user.server");
    const userId = await resolveUserId();
    if (!userId) {
      setResponseStatus(401);
      return { error: "signin" as const };
    }
    const contents = typeof data.contents === "string" ? data.contents.slice(0, 20) : "personal";
    const { submitRequest } = await import("./handlers.server");
    // One booking per signed quote: replaying the same token returns the first request.
    return submitRequest(
      userId,
      "quote",
      { ...quote, contents, declared: true },
      Math.round(quote.total),
      { idempotencyKey: quoteBookingKey(String(data.quote)) },
    );
  });

/**
 * Buy / ship request from /stores/request. Order of checks: per-IP rate limit
 * (HTTP 429), bot gate (Turnstile or signed token), same-site + signed-in user,
 * then strict validation. Only the validated minimal fields are stored.
 */
export const orderStore = createServerFn({ method: "POST" })
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ data }) => {
    const { allow, clientIp } = await import("@/lib/rate-limit.server");
    const { setResponseStatus } = await import("@tanstack/react-start/server");
    if (!(await allow("request"))) {
      setResponseStatus(429);
      return { error: "rate" as const };
    }
    const { verifyGate } = await import("@/lib/ai/gate.server");
    if (!(await verifyGate({ token: data.token, turnstile: data.turnstile }, await clientIp()))) {
      setResponseStatus(403);
      return { error: "forbidden" as const };
    }
    // The contents declaration is mandatory, as for quote bookings and move requests.
    if (data.declared !== true) {
      setResponseStatus(400);
      return { error: "declare" as const };
    }
    // Reject bad input (links, quantity, destination) before touching auth or the database.
    const { validateStoreRequest, storeSubmissionKey } = await import("./store-request");
    const shape = validateStoreRequest(data, null, { requireContact: false });
    if (!shape.ok) {
      setResponseStatus(400);
      return { error: shape.error };
    }
    const { resolveUserId } = await import("@/lib/auth/resolve-user.server");
    const userId = await resolveUserId();
    if (!userId) {
      setResponseStatus(401);
      return { error: "signin" as const };
    }
    let sessionPhone: string | null = null;
    try {
      const { phoneMe } = await import("@/lib/phone/session.server");
      sessionPhone = (await phoneMe())?.phone ?? null;
    } catch {
      sessionPhone = null;
    }
    const checked = validateStoreRequest(data, sessionPhone);
    if (!checked.ok) {
      setResponseStatus(400);
      return { error: checked.error };
    }
    const { submitRequest } = await import("./handlers.server");
    let idempotencyKey: string | null;
    try {
      idempotencyKey = await storeSubmissionKey(data.submissionId, checked.data);
    } catch {
      setResponseStatus(400);
      return { error: "invalid" as const };
    }
    return submitRequest(userId, "store", { ...checked.data, declared: true }, null, {
      idempotencyKey,
    });
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
