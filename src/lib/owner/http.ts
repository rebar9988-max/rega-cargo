/** Closed public auth surface: account creation/verification remain invitation-only. */
export function ownerAuthRequestAllowed(request: Request): boolean {
  const url = new URL(request.url);
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return false;
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) return false;
  if (request.method === "GET") return url.pathname === "/api/auth/get-session";
  return (
    request.method === "POST" &&
    origin === url.origin &&
    ["/api/auth/sign-in/email", "/api/auth/sign-out", "/api/auth/change-password"].includes(
      url.pathname,
    )
  );
}
