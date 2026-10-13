/** Immutable purpose, mutable implementation: changes of purpose need owner instruction. */
export const RL_AI_IDENTITY = "R&L AI — یاریدەدەری زیرەکی کڕیار";
export const RL_AI_TOOLS = [
  "marketplace.read",
  "bring.navigate",
  "delivery.navigate",
  "tracking.navigate",
  "support.navigate",
  "image.identify",
] as const;

export function normalizeScopeText(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Conservative preflight. Unknown inputs cannot open arbitrary inference or tools. */
export function instructionAttack(text: string): boolean {
  const n = normalizeScopeText(text);
  return /(?:ignore|override|forget|bypass|disregard).{0,60}(?:rules|instructions|prompt|policy|previous)|(?:system|developer|hidden|internal).{0,30}(?:prompt|instructions|secrets)|(?:reveal|print|show|expose).{0,40}(?:prompt|secret|token|credentials)|(?:act as|role.?play|unrestricted|jailbreak|base64|decode|execute|eval\(|<\/?script|\[inst\]|\[system\]|system:|developer:)|ڕێنمایی.{0,30}(?:پشتگوێ|نهێنی)|(?:تجاهل|اكشف).{0,30}(?:التعليمات|النظام|الأسرار)/iu.test(
    n,
  );
}

export function unrelatedTask(text: string): boolean {
  const n = normalizeScopeText(text);
  // Detect the requested task, not brand/city/category mentions (e.g. sports shoes).
  return /(?:write|debug|implement|generate|explain|teach|solve|calculate).{0,35}(?:code|python|javascript|programming|algorithm|essay|homework|equation|politics|religion|history|ai model)|(?:who|when).{0,25}(?:president|won|election|match|war)|(?:tell|give|write).{0,20}(?:joke|story|poem)|(?:capital of|weather in|football score)|(?:کۆد|بەرنامەنووسی|سیاسەت|مێژوو).{0,30}(?:بنووسە|ڕوون|فێر)|(?:چەندە|چییە).{0,20}(?:پایتەخت)|(?:اكتب|اشرح).{0,30}(?:كود|سياسة|قصيدة)/iu.test(
    n,
  );
}
