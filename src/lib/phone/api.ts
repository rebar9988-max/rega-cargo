import { createServerFn } from "@tanstack/react-start";

async function guard() {
  const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
  assertSameSiteRequest();
}

export const phoneWho = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const { phoneMe } = await import("./session.server");
  return phoneMe();
});

export const phoneStatus = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const { phoneDeliveryConfigured } = await import("./session.server");
  return { available: phoneDeliveryConfigured() };
});

export const phoneBegin = createServerFn({ method: "POST" })
  .validator((input: { dial: string; national: string; turnstile?: string }) => input)
  .handler(async ({ data }) => {
    await guard();
    const { phoneStart } = await import("./session.server");
    return phoneStart(data.dial, data.national, data.turnstile);
  });

export const phoneJoin = createServerFn({ method: "POST" })
  .validator((input: { dial: string; national: string; name: string; pin: string }) => input)
  .handler(async ({ data }) => {
    await guard();
    const { phoneRegister } = await import("./session.server");
    return phoneRegister(data);
  });

export const phoneCheck = createServerFn({ method: "POST" })
  .validator((input: { dial: string; national: string; pin: string; name: string }) => input)
  .handler(async ({ data }) => {
    await guard();
    const { phoneConfirm } = await import("./session.server");
    return phoneConfirm(data);
  });

export const phoneEnter = createServerFn({ method: "POST" })
  .validator((input: { dial: string; national: string; pin: string }) => input)
  .handler(async ({ data }) => {
    await guard();
    const { phoneLogin } = await import("./session.server");
    return phoneLogin(data);
  });

export const phoneLeave = createServerFn({ method: "POST" }).handler(async () => {
  await guard();
  const { phoneLogout } = await import("./session.server");
  return phoneLogout();
});
