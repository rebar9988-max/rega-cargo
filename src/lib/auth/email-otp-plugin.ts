/**
 * Customer email sign-in inside the existing Better Auth instance (server-only).
 *
 * Codes are issued and consumed by `@/lib/email-otp/service.server` (atomic SQL,
 * hashed, single-use). A verified code opens a NATIVE Better Auth session for a
 * plain customer `user` row, so `/api/auth/get-session`, `requireUserId`,
 * `viewerState` and `/api/auth/sign-out` work unchanged. Better Auth's stock
 * emailOTP plugin is not used: it signs in any existing user, owner included.
 * Routes are reachable only through the allowlist in `@/lib/owner/http`.
 */
import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import * as z from "zod";

function clientIp(request: Request | undefined) {
  return request?.headers.get("cf-connecting-ip")?.trim() || "unknown";
}

/**
 * Login-CSRF guard inside the endpoint itself (Better Auth's origin check skips
 * cookie-less requests): mutations need an Origin equal to this request's origin.
 */
function sameOrigin(request: Request | undefined) {
  if (!request) return false;
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;
  return request.headers.get("origin") === new URL(request.url).origin;
}

const STATUS: Record<string, 400 | 429 | 503> = {
  email: 400,
  code: 400,
  expired: 400,
  rate: 429,
  unavailable: 503,
};

export const rlEmailOtp = () =>
  ({
    id: "rl-email-otp",
    endpoints: {
      rlEmailStatus: createAuthEndpoint("/rl-email/status", { method: "GET" }, async (ctx) => {
        const { emailDeliveryConfigured } = await import("../email-otp/send.server.ts");
        ctx.setHeader("Cache-Control", "no-store");
        return ctx.json({ available: emailDeliveryConfigured() });
      }),

      rlEmailSend: createAuthEndpoint(
        "/rl-email/send",
        {
          method: "POST",
          body: z.object({ email: z.string().max(320), lang: z.string().max(8).optional() }),
        },
        async (ctx) => {
          if (!sameOrigin(ctx.request)) {
            ctx.setStatus(403);
            return ctx.json({ error: "forbidden" });
          }
          const mail = await import("../email-otp/send.server.ts");
          const secret = mail.emailCodeSecret();
          if (!secret || !mail.emailDeliveryConfigured()) {
            ctx.setStatus(503);
            return ctx.json({ error: "unavailable" });
          }
          const { getSql } = await import("../db");
          const { requestEmailCode } = await import("../email-otp/service.server.ts");
          const lang = ctx.body.lang ?? "ckb";
          const result = await requestEmailCode(await getSql(), {
            email: ctx.body.email,
            ip: clientIp(ctx.request),
            secret,
            deliver: (email, code) => mail.deliverEmailCode(email, code, lang),
          });
          if ("error" in result) ctx.setStatus(STATUS[result.error] ?? 400);
          return ctx.json(result);
        },
      ),

      /**
       * Administrative sign-in. Same code mechanics as the customer entrance, but its own
       * table and rate-limit keys (migration 0020), so public traffic aimed at an owner's
       * address cannot occupy the row or spend the budget this entrance needs. It opens a
       * session only for an existing approved, verified, enabled administrative account,
       * and answers the same for every address so it never reveals who holds a role.
       */
      rlAdminSend: createAuthEndpoint(
        "/rl-admin/send",
        {
          method: "POST",
          body: z.object({ email: z.string().max(320), lang: z.string().max(8).optional() }),
        },
        async (ctx) => {
          if (!sameOrigin(ctx.request)) {
            ctx.setStatus(403);
            return ctx.json({ error: "forbidden" });
          }
          const mail = await import("../email-otp/send.server.ts");
          const secret = mail.emailCodeSecret();
          if (!secret || !mail.emailDeliveryConfigured()) {
            ctx.setStatus(503);
            return ctx.json({ error: "unavailable" });
          }
          const { getSql } = await import("../db");
          const { requestEmailCode } = await import("../email-otp/service.server.ts");
          const lang = ctx.body.lang ?? "ckb";
          const result = await requestEmailCode(await getSql(), {
            email: ctx.body.email,
            ip: clientIp(ctx.request),
            secret,
            scope: "admin",
            deliver: (email, code) => mail.deliverEmailCode(email, code, lang),
          });
          if ("error" in result) ctx.setStatus(STATUS[result.error] ?? 400);
          return ctx.json(result);
        },
      ),

      rlAdminVerify: createAuthEndpoint(
        "/rl-admin/verify",
        {
          method: "POST",
          body: z.object({
            email: z.string().max(320),
            code: z.string().max(12),
            lang: z.string().max(8).optional(),
          }),
        },
        async (ctx) => {
          if (!sameOrigin(ctx.request)) {
            ctx.setStatus(403);
            return ctx.json({ error: "forbidden" });
          }
          const mail = await import("../email-otp/send.server.ts");
          const secret = mail.emailCodeSecret();
          if (!secret) {
            ctx.setStatus(503);
            return ctx.json({ error: "unavailable" });
          }
          const { getSql } = await import("../db");
          const { adminAccount, verifyEmailCode } = await import("../email-otp/service.server.ts");
          const sql = await getSql();
          const checked = await verifyEmailCode(sql, {
            email: ctx.body.email,
            code: ctx.body.code,
            ip: clientIp(ctx.request),
            secret,
            scope: "admin",
          });
          if ("error" in checked) {
            ctx.setStatus(STATUS[checked.error] ?? 400);
            return ctx.json({ error: checked.error });
          }
          // The role is re-read here, after the code was spent: a role removed since the
          // code was sent must not open a session.
          const account = await adminAccount(sql, checked.email);
          const user =
            "id" in account ? await ctx.context.internalAdapter.findUserById(account.id) : null;
          if (!user) {
            ctx.setStatus(400);
            return ctx.json({ error: "code" });
          }
          const session = await ctx.context.internalAdapter.createSession(user.id);
          await setSessionCookie(ctx, { session, user });
          // The administrator is told their account was used. A mail failure is logged
          // inside and never keeps them out of their own administration.
          await mail.deliverAdminSignInNotice(user.email, ctx.body.lang ?? "ckb", new Date());
          return ctx.json({ ok: true, name: user.name, email: user.email });
        },
      ),

      rlEmailVerify: createAuthEndpoint(
        "/rl-email/verify",
        {
          method: "POST",
          body: z.object({
            email: z.string().max(320),
            code: z.string().max(12),
            name: z.string().max(80).optional(),
          }),
        },
        async (ctx) => {
          if (!sameOrigin(ctx.request)) {
            ctx.setStatus(403);
            return ctx.json({ error: "forbidden" });
          }
          const mail = await import("../email-otp/send.server.ts");
          const secret = mail.emailCodeSecret();
          if (!secret) {
            ctx.setStatus(503);
            return ctx.json({ error: "unavailable" });
          }
          const { getSql } = await import("../db");
          const { customerAccount, verifyEmailCode } =
            await import("../email-otp/service.server.ts");
          const sql = await getSql();
          const checked = await verifyEmailCode(sql, {
            email: ctx.body.email,
            code: ctx.body.code,
            ip: clientIp(ctx.request),
            secret,
          });
          if ("error" in checked) {
            ctx.setStatus(STATUS[checked.error] ?? 400);
            return ctx.json({ error: checked.error });
          }
          const account = await customerAccount(sql, checked.email, ctx.body.name, (input) =>
            ctx.context.internalAdapter.createUser({ ...input, emailVerified: true }),
          );
          const user =
            "id" in account ? await ctx.context.internalAdapter.findUserById(account.id) : null;
          if (!user) {
            ctx.setStatus(400);
            return ctx.json({ error: "code" });
          }
          const session = await ctx.context.internalAdapter.createSession(user.id);
          await setSessionCookie(ctx, { session, user });
          return ctx.json({ ok: true, name: user.name, email: user.email });
        },
      ),
    },
  }) satisfies BetterAuthPlugin;
