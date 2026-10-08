/**
 * Extra Worker exports, picked up by Nitro's cloudflare preset and re-exported
 * from the generated entry. Only bound where wrangler config declares it
 * (staging), so production is unaffected.
 */
import { DurableObject } from "cloudflare:workers";
import { consumeUsage, type UsageInput } from "./src/lib/ai/usage";

/** Single global counter for R&L AI budgets (strongly consistent). */
export class RlAiUsage extends DurableObject {
  async consume(input: UsageInput) {
    const storage = this.ctx.storage;
    if ((await storage.get<string>("current-day")) !== input.day) {
      await storage.deleteAll();
      await storage.put("current-day", input.day);
    }
    return consumeUsage(
      { get: (key) => storage.get<number>(key), put: (entries) => storage.put(entries) },
      input,
    );
  }
}
