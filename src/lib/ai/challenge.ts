import { codesMatch, hmacHex } from "../phone/codes.ts";

const TEN_MIN = 10 * 60 * 1000;

export async function signAiToken(secret: string, now: number) {
  const exp = String(now + TEN_MIN);
  const sig = await hmacHex(secret, exp);
  return `${exp}.${sig}`;
}

export async function verifyAiToken(secret: string, token: string, now: number) {
  const [exp, sig] = token.split(".");
  const at = Number(exp);
  if (!exp || !sig || !Number.isFinite(at) || at < now || at > now + TEN_MIN + 1000) return false;
  return codesMatch(await hmacHex(secret, exp), sig);
}
