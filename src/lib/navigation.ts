import { PRIMARY_CATEGORIES } from "./catalogue.ts";
/** Header, footer and mobile menu use the same ten primary groups as the catalogue. */
export const NAV_CATEGORIES = PRIMARY_CATEGORIES;
export const ANNOUNCEMENT_ENABLED = true;

/** Classify descendants as part of their customer journey; preserve every existing URL. */
export function primaryJourney(path: string) {
  if (path === "/") return "/";
  if (path === "/market" || path.startsWith("/market/")) return "/market";
  if (path === "/stores" || path.startsWith("/stores/")) return "/stores/request";
  if (path === "/account" || path.startsWith("/account/")) return "/account";
  if (path === "/track") return "/track";
  if (path === "/contact") return "/contact";
  return null;
}
