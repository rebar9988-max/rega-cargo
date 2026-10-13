/**
 * Public tracking codes: RG-XXXX-XXXX-XXXX from a CSPRNG over Crockford
 * base32 (no I, L, O, U). 60 random bits, so codes cannot be enumerated.
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function newTrackingId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const chars = Array.from(bytes, (byte) => ALPHABET[byte & 31]);
  return `RG-${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}-${chars.slice(8, 12).join("")}`;
}

/** Accepts new codes and the legacy RG-XXXXX form; anything else is not looked up. */
export function normalizeTrackingId(input: string): string | null {
  const code = input.trim().toUpperCase().slice(0, 40);
  return /^RG-[A-Z0-9]{4,}(-[A-Z0-9]{4})*$/.test(code) ? code : null;
}

/**
 * The anonymous /track lookup only accepts the 60-bit form. Legacy RG-XXXXX
 * codes (about a million possibilities) could be enumerated, so they stay
 * visible to their owner and staff in the account pages only.
 */
export function publicTrackingId(input: string): string | null {
  const code = normalizeTrackingId(input);
  return code && /^RG-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/.test(code) ? code : null;
}
