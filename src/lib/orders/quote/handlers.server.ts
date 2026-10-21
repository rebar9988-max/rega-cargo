/**
 * Wiring for the Bring For Me endpoints: database, secrets, rate limits, DNS-over-HTTPS and the
 * Workers socket transport are attached here and nowhere else, so every other module stays a
 * plain function over an injected `sql` and is tested without the framework.
 */
import { getSql } from "@/lib/db";
import { complianceRules } from "@/lib/compliance/service.server";
import { MarketError } from "@/lib/market";
import { allow, clientIp, serverSecret } from "@/lib/rate-limit.server";
import { createDohResolver } from "../../product-link/dns.server.ts";
import { safeFetchPage } from "../../product-link/safe-fetch.ts";
import { connectVerifiedIp } from "../../product-link/transport.server.ts";
import * as cart from "./cart.server.ts";
import { BfmError } from "./errors.ts";
import { importLink } from "./import.server.ts";
import { cartQuote, getQuote } from "./quote.server.ts";
import * as admin from "./settings.server.ts";

export { admin, cart, cartQuote, getQuote };

/** What a client may be told about a failure: a code (and, for validation, which field). */
export function failure(err: unknown): { error: string; [k: string]: unknown } {
  if (err instanceof BfmError) return { error: err.code, ...(err.detail ?? {}) };
  if (err instanceof MarketError) return { error: err.code };
  console.error("[bring-for-me]", err instanceof Error ? err.message : "failed");
  return { error: "unavailable" };
}

export async function cartContext() {
  const sql = await getSql();
  return {
    sql,
    ctx: {
      now: new Date(),
      secret: serverSecret("QUOTE_SECRET"),
      rules: await complianceRules(sql),
      stores: await cart.loadStores(sql),
    },
  };
}

export async function runImport(userId: string, url: unknown) {
  const { sql, ctx } = await cartContext();
  const resolve = createDohResolver();
  return importLink(
    sql,
    {
      fetchPage: (u) => safeFetchPage(u, { resolve, connect: connectVerifiedIp }),
      allow,
      secret: ctx.secret,
      now: ctx.now,
      rules: ctx.rules,
      stores: ctx.stores,
    },
    { userId, ip: await clientIp(), url },
  );
}
