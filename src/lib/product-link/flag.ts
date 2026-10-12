/**
 * Is the product-link check switched on for this deployment? Off unless PRODUCT_LINK_ENABLED is
 * exactly "true".
 *
 * Server: read from the Worker env. The root document stamps the answer on
 * <html data-rl-plink="1">, so the client reads the same value during hydration. The panel is
 * then in the server-rendered HTML and never pops in above the request form after load (a
 * client-side status request did exactly that and shifted the form by the panel's height).
 */
export function productLinkEnabled(): boolean {
  if (typeof document !== "undefined") return document.documentElement.dataset.rlPlink === "1";
  const env = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const value =
    env?.PRODUCT_LINK_ENABLED ??
    (typeof process !== "undefined" ? process.env.PRODUCT_LINK_ENABLED : undefined);
  return value === "true";
}
