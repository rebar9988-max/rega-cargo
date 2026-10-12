import { createServerFn } from "@tanstack/react-start";

/**
 * Validates a product link and returns a shipping estimate. The link is parsed, never fetched.
 * Rate limited per IP; text is run through the permanent compliance filter first.
 */
export const productLinkCheck = createServerFn({ method: "POST" })
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ data }) => {
    const { productLinkEnabled } = await import("./flag.server");
    if (!productLinkEnabled()) return { error: "disabled" as const };
    const { allow } = await import("@/lib/rate-limit.server");
    const { setResponseStatus } = await import("@tanstack/react-start/server");
    if (!(await allow("plink"))) {
      setResponseStatus(429);
      return { error: "rate" as const };
    }
    const { parseProductLink } = await import("./url");
    const parsed = parseProductLink(data.url);
    if (!parsed.ok) {
      setResponseStatus(400);
      return { error: parsed.error };
    }
    try {
      const { getSql } = await import("@/lib/db");
      const { checkTextServer } = await import("@/lib/compliance/service.server");
      const verdict = await checkTextServer(await getSql(), String(data.url));
      if (verdict.decision === "block") return { error: "prohibited" as const };
    } catch {
      // The bundled rules still apply without a database.
      const { checkText } = await import("@/lib/compliance/check");
      if (checkText(String(data.url)).decision === "block") return { error: "prohibited" as const };
    }
    const { estimateLinkShipping } = await import("./estimate");
    const estimate =
      data.kg == null || data.kg === ""
        ? null
        : estimateLinkShipping({
            kg: data.kg,
            l: data.l,
            w: data.w,
            h: data.h,
            dest: data.dest,
            mode: data.mode,
          });
    if (data.kg != null && data.kg !== "" && !estimate) {
      setResponseStatus(400);
      return { error: "invalid" as const };
    }
    const { fetchProviderInfo } = await import("./providers.server");
    const provider = await fetchProviderInfo(parsed.link);
    return {
      link: parsed.link,
      info: provider.info,
      infoReason: provider.reason,
      estimate,
    };
  });
