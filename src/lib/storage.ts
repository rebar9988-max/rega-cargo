/**
 * The only way the app touches localStorage. Every access is wrapped in
 * try/catch (private mode, blocked storage, quota), keys are versioned, and
 * only non-personal preferences live here: no names, phone numbers, emails,
 * addresses or tokens. Old unversioned keys are migrated once, then removed.
 */
export const STORAGE_KEYS = {
  lang: "rl-lang-v4",
  service: "rl-service-v1",
  favs: "rl-favs-v1",
  held: "rl-held-v1",
  recent: "rl-recent-v1",
} as const;

export type StorageName = keyof typeof STORAGE_KEYS;

/** Previous key names, read once for migration and then deleted. */
export const LEGACY_KEYS: Record<StorageName, readonly string[]> = {
  lang: ["rega-lang", "rega-lang-v3"],
  service: ["rl-service"],
  favs: ["rl-store-favs"],
  held: ["rega-held"],
  recent: ["rl-recent-searches"],
};

function store(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function rawGet(key: string): string | null {
  try {
    return store()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function rawSet(key: string, value: string): void {
  try {
    store()?.setItem(key, value);
  } catch {
    /* storage unavailable or full: the preference just isn't remembered */
  }
}

export function rawRemove(key: string): void {
  try {
    store()?.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Reads a versioned key; if missing, moves the first legacy value over (same format). */
export function getItem(name: StorageName): string | null {
  const value = rawGet(STORAGE_KEYS[name]);
  if (value !== null || name === "lang") return value;
  const [legacy] = LEGACY_KEYS[name];
  const old = legacy ? rawGet(legacy) : null;
  if (old !== null) {
    rawSet(STORAGE_KEYS[name], old);
    rawRemove(legacy);
  }
  return old;
}

export function setItem(name: StorageName, value: string): void {
  rawSet(STORAGE_KEYS[name], value);
}

export function removeItem(name: StorageName): void {
  rawRemove(STORAGE_KEYS[name]);
}

/** JSON read that never throws: bad or tampered data gives the fallback. */
export function getJson<T>(name: StorageName, guard: (value: unknown) => T | null, fallback: T): T {
  const raw = getItem(name);
  if (raw === null || raw.length > 20_000) return fallback;
  try {
    return guard(JSON.parse(raw)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function setJson(name: StorageName, value: unknown): void {
  try {
    setItem(name, JSON.stringify(value));
  } catch {
    /* not serialisable: ignore */
  }
}
