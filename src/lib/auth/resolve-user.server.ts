/**
 * Same checks as `phoneOrAuthMiddleware` (same-site request, then phone session,
 * then Better Auth), but returns null instead of throwing so a server function
 * can rate-limit and answer with a clean status before touching auth.
 */
export async function resolveUserId(): Promise<string | null> {
  try {
    const { assertSameSiteRequest } = await import("./isolation.server");
    assertSameSiteRequest();
    const { currentPhoneUserId } = await import("@/lib/phone/session.server");
    const phoneUserId = await currentPhoneUserId().catch(() => null);
    if (phoneUserId) return phoneUserId;
    const { requireUserId } = await import("./verify.server");
    return await requireUserId();
  } catch {
    return null;
  }
}
