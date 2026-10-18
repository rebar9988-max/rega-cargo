/**
 * Per-IP rate limiting with the Cloudflare Workers rate-limit binding
 * (`ratelimits` in wrangler.jsonc, binding RL_LIMIT: 20 requests / 60 s per key).
 * Missing bindings, missing client identity and binding errors refuse requests, so drift
 * or an outage never silently turns the limits off.
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
  if (!env?.RL_LIMIT) return false;
  try {
    const identity = (ip ?? (await clientIp())).trim();
    if (!identity || identity === "unknown") return false;
    const { success } = await env.RL_LIMIT.limit({ key: `${scope}:${identity}` });
    return success === true;
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

