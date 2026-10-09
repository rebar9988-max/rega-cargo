/** Recent searches, kept only on this device. */
const KEY = "rl-recent-searches";
const MAX = 8;

export function readRecent(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function addRecent(text: string): string[] {
  const value = text.trim().slice(0, 80);
  if (!value) return readRecent();
  const key = value.toLowerCase();
  const next = [value, ...readRecent().filter((item) => item.toLowerCase() !== key)].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable: the list just isn't remembered
  }
  return next;
}

export function clearRecent(): string[] {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  return [];
}
