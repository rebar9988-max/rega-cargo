import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function guard() {
  const { assertSameSiteRequest } = await import("../auth/isolation.server");
  const { getRequest, setResponseHeader } = await import("@tanstack/react-start/server");
  const { allow } = await import("../rate-limit.server");
  assertSameSiteRequest();
  setResponseHeader("Cache-Control", "no-store");
  const request = getRequest();
  // POSTs must originate from this exact host, including non-browser clients.
  if (
    !request ||
    request.headers.get("origin") !== new URL(request.url).origin ||
    !(await allow("owner-activation"))
  )
    throw new Error("Forbidden");
}
const token = z.string().regex(/^[a-f0-9]{64}$/);
export const inspectOwnerInvitation = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ token }).strict().parse(input))
  .handler(async ({ data }) => {
    await guard();
    const { getSql } = await import("../db");
    const { ownerInvitation } = await import("./service.server");
    try {
      const ticket = await ownerInvitation(await getSql(), data.token);
      return { valid: true as const, email: ticket.email, existing: ticket.existing };
    } catch {
      return { valid: false as const };
    }
  });
export const activateFirstOwner = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        token,
        name: z.string().trim().min(1).max(80),
        password: z.string().min(1).max(128),
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ data }) => {
    await guard();
    const { getSql } = await import("../db");
    const { auth, authConfigured } = await import("../auth/server");
    const { getRequest } = await import("@tanstack/react-start/server");
    const { activateOwner } = await import("./service.server");
    if (!authConfigured) return { activated: false as const };
    try {
      return await activateOwner(
        await getSql(),
        data,
        async ({ email, existing, name, password }) => {
          if (!existing && password.length < 16) throw new Error("Invalid password");
          const headers = getRequest().headers;
          const response = existing
            ? await auth.api.signInEmail({ headers, body: { email, password } })
            : await auth.api.signUpEmail({ headers, body: { email, name, password } });
          if (!response.user?.id || response.user.email.toLowerCase() !== email)
            throw new Error("Unauthorized");
          return response.user.id;
        },
      );
    } catch {
      return { activated: false as const };
    }
  });
