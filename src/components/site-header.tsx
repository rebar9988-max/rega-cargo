import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  Heart,
  House,
  LayoutGrid,
  Menu,
  ShoppingBag,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { Badge, Icon, Modal, Select, ThemeToggle } from "./ui";
import { CATEGORY_ICON } from "./category-icons";
import { Mark } from "./site-mark";
import { SITE_COPY } from "@/lib/site-copy";
import { SearchBox } from "./search-box";
import { HeaderLangPicker } from "./lang-picker";
import { useI18n } from "@/lib/i18n";
import { redesignCopy } from "@/lib/redesign-copy";
import { LANGS } from "@/lib/langs";
import { DESIGN_COPY } from "@/lib/design-copy";
import { NAV_CATEGORIES, ANNOUNCEMENT_ENABLED } from "@/lib/navigation";
import { storeCopy } from "@/lib/store-copy";
import { catalogueCopy } from "@/lib/catalogue-copy";
import { isPublishedCategory, publishedSubcategories } from "@/lib/catalogue";
import { rawGet, rawSet } from "@/lib/storage";
import { rlAiEnabled } from "@/lib/ai/flag";
import type { ShellSearch } from "./shell";

export function SiteHeader({ search }: { search?: ShellSearch }) {
  const { lang, t, setLang } = useI18n();
  const c = redesignCopy(lang);
  const sc = storeCopy(lang);
  const cc = catalogueCopy(lang);
  const d = DESIGN_COPY[lang];
  const path = useRouterState({ select: (s) => s.location.pathname });
  const wrap = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [shrunk, setShrunk] = useState(false);
  const [announce, setAnnounce] = useState(ANNOUNCEMENT_ENABLED);
  useEffect(() => {
    setAnnounce(ANNOUNCEMENT_ENABLED && rawGet("rl-announcement-v1") !== "closed");
  }, []);
  useEffect(() => {
    setActive(false);
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
      if (!wrap.current?.contains(e.target as Node)) setActive(false);
    };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [active]);
  function close() {
    setActive(false);
    trigger.current?.focus();
  }
  function categoryKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(true);
      requestAnimationFrame(() => document.querySelector<HTMLElement>("#rl-mega a")?.focus());
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
        <section className="rl-announcement" aria-labelledby="rl-announcement-text">
          <div className="page rl-announcement-inner">
            <p id="rl-announcement-text">{c.announcement}</p>
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
        </section>
      ) : null}
      <header ref={wrap} className="rl-site-header" data-shrunk={shrunk} aria-label={c.navigation}>
        <div className="page rl-header-row" data-layout="header">
          <Link to="/" className="rl-brand" aria-label={t.nav.home}>
            <Mark className="rl-brand-mark" />
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
          <button
            ref={trigger}
            type="button"
            aria-expanded={active}
            aria-controls="rl-mega"
            onClick={() => setActive(!active)}
            onKeyDown={categoryKey}
            className="rl-category-trigger"
          >
            <Icon as={LayoutGrid} />
            {cc.title}
            <Icon as={ChevronDown} />
          </button>
          <Link
            to="/quote"
            search={{ from: undefined, to: undefined, kg: undefined }}
            className="rl-nav-service"
          >
            {c.shipping}
          </Link>
          {rlAiEnabled() ? (
            <Link to="/ai" className="rl-nav-service">
              {SITE_COPY[lang].ai}
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
              {NAV_CATEGORIES.map((cat) => (
                <section key={cat} data-mega-column={cat} className="rl-mega-column">
                  {isPublishedCategory(cat) ? (
                    <>
                      <h2>
                        <Link to="/stores" search={{ cat }} onClick={() => setActive(false)}>
                          <Icon as={CATEGORY_ICON[cat]} />
                          {sc.categories[cat]}
                        </Link>
                      </h2>
                      {publishedSubcategories(cat).map((sub) => (
                        <Link
                          key={sub.id}
                          to="/stores"
                          search={{ cat, sub: sub.id }}
                          onClick={() => setActive(false)}
                        >
                          {cc.subs[cat][sub.id]}
                        </Link>
                      ))}
                    </>
                  ) : (
                    <h2 className="rl-mega-pending">
                      <Icon as={CATEGORY_ICON[cat]} />
                      {sc.categories[cat]}
                      <Badge>{cc.comingSoon}</Badge>
                    </h2>
                  )}
                </section>
              ))}
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
        <div className="rl-stack">
          <div className="rl-row">
            <Mark />
            <ThemeToggle />
          </div>
          <nav className="rl-stack" aria-label={c.categories}>
            {NAV_CATEGORIES.map((cat) =>
              isPublishedCategory(cat) ? (
                <Link
                  key={cat}
                  to="/stores"
                  search={{ cat }}
                  onClick={() => setMobile(false)}
                  className="rl-mobile-menu-link"
                >
                  <span className="rl-row">
                    <Icon as={CATEGORY_ICON[cat]} />
                    {sc.categories[cat]}
                  </span>
                  <Icon as={ChevronRight} directional />
                </Link>
              ) : (
                <span key={cat} className="rl-mobile-menu-link" aria-disabled="true">
                  <span className="rl-row">
                    <Icon as={CATEGORY_ICON[cat]} />
                    {sc.categories[cat]}
                  </span>
                  <Badge>{cc.comingSoon}</Badge>
                </span>
              ),
            )}
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
                {SITE_COPY[lang].ai}
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
