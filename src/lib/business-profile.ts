import type { Lang } from "./langs.ts";

export const BUSINESS_FIELDS = [
  "legalName",
  "legalForm",
  "street",
  "postalCode",
  "city",
  "country",
  "representative",
  "registerDetails",
  "vatDetails",
  "contentResponsible",
  "verificationSource",
  "verifiedAt",
] as const;
export const BUSINESS_POLICIES = ["liability", "jurisdiction", "complaints", "retention"] as const;
const LANGUAGES: Lang[] = ["ckb", "ku", "de", "en", "ar", "fa", "tr"];
export type BusinessProfile = Record<(typeof BUSINESS_FIELDS)[number], string> &
  Record<(typeof BUSINESS_POLICIES)[number], Record<Lang, string>>;

/** Presence validation is a release gate, never a claim of legal review or registry verification. */
export function businessReadiness(
  raw: unknown,
  now = Date.now(),
): { ready: boolean; missing: string[]; profile: BusinessProfile | null } {
  const value =
    raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const missing: string[] = [];
  const valid = (text: unknown) =>
    typeof text === "string" &&
    text.trim().length > 0 &&
    text.length <= 4000 &&
    !/\[|\]|\b(pending|placeholder|tbd|todo)\b|چاوەڕوانە/i.test(text);
  for (const key of BUSINESS_FIELDS) if (!valid(value[key])) missing.push(key);
  const verified = typeof value.verifiedAt === "string" ? Date.parse(value.verifiedAt) : NaN;
  if (!Number.isFinite(verified) || verified > now) {
    if (!missing.includes("verifiedAt")) missing.push("verifiedAt");
  }
  for (const key of BUSINESS_POLICIES) {
    const policy = value[key] as Partial<Record<Lang, unknown>> | null;
    for (const lang of LANGUAGES)
      if (!policy || !valid(policy[lang])) missing.push(`${key}.${lang}`);
  }
  return {
    ready: missing.length === 0,
    missing,
    profile: missing.length === 0 ? (value as BusinessProfile) : null,
  };
}

/** Owner-controlled release stage never promotes incomplete facts to verified legal content. */
export function releaseReadiness(business: unknown, policy: unknown, now = Date.now()) {
  const legal = businessReadiness(business, now);
  const config =
    policy && typeof policy === "object" && !Array.isArray(policy)
      ? (policy as Record<string, unknown>)
      : {};
  const stage = config.stage === "beta" || config.stage === "public" ? config.stage : null;
  const betaException = stage === "beta" && config.allowIncompleteLegalInfo === true;
  return {
    ...legal,
    stage,
    betaException,
    allowed: stage !== null && (legal.ready || betaException),
  };
}
