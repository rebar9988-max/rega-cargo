import { useEffect, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Mail, Warehouse } from "lucide-react";
import { SiteHeader } from "./site-header";
import { Mark } from "./site-mark";
export { Mark } from "./site-mark";
import { LEGAL_COPY } from "@/lib/legal-copy";
import { ITEMS_COPY } from "@/lib/items-copy";
import { CONTACT_EMAIL } from "@/lib/contact";
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
export function Shell({ children, search }: { children: ReactNode; search?: ShellSearch }) {
  const { t, lang } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });
  useLocalizedTitle(lang, path);
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <a href="#content" className="rl-skip">
        {t.skip}
      </a>
      <SiteHeader search={search} />
      <main id="content" className="flex-1">
        {children}
      </main>
      <footer className="clear-bottom-bar border-t border-line bg-surface text-ink lg:pb-0">
        <div className="page grid gap-10 py-12 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Mark />
              <div className="leading-none">
                <p dir="ltr" className="font-sans text-xs font-semibold tracking-wide text-ink">
                  MOVE SMART. DELIVER FAST.
                </p>
                <p dir="ltr" className="mt-1 font-sans text-xs text-muted">
                  EUROPE ↔ KURDISTAN ↔ IRAQ
                </p>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted">{t.footerBlurb}</p>
          </div>
          <div className="flex flex-col gap-3 md:col-span-2 md:items-end">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Warehouse className="size-4 shrink-0" aria-hidden="true" />
              <span dir="auto">{t.warehouse}</span>
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex min-h-11 items-center gap-2 text-sm font-medium text-pine hover:underline"
            >
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <bdi dir="ltr">{CONTACT_EMAIL}</bdi>
            </a>
          </div>
        </div>
        <div className="border-t border-line bg-paper">
          <div className="page flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs leading-relaxed text-muted">{t.footerNote}</p>
              <nav
                aria-label={LEGAL_COPY[lang].links.impressum}
                className="flex flex-wrap gap-x-4 text-xs"
              >
                <Link
                  to="/impressum"
                  className="inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline"
                >
                  {LEGAL_COPY[lang].links.impressum}
                </Link>
                <Link
                  to="/privacy"
                  className="inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline"
                >
                  {LEGAL_COPY[lang].links.privacy}
                </Link>
                <Link
                  to="/terms"
                  className="inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline"
                >
                  {LEGAL_COPY[lang].links.terms}
                </Link>
                <Link
                  to="/prohibited-items"
                  className="inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline"
                >
                  {ITEMS_COPY[lang].link}
                </Link>
              </nav>
            </div>
            <a
              href="/rl-cargo.pdf"
              download="rl-cargo.pdf"
              className="inline-flex h-10 shrink-0 items-center rounded-full border border-silver bg-surface px-4 text-xs font-medium text-ink hover:border-pine"
            >
              PDF
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
