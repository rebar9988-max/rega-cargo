/** Which of the two services (Bazaar or Delivery) the home page shows; remembered per device. */
export type Service = "bazaar" | "delivery";
export const SERVICE_KEY = "rl-service";
/** Same name as the storage key; read on the server so SSR renders the remembered panel. */
export const SERVICE_COOKIE = SERVICE_KEY;

/** Only "delivery" is meaningful; anything else (absent, tampered) is the default. */
export function serviceFromCookieHeader(header: string | null | undefined): Service {
  return /(?:^|;\s*)rl-service=delivery(?:;|$)/.test(header ?? "") ? "delivery" : "bazaar";
}

export function readService(): Service {
  try {
    return localStorage.getItem(SERVICE_KEY) === "delivery" ? "delivery" : "bazaar";
  } catch {
    return "bazaar";
  }
}

export function writeService(service: Service) {
  try {
    localStorage.setItem(SERVICE_KEY, service);
  } catch {
    // storage unavailable (private mode): the choice simply isn't remembered
  }
  try {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie =
      service === "delivery"
        ? `${SERVICE_COOKIE}=delivery; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
        : `${SERVICE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  } catch {
    // cookies blocked: SSR shows Bazaar and the client corrects it after hydration
  }
}
