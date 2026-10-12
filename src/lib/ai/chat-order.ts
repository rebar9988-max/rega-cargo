import { createServerFn } from "@tanstack/react-start";
import { phoneOrAuthMiddleware } from "../auth/middleware";
import { normalizeTrackingId } from "../orders/tracking-id";

/** Existing session and owner/staff permission checks; no private data enters AI context. */
export const chatOrder = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { ref: string }) => ({
    ref: typeof input.ref === "string" ? normalizeTrackingId(input.ref) : null,
  }))
  .handler(async ({ data, context }) => {
    if (!data.ref) return { error: "notfound" as const };
    const { allow } = await import("../rate-limit.server");
    if (!(await allow("ai-order"))) return { error: "unavailable" as const };
    try {
      const { requestDetail } = await import("../requests/handlers.server");
      const result = await requestDetail(context.userId, data.ref);
      return {
        ref: result.ref,
        status: result.status,
        events: result.events.map(({ title, titleKu, at, phase }) => ({
          title,
          titleKu,
          at,
          phase,
        })),
      };
    } catch (error) {
      const { MarketError } = await import("../market");
      return {
        error:
          error instanceof MarketError && ["forbidden", "notfound"].includes(error.code)
            ? ("notfound" as const)
            : ("unavailable" as const),
      };
    }
  });
