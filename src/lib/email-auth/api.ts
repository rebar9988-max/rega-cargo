import { createServerFn } from "@tanstack/react-start";

async function guard() {
  const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
  assertSameSiteRequest();
}

export const emailStatus = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const { emailDeliveryConfigured } = await import("./session.server");
  return { available: emailDeliveryConfigured() };
});

/**
 * Sends a code. Order: same-site, per-IP limiter (HTTP 429), bot gate (Turnstile or
 * the signed challenge token, as for order forms), then the per-address limits.
 */
export const emailBegin = createServerFn({ method: "POST" })
  .validator((input: { email: string; token?: string; turnstile?: string }) => input)
  .handler(async ({ data }) => {
    await guard();
    const { allow, clientIp } = await import("@/lib/rate-limit.server");
    const { setResponseStatus } = await import("@tanstack/react-start/server");
    if (!(await allow("email-send"))) {
      setResponseStatus(429);
      return { error: "rate" as const };
    }
    const { verifyGate } = await import("@/lib/ai/gate.server");
    if (!(await verifyGate({ token: data.token, turnstile: data.turnstile }, await clientIp()))) {
      setResponseStatus(403);
      return { error: "gate" as const };
    }
    const { emailStart } = await import("./session.server");
    return emailStart(data.email);
  });

export const emailCheck = createServerFn({ method: "POST" })
  .validator((input: { email: string; code: string; name?: string }) => input)
  .handler(async ({ data }) => {
    await guard();
    const { allow } = await import("@/lib/rate-limit.server");
    const { setResponseStatus } = await import("@tanstack/react-start/server");
    if (!(await allow("email-check"))) {
      setResponseStatus(429);
      return { error: "rate" as const };
    }
    const { emailConfirm } = await import("./session.server");
    return emailConfirm(data);
  });
