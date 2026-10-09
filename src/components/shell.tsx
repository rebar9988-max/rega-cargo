import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  House,
  LayoutGrid,
  Mail,
  MapPin,
  Menu,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Truck,
  UserRound,
  Warehouse,
  X,
  type LucideIcon,
} from "lucide-react";
import { AI_COPY } from "@/components/ai-copy";
import { PhoneButton } from "@/components/phone-gate";
import { SearchBox } from "@/components/search-box";
import { LEGAL_COPY } from "@/lib/legal-copy";
import { rlAiEnabled } from "@/lib/ai/flag";
import { CONTACT_EMAIL } from "@/lib/contact";
import { DESIGN_COPY } from "@/lib/design-copy";
import { useI18n } from "@/lib/i18n";
import { storeCopy } from "@/lib/store-copy";
import { LANGS, langMeta, type Lang } from "@/lib/langs";

const LINKS = [
  { to: "/", key: "home", exact: true },
  { to: "/quote", key: "quote", exact: false },
  { to: "/track", key: "track", exact: false },
  { to: "/stores", key: "stores", exact: false },
  { to: "/market", key: "market", exact: false },
  { to: "/move", key: "move", exact: false },
  { to: "/contact", key: "contact", exact: false },
] as const;

const TABS = [
  { to: "/", key: "home", exact: true, icon: House },
  { to: "/stores", key: "stores", exact: false, icon: Store },
  { to: "/quote", key: "delivery", exact: false, icon: Truck },
  { to: "/market", key: "market", exact: false, icon: LayoutGrid },
] as const;
const DELIVERY_PATHS = ["/quote", "/track", "/move"];

const MENU_BAZAAR = [
  { to: "/stores", key: "stores", icon: Store },
  { to: "/market", key: "market", icon: LayoutGrid },
  { to: "/ai", key: "ai", icon: Sparkles },
] as const;
const MENU_DELIVERY = [
  { to: "/quote", key: "quote", icon: Tag },
  { to: "/track", key: "track", icon: MapPin },
  { to: "/move", key: "move", icon: Truck },
] as const;

const iconBtn =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink hover:bg-paper lg:size-9";

function MenuRow({
  to,
  icon: Icon,
  label,
  sub,
  on,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  sub?: string;
  on: boolean;
}) {
  return (
    <Link
      to={to}
      className="flex min-h-16 items-center gap-3 border-b border-line px-4 py-3 last:border-b-0"
      style={{ direction: "ltr" }}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper text-ink">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start">
        <span dir="auto" className={`text-base ${on ? "font-semibold text-pine" : "text-ink"}`}>
          {label}
        </span>
        {sub ? (
          <bdi dir="ltr" className="text-sm text-muted">
            {sub}
          </bdi>
        ) : null}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
    </Link>
  );
}

function isOn(path: string, to: string, exact: boolean) {
  if (exact) return path === to;
  return path === to || path.startsWith(`${to}/`);
}

export function Mark({ className = "size-14" }: { className?: string }) {
  return (
    <img
      src="/rega-logo-168.webp"
      alt="R&L"
      width={56}
      height={56}
      decoding="async"
      className={`${className} shrink-0 rounded-xl`}
    />
  );
}

/**
 * Route heads are written in Sorani (SSR/SEO). For other languages the tab title follows
 * the page's visible h1, so tabs and screen readers announce the chosen language.
 */
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

/** R&L AI entry: same pill as the sign-in button; shown only where RL_AI_ENABLED is on. */
function AiPill({ lang, on }: { lang: Lang; on: boolean }) {
  const label = AI_COPY[lang].navLabel;
  return (
    <Link
      to="/ai"
      aria-current={on ? "page" : undefined}
      style={{ direction: "ltr" }}
      className={`inline-flex h-10 w-16 shrink-0 items-center justify-center gap-1.5 rounded-full border px-2 sm:w-36 lg:w-16 xl:w-36 text-sm whitespace-nowrap ${on ? "border-pine text-pine" : "border-line text-ink"}`}
    >
      <Sparkles className="size-4 shrink-0 text-pine" aria-hidden="true" />
      <span className="sm:hidden lg:inline xl:hidden" dir="ltr">
        AI
      </span>
      <span className="sr-only sm:not-sr-only lg:sr-only xl:not-sr-only" dir="auto">
        {label.includes("AI") ? label : ` ${label}`}
      </span>
    </Link>
  );
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

export type ShellSearch = { q: string; setQ: (value: string) => void };

export function Shell({ children, search }: { children: ReactNode; search?: ShellSearch }) {
  const { t, lang, setLang } = useI18n();
  const d = DESIGN_COPY[lang];
  const ai = rlAiEnabled();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useLocalizedTitle(lang, path);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-pine focus:px-4 focus:py-2 focus:text-pine-ink"
      >
        {t.skip}
      </a>
      <header className="sticky top-0 z-30 border-b-2 border-pine bg-surface text-ink">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 md:px-5" style={{ direction: "ltr" }}>
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <Mark className="size-11 md:size-12" />
            <span lang="en" className="hidden min-w-0 flex-col leading-none xl:flex">
              <span className="font-sans text-xs font-semibold tracking-wide text-ink">
                MOVE SMART. DELIVER FAST.
              </span>
              <span className="mt-1 font-sans text-xs text-muted">EUROPE ↔ KURDISTAN ↔ IRAQ</span>
            </span>
          </Link>
          <nav className="ms-auto hidden items-center gap-2 lg:flex">
            {LINKS.map((link) => {
              const on = isOn(path, link.to, link.exact);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`inline-flex min-h-11 min-w-6 items-center justify-center text-sm whitespace-nowrap ${on ? "font-semibold text-pine" : "text-muted hover:text-ink"}`}
                >
                  {link.to === "/move" ? d.moveSend : t.nav[link.key]}
                </Link>
              );
            })}
          </nav>
          <div className="ms-auto flex shrink-0 items-center gap-1 lg:ms-4">
            <div className="hidden lg:block">
              <LangSwitch key={path} lang={lang} setLang={setLang} />
            </div>
            {ai ? <AiPill lang={lang} on={isOn(path, "/ai", false)} /> : null}
            <Link to="/stores" search={{ fav: 1 }} aria-label={d.wishlist} className={iconBtn}>
              <Heart className="size-5" aria-hidden="true" />
            </Link>
            <Link
              to="/stores/request"
              search={{ store: undefined, item: undefined, intent: "buy" }}
              aria-label={d.cart}
              className={iconBtn}
            >
              <ShoppingBag className="size-5" aria-hidden="true" />
            </Link>
            <span className="contents max-[389px]:hidden">
              <PhoneButton variant="icon" label={d.account} />
            </span>
            <PhoneButton />
            <button
              type="button"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-ink lg:hidden"
              aria-expanded={open}
              aria-label={open ? t.menuClose : t.menuOpen}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>
      {open ? (
        <div className="fixed inset-x-0 top-[66px] bottom-0 z-20 overflow-y-auto bg-paper px-4 pt-4 pb-28 lg:hidden">
          <div className="mx-auto flex max-w-lg flex-col gap-3">
            <section className="flex flex-col items-center rounded-3xl border border-line bg-surface p-5 text-center">
              <span className="grid size-16 place-items-center rounded-full bg-paper text-muted">
                <UserRound className="size-7" aria-hidden="true" />
              </span>
              <p className="mt-3 text-base font-semibold">{d.account}</p>
              <p className="mt-1 text-sm text-muted">{d.accountHint}</p>
              <div className="mt-4 w-full">
                <PhoneButton variant="block" />
              </div>
            </section>
            {(
              [
                { title: d.bazaar, icon: ShoppingBag, rows: MENU_BAZAAR },
                { title: d.delivery, icon: Truck, rows: MENU_DELIVERY },
              ] as const
            ).map((group) => (
              <section key={group.title} className="flex flex-col gap-2">
                <h2
                  className="flex items-center gap-2 px-2 pt-2 text-sm font-bold text-ink"
                  style={{ direction: "ltr" }}
                >
                  <group.icon className="size-4 text-pine" aria-hidden="true" />
                  <span dir="auto">{group.title}</span>
                </h2>
                <nav className="overflow-hidden rounded-3xl border border-line bg-surface">
                  {group.rows
                    .filter((item) => ai || item.to !== "/ai")
                    .map((item) => (
                      <MenuRow
                        key={item.to}
                        to={item.to}
                        icon={item.icon}
                        label={
                          item.to === "/ai"
                            ? AI_COPY[lang].navLabel
                            : item.to === "/move"
                              ? d.moveSend
                              : item.to === "/stores"
                                ? storeCopy(lang).storesHeading
                                : t.nav[item.key as keyof typeof t.nav]
                        }
                        on={isOn(path, item.to, false)}
                      />
                    ))}
                </nav>
              </section>
            ))}
            <div className="overflow-hidden rounded-3xl border border-line bg-surface">
              <MenuRow
                to="/contact"
                icon={Mail}
                label={t.nav.contact}
                sub={CONTACT_EMAIL}
                on={isOn(path, "/contact", false)}
              />
            </div>
            <div className="rounded-3xl border border-line bg-surface px-4 py-3">
              <LangSwitch key={`${path}-menu`} lang={lang} setLang={setLang} />
            </div>
          </div>
        </div>
      ) : null}
      <SearchBox search={search} label={d.search} closeLabel={t.menuClose} lang={lang} ai={ai} />
      <main id="content" className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>
      <footer className="border-t border-line bg-surface pb-24 text-ink lg:pb-0">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-3">
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
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs leading-relaxed text-muted">{t.footerNote}</p>
              <nav aria-label={LEGAL_COPY[lang].links.impressum} className="flex flex-wrap gap-x-4 text-xs">
                <Link to="/impressum" className="inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline">{LEGAL_COPY[lang].links.impressum}</Link>
                <Link to="/privacy" className="inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline">{LEGAL_COPY[lang].links.privacy}</Link>
                <Link to="/terms" className="inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline">{LEGAL_COPY[lang].links.terms}</Link>
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
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        {TABS.map((tab) => {
          const on =
            tab.key === "delivery"
              ? DELIVERY_PATHS.some((item) => isOn(path, item, false))
              : isOn(path, tab.to, tab.exact);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex h-16 flex-col items-center justify-center gap-1 text-xs ${on ? "font-semibold text-pine" : "text-muted"}`}
            >
              <Icon className="size-5" aria-hidden="true" />
              {tab.key === "delivery" ? d.delivery : t.nav[tab.key]}
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
        <ChevronDown
          className={`size-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label={current.name}
          className="absolute end-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-line bg-surface p-1.5 shadow-xl"
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
                  on ? "bg-pine/10 text-pine" : "text-ink hover:bg-paper"
                }`}
              >
                <span className="flex justify-center">
                  {on ? <Check className="size-4" strokeWidth={2.5} /> : null}
                </span>
                <span
                  className={`truncate text-center font-medium ${item.dir === "rtl" ? "font-ar" : "font-sans"}`}
                >
                  {item.name}
                </span>
                <span
                  className={`text-end text-xs tracking-wide ${on ? "text-pine" : "text-muted"}`}
                >
                  {item.code}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
