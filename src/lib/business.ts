/**
 * Business contact details beyond the email. Shown ONLY when the owner has set them as
 * Worker vars (wrangler.jsonc "vars" or the dashboard) AND they pass validation. Setting a
 * var is the owner's confirmation that the detail is verified; unset or invalid = hidden.
 *
 * Server: read from the Worker env. The root document stamps the validated values on
 * <html data-rl-contact='{"phone":…}'>, so the client renders the same thing on hydration.
 */
import { normalizePhone } from "./orders/store-request.ts";

export const CONTACT_KEYS = {
  phone: "RL_CONTACT_PHONE",
  whatsapp: "RL_CONTACT_WHATSAPP",
  hours: "RL_CONTACT_HOURS",
  timezone: "RL_CONTACT_TIMEZONE",
  address: "RL_WAREHOUSE_ADDRESS",
  mapUrl: "RL_WAREHOUSE_MAP_URL",
} as const;

export type BusinessContact = {
  phone?: string;
  whatsapp?: string;
  hours?: string;
  timezone?: string;
  address?: string;
  mapUrl?: string;
};

const MAP_HOSTS = ["google.com", "maps.google.com", "goo.gl", "maps.app.goo.gl", "openstreetmap.org", "osm.org", "maps.apple.com"];

function text(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value
    .normalize("NFKC")
    // eslint-disable-next-line no-control-regex -- stripping control chars is the point
    .replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return clean && clean.length <= max ? clean : undefined;
}

function validZone(zone: string | undefined) {
  if (!zone || !/^[A-Za-z_]+(\/[A-Za-z0-9_+-]+)+$/.test(zone)) return undefined;
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
    return zone;
  } catch {
    return undefined;
  }
}

function mapLink(value: unknown) {
  const raw = text(value, 500);
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const ok = url.protocol === "https:" && !url.username && !url.password && MAP_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`));
    return ok ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/** Validates raw env values. Hours need a valid IANA time zone; a map link needs an address. */
export function parseBusinessContact(env: Record<string, unknown>): BusinessContact {
  const out: BusinessContact = {};
  const phone = normalizePhone(env[CONTACT_KEYS.phone]);
  if (phone) out.phone = phone;
  const whatsapp = normalizePhone(env[CONTACT_KEYS.whatsapp]);
  if (whatsapp) out.whatsapp = whatsapp;
  const hours = text(env[CONTACT_KEYS.hours], 120);
  const timezone = validZone(text(env[CONTACT_KEYS.timezone], 60));
  if (hours && timezone) {
    out.hours = hours;
    out.timezone = timezone;
  }
  const address = text(env[CONTACT_KEYS.address], 200);
  if (address) {
    out.address = address;
    const map = mapLink(env[CONTACT_KEYS.mapUrl]);
    if (map) out.mapUrl = map;
  }
  return out;
}

/** Config keys whose detail is not shown (unset or invalid). */
export function missingContactKeys(contact: BusinessContact): string[] {
  const missing: string[] = [];
  if (!contact.phone) missing.push(CONTACT_KEYS.phone);
  if (!contact.whatsapp) missing.push(CONTACT_KEYS.whatsapp);
  if (!contact.hours) missing.push(CONTACT_KEYS.hours, CONTACT_KEYS.timezone);
  if (!contact.address) missing.push(CONTACT_KEYS.address);
  if (!contact.mapUrl) missing.push(CONTACT_KEYS.mapUrl);
  return missing;
}

/** https://wa.me/<digits> for a validated E.164 number. */
export function whatsappLink(e164: string) {
  return `https://wa.me/${e164.replace(/\D/g, "")}`;
}

/** Same values on server (env) and client (stamped attribute). */
export function businessContact(): BusinessContact {
  if (typeof document !== "undefined") {
    try {
      return parseBusinessContact(contactEnvFromJson(document.documentElement.dataset.rlContact));
    } catch {
      return {};
    }
  }
  const env = (globalThis as { __env__?: Record<string, unknown> }).__env__ ?? {};
  const proc = typeof process !== "undefined" ? (process.env as Record<string, unknown>) : {};
  const merged: Record<string, unknown> = {};
  for (const key of Object.values(CONTACT_KEYS)) merged[key] = env[key] ?? proc[key];
  return parseBusinessContact(merged);
}

/** Attribute value for <html data-rl-contact>, or undefined when nothing is configured. */
export function contactAttr(): string | undefined {
  if (typeof document !== "undefined") return document.documentElement.dataset.rlContact;
  const contact = businessContact();
  return Object.keys(contact).length ? JSON.stringify(contact) : undefined;
}

function contactEnvFromJson(raw: string | undefined): Record<string, unknown> {
  if (!raw) return {};
  const value = JSON.parse(raw) as BusinessContact;
  return {
    [CONTACT_KEYS.phone]: value.phone,
    [CONTACT_KEYS.whatsapp]: value.whatsapp,
    [CONTACT_KEYS.hours]: value.hours,
    [CONTACT_KEYS.timezone]: value.timezone,
    [CONTACT_KEYS.address]: value.address,
    [CONTACT_KEYS.mapUrl]: value.mapUrl,
  };
}
