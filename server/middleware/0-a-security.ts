/**
 * Outermost security headers (sorts before 0-html-cache, so it sees the final
 * response, including cache hits) and a per-request nonce for inline scripts.
 */
const FONT_HASH = "'sha256-d+9JVhYSHpWepfI9cknBb9xs6iHWlXIFM1pcB4nZ6dg='";

function csp(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' ${FONT_HASH} https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self' https://challenges.cloudflare.com",
    "worker-src 'self'",
    "frame-src https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

export default async function securityHeaders(_event: unknown, next: () => unknown | Promise<unknown>) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const result = await next();
  if (!(result instanceof Response)) return result;
  const headers = new Headers(result.headers);
  headers.set("content-security-policy", csp(nonce));
  headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(self), microphone=(), geolocation=(), payment=()");
  // Staging and other preview Workers must never be indexed.
  if ((globalThis as { __env__?: Record<string, unknown> }).__env__?.RL_NOINDEX === "1") headers.set("x-robots-tag", "noindex, nofollow");
  const type = headers.get("content-type") ?? "";
  if (!type.includes("text/html") || !result.body) {
    return new Response(result.body, { status: result.status, statusText: result.statusText, headers });
  }
  const html = (await result.text()).replace(/<script\b([^>]*)>/gi, (full, attrs: string) =>
    /\bnonce=/.test(attrs) ? full : `<script nonce="${nonce}"${attrs}>`,
  );
  headers.delete("content-length");
  return new Response(html, { status: result.status, statusText: result.statusText, headers });
}
