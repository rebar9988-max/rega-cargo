/**
 * Server-only Better Auth, using the existing unified database and host cookies.
 * R&L owner email/password access is invitation-only. Phone authentication stays
 * independent; no broker provider, client secret or public admin signup is added.
 * Never import this module into client components.
 */
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getCookie } from "@tanstack/react-start/server";
import { randomBytes } from "node:crypto";
import { Client, Pool, type ClientConfig } from "pg";
import { ensureDbReady, getPglite } from "../db";
import { hasWorkersDatabase, isWorkersRuntime, resolveDatabaseUrl } from "../db-config.server";
import { emailAndPasswordEnabled } from "./email-password";
import { rlEmailOtp } from "./email-otp-plugin";
import { pgliteDialect } from "./pglite-dialect";
import { PREVIEW_ALLOWED_HOSTS } from "./preview";

// Kick (and share) PGLite bootstrap as soon as the auth server module loads.
void ensureDbReady();

/**
 * Preview secret must outlive module reloads: PGLite (and its session rows) is
 * stored on `globalThis`, so an HMR re-eval of this file must NOT mint a new
 * signing secret or every existing session becomes invalid mid-dev. Process
 * restart clears both the secret and PGLite together.
 */
const globalAuthRef = globalThis as typeof globalThis & {
  __grokAuthPreviewSecret__?: string;
};
function previewAuthSecret(): string {
  if (isWorkersRuntime()) {
    // workerd forbids random generation at module scope, and a per-isolate
    // secret would invalidate sessions on every cold start anyway.
    throw new Error(
      "BETTER_AUTH_SECRET is not set for the rega-cargo Worker — run " +
        "`npx wrangler secret put BETTER_AUTH_SECRET` (see DEPLOY.md).",
    );
  }
  globalAuthRef.__grokAuthPreviewSecret__ ??= randomBytes(32).toString("hex");
  return globalAuthRef.__grokAuthPreviewSecret__;
}

/** Read an env var, treating empty/whitespace as unset. */
const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

// Explicit off-switch. The deployer sets `VITE_AUTH_ENABLED=true` when it
// provisions auth; set it to "false" to force auth off everywhere (dev user).
const authDisabled = env("VITE_AUTH_ENABLED") === "false";

// Broker federation creds: the deployer injects a per-app client when deployed;
// otherwise fall back to the shared live-preview client, which the broker accepts
// for any `*.grok-sandbox.com` callback (see `./preview`).
// No baked-in client secret. Federated Grok auth is on only when both env vars are set.
const grokClientId = env("GROK_AUTH_CLIENT_ID");
const grokClientSecret = env("GROK_AUTH_CLIENT_SECRET");

/** True when a configured local or federated provider enforces authentication. */
export const authConfigured =
  !authDisabled && (emailAndPasswordEnabled || Boolean(grokClientId && grokClientSecret));

// This app's own Better Auth origin. When deployed the deployer injects the
// public URL. In the sandbox live preview there's no fixed URL (each preview gets
// a dynamic `*.grok-sandbox.com` host), so we hand Better Auth a dynamic baseURL:
// it derives the origin per-request from the (proxied) host, validated against the
// preview allowlist, which makes the OAuth `redirect_uri` the concrete preview URL
// the broker's preview client accepts.
const explicitBaseURL = env("BETTER_AUTH_URL");
// Explicit `string[]` (not a readonly tuple) — Better Auth's DynamicBaseURLConfig
// requires a mutable `allowedHosts: string[]`.
const previewAllowedHosts: string[] = [...PREVIEW_ALLOWED_HOSTS];
// Local `npm run dev` (port 8080 contract). Browsers may send Origin as any of
// these for the same server — trusting only `localhost` rejects `127.0.0.1` and
// breaks email/password with "Invalid origin".
const LOCAL_DEV_ORIGINS: string[] = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
];
const baseURL = explicitBaseURL ?? {
  // Include loopback hosts so dynamic baseURL resolves for local email/password
  // (not only the preview wildcard).
  allowedHosts: [...previewAllowedHosts, "localhost", "127.0.0.1", "[::1]"],
  // `auto` → trust both http:// and https:// expansions of allowedHosts
  // (preview is https; local dev is http).
  protocol: "auto" as const,
  fallback: "http://localhost:8080",
};

// Origins Better Auth accepts on credentialed POSTs (sign-up/sign-in, etc.).
// Missing entries here surface as FORBIDDEN "Invalid origin".
const trustedOrigins: string[] = explicitBaseURL
  ? [explicitBaseURL]
  : [
      // Host wildcards (matched against Origin's host)
      ...previewAllowedHosts,
      // Full-origin wildcards (matched against Origin)
      ...previewAllowedHosts.flatMap((host) => [`https://${host}`, `http://${host}`]),
      ...LOCAL_DEV_ORIGINS,
    ];

// Workers: reading the Hyperdrive connection string at module load throws
// ("Disallowed operation called within global scope"), so the binding is only
// detected here and its connection string is read per client, inside the
// request (see db.ts).
const workers = isWorkersRuntime();
const databaseUrl = workers ? undefined : resolveDatabaseUrl();
const databaseConfigured = workers ? hasWorkersDatabase() : Boolean(databaseUrl);

/** pg client that resolves its connection string when the pool opens it. */
class RequestScopedClient extends Client {
  constructor(config?: ClientConfig) {
    super({ ...config, connectionString: resolveDatabaseUrl() });
  }
}

// Real Postgres when `DATABASE_URL` is set (deployed apps), else the app's
// embedded PGLite (preview) via a Kysely dialect — so Better Auth persists to the
// SAME DB as app data, including email/password users. Both use the Better Auth
// schema from `migrations/auth/0001_auth.sql`, copied into `migrations/` when
// the app turns sign-in on.
// Workers: `maxUses: 1` closes each pg client after one checkout so no socket
// outlives the request that opened it (workerd forbids cross-request I/O);
// Hyperdrive does the real pooling.
const database = databaseConfigured
  ? new Pool(
      workers
        ? { Client: RequestScopedClient, maxUses: 1, idleTimeoutMillis: 1 }
        : { connectionString: databaseUrl },
    )
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

/** Session token cookie name — also read by the live-preview popup completion page. */
export const SESSION_TOKEN_COOKIE = "__Host-grok-auth.session_token";

// Built separately so the `betterAuth({...})` call stays easy to edit without
// breaking brackets (models often trip on the conditional plugin spread).
export const auth = betterAuth({
  baseURL,
  // Deployed apps inject BETTER_AUTH_SECRET. Preview: process-stable secret on
  // globalThis so HMR doesn't invalidate PGLite-backed sessions (see above).
  secret: env("BETTER_AUTH_SECRET") ?? previewAuthSecret(),
  database,

  // CSRF / origin check for credentialed auth POSTs (email sign-up/sign-in, …).
  // See `trustedOrigins` construction above — must cover live preview hosts AND
  // local loopback variants, or clients get "Invalid origin".
  trustedOrigins,

  // Encrypt broker-issued OAuth tokens at rest, and treat the broker's upstreams
  // as trusted first-party identities. The broker owns identity and X emails are
  // synthetic/unverified, so WITHOUT this a login can fail with
  // `account_not_linked` (Better Auth refuses to attach an untrusted, unverified
  // identity to an existing user). Google and X carry DISTINCT emails, so this
  // never merges them into one user — they stay separate identities.
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: [],
      // X's synthetic email is never "verified", so don't gate linking on the
      // local user's email-verified state.
      requireLocalEmailVerified: false,
    },
  },

  // Resolve sessions from the database on every request. Owner revocation and
  // verification cannot depend on stale cookie-cached identity information.
  session: { cookieCache: { enabled: false } },

  // Local email/password — toggled only via `./email-password` (not a plugin).
  ...(emailAndPasswordEnabled
    ? {
        emailAndPassword: {
          enabled: true,
          minPasswordLength: 16,
          maxPasswordLength: 128,
          autoSignIn: true,
        },
      }
    : {}),

  // `__Host-` prefixed cookies: the browser REFUSES any same-named cookie that
  // carries a `Domain` attribute, so a sibling `*.grok.me` app cannot "toss" a
  // `Domain=.grok.me` session cookie onto this app. `__Host-` requires Secure +
  // Path=/ + no Domain; Better Auth otherwise uses `__Secure-` (which permits
  // Domain), so we drop its auto prefix (`useSecureCookies: false`) and set
  // Secure + the names ourselves. (Browsers allow Secure cookies on
  // `http://localhost`, so local dev still works.)
  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: SESSION_TOKEN_COOKIE },
      session_data: { name: "__Host-grok-auth.session_data" },
      account_data: { name: "__Host-grok-auth.account_data" },
      dont_remember: { name: "__Host-grok-auth.dont_remember" },
    },
  },

  plugins: [
    // Phone sign-in keeps its own session. Customer email sign-in codes open a
    // native session here (see ./email-otp-plugin). Federated Grok OAuth, the
    // preview bearer token, and the gate-identity plugin are not mounted.
    rlEmailOtp(),
    tanstackStartCookies(),
  ],
});

export function readSessionToken(): string | null {
  return getCookie(SESSION_TOKEN_COOKIE) ?? null;
}

// Re-exported for convenience; the array lives in the dependency-free
// `providers.ts` so the client can import it too.
export { GROK_PROVIDERS } from "./providers";
