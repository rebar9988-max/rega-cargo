import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  Heart,
  House,
  LayoutGrid,
  Menu,
  MoreHorizontal,
  Search,
  ShoppingBag,
  Truck,
  PackageSearch,
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
import { NAV_CATEGORIES, ANNOUNCEMENT_ENABLED, primaryJourney } from "@/lib/navigation";
import { storeCopy } from "@/lib/store-copy";
import { catalogueCopy } from "@/lib/catalogue-copy";
import { isPublishedCategory, publishedSubcategories } from "@/lib/catalogue";
import { rawGet, rawSet } from "@/lib/storage";
import { rlAiEnabled } from "@/lib/ai/flag";
import { JOURNEY_COPY } from "@/lib/journey-copy";
import { refHomeCopy } from "@/lib/ref-home-copy";
import type { ShellSearch } from "./shell";

export function SiteHeader({
  search,
  reference = false,
}: {
  search?: ShellSearch;
  /** Reference homepage: the five-control header, no bottom bar. */
  reference?: boolean;
}) {
  const { lang, t, setLang } = useI18n();
  const c = redesignCopy(lang);
  const sc = storeCopy(lang);
  const cc = catalogueCopy(lang);
  const j = JOURNEY_COPY[lang];
  const d = DESIGN_COPY[lang];
  const path = useRouterState({ select: (s) => s.location.pathname });
  const journey = primaryJourney(path);
  const catalogue = useRouterState({
    select: (s) =>
      s.location.pathname === "/stores" ||
      (s.location.pathname === "/" && Boolean((s.location.search as { cat?: string }).cat)),
  });
  const wrap = useRef<HTMLElement>(null);
  const openSearch = useRef<(() => void) | null>(null);
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
  const rc = refHomeCopy(lang);
  const tabs = [
    { to: "/", label: t.nav.home, icon: House },
    { to: "/market", label: j.market, icon: ShoppingBag },
    { to: "/stores/request", label: j.bring, icon: PackageSearch },
    { to: "/track", label: t.nav.track, icon: Truck },
    { to: "/account", label: c.account, icon: UserRound },
  ];
  return (
    <>
      {announce && !reference ? (
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
      {reference ? (
        // Reference homepage header: five controls in the reference's physical order (logo,
        // language, search, R&L AI, menu). The row is isolated as LTR so the order never mirrors.
        <header
          className="rl-ref-header"
          aria-label={c.navigation}
          data-shrunk="false"
          data-layout-exempt
        >
          <div className="rl-ref-header-row" dir="ltr" data-layout="ref-header">
            <Link to="/" className="rl-ref-brand" aria-label={t.nav.home}>
              <img
                src="/rl-mark-white-336.webp"
                alt="R&L"
                width={72}
                height={72}
                decoding="async"
                fetchPriority="high"
              />
            </Link>
            <div className="rl-ref-lang">
              <HeaderLangPicker lang={lang} setLang={setLang} title={rc.language} />
            </div>
            <div className="rl-ref-search">
              <SearchBox
                embedded
                search={search}
                label={rc.searchPlaceholder}
                closeLabel={t.menuClose}
                lang={lang}
                ai={rlAiEnabled()}
              />
            </div>
            {rlAiEnabled() ? (
              <Link to="/ai" className="rl-ref-ai" aria-label={rc.ai}>
                <img src="/home/ai-robot.webp" alt="" width={35} height={28} decoding="async" />
                <span dir="ltr">{rc.aiLabel}</span>
              </Link>
            ) : null}
            <button
              type="button"
              data-layout="menu-button"
              className="rl-ref-menu"
              aria-label={t.menuOpen}
              aria-expanded={mobile}
              onClick={() => setMobile(true)}
            >
              <Icon as={Menu} />
            </button>
          </div>
        </header>
      ) : (
        <header
          ref={wrap}
          className="rl-site-header"
          data-shrunk={shrunk}
          aria-label={c.navigation}
        >
          <div className="page rl-header-row" data-layout="header">
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
            <Link to="/" className="rl-brand" aria-label={t.nav.home}>
              <Mark className="rl-brand-mark" />
            </Link>
            <SearchBox
              embedded
              search={search}
              label={j.stores}
              closeLabel={t.menuClose}
              lang={lang}
              ai={rlAiEnabled()}
              openRef={openSearch}
            />
            <div className="rl-header-actions">
              <button
                type="button"
                data-layout="search-button"
                className="rl-icon-button rl-mobile-only"
                aria-label={d.search}
                onClick={() => openSearch.current?.()}
              >
                <Icon as={Search} />
              </button>
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
                className="rl-icon-button rl-desktop-only"
                aria-label={j.bring}
              >
                <Icon as={ShoppingBag} />
              </Link>
              <HeaderLangPicker lang={lang} setLang={setLang} title={d.language} />
              {/* Phones and tablets: account sits last in the bar (desktop keeps its place above). */}
              <Link
                to="/account"
                data-layout="account-button"
                className="rl-icon-button rl-mobile-only"
                aria-label={c.account}
              >
                <Icon as={UserRound} />
              </Link>
              <span className="rl-desktop-only">
                <ThemeToggle />
              </span>
            </div>
          </div>
          <nav className="page rl-category-nav rl-primary-nav" aria-label={c.navigation}>
            {tabs.slice(0, 4).map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                className="rl-nav-service"
                aria-current={journey === tab.to ? "page" : undefined}
              >
                {tab.label}
              </Link>
            ))}
            <Link
              to="/contact"
              className="rl-nav-service"
              aria-current={journey === "/contact" ? "page" : undefined}
            >
              {j.help}
            </Link>
          </nav>
          {catalogue ? (
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
            </nav>
          ) : null}
          {catalogue && active ? (
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
      )}
      {catalogue ? (
        <CategoryStrip
          label={c.categories}
          more={d.more}
          moreOpen={mobile}
          onMore={() => setMobile(true)}
        />
      ) : null}
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
          <nav className="rl-stack" aria-label={c.navigation}>
            {tabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                className="rl-mobile-menu-link"
                aria-current={journey === tab.to ? "page" : undefined}
                onClick={() => setMobile(false)}
              >
                <span className="rl-row">
                  <Icon as={tab.icon} />
                  {tab.label}
                </span>
                <Icon as={ChevronRight} directional />
              </Link>
            ))}
            <Link to="/contact" className="rl-mobile-menu-link" onClick={() => setMobile(false)}>
              {j.help}
            </Link>
            <Link to="/stores" className="rl-mobile-menu-link" onClick={() => setMobile(false)}>
              {j.stores}
            </Link>
          </nav>
          <details>
            <summary className="rl-mobile-menu-link">
              {c.categories}
              <Icon as={ChevronDown} />
            </summary>
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
          </details>
          <nav className="rl-row" aria-label={d.services}>
            <Link
              to="/quote"
              search={{ from: undefined, to: undefined, kg: undefined }}
              onClick={() => setMobile(false)}
            >
              {c.shipping}
            </Link>
            {rlAiEnabled() ? (
              <Link to="/ai" onClick={() => setMobile(false)}>
                {SITE_COPY[lang].ai}
              </Link>
            ) : null}
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
      {reference ? null : (
        <nav
          data-layout="bottom-bar"
          className="rl-bottom-nav app-bottom-bar"
          aria-label={c.navigation}
        >
          {tabs.map((tab) => (
            <Link key={tab.to} to={tab.to} aria-current={journey === tab.to ? "page" : undefined}>
              <Icon as={tab.icon} />
              <span>{tab.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}

/**
 * Phones and tablets: the primary categories as one horizontal row under the header (icon
 * above the name), the same groups, order and /stores?cat=… links as the desktop mega menu
 * and the mobile menu. The selected category is marked from the URL. Categories awaiting
 * approval stay visible but are not links. "More" opens the full menu.
 */
function CategoryStrip({
  label,
  more,
  moreOpen,
  onMore,
}: {
  label: string;
  more: string;
  moreOpen: boolean;
  onMore: () => void;
}) {
  const { lang } = useI18n();
  const sc = storeCopy(lang);
  const cc = catalogueCopy(lang);
  const current = useRouterState({
    select: (s): string | undefined => {
      const cat = (s.location.search as { cat?: unknown }).cat;
      const listing = s.location.pathname === "/" || s.location.pathname === "/stores";
      return listing && typeof cat === "string" ? cat : undefined;
    },
  });
  const list = useRef<HTMLUListElement>(null);
  // Keep the selected category in view without scrolling the page or animating on load.
  useIsoLayoutEffect(() => {
    function reveal() {
      const box = list.current;
      const item = box?.querySelector<HTMLElement>('[aria-current="page"]');
      if (!box || !item) return;
      const boxRect = box.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      if (itemRect.left >= boxRect.left && itemRect.right <= boxRect.right) return;
      box.scrollLeft += itemRect.left + itemRect.width / 2 - (boxRect.left + boxRect.width / 2);
    }
    reveal();
    // Layout can still settle while the web fonts load, so check again once they have.
    let live = true;
    void document.fonts?.ready.then(() => {
      if (live) reveal();
    });
    return () => {
      live = false;
    };
  }, [current]);
  return (
    <nav className="rl-category-strip" aria-label={label} data-layout="category-strip">
      <ul ref={list} className="page rl-category-strip-list">
        {NAV_CATEGORIES.map((cat) => {
          const content = (
            <>
              <span className="rl-category-strip-icon">
                <Icon as={CATEGORY_ICON[cat]} />
              </span>
              <span className="rl-category-strip-label">{sc.categories[cat]}</span>
            </>
          );
          return (
            <li key={cat}>
              {isPublishedCategory(cat) ? (
                <Link
                  to="/stores"
                  search={{ cat }}
                  className="rl-category-strip-item"
                  data-category={cat}
                  aria-current={current === cat ? "page" : undefined}
                >
                  {content}
                </Link>
              ) : (
                <span
                  className="rl-category-strip-item"
                  data-category={cat}
                  aria-disabled="true"
                  title={cc.comingSoon}
                >
                  {content}
                  <span className="sr-only">{cc.comingSoon}</span>
                </span>
              )}
            </li>
          );
        })}
        <li>
          <button
            type="button"
            className="rl-category-strip-item"
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            onClick={onMore}
          >
            <span className="rl-category-strip-icon">
              <Icon as={MoreHorizontal} />
            </span>
            <span className="rl-category-strip-label">{more}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
