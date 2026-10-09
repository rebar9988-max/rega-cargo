/**
 * Per-IP rate limiting with the Cloudflare Workers rate-limit binding
 * (`ratelimits` in wrangler.jsonc, binding RL_LIMIT: 20 requests / 60 s per key).
 * Without the binding (local dev) every call is allowed.
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

export async function allow(scope: string): Promise<boolean> {
  const env = (globalThis as { __env__?: { RL_LIMIT?: Limiter } }).__env__;
  if (!env?.RL_LIMIT) return true;
  try {
    const { success } = await env.RL_LIMIT.limit({ key: `${scope}:${await clientIp()}` });
    return success;
  } catch {
    return true;
  }
}

export function serverSecret(name: "QUOTE_SECRET"): string | null {
  const env = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const value = env?.[name] ?? (typeof process !== "undefined" ? process.env[name] : undefined);
  return typeof value === "string" && value.length >= 32 ? value : null;
}
