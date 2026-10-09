import { isProhibitedQuery } from "../compliance/check.ts";
import { getJson, removeItem, setJson } from "../storage.ts";

/** Recent searches, kept only on this device (storage key rl-recent-v1). */
const MAX = 8;

const strings = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, MAX)
    : null;

export function readRecent(): string[] {
  return getJson("recent", strings, []).filter((item) => !isProhibitedQuery(item));
}

export function addRecent(text: string): string[] {
  const value = text.trim().slice(0, 80);
  if (!value || isProhibitedQuery(value)) return readRecent();
  const key = value.toLowerCase();
  const next = [value, ...readRecent().filter((item) => item.toLowerCase() !== key)].slice(0, MAX);
  setJson("recent", next);
  return next;
}

export function clearRecent(): string[] {
  removeItem("recent");
  return [];
}
