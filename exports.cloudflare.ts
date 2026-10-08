/**
 * Extra Worker exports, picked up by Nitro's cloudflare preset and re-exported
 * from the generated entry. Only bound where wrangler config declares it.
 */
import { DurableObject } from "cloudflare:workers";
import { signAiToken, verifyAiToken } from "./src/lib/ai/challenge";
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
      await storage.deleteAll();
      await storage.put("current-day", day);
      if (hmac) await storage.put("hmac", hmac);
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
  async verify(token: string, now: number) {
    return verifyAiToken(await this.secret(), token, now);
  }
}
