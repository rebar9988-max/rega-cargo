/**
 * Extra Worker exports, picked up by Nitro's cloudflare preset and re-exported
 * from the generated entry. Only bound where wrangler config declares it.
 */
import { DurableObject } from "cloudflare:workers";
import { signAiToken, spendAiToken } from "./src/lib/ai/challenge";
import { consumeUsage, refundUsage, type UsageInput } from "./src/lib/ai/usage";

/** Single global counter for R&L AI budgets (strongly consistent). */
export class RlAiUsage extends DurableObject {
  private store() {
    const storage = this.ctx.storage;
    return { get: (key: string) => storage.get<number>(key), put: (entries: Record<string, number>) => storage.put(entries) };
  }
  private async roll(day: string) {
    const storage = this.ctx.storage;
    if ((await storage.get<string>("current-day")) !== day) {
      const hmac = await storage.get<string>("hmac");
      // Spent gate tokens that have not expired yet survive the daily reset.
      const spent = await storage.list<number>({ prefix: "spent:" });
      await storage.deleteAll();
      await storage.put("current-day", day);
      if (hmac) await storage.put("hmac", hmac);
      const now = Date.now();
      const keep = Object.fromEntries([...spent].filter(([, exp]) => exp > now));
      if (Object.keys(keep).length) await storage.put(keep);
    }
  }
  private async secret() {
    const storage = this.ctx.storage;
    let secret = await storage.get<string>("hmac");
    if (!secret) {
      secret = crypto.randomUUID() + crypto.randomUUID();
      await storage.put("hmac", secret);
    }
    return secret;
  }
  async consume(input: UsageInput) {
    await this.roll(input.day);
    return consumeUsage(this.store(), input);
  }
  async refund(input: UsageInput) {
    await this.roll(input.day);
    await refundUsage(this.store(), input);
  }
  async issue(now: number) {
    return signAiToken(await this.secret(), now);
  }
  /** Each gate token is accepted once: a replayed token is refused. */
  async verify(token: string, now: number) {
    const storage = this.ctx.storage;
    return spendAiToken(await this.secret(), token, now, {
      get: (key) => storage.get<number>(key),
      put: (key, exp) => storage.put(key, exp),
    });
  }
}
