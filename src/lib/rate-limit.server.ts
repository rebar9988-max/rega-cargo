/**
 * Per-IP rate limiting with the Cloudflare Workers rate-limit binding
 * (`ratelimits` in wrangler.jsonc, binding RL_LIMIT: 20 requests / 60 s per key).
 * Without the binding every call is allowed in local dev and tests only. In a production
 * runtime a missing binding (configuration drift) refuses the request, and so does a binding
 * that errors (fail closed), so neither can silently turn the limits off.
 */
type Limiter = { limit(input: { key: string }): Promise<{ success: boolean }> };

export async function clientIp(): Promise<string> {
  try {
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    return getRequestHeader("cf-connecting-ip")?.trim() || "unknown";
  } catch {
    return "unknown";
  }
}

/** `ip` is for plain server routes that read it from their own Request. */
export async function allow(scope: string, ip?: string): Promise<boolean> {
  const env = (globalThis as { __env__?: { RL_LIMIT?: Limiter } }).__env__;
  if (!env?.RL_LIMIT) {
    if (process.env.NODE_ENV !== "production") return true;
    console.error("[rate-limit]", scope, "RL_LIMIT binding is missing");
    return false;
  }
  try {
    const { success } = await env.RL_LIMIT.limit({ key: `${scope}:${ip ?? (await clientIp())}` });
    return success;
  } catch (err) {
    console.error("[rate-limit]", scope, err instanceof Error ? err.message : "failed");
    return false;
  }
}

export function serverSecret(name: "QUOTE_SECRET"): string | null {
  const env = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const value = env?.[name] ?? (typeof process !== "undefined" ? process.env[name] : undefined);
  return typeof value === "string" && value.length >= 32 ? value : null;
}
