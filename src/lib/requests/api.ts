import { createServerFn } from "@tanstack/react-start";
import { phoneOrAuthMiddleware } from "@/lib/auth/middleware";
import { MarketError } from "@/lib/market";

function fail(err: unknown) {
  if (err instanceof MarketError) return { error: err.code };
  console.error("[requests]", err instanceof Error ? err.message : "failed");
  return { error: "unavailable" as const };
}

type Input = Record<string, unknown>;

/** New "buy for me" / "ship it for me" request. Idempotent per form key. */
export const requestCreate = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: Input) => input)
  .handler(async ({ data, context }) => {
    const { allow } = await import("@/lib/rate-limit.server");
    if (!(await allow("request"))) return { error: "rate" as const };
    try {
      const { createRequest } = await import("./handlers.server");
      return await createRequest(context.userId, data);
    } catch (err) {
      return fail(err);
    }
  });

export const requestMine = createServerFn({ method: "GET" })
  .middleware([phoneOrAuthMiddleware])
  .handler(async ({ context }) => {
    try {
      const { myRequests } = await import("./handlers.server");
      return { requests: await myRequests(context.userId) };
    } catch (err) {
      return fail(err);
    }
  });

export const requestGet = createServerFn({ method: "GET" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { ref: string }) => input)
  .handler(async ({ data, context }) => {
    try {
      const { requestDetail } = await import("./handlers.server");
      return { request: await requestDetail(context.userId, data.ref) };
    } catch (err) {
      return fail(err);
    }
  });

export const requestDecide = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { ref: string; quoteId: string; accept: boolean }) => input)
  .handler(async ({ data, context }) => {
    try {
      const { acceptQuote, declineQuote } = await import("./handlers.server");
      return data.accept === true
        ? await acceptQuote(context.userId, data.ref, data.quoteId)
        : await declineQuote(context.userId, data.ref, data.quoteId);
    } catch (err) {
      return fail(err);
    }
  });

export const staffList = createServerFn({ method: "GET" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { status?: string }) => input)
  .handler(async ({ data, context }) => {
    try {
      const { staffRequests } = await import("./handlers.server");
      return { requests: await staffRequests(context.userId, data.status) };
    } catch (err) {
      return fail(err);
    }
  });

export const staffAction = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: Input) => input)
  .handler(async ({ data, context }) => {
    try {
      const handlers = await import("./handlers.server");
      if (data.action === "quote") return await handlers.staffQuote(context.userId, data);
      if (data.action === "status") return await handlers.staffSetStatus(context.userId, data);
      if (data.action === "event") return await handlers.staffAddEvent(context.userId, data);
      return { error: "invalid" as const };
    } catch (err) {
      return fail(err);
    }
  });
