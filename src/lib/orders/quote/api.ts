/**
 * Bring For Me Phase 1 endpoints (server functions). Every one needs a signed-in customer; the
 * admin ones are additionally checked against user_roles on the server (SUPER_ADMIN for
 * settings, coupons and the review queue; staff for recording a review of a quote).
 *
 * Nothing here creates an order, takes a payment or contacts a store. All amounts are whole IQD.
 * Errors come back as `{ error: "<code>" }` (plus `field` / `limit` / `missing` where useful).
 */
import { createServerFn } from "@tanstack/react-start";
import { phoneOrAuthMiddleware } from "@/lib/auth/middleware";
import { GOVERNORATES, LIMITS } from "./constants";

type Input = Record<string, unknown>;

async function guarded<T>(scope: string, run: () => Promise<T>) {
  const { allow } = await import("@/lib/rate-limit.server");
  const { failure } = await import("./handlers.server");
  if (!(await allow(scope))) return { error: "rate" as const };
  try {
    return await run();
  } catch (err) {
    return failure(err) as { error: string };
  }
}

// ----------------------------------------------------------------------------- reference data

/** Supported stores, governorates and the Phase 1 limits. Static or near-static, no secrets. */
export const bfmReference = createServerFn({ method: "GET" })
  .middleware([phoneOrAuthMiddleware])
  .handler(async () =>
    guarded("bfm-ref", async () => {
      const { cart, cartContext } = await import("./handlers.server");
      const { sql } = await cartContext();
      const stores = (await cart.loadStores(sql)).filter((s) => s.enabled);
      return {
        stores: stores.map((s) => ({ key: s.key, name: s.name, domains: s.domains })),
        governorates: GOVERNORATES,
        limits: { ...LIMITS, shipments: 1 },
      };
    }),
  );

// ----------------------------------------------------------------------------------- import

export const bfmImportLink = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { url: unknown }) => input)
  .handler(async ({ data, context }) => {
    const { failure, runImport } = await import("./handlers.server");
    try {
      return await runImport(context.userId, data.url);
    } catch (err) {
      return failure(err) as { error: string };
    }
  });

// ------------------------------------------------------------------------------------ cart

export const bfmCartGet = createServerFn({ method: "GET" })
  .middleware([phoneOrAuthMiddleware])
  .handler(async ({ context }) =>
    guarded("bfm-cart-read", async () => {
      const { cart, cartContext } = await import("./handlers.server");
      const { sql } = await cartContext();
      return cart.getCart(sql, context.userId);
    }),
  );

export const bfmCartAdd = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: Input) => input)
  .handler(async ({ data, context }) =>
    guarded("bfm-cart", async () => {
      const { cart, cartContext } = await import("./handlers.server");
      const { sql, ctx } = await cartContext();
      return cart.addItem(sql, context.userId, data, ctx);
    }),
  );

export const bfmCartSetQuantity = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { itemId: unknown; quantity: unknown }) => input)
  .handler(async ({ data, context }) =>
    guarded("bfm-cart", async () => {
      const { cart, cartContext } = await import("./handlers.server");
      const { sql } = await cartContext();
      return cart.setQuantity(sql, context.userId, data.itemId, data.quantity);
    }),
  );

export const bfmCartRemove = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { itemId: unknown }) => input)
  .handler(async ({ data, context }) =>
    guarded("bfm-cart", async () => {
      const { cart, cartContext } = await import("./handlers.server");
      const { sql } = await cartContext();
      return cart.removeItem(sql, context.userId, data.itemId);
    }),
  );

export const bfmCartSetDestination = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { governorate: unknown }) => input)
  .handler(async ({ data, context }) =>
    guarded("bfm-cart", async () => {
      const { cart, cartContext } = await import("./handlers.server");
      const { sql } = await cartContext();
      return cart.setDestination(sql, context.userId, data.governorate);
    }),
  );

export const bfmCartSetCoupon = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { code: unknown }) => input)
  .handler(async ({ data, context }) =>
    guarded("bfm-cart", async () => {
      const { cart, cartContext } = await import("./handlers.server");
      const { sql } = await cartContext();
      return cart.setCoupon(sql, context.userId, data.code);
    }),
  );

// ----------------------------------------------------------------------------------- quote

/** The cost ESTIMATE for the whole cart. Refuses (no total) while a required setting is missing. */
export const bfmCartQuote = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .handler(async ({ context }) =>
    guarded("bfm-quote", async () => {
      const { cartContext, cartQuote } = await import("./handlers.server");
      const { sql, ctx } = await cartContext();
      const result = await cartQuote(sql, context.userId, ctx.now);
      return result.ok
        ? { quote: result.quote, reused: result.reused }
        : { error: result.error.code, detail: result.error };
    }),
  );

export const bfmQuoteGet = createServerFn({ method: "GET" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { quoteId: unknown }) => input)
  .handler(async ({ data, context }) =>
    guarded("bfm-cart-read", async () => {
      const { cartContext, getQuote } = await import("./handlers.server");
      const { sql, ctx } = await cartContext();
      return { quote: await getQuote(sql, context.userId, data.quoteId, ctx.now) };
    }),
  );

// ------------------------------------------------------------------------- owner (SUPER_ADMIN)

export const bfmAdminSettings = createServerFn({ method: "GET" })
  .middleware([phoneOrAuthMiddleware])
  .handler(async ({ context }) =>
    guarded("bfm-admin", async () => {
      const { admin, cartContext } = await import("./handlers.server");
      const { sql } = await cartContext();
      return admin.adminListSettings(sql, context.userId);
    }),
  );

export const bfmAdminSetSettings = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { entries: unknown }) => input)
  .handler(async ({ data, context }) =>
    guarded("bfm-admin", async () => {
      const { admin, cartContext } = await import("./handlers.server");
      const { sql } = await cartContext();
      return admin.adminSetSettings(sql, context.userId, data.entries);
    }),
  );

export const bfmAdminSettingsHistory = createServerFn({ method: "GET" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { key?: unknown }) => input)
  .handler(async ({ data, context }) =>
    guarded("bfm-admin", async () => {
      const { admin, cartContext } = await import("./handlers.server");
      const { sql } = await cartContext();
      return admin.adminSettingsHistory(sql, context.userId, data.key);
    }),
  );

export const bfmAdminCoupons = createServerFn({ method: "GET" })
  .middleware([phoneOrAuthMiddleware])
  .handler(async ({ context }) =>
    guarded("bfm-admin", async () => {
      const { admin, cartContext } = await import("./handlers.server");
      const { sql } = await cartContext();
      return admin.adminListCoupons(sql, context.userId);
    }),
  );

export const bfmAdminCouponCreate = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: Input) => input)
  .handler(async ({ data, context }) =>
    guarded("bfm-admin", async () => {
      const { admin, cartContext } = await import("./handlers.server");
      const { sql } = await cartContext();
      return admin.adminCreateCoupon(sql, context.userId, data);
    }),
  );

export const bfmAdminCouponDeactivate = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { code: unknown }) => input)
  .handler(async ({ data, context }) =>
    guarded("bfm-admin", async () => {
      const { admin, cartContext } = await import("./handlers.server");
      const { sql } = await cartContext();
      return admin.adminDeactivateCoupon(sql, context.userId, data.code);
    }),
  );

export const bfmAdminReviewQueue = createServerFn({ method: "GET" })
  .middleware([phoneOrAuthMiddleware])
  .handler(async ({ context }) =>
    guarded("bfm-admin", async () => {
      const { admin, cartContext } = await import("./handlers.server");
      const { sql } = await cartContext();
      return admin.adminReviewQueue(sql, context.userId);
    }),
  );

export const bfmAdminReviewDecide = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { itemId: unknown; decision: unknown }) => input)
  .handler(async ({ data, context }) =>
    guarded("bfm-admin", async () => {
      const { admin, cartContext } = await import("./handlers.server");
      const { sql } = await cartContext();
      return admin.adminDecideReview(sql, context.userId, data.itemId, data.decision);
    }),
  );

// ------------------------------------------------------------------------------ R&L staff

export const bfmStaffQuoteDecide = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { quoteId: unknown; decision: unknown }) => input)
  .handler(async ({ data, context }) =>
    guarded("bfm-admin", async () => {
      const { admin, cartContext } = await import("./handlers.server");
      const { sql } = await cartContext();
      return admin.staffDecideQuote(sql, context.userId, data.quoteId, data.decision);
    }),
  );
