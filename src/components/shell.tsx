import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Check, ChevronDown, Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LANGS, langMeta, type Lang } from "@/lib/langs";
import logo from "@/assets/rega-logo.jpg";

const LINKS = [
  { to: "/", key: "home", exact: true },
  { to: "/quote", key: "quote", exact: false },
  { to: "/track", key: "track", exact: false },
  { to: "/customs", key: "customs", exact: false },
  { to: "/contact", key: "contact", exact: false },
] as const;

function isOn(path: string, to: string, exact: boolean) {
  if (exact) return path === to;
  return path === to || path.startsWith(`${to}/`);
}

export function Mark() {
  return (
    <img
      src={logo}
      alt=""
      width={48}
      height={48}
      className="size-12 shrink-0 rounded-lg"
    />
  );
}

export function PageHeader({ kicker, title, lede }: { kicker: string; title: string; lede: string }) {
  return (
    <header className="bg-pine text-pine-ink">
      <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <p className="text-sm font-medium text-pine-ink/75">{kicker}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-pine-ink md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-pine-ink/80 md:text-lg">{lede}</p>
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
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-pine-ink focus:px-4 focus:py-2 focus:text-pine"
      >
        {t.skip}
      </a>
      <header className="sticky top-0 z-20 bg-pine text-pine-ink">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <Mark />
            <span className="flex min-w-0 flex-col leading-none">
              <span className="font-sans text-sm font-semibold tracking-widest text-pine-ink">REGA</span>
              <span className="mt-1 truncate text-xs text-pine-ink/75">{t.brandSub}</span>
            </span>
          </Link>
          <nav className="ms-auto hidden items-center gap-5 md:flex">
            {LINKS.map((link) => {
              const on = isOn(path, link.to, link.exact);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm ${on ? "font-medium text-pine-ink" : "text-pine-ink/75 hover:text-pine-ink"}`}
                >
                  {t.nav[link.key]}
                </Link>
              );
            })}
          </nav>
          <div className="ms-auto flex shrink-0 items-center gap-1 md:ms-4">
            <LangSwitch key={path} lang={lang} setLang={setLang} />
            <button
              type="button"
              className="inline-flex size-12 items-center justify-center rounded-full border border-pine-ink/40 text-pine-ink md:hidden"
              aria-expanded={open}
              aria-label={open ? t.menuClose : t.menuOpen}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open ? (
          <nav className="flex flex-col border-t border-pine-ink/20 bg-pine px-5 py-2 md:hidden">
            {LINKS.map((link) => {
              const on = isOn(path, link.to, link.exact);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex h-12 items-center text-base ${on ? "font-medium text-pine-ink" : "text-pine-ink/75"}`}
                >
                  {t.nav[link.key]}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </header>
      <main id="content" className="flex-1">
        {children}
      </main>
      <footer className="bg-pine text-pine-ink">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Mark />
              <span className="font-sans text-sm font-semibold tracking-widest text-pine-ink">REGA</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-pine-ink/75">{t.footerBlurb}</p>
          </div>
          <div>
            <p className="text-sm font-medium">{t.hubsTitle}</p>
            <ul className="mt-4 flex flex-col gap-3">
              {t.hubs.map((hub) => (
                <li key={hub.name}>
                  <p className="text-sm font-medium">{hub.name}</p>
                  <p className="text-sm text-pine-ink/75">{hub.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">{t.hoursTitle}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {t.hours.map((row) => (
                <li key={row}>
                  <bdi dir="ltr" className="text-sm text-pine-ink/75">
                    {row}
                  </bdi>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-pine-ink/20">
          <p className="mx-auto max-w-6xl px-5 py-4 text-xs leading-relaxed text-pine-ink/70">{t.footerNote}</p>
        </div>
      </footer>
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
        className="inline-flex h-12 items-center gap-1 rounded-full px-1 text-sm text-pine-ink"
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
