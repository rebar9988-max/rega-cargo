import { createServerFn } from "@tanstack/react-start";
import { phoneOrAuthMiddleware } from "../auth/middleware";
import { MarketError } from "../market";
export const platformAdmin = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ context, data }) => {
    try {
      const { getSql } = await import("../db");
      const { managePlatform } = await import("./handlers.server");
      return { result: JSON.stringify(await managePlatform(await getSql(), context.userId, data)) };
    } catch (error) {
      return { error: error instanceof MarketError ? error.code : "unavailable" };
    }
  });
