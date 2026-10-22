/**
 * The email sign-in limits, in one place because both sides need them: the server
 * enforces them, and the form counts the resend down. They used to be duplicated,
 * and the copy drifted apart the moment one side changed.
 *
 * The server stays authoritative; the countdown is only what the person sees.
 */

/** A code is usable for this long. */
export const CODE_TTL_MINUTES = 5;
/** Wait between two sends to the same address. */
export const RESEND_COOLDOWN_SECONDS = 30;
/** Guesses allowed per code before it is locked. */
export const MAX_ATTEMPTS = 5;
/** Codes one address may be sent per hour, and per day. */
export const EMAIL_HOUR_LIMIT = 8;
export const EMAIL_DAY_LIMIT = 20;
/** Codes one client address may ask for, and guesses it may make, per hour. */
export const IP_SEND_HOUR_LIMIT = 20;
export const IP_VERIFY_HOUR_LIMIT = 30;
