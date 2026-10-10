import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  House,
  LayoutGrid,
  Menu,
  ShoppingBag,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { Icon, Modal, Select, ThemeToggle } from "./ui";
import { Mark } from "./site-mark";
import { AI_COPY } from "./ai-copy";
import { SearchBox } from "./search-box";
import { HeaderLangPicker } from "./lang-picker";
import { useI18n } from "@/lib/i18n";
import { redesignCopy } from "@/lib/redesign-copy";
import { LANGS } from "@/lib/langs";
import { DESIGN_COPY } from "@/lib/design-copy";
import { NAV_CATEGORIES, ANNOUNCEMENT_ENABLED } from "@/lib/navigation";
import { storeCopy } from "@/lib/store-copy";
import { GOODS } from "@/lib/stores";
import { responsiveImage } from "@/lib/images";
import { rawGet, rawSet } from "@/lib/storage";
import { rlAiEnabled } from "@/lib/ai/flag";
import type { ShellSearch } from "./shell";

export function SiteHeader({ search }: { search?: ShellSearch }) {
  const { lang, t, setLang } = useI18n();
  const c = redesignCopy(lang);
  const sc = storeCopy(lang);
  const d = DESIGN_COPY[lang];
  const path = useRouterState({ select: (s) => s.location.pathname });
  const wrap = useRef<HTMLElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [shrunk, setShrunk] = useState(false);
  const [announce, setAnnounce] = useState(ANNOUNCEMENT_ENABLED);
  useEffect(() => {
    setAnnounce(ANNOUNCEMENT_ENABLED && rawGet("rl-announcement-v1") !== "closed");
  }, []);
  useEffect(() => {
    setActive(null);
    setMobile(false);
  }, [path]);
  useEffect(() => {
    const scroll = () => setShrunk(window.scrollY > 32);
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  useEffect(() => {
    if (!active) return;
    const down = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setActive(null);
    };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [active]);
  function close() {
    const at = NAV_CATEGORIES.findIndex((n) => n.id === active);
    setActive(null);
    buttons.current[at]?.focus();
  }
  function categoryKey(event: KeyboardEvent<HTMLButtonElement>, i: number) {
    const rtl = lang === "ckb" || lang === "ar" || lang === "fa";
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(NAV_CATEGORIES[i].id);
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>(`[data-mega-column="${NAV_CATEGORIES[i].id}"] a`)
          ?.focus(),
      );
    } else if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      let next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? NAV_CATEGORIES.length - 1
            : i + (event.key === "ArrowRight" ? (rtl ? -1 : 1) : rtl ? 1 : -1);
      next = (next + NAV_CATEGORIES.length) % NAV_CATEGORIES.length;
      buttons.current[next]?.focus();
    }
  }
  const tabs = [
    { to: "/", label: t.nav.home, icon: House },
    { to: "/stores", label: c.marketplace, icon: ShoppingBag },
    { to: "/quote", label: c.shipping, icon: Truck },
    { to: "/market", label: t.nav.market, icon: LayoutGrid },
    { to: "/account", label: c.account, icon: UserRound },
  ];
  return (
    <>
      {announce ? (
        <div className="rl-announcement">
          <div className="page rl-announcement-inner">
            <p>{c.announcement}</p>
            <button
              type="button"
              aria-label={c.dismiss}
              className="rl-icon-button"
              onClick={() => {
                setAnnounce(false);
                rawSet("rl-announcement-v1", "closed");
              }}
            >
              <Icon as={X} />
            </button>
          </div>
        </div>
      ) : null}
      <header ref={wrap} className="rl-site-header" data-shrunk={shrunk} aria-label={c.navigation}>
        <div className="page rl-header-row" data-layout="header">
          <Link to="/" className="rl-brand" aria-label={t.nav.home}>
            <Mark className="rl-brand-mark" />
            <span className="rl-brand-name" dir="ltr">
              R&amp;L
            </span>
          </Link>
          <SearchBox
            embedded
            search={search}
            label={c.search}
            closeLabel={t.menuClose}
            lang={lang}
            ai={rlAiEnabled()}
          />
          <div className="rl-header-actions">
            <Link
              to="/stores"
              search={{ fav: 1 }}
              className="rl-icon-button rl-desktop-only"
              aria-label={d.wishlist}
            >
              <Icon as={Heart} />
            </Link>
            <Link to="/account" className="rl-icon-button rl-desktop-only" aria-label={c.account}>
              <Icon as={UserRound} />
            </Link>
            <Link
              to="/stores/request"
              search={{ store: undefined, item: undefined, intent: "buy" }}
              className="rl-icon-button"
              aria-label={c.requests}
            >
              <Icon as={ShoppingBag} />
            </Link>
            <HeaderLangPicker lang={lang} setLang={setLang} title={d.language} />
            <span className="rl-desktop-only">
              <ThemeToggle />
            </span>
            <button
              type="button"
              data-layout="menu-button"
              className="rl-icon-button rl-mobile-only"
              aria-label={t.menuOpen}
              aria-expanded={mobile}
              onClick={() => setMobile(true)}
            >
              <Icon as={Menu} />
            </button>
          </div>
        </div>
        <nav className="page rl-category-nav" aria-label={c.categories}>
          {NAV_CATEGORIES.map((n, i) => (
            <button
              key={n.id}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              aria-expanded={active === n.id}
              aria-controls="rl-mega"
              onClick={() => setActive(active === n.id ? null : n.id)}
              onKeyDown={(e) => categoryKey(e, i)}
              className="rl-category-trigger"
            >
              {c[n.id]}
              <Icon as={ChevronDown} />
            </button>
          ))}
          <Link
            to="/quote"
            search={{ from: undefined, to: undefined, kg: undefined }}
            className="rl-nav-service"
          >
            {c.shipping}
          </Link>
          {rlAiEnabled() ? (
            <Link to="/ai" className="rl-nav-service">
              {AI_COPY[lang].navLabel}
            </Link>
          ) : null}
        </nav>
        {active ? (
          <div
            id="rl-mega"
            className="rl-mega"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                close();
              }
            }}
          >
            <div className="page rl-mega-grid">
              {NAV_CATEGORIES.map((n) => {
                const image = GOODS.find((g) => g.id === n.image)!;
                return (
                  <section key={n.id} data-mega-column={n.id} className="rl-stack">
                    <h2>{c[n.id]}</h2>
                    <Link
                      to="/stores"
                      search={{ cat: n.cat, who: n.who }}
                      onClick={() => setActive(null)}
                    >
                      <img
                        {...responsiveImage(image.image, "160px")}
                        alt=""
                        width={160}
                        height={160}
                        loading="lazy"
                        decoding="async"
                        className="rl-menu-image"
                      />
                      <span className="rl-menu-image-note">{c.exampleTitle}</span>
                    </Link>
                    {n.children.map((cat) => (
                      <Link
                        key={cat}
                        to="/stores"
                        search={{ cat, who: n.who }}
                        onClick={() => setActive(null)}
                      >
                        {sc.categories[cat]}
                      </Link>
                    ))}
                    <Link
                      to="/stores"
                      search={{ cat: n.cat, who: n.who }}
                      onClick={() => setActive(null)}
                      className="rl-menu-more"
                    >
                      {c.browse}
                      <Icon as={ArrowRight} directional />
                    </Link>
                  </section>
                );
              })}
            </div>
          </div>
        ) : null}
      </header>
      <Modal
        open={mobile}
        onClose={() => setMobile(false)}
        title={c.navigation}
        className="rl-mobile-menu"
      >
        <div data-layout="sheet" className="rl-stack">
          <div className="rl-row">
            <Mark />
            <ThemeToggle />
          </div>
          <nav className="rl-stack" aria-label={c.categories}>
            {NAV_CATEGORIES.map((n) => (
              <Link
                key={n.id}
                to="/stores"
                search={{ cat: n.cat, who: n.who }}
                onClick={() => setMobile(false)}
                className="rl-mobile-menu-link"
              >
                {c[n.id]}
                <Icon as={ArrowRight} directional />
              </Link>
            ))}
          </nav>
          <nav className="rl-row" aria-label={d.services}>
            <Link
              to="/quote"
              search={{ from: undefined, to: undefined, kg: undefined }}
              onClick={() => setMobile(false)}
            >
              {c.shipping}
            </Link>
            <Link to="/track" search={{ id: "" }} onClick={() => setMobile(false)}>
              {t.nav.track}
            </Link>
            <Link
              to="/market"
              search={{
                q: "",
                category: "",
                brand: "",
                min: "",
                max: "",
                stock: "",
                sort: "price",
                page: 1,
                saved: "",
              }}
              onClick={() => setMobile(false)}
            >
              {t.nav.market}
            </Link>
            {rlAiEnabled() ? (
              <Link to="/ai" onClick={() => setMobile(false)}>
                {AI_COPY[lang].navLabel}
              </Link>
            ) : null}
            <Link to="/account" onClick={() => setMobile(false)}>
              {c.account}
            </Link>
            <Link to="/stores" search={{ fav: 1 }} onClick={() => setMobile(false)}>
              {d.wishlist}
            </Link>
          </nav>
          <label className="rl-stack">
            <span>{d.language}</span>
            <Select
              value={lang}
              onChange={(e) => {
                const next = LANGS.find((l) => l.id === e.target.value);
                if (next) setLang(next.id);
              }}
            >
              {LANGS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </Modal>
      <nav
        data-layout="bottom-bar"
        className="rl-bottom-nav app-bottom-bar"
        aria-label={c.navigation}
      >
        {tabs.map((tab) => (
          <Link key={tab.to} to={tab.to} aria-current={path === tab.to ? "page" : undefined}>
            <Icon as={tab.icon} />
            <span>{tab.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
