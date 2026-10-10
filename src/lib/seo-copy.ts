import type { Lang } from "./langs";
import { SEO_MESSAGES } from "./seo-messages";
export function seoCopy(
  lang: Lang,
  path: string,
): { title: string; description: string } | undefined {
  return SEO_MESSAGES[lang][path];
}
