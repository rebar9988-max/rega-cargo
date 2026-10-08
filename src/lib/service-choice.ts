/** Which of the two services (Bazaar or Delivery) the home page shows; remembered per device. */
export type Service = "bazaar" | "delivery";
export const SERVICE_KEY = "rl-service";

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
}
