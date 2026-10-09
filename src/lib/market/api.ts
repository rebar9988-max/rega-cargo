import { createServerFn } from "@tanstack/react-start";
import { phoneOrAuthMiddleware } from "@/lib/auth/middleware";
import { MarketError } from "@/lib/market";

async function optionalUser() {
  try {
    const { currentPhoneUserId } = await import("@/lib/phone/session.server");
    const phone = await currentPhoneUserId();
    if (phone) return phone;
  } catch {
    /* phone tables may be absent during a cold start */
  }
  try {
    const { requireUserId } = await import("@/lib/auth/verify.server");
    return await requireUserId();
  } catch {
    return null;
  }
}

function fail(err: unknown): { error: string } {
  if (err instanceof MarketError) return { error: err.code };
  console.error("[market]", err);
  return { error: "invalid" };
}

export const marketHome = createServerFn({ method: "GET" })
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ data }) => {
    try {
      const { listProducts } = await import("./handlers.server");
      const userId = await optionalUser();
      return await listProducts({ ...data, userId });
    } catch (err) {
      return fail(err);
    }
  });

export const marketProduct = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    try {
      const { getProduct } = await import("./handlers.server");
      return await getProduct(data.slug, await optionalUser());
    } catch (err) {
      return fail(err);
    }
  });

export const marketMe = createServerFn({ method: "GET" })
  .middleware([phoneOrAuthMiddleware])
  .handler(async ({ context }) => {
    const { getMe } = await import("./handlers.server");
    return getMe(context.userId);
  });

export const marketRole = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ data, context }) => {
    try {
      const { requestRole } = await import("./handlers.server");
      return await requestRole(context.userId, data);
    } catch (err) {
      return fail(err);
    }
  });

export const marketSaveProduct = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ data, context }) => {
    try {
      const { saveProduct } = await import("./handlers.server");
      return await saveProduct(context.userId, data);
    } catch (err) {
      return fail(err);
    }
  });

export const marketSaveOffer = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ data, context }) => {
    try {
      const { saveOffer } = await import("./handlers.server");
      return await saveOffer(context.userId, data);
    } catch (err) {
      return fail(err);
    }
  });

export const marketMine = createServerFn({ method: "GET" })
  .middleware([phoneOrAuthMiddleware])
  .handler(async ({ context }) => {
    const { myOffers } = await import("./handlers.server");
    return myOffers(context.userId);
  });

export const marketFavorite = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { slug: string; on: boolean }) => input)
  .handler(async ({ data, context }) => {
    try {
      const { setFavorite } = await import("./handlers.server");
      return await setFavorite(context.userId, data.slug, data.on);
    } catch (err) {
      return fail(err);
    }
  });

export const marketAlert = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { slug: string; target: unknown }) => input)
  .handler(async ({ data, context }) => {
    try {
      const { setAlert } = await import("./handlers.server");
      return await setAlert(context.userId, data.slug, data.target);
    } catch (err) {
      return fail(err);
    }
  });

export const marketReview = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { slug: string; rating: unknown; body: unknown }) => input)
  .handler(async ({ data, context }) => {
    try {
      const { addReview } = await import("./handlers.server");
      return await addReview(context.userId, data.slug, data.rating, data.body);
    } catch (err) {
      return fail(err);
    }
  });

export const marketReport = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { subject: string; body: string }) => input)
  .handler(async ({ data, context }) => {
    try {
      const { reportProblem } = await import("./handlers.server");
      return await reportProblem(context.userId, data.subject, data.body);
    } catch (err) {
      return fail(err);
    }
  });

export const marketAdmin = createServerFn({ method: "GET" })
  .middleware([phoneOrAuthMiddleware])
  .handler(async ({ context }) => {
    try {
      const { adminQueue } = await import("./handlers.server");
      return await adminQueue(context.userId);
    } catch (err) {
      return fail(err);
    }
  });

export const marketAdminSet = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ data, context }) => {
    try {
      const { adminSet } = await import("./handlers.server");
      return await adminSet(context.userId, data);
    } catch (err) {
      return fail(err);
    }
  });

export const marketAdminComplianceScan = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .handler(async ({ context }) => {
    try {
      const { adminComplianceScan } = await import("./handlers.server");
      return await adminComplianceScan(context.userId);
    } catch (err) {
      return fail(err);
    }
  });

export const moveCreateDelivery = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ data, context }) => {
    try {
      const { createDelivery } = await import("./handlers.server");
      return await createDelivery(context.userId, data);
    } catch (err) {
      return fail(err);
    }
  });

export const moveCreateTransport = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ data, context }) => {
    try {
      const { createTransport } = await import("./handlers.server");
      return await createTransport(context.userId, data);
    } catch (err) {
      return fail(err);
    }
  });

export const moveJobs = createServerFn({ method: "GET" })
  .middleware([phoneOrAuthMiddleware])
  .handler(async ({ context }) => {
    const { listJobs } = await import("./handlers.server");
    return listJobs(context.userId);
  });

export const moveOffer = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { kind: "delivery" | "transport"; id: string; note?: string }) => input)
  .handler(async ({ data, context }) => {
    try {
      const { offerJob } = await import("./handlers.server");
      return await offerJob(context.userId, data.kind, data.id, data.note);
    } catch (err) {
      return fail(err);
    }
  });

export const moveChoose = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { kind: "delivery" | "transport"; id: string; courierId: string }) => input)
  .handler(async ({ data, context }) => {
    try {
      const { chooseCourier } = await import("./handlers.server");
      return await chooseCourier(context.userId, data.kind, data.id, data.courierId);
    } catch (err) {
      return fail(err);
    }
  });

export const moveStatus = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator(
    (input: {
      kind: "delivery" | "transport";
      id: string;
      status: "picked_up" | "on_the_way" | "delivered" | "cancelled";
    }) => input,
  )
  .handler(async ({ data, context }) => {
    try {
      const { setJobStatus } = await import("./handlers.server");
      return await setJobStatus(context.userId, data.kind, data.id, data.status);
    } catch (err) {
      return fail(err);
    }
  });

export const moveRate = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator(
    (input: { kind: "delivery" | "transport"; id: string; rating: unknown; body: unknown }) =>
      input,
  )
  .handler(async ({ data, context }) => {
    try {
      const { rateJob } = await import("./handlers.server");
      return await rateJob(context.userId, data.kind, data.id, data.rating, data.body);
    } catch (err) {
      return fail(err);
    }
  });

export const marketRead = createServerFn({ method: "POST" })
  .middleware([phoneOrAuthMiddleware])
  .validator((input: { ids?: string[] }) => input)
  .handler(async ({ data, context }) => {
    const { markNotificationsRead } = await import("./handlers.server");
    return markNotificationsRead(context.userId, data.ids);
  });
