import { codesMatch, hmacHex } from "../phone/codes.ts";

const TEN_MIN = 10 * 60 * 1000;

export async function signAiToken(secret: string, now: number) {
  const payload = `${now + TEN_MIN}:${crypto.randomUUID()}`;
  const sig = await hmacHex(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifyAiToken(secret: string, token: string, now: number) {
  const parts = token.split(".");
  if (parts.length !== 2 || token.length > 200) return false;
  const [payload, sig] = parts;
  const [exp, nonce] = payload.split(":");
  const at = Number(exp);
  if (payload.split(":").length > 2 || (nonce !== undefined && !/^[a-f0-9-]{36}$/.test(nonce)))
    return false;
  if (!exp || !sig || !Number.isFinite(at) || at < now || at > now + TEN_MIN + 1000) return false;
  return codesMatch(await hmacHex(secret, payload), sig);
}

export interface SpentStore {
  get(key: string): Promise<number | undefined>;
  put(key: string, exp: number): Promise<void>;
}

/** Like verifyAiToken, but each token is accepted once; a replay is refused. */
export async function spendAiToken(secret: string, token: string, now: number, store: SpentStore) {
  if (!(await verifyAiToken(secret, token, now))) return false;
  const [exp, sig] = token.split(".");
  const key = `spent:${sig}`;
  if ((await store.get(key)) !== undefined) return false;
  await store.put(key, Number(exp.split(":")[0]));
  return true;
}
