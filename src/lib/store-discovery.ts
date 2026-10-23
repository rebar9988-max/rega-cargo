import { isProhibitedQuery } from "./compliance/check.ts";
import { checkProductUrl } from "./orders/store-request.ts";
import { DIRECTORY_STORES, type DirectoryStore } from "./stores.ts";

/** Group AFTER filtering: country URLs and saved regional storefronts keep their meaning. */
export function groupStorefronts(stores: readonly DirectoryStore[]) {
  const groups = new Map<string, DirectoryStore[]>();
  for (const store of stores) {
    const group = groups.get(store.brand) ?? [];
    group.push(store);
    groups.set(store.brand, group);
  }
  return [...groups.values()];
}

/** Only a validated product URL is carried to the existing request form; never fetched here. */
export function productLinkTarget(input: string) {
  if (isProhibitedQuery(input)) return null;
  const checked = checkProductUrl(input, undefined);
  if (!checked.ok) return null;
  const host = new URL(checked.url).hostname.replace(/^www\./, "");
  const store = DIRECTORY_STORES.find(
    (entry) => host === entry.host || host.endsWith(`.${entry.host}`),
  );
  return { url: checked.url, store: store?.id };
}
