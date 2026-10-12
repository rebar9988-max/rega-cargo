/**
 * Where the Postgres connection string comes from, per runtime.
 *
 * - Cloudflare Workers (production): a Hyperdrive binding named `HYPERDRIVE`
 *   (preferred — pooled, low latency) or a `DATABASE_URL` secret. Nitro's
 *   cloudflare-module entry stores the request's `env` on `globalThis.__env__`
 *   before any app code runs, and `nodejs_compat` also mirrors string
 *   vars/secrets into `process.env`.
 * - Node (local dev / tests): `DATABASE_URL`, or nothing → embedded PGLite.
 *
 * Empty/whitespace values mean "unset" — a blank secret must never silently
 * fall back to something else in production.
 */
type CloudflareEnv = {
  HYPERDRIVE?: { connectionString?: string };
  DATABASE_URL?: unknown;
};

function cloudflareEnv(): CloudflareEnv | undefined {
  return (globalThis as { __env__?: CloudflareEnv }).__env__;
}

/** True inside workerd (Cloudflare Workers / `wrangler dev`). */
export function isWorkersRuntime(): boolean {
  return typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
}

export function resolveDatabaseUrl(): string | undefined {
  const cf = cloudflareEnv();
  const hyperdrive = cf?.HYPERDRIVE?.connectionString?.trim();
  if (hyperdrive) return hyperdrive;
  if (typeof cf?.DATABASE_URL === "string" && cf.DATABASE_URL.trim()) {
    return cf.DATABASE_URL.trim();
  }
  const raw = typeof process !== "undefined" ? process.env?.DATABASE_URL : undefined;
  return raw && raw.trim() ? raw.trim() : undefined;
}

/**
 * Whether the Worker has a database, without reading the Hyperdrive connection
 * string (workerd only allows that inside a request handler). Safe at module
 * load.
 */
export function hasWorkersDatabase(): boolean {
  const cf = cloudflareEnv();
  if (cf?.HYPERDRIVE) return true;
  return typeof cf?.DATABASE_URL === "string" && cf.DATABASE_URL.trim() !== "";
}
