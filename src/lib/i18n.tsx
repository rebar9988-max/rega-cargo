import { useNavigate } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LAYOUT_DIR, isLang, langMeta, type Lang } from "@/lib/langs";
import { getItem, rawGet, rawRemove, setItem } from "@/lib/storage";

export type { Lang };

import type { en } from "./messages/en";

export type Copy = typeof en;

// The root preloads the active catalog on the server and includes it in its route context.
// Other catalogs load only when their locale is selected.
const catalog: Partial<Record<Lang, Copy>> = {};
const loaders: Record<Lang, () => Promise<Copy>> = {
  ckb: () => import("@/lib/messages/ckb").then((m) => m.ckb),
  en: () => import("@/lib/messages/en").then((m) => m.en),
  ku: () => import("@/lib/messages/ku").then((m) => m.ku),
  de: () => import("@/lib/messages/de").then((m) => m.de),
  ar: () => import("@/lib/messages/ar").then((m) => m.ar),
  fa: () => import("@/lib/messages/fa").then((m) => m.fa),
  tr: () => import("@/lib/messages/tr").then((m) => m.tr),
};

export async function loadCopy(lang: Lang): Promise<Copy> {
  const have = catalog[lang];
  if (have) return have;
  const copy = await loaders[lang]();
  catalog[lang] = copy;
  return copy;
}

type Ctx = { lang: Lang; t: Copy; setLang: (lang: Lang) => void };

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({
  children,
  initialLang,
  initialCopy,
  localeExplicit = false,
}: {
  children: ReactNode;
  initialLang: Lang;
  initialCopy: Copy;
  localeExplicit?: boolean;
}) {
  catalog[initialLang] = initialCopy;
  const navigate = useNavigate();
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [ready, setReady] = useState(false);
  const setLang = useCallback(
    (next: Lang) => {
      // The root route preloads this copy; the URL renders the same locale on reload and for crawlers.
      const url = new URL(window.location.href);
      url.searchParams.set("lang", next);
      void navigate({ href: `${url.pathname}${url.search}${url.hash}`, replace: true });
    },
    [navigate],
  );
  useEffect(() => {
    setLangState(initialLang);
  }, [initialLang]);

  useEffect(() => {
    const stored = getItem("lang");
    let next: Lang = "ckb";
    if (localeExplicit) next = initialLang;
    else if (isLang(stored)) next = stored;
    else {
      // One-time migration from the old unversioned keys.
      const saved = rawGet("rega-lang");
      const settled = rawGet("rega-lang-v3") === "1";
      if (settled && isLang(saved)) next = saved;
      else if (saved === "en") next = "en";
      else if (isLang(saved) && saved !== "ku") next = saved;
    }
    setItem("lang", next);
    rawRemove("rega-lang");
    rawRemove("rega-lang-v3");
    if (!localeExplicit && next !== initialLang) setLang(next);
    setReady(true);
    // Restore saved preferences once; subsequent URL changes come from the router.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const meta = langMeta(lang);
    const root = document.documentElement;
    const scriptChanged = root.dataset.textdir !== meta.dir;
    root.lang = meta.html;
    root.dir = LAYOUT_DIR;
    root.dataset.textdir = meta.dir;
    if (scriptChanged) restyle(root);
    if (ready) setItem("lang", lang);
  }, [lang, ready]);

  const value = useMemo<Ctx>(
    () => ({ lang, t: catalog[lang] ?? initialCopy, setLang }),
    [lang, setLang, initialCopy],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Switching between Arabic-script and Latin type scales changes inherited font sizes across
 * the page. WebKit (Safari) can leave some descendants with the previous script's sizes
 * (caught by the layout-lock WebKit runs), so rebuild styles once, synchronously (no paint in
 * between), keeping scroll position and focus.
 */
function restyle(root: HTMLElement) {
  const { scrollX, scrollY } = window;
  const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const display = root.style.display;
  root.style.display = "none";
  void root.offsetHeight;
  root.style.display = display;
  void root.offsetHeight;
  if (window.scrollX !== scrollX || window.scrollY !== scrollY) window.scrollTo(scrollX, scrollY);
  if (focused && document.activeElement !== focused) focused.focus({ preventScroll: true });
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function dayRange(template: string, a: number, b: number) {
  return template.replace("{a}", String(a)).replace("{b}", String(b));
}
