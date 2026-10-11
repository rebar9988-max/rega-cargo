/** Product-link assist is OFF unless PRODUCT_LINK_ENABLED is exactly "true". */
export function productLinkEnabled(): boolean {
  const env = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const value =
    env?.PRODUCT_LINK_ENABLED ??
    (typeof process !== "undefined" ? process.env.PRODUCT_LINK_ENABLED : undefined);
  return value === "true";
}
