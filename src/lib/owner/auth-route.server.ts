import { ownerAuthRequestAllowed } from "./http";

export async function handleOwnerAuth(request: Request) {
  if (!ownerAuthRequestAllowed(request))
    return new Response(null, { status: 403, headers: { "Cache-Control": "no-store" } });
  const { allow } = await import("@/lib/rate-limit.server");
  if (
    request.method === "POST" &&
    !(await allow("owner-auth", request.headers.get("cf-connecting-ip") ?? "unknown"))
  )
    return new Response(null, { status: 429, headers: { "Cache-Control": "no-store" } });
  try {
    const { auth, authConfigured } = await import("@/lib/auth/server");
    if (!authConfigured) throw new Error("Unavailable");
    const response = await auth.handler(request);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
