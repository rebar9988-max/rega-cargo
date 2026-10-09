import { createServerFn } from "@tanstack/react-start";

export type ViewerState = "in" | "out" | "unavailable";

/**
 * Who is looking, without throwing. Gated pages call this before any
 * auth-required server function, so a signed-out visit (or a Worker with no
 * database yet) renders a prompt instead of a 500.
 */
export const viewerState = createServerFn({ method: "GET" }).handler(async (): Promise<{ state: ViewerState }> => {
  try {
    const { getSql } = await import("@/lib/db");
    await getSql();
  } catch {
    return { state: "unavailable" };
  }
  try {
    const { currentPhoneUserId } = await import("@/lib/phone/session.server");
    if (await currentPhoneUserId()) return { state: "in" };
  } catch {
    /* fall through to the fallback session */
  }
  try {
    const { requireUserId } = await import("@/lib/auth/verify.server");
    if (await requireUserId()) return { state: "in" };
  } catch {
    /* signed out */
  }
  return { state: "out" };
});
