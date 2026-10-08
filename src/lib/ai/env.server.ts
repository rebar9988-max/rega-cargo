import type { IdentifyEnv, UsageLimiter } from "./identify.server.ts";
import type { UsageInput, UsageDecision } from "./usage.ts";

interface UsageStub {
  consume(input: UsageInput): Promise<UsageDecision>;
}
interface UsageNamespace {
  idFromName(name: string): unknown;
  get(id: unknown): UsageStub;
}

type WorkerEnv = IdentifyEnv & { RL_AI_USAGE?: UsageNamespace };

/** Cloudflare bindings (Nitro stores the Worker `env` on globalThis). */
export function aiEnv(): { env: IdentifyEnv; usage?: UsageLimiter } {
  const raw = ((globalThis as { __env__?: WorkerEnv }).__env__ ?? {}) as WorkerEnv;
  const env: IdentifyEnv = {
    RL_AI_ENABLED: raw.RL_AI_ENABLED ?? process.env.RL_AI_ENABLED,
    RL_AI_DAILY_CAP: raw.RL_AI_DAILY_CAP ?? process.env.RL_AI_DAILY_CAP,
    AI: raw.AI,
  };
  const ns = raw.RL_AI_USAGE;
  const usage = ns
    ? { consume: (input: UsageInput) => ns.get(ns.idFromName("global")).consume(input) }
    : undefined;
  return { env, usage };
}
