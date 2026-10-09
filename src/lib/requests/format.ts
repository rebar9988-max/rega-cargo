import { NUM_LOCALE } from "@/lib/numbers";

/** Date + time with Western digits, fixed locale so server and client render the same text. */
export function when(iso: string, withTime = true) {
  return new Intl.DateTimeFormat(NUM_LOCALE, {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
    timeZone: "Asia/Baghdad",
  }).format(new Date(iso));
}
