import type { IdentifyDeps, IdentifyEnv, UsageLimiter } from "./identify.server.ts";
import type { UsageInput, UsageDecision } from "./usage.ts";

interface UsageStub {
  consume(input: UsageInput): Promise<UsageDecision>;
  refund(input: UsageInput): Promise<void>;
  issue(now: number): Promise<string>;
  verify(token: string, now: number): Promise<boolean>;
}
interface UsageNamespace {
  idFromName(name: string): unknown;
  get(id: unknown): UsageStub;
}

type WorkerEnv = IdentifyEnv & {
  RL_AI_USAGE?: UsageNamespace;
  TURNSTILE_SECRET?: string;
  TURNSTILE_SITE_KEY?: string;
  AI_TOKEN_SECRET?: string;
  BETTER_AUTH_SECRET?: string;
  RL_LIMIT?: { limit(input: { key: string }): Promise<{ success: boolean }> };
};

/**
 * Without its own AI_TOKEN_SECRET the gate key is derived from the auth secret
 * under a fixed label, so the session-signing key is never used as-is here.
 */
function derivedFrom(secret: string | undefined) {
  const value = secret?.trim();
  return value ? `rl-ai-gate-v1\n${value}` : undefined;
}

export function aiEnv(): IdentifyDeps {
  const raw = ((globalThis as { __env__?: WorkerEnv }).__env__ ?? {}) as WorkerEnv;
  const env: IdentifyEnv = {
    RL_AI_ENABLED: raw.RL_AI_ENABLED ?? process.env.RL_AI_ENABLED,
    RL_AI_DAILY_CAP: raw.RL_AI_DAILY_CAP ?? process.env.RL_AI_DAILY_CAP,
    AI: raw.AI,
  };
  const ns = raw.RL_AI_USAGE;
  const stub = ns ? ns.get(ns.idFromName("global")) : undefined;
  const usage: UsageLimiter | undefined = stub
    ? {
        consume: (input) => stub.consume(input),
        refund: (input) => stub.refund(input),
      }
    : undefined;
  return {
    env,
    usage,
    turnstileSecret: raw.TURNSTILE_SECRET ?? process.env.TURNSTILE_SECRET,
    tokenSecret: raw.AI_TOKEN_SECRET ?? process.env.AI_TOKEN_SECRET ?? derivedFrom(raw.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET),
    verifyToken: stub ? (token, now) => stub.verify(token, now) : undefined,
    limit: raw.RL_LIMIT
      ? async (ip) => {
          try {
            return (await raw.RL_LIMIT!.limit({ key: `ai:${ip}` })).success;
          } catch {
            // Fail closed: a limiter outage must not lift the per-IP limit.
            return false;
          }
        }
      : undefined,
  };
}

export function turnstileSiteKey() {
  const raw = ((globalThis as { __env__?: WorkerEnv }).__env__ ?? {}) as WorkerEnv;
  return raw.TURNSTILE_SITE_KEY ?? process.env.TURNSTILE_SITE_KEY ?? "";
}
