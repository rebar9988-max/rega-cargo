/** Prioritize the bootstrap entry and visible assets over remaining route preloads. */
export default async function renderPriority(
  _event: unknown,
  next: () => unknown | Promise<unknown>,
) {
  const result = await next();
  if (!(result instanceof Response) || !result.body) return result;
  if (!(result.headers.get("content-type") ?? "").includes("text/html")) return result;
  let bootstrap = true;
  const html = (await result.text()).replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/\brel="modulepreload"/.test(tag)) return tag;
    const priority = bootstrap ? "high" : "low";
    bootstrap = false;
    return /\bfetchpriority=/.test(tag)
      ? tag
      : tag.replace(/\s*\/?\s*>$/, ` fetchpriority="${priority}"/>`);
  });
  const headers = new Headers(result.headers);
  headers.delete("content-length");
  return new Response(html, { status: result.status, statusText: result.statusText, headers });
}
