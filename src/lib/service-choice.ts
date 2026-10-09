import { getItem, setItem } from "./storage.ts";
/** Which of the two services (Bazaar or Delivery) the home page shows; remembered per device. */
export type Service = "bazaar" | "delivery";
/** Cookie read on the server so SSR renders the remembered panel (storage key: rl-service-v1, see storage.ts). */
export const SERVICE_COOKIE = "rl-service";

/** Only "delivery" is meaningful; anything else (absent, tampered) is the default. */
export function serviceFromCookieHeader(header: string | null | undefined): Service {
  return /(?:^|;\s*)rl-service=delivery(?:;|$)/.test(header ?? "") ? "delivery" : "bazaar";
}

export function readService(): Service {
  return getItem("service") === "delivery" ? "delivery" : "bazaar";
}

export function writeService(service: Service) {
  setItem("service", service);
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
