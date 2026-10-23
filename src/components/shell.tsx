import { useEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
export { Mark } from "./site-mark";
import { useI18n } from "@/lib/i18n";
import { type Lang } from "@/lib/langs";
let routerTitle = "";
let appliedTitle = "";
function useLocalizedTitle(lang: Lang, path: string) {
  useEffect(() => {
    const titleEl = document.querySelector("title");
    function apply() {
      if (document.title !== appliedTitle) routerTitle = document.title;
      if (lang === "ckb") {
        if (routerTitle && document.title !== routerTitle) document.title = routerTitle;
        appliedTitle = "";
        return;
      }
      const text = document.querySelector("main h1, h1")?.textContent?.replace(/\s+/g, " ").trim();
      if (!text) return;
      const next = `${text.slice(0, 70)} · R&L`;
      appliedTitle = next;
      if (document.title !== next) document.title = next;
    }
    apply();
    const timer = window.setTimeout(apply, 50);
    const observer = new MutationObserver(() => {
      if (document.title !== appliedTitle) apply();
    });
    if (titleEl) observer.observe(titleEl, { childList: true, characterData: true, subtree: true });
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [lang, path]);
}

export function PageHeader({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede: string;
}) {
  return (
    <header className="rl-page-header">
      <div className="page">
        <p className="rl-eyebrow">{kicker}</p>
        <h1>{title}</h1>
        <p className="rl-page-lede">{lede}</p>
      </div>
    </header>
  );
}
export type ShellSearch = { q: string; setQ: (value: string) => void };
export function Shell({
  children,
  search,
  reference = false,
}: {
  children: ReactNode;
  search?: ShellSearch;
  /** Reference homepage: the five-control header. The bottom bar is shown on every page. */
  reference?: boolean;
}) {
  const { t, lang } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });
  useLocalizedTitle(lang, path);
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <a href="#content" className="rl-skip">
        {t.skip}
      </a>
      <SiteHeader search={search} reference={reference} />
      <main id="content" className="flex-1">
        {children}
      </main>
      <SiteFooter bottomBar compact={path === "/stores"} />
    </div>
  );
}
