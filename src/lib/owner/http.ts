/**
 * Closed public auth surface: owner/staff creation stays invitation-only. The only
 * public account path is the customer email-code flow (/rl-email/*), which refuses
 * privileged identities server-side.
 */
export function ownerAuthRequestAllowed(request: Request): boolean {
  const url = new URL(request.url);
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return false;
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) return false;
  if (request.method === "GET")
    return ["/api/auth/get-session", "/api/auth/rl-email/status"].includes(url.pathname);
  return (
    request.method === "POST" &&
    origin === url.origin &&
    [
      "/api/auth/sign-in/email",
      "/api/auth/sign-out",
      "/api/auth/change-password",
      "/api/auth/rl-email/send",
      "/api/auth/rl-email/verify",
    ].includes(
      url.pathname,
    )
  );
}
