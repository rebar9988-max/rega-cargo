import type { Sql } from "../db";
import type { IdentifyDeps } from "../ai/identify.server";
/** Approved settings read contract: exposes only assistant policy, never users, orders or other settings. */
export async function configureAssistant(deps: IdentifyDeps, sql?: Sql): Promise<IdentifyDeps> {
  try {
    sql ??= await (await import("../db")).getSql();
    const rows = await sql<{
      key: string;
      value: unknown;
    }>`select key, value from platform_settings where key in ('ai.assistant.enabled', 'ai.assistant.daily_cap') and archived_at is null`;
    for (const row of rows) {
      if (row.key === "ai.assistant.enabled" && row.value === false)
        deps.env.RL_AI_ENABLED = "false";
      if (
        row.key === "ai.assistant.daily_cap" &&
        typeof row.value === "number" &&
        Number.isInteger(row.value) &&
        row.value >= 1
      )
        deps.env.RL_AI_DAILY_CAP = String(
          Math.min(row.value, 200, Number(deps.env.RL_AI_DAILY_CAP) || 200),
        );
    }
  } catch {
    // Curated navigation/refusals can still work; inference fails closed when its policy cannot be read.
    deps.env.AI = undefined;
    deps.usage = undefined;
  }
  return deps;
}
