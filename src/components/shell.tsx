import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Check, ChevronDown, House, LayoutGrid, Menu, Store, Tag, X } from "lucide-react";
import { PhoneButton } from "@/components/phone-gate";
import { useI18n } from "@/lib/i18n";
import { LANGS, langMeta, type Lang } from "@/lib/langs";

const LINKS = [
  { to: "/", key: "home", exact: true },
  { to: "/quote", key: "quote", exact: false },
  { to: "/track", key: "track", exact: false },
  { to: "/customs", key: "customs", exact: false },
  { to: "/stores", key: "stores", exact: false },
  { to: "/market", key: "market", exact: false },
  { to: "/move", key: "move", exact: false },
  { to: "/contact", key: "contact", exact: false },
] as const;

const TABS = [
  { to: "/", key: "home", exact: true, icon: House },
  { to: "/stores", key: "stores", exact: false, icon: Store },
  { to: "/quote", key: "quote", exact: false, icon: Tag },
  { to: "/market", key: "market", exact: false, icon: LayoutGrid },
] as const;

function isOn(path: string, to: string, exact: boolean) {
  if (exact) return path === to;
  return path === to || path.startsWith(`${to}/`);
}

export function Mark({ className = "size-14" }: { className?: string }) {
  return <img src="/rega-logo.jpg?v=7" alt="R&L" width={56} height={56} className={`${className} shrink-0 rounded-xl`} />;
}

export function PageHeader({ kicker, title, lede }: { kicker: string; title: string; lede: string }) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-10 md:py-16">
        <p className="text-sm font-medium text-pine">{kicker}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-ink md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">{lede}</p>
      </div>
    </header>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-pine focus:px-4 focus:py-2 focus:text-pine-ink"
      >
        {t.skip}
      </a>
      <header className="sticky top-0 z-20 border-b border-line bg-surface text-ink">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <Mark className="size-11 md:size-12" />
            <span className="hidden min-w-0 flex-col leading-none xl:flex">
              <span className="font-sans text-xs font-semibold tracking-wide text-ink">MOVE SMART. DELIVER FAST.</span>
              <span className="mt-1 font-sans text-xs text-muted">EUROPE ↔ KURDISTAN ↔ IRAQ</span>
            </span>
          </Link>
          <nav className="ms-auto hidden items-center gap-3 lg:flex">
            {LINKS.map((link) => {
              const on = isOn(path, link.to, link.exact);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm ${on ? "font-medium text-pine" : "text-muted hover:text-ink"}`}
                >
                  {t.nav[link.key]}
                </Link>
              );
            })}
          </nav>
          <div className="ms-auto flex shrink-0 items-center gap-1 md:ms-4">
            <div className="hidden lg:block">
              <LangSwitch key={path} lang={lang} setLang={setLang} />
            </div>
            <PhoneButton />
            <button
              type="button"
              className="inline-flex size-12 items-center justify-center rounded-full border border-line text-ink lg:hidden"
              aria-expanded={open}
              aria-label={open ? t.menuClose : t.menuOpen}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open ? (
          <nav className="flex flex-col border-t border-line bg-surface px-5 py-2 lg:hidden">
            {LINKS.map((link) => {
              const on = isOn(path, link.to, link.exact);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex h-12 items-center text-base ${on ? "font-medium text-pine" : "text-ink"}`}
                >
                  {t.nav[link.key]}
                </Link>
              );
            })}
            <div className="border-t border-line py-3">
              <LangSwitch key={`${path}-menu`} lang={lang} setLang={setLang} />
            </div>
          </nav>
        ) : null}
      </header>
      <main id="content" className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>
      <footer className="bg-ink pb-24 text-paper lg:pb-0">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Mark />
              <div className="leading-none">
                <p className="font-sans text-xs font-semibold tracking-wide text-paper">MOVE SMART. DELIVER FAST.</p>
                <p className="mt-1 font-sans text-xs text-paper/70">EUROPE ↔ KURDISTAN ↔ IRAQ</p>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-paper/70">{t.footerBlurb}</p>
          </div>
          <div>
            <p className="text-sm font-medium">{t.hubsTitle}</p>
            <ul className="mt-4 flex flex-col gap-3">
              {t.hubs.map((hub) => (
                <li key={hub.name}>
                  <p className="text-sm font-medium">{hub.name}</p>
                  <p className="text-sm text-paper/70">{hub.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">{t.hoursTitle}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {t.hours.map((row) => (
                <li key={row}>
                  <bdi dir="ltr" className="text-sm text-paper/70">
                    {row}
                  </bdi>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-paper/15">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
            <p className="text-xs leading-relaxed text-paper/60">{t.footerNote}</p>
            <a
              href="/rega-cargo.pdf"
              download="rega-cargo.pdf"
              className="inline-flex h-10 shrink-0 items-center rounded-full border border-paper/25 px-4 text-xs font-medium text-paper"
            >
              PDF
            </a>
          </div>
        </div>
      </footer>
      <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-3xl border border-line bg-surface/95 px-1 py-1 shadow-lg backdrop-blur lg:hidden">
        {TABS.map((tab) => {
          const on = isOn(path, tab.to, tab.exact);
          const Icon = tab.icon;
          return (
            <Link key={tab.to} to={tab.to} className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] ${on ? "bg-ink text-pine-ink" : "text-muted"}`}>
              <Icon className="size-5" />
              {t.nav[tab.key]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function LangSwitch({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = langMeta(lang);

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={current.name}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-12 items-center gap-1 rounded-full px-1 text-sm text-ink"
      >
        <span className={current.dir === "rtl" ? "font-ar" : "font-sans"}>{current.short}</span>
        <ChevronDown className={`size-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label={current.name}
          className="absolute end-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-paper/10 bg-ink p-1.5 shadow-2xl"
        >
          {LANGS.map((item) => {
            const on = item.id === lang;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => {
                  setLang(item.id);
                  setOpen(false);
                }}
                className={`grid h-11 w-full grid-cols-[1.25rem_minmax(0,1fr)_2.5rem] items-center gap-2 rounded-xl px-3 text-sm ${
                  on ? "bg-pine/25 text-pine" : "text-paper hover:bg-paper/5"
                }`}
              >
                <span className="flex justify-center">{on ? <Check className="size-4" strokeWidth={2.5} /> : null}</span>
                <span className={`truncate text-center font-medium ${item.dir === "rtl" ? "font-ar" : "font-sans"}`}>
                  {item.name}
                </span>
                <span className={`text-end text-xs tracking-wide ${on ? "text-pine" : "text-paper/45"}`}>{item.code}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
