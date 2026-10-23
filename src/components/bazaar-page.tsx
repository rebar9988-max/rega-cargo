import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Heart,
  SlidersHorizontal,
  ArrowUpRight,
  Info,
  X,
  Search,
  Store,
  Link2,
  PackageCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Shell } from "./shell";
import { BottomSheet, Button, Chip, Icon, Select, Skeleton } from "./ui";
import { Field } from "./field";
import { SubcategoryPanel } from "./category-directory";
import type { BazaarSearch } from "@/lib/bazaar-search";
import { selectBazaar } from "@/lib/bazaar-listing";
import { catalogueCopy } from "@/lib/catalogue-copy";
import { redesignCopy } from "@/lib/redesign-copy";
import { DESIGN_COPY } from "@/lib/design-copy";
import { useI18n } from "@/lib/i18n";
import { useHydrated } from "@/lib/use-hydrated";
import { storeCopy } from "@/lib/store-copy";
import {
  DIRECTORY_STORES,
  EUROPEAN_COUNTRIES,
  isEuropeanCountry,
  readFavs,
  storeById,
  storeLogo,
  storeLogoSize,
  CARD_LOGO,
  RAIL_LOGO,
  writeFavs,
  type StoreCategory,
} from "@/lib/stores";
import { DIRECTORY_COPY } from "@/lib/directory-copy";
import { PUBLISHED_STORE_CATEGORIES, isPublishedCategory } from "@/lib/catalogue";

import { groupStorefronts, productLinkTarget } from "@/lib/store-discovery";
import { DISCOVERY_COPY } from "@/lib/discovery-copy";
import { JOURNEY_COPY } from "@/lib/journey-copy";

/**
 * The store a customer last opened on its official site (this tab only), so that coming back
 * can offer Bring For Me for it. Nothing about the external visit is known or claimed.
 */
const HANDOFF_KEY = "rl-store-handoff-v1";
function readHandoff(): string | null {
  try {
    return window.sessionStorage.getItem(HANDOFF_KEY);
  } catch {
    return null;
  }
}
function writeHandoff(id: string | null) {
  try {
    if (id) window.sessionStorage.setItem(HANDOFF_KEY, id);
    else window.sessionStorage.removeItem(HANDOFF_KEY);
  } catch {
    // Storage blocked: the handoff note is a convenience only.
  }
}

/** Store catalogue only; shipping lives on /quote in ShippingPage. */
export function BazaarPage({ home = false }: { home?: boolean } = {}) {
  const { lang } = useI18n();
  const ready = useHydrated();
  const t = storeCopy(lang),
    c = redesignCopy(lang),
    d = DESIGN_COPY[lang],
    e = DIRECTORY_COPY[lang],
    bring = JOURNEY_COPY[lang].bring;
  const copy = DISCOVERY_COPY[lang];
  const [query, setQuery] = useState("");
  const [linkError, setLinkError] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const params = useRouterState({ select: (state) => state.location.search as BazaarSearch });
  useEffect(() => setQuery(params.q ?? ""), [params.q]);
  const pending = useRouterState({ select: (state) => state.status === "pending" });
  const navigate = useNavigate();
  const [sheet, setSheet] = useState(false);
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => setFavs(readFavs()), []);
  // Back from an official store site (another tab, or this one via history): offer Bring For Me.
  const [back, setBack] = useState<string | null>(null);
  useEffect(() => {
    const check = () => {
      if (document.visibilityState !== "visible") return;
      const id = readHandoff();
      if (id && DIRECTORY_STORES.some((store) => store.id === id)) setBack(id);
    };
    check();
    document.addEventListener("visibilitychange", check);
    window.addEventListener("pageshow", check);
    return () => {
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("pageshow", check);
    };
  }, []);
  const closeBack = () => {
    writeHandoff(null);
    setBack(null);
  };
  const setFilter = (patch: Partial<BazaarSearch>) => {
    void navigate({
      to: home ? "/" : "/stores",
      search: (previous) => ({ ...previous, ...patch }),
      replace: true,
    });
  };
  const clear = () =>
    setFilter({
      q: undefined,
      cat: undefined,
      sub: undefined,
      who: undefined,
      store: undefined,
      country: undefined,
      fav: undefined,
    });
  const results = useMemo(
    () => selectBazaar({ params, favs, labels: t.goods, stores: DIRECTORY_STORES }),
    [params, favs, t.goods],
  );
  const groups = useMemo(() => groupStorefronts(results.stores), [results.stores]);
  const selected = DIRECTORY_STORES.find((store) => store.id === chosen);
  const variants = selected ? results.stores.filter((store) => store.brand === selected.brand) : [];
  const countryName = (country: string) =>
    isEuropeanCountry(country) ? e.country[country] : country;
  // One rail entry per retailer available in the chosen country.
  const retailers = useMemo(
    () =>
      DIRECTORY_STORES.filter(
        (store, index, all) =>
          (!params.country || store.country === params.country) &&
          all.findIndex(
            (other) =>
              other.brand === store.brand && (!params.country || other.country === params.country),
          ) === index,
      ),
    [params.country],
  );
  const setCountry = (country: string | undefined) =>
    setFilter({
      country,
      // Keep the chosen retailer only where it has a storefront in that country.
      store:
        params.store &&
        DIRECTORY_STORES.some(
          (store) =>
            (store.brand === params.store || store.id === params.store) &&
            (!country || store.country === country),
        )
          ? params.store
          : undefined,
    });
  const brandName = (id: string) =>
    DIRECTORY_STORES.find((store) => store.id === id || store.brand === id)?.name ?? id;
  const active: { key: keyof BazaarSearch; label: string }[] = [
    ...(params.q ? [{ key: "q" as const, label: `“${params.q}”` }] : []),
    ...(params.country ? [{ key: "country" as const, label: countryName(params.country) }] : []),
    ...(params.store ? [{ key: "store" as const, label: brandName(params.store) }] : []),
    ...(params.cat && isPublishedCategory(params.cat)
      ? [{ key: "cat" as const, label: t.categories[params.cat as StoreCategory] }]
      : []),
    ...(params.who && params.who in d.audience
      ? [{ key: "who" as const, label: d.audience[params.who as keyof typeof d.audience] }]
      : []),
    ...(params.fav ? [{ key: "fav" as const, label: t.favorites }] : []),
  ];
  const toggle = (id: string) => {
    const next = favs.includes(id) ? favs.filter((item) => item !== id) : [...favs, id];
    setFavs(next);
    writeFavs(next);
  };
  const filters = (
    <div className="rl-filter-controls">
      <Field label={c.categories}>
        <Select
          value={params.cat ?? ""}
          onChange={(e) => setFilter({ cat: e.target.value || undefined, sub: undefined })}
        >
          <option value="">{t.allCategories}</option>
          {PUBLISHED_STORE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {t.categories[category]}
            </option>
          ))}
        </Select>
      </Field>
      <Chip
        selected={params.fav === 1}
        onClick={() => setFilter({ fav: params.fav ? undefined : 1 })}
      >
        <Icon as={Heart} />
        {t.favorites}
      </Chip>
      <Button variant="ghost" onClick={clear}>
        {c.clear}
      </Button>
    </div>
  );
  return (
    <Shell search={{ q: params.q ?? "", setQ: (q) => setFilter({ q: q || undefined }) }}>
      <section className="rl-store-hero">
        <div className="page rl-store-hero-inner">
          <div className="rl-stack">
            <h1>{copy.title}</h1>
            <p className="rl-muted">{copy.body}</p>
            <form
              className="rl-store-search"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                setLinkError(false);
                if (/^https?:|www\./i.test(query.trim())) {
                  const target = productLinkTarget(query.trim());
                  if (!target) {
                    setLinkError(true);
                    return;
                  }
                  void navigate({
                    to: "/stores/request",
                    search: { ...target, intent: "buy", item: undefined },
                  });
                } else setFilter({ q: query.trim() || undefined });
              }}
            >
              <label className="sr-only" htmlFor="rl-directory-search">
                {copy.search}
              </label>
              <Icon as={Search} />
              <input
                id="rl-directory-search"
                disabled={!ready}
                size={1}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setLinkError(false);
                }}
                placeholder={copy.search}
                maxLength={2048}
                aria-invalid={linkError}
                aria-describedby={linkError ? "rl-link-error" : undefined}
              />
              <Button type="submit" disabled={!ready}>
                {copy.go}
              </Button>
            </form>
            {linkError ? (
              <p id="rl-link-error" role="alert">
                {copy.invalid}
              </p>
            ) : null}
          </div>
          <ol className="rl-store-steps" aria-label={copy.help}>
            {[Store, Link2, PackageCheck].map((StepIcon, index) => (
              <li key={copy.steps[index]}>
                <span>
                  <Icon as={StepIcon} />
                </span>
                <p>{copy.steps[index]}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="page rl-marketplace rl-store-discovery">
        {/* One toolbar: the filter sheet button first, then the audience chips in a single
                scrollable row. */}
        <div className="rl-store-filters">
          <div className="rl-market-toolbar">
            <Button
              variant="secondary"
              className="rl-mobile-filters"
              onClick={() => setSheet(true)}
            >
              <Icon as={SlidersHorizontal} />
              <span className="rl-filters-label">{c.filters}</span>
            </Button>
            <div className="rl-chip-row rl-audience-chips">
              {(["women", "men", "kids"] as const).map((who) => (
                <Chip
                  key={who}
                  selected={params.who === who}
                  onClick={() => setFilter({ who: params.who === who ? undefined : who })}
                >
                  {d.audience[who]}
                </Chip>
              ))}
            </div>
          </div>
          {/* Discovery: country first, then the retailer, both one compact scrollable row. */}
          <div className="rl-discovery">
            <div className="rl-chip-row rl-country-chips" role="group" aria-label={e.countries}>
              <Chip selected={!params.country} onClick={() => setCountry(undefined)}>
                {e.allCountries}
              </Chip>
              {EUROPEAN_COUNTRIES.map((country) => (
                <Chip
                  key={country}
                  data-country={country}
                  selected={params.country === country}
                  onClick={() => setCountry(params.country === country ? undefined : country)}
                >
                  <span aria-hidden="true">
                    {{ DE: "🇩🇪", CH: "🇨🇭", IT: "🇮🇹", FR: "🇫🇷", GB: "🇬🇧" }[country]}
                  </span>
                  {e.country[country]}
                </Chip>
              ))}
            </div>
            <div
              className="rl-chip-row rl-discovery-categories"
              role="group"
              aria-label={c.categories}
            >
              <Chip
                selected={!params.cat}
                onClick={() => setFilter({ cat: undefined, sub: undefined })}
              >
                {t.allCategories}
              </Chip>
              {PUBLISHED_STORE_CATEGORIES.map((category) => (
                <Chip
                  key={category}
                  data-category={category}
                  selected={params.cat === category}
                  onClick={() =>
                    setFilter({
                      cat: params.cat === category ? undefined : category,
                      sub: undefined,
                    })
                  }
                >
                  {t.categories[category]}
                </Chip>
              ))}
            </div>
            <details className="rl-retailer-picker">
              <summary>{e.allRetailers}</summary>
              <ul className="rl-retailer-rail" aria-label={e.retailers}>
                {retailers.map((store) => (
                  <li key={store.brand}>
                    <button
                      type="button"
                      className="rl-retailer"
                      data-retailer={store.brand}
                      aria-pressed={params.store === store.brand}
                      aria-label={store.name}
                      title={store.name}
                      onClick={() =>
                        setFilter({ store: params.store === store.brand ? undefined : store.brand })
                      }
                    >
                      {/* Same visual weight for every wordmark, at its own proportions. */}
                      <img
                        src={storeLogo(store.brand)}
                        alt=""
                        {...storeLogoSize(store.brand, RAIL_LOGO)}
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </details>
            {active.length ? (
              <div className="rl-active-filters" role="group" aria-label={e.active}>
                {active.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    className="rl-active-filter"
                    aria-label={`${e.remove}: ${item.label}`}
                    onClick={() =>
                      setFilter(
                        item.key === "cat"
                          ? { cat: undefined, sub: undefined }
                          : { [item.key]: undefined },
                      )
                    }
                  >
                    <bdi>{item.label}</bdi>
                    <Icon as={X} />
                  </button>
                ))}
                <button type="button" className="rl-text-action" onClick={clear}>
                  {e.reset}
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className="rl-market-layout">
          <div className="rl-market-results" aria-busy={pending}>
            {back ? (
              <div className="rl-handoff-back rl-card" role="status">
                <div>
                  <p className="rl-handoff-title">
                    {e.backTitle.split("{store}")[0]}
                    <bdi dir="ltr">{storeById(back)?.name ?? brandName(back)}</bdi>
                    {e.backTitle.split("{store}")[1]}
                  </p>
                  <p className="rl-muted">{e.backBody}</p>
                </div>
                <div className="rl-handoff-actions">
                  <Link
                    to="/stores/request"
                    search={{ store: back, intent: "buy", item: undefined }}
                    className="rl-button"
                    data-variant="primary"
                    onClick={closeBack}
                  >
                    {bring}
                  </Link>
                  <Button variant="ghost" aria-label={e.dismiss} onClick={closeBack}>
                    <Icon as={X} />
                  </Button>
                </div>
              </div>
            ) : null}
            <SubcategoryPanel lang={lang} to={home ? "/" : "/stores"} params={params} />
            {pending ? (
              <div className="rl-results-grid">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="rl-product-skeleton" />
                ))}
              </div>
            ) : (
              <>
                {!results.stores.length && (!params.cat || isPublishedCategory(params.cat)) ? (
                  <div className="rl-empty-state" role="status">
                    <h2>{c.emptyTitle}</h2>
                    <p>{params.cat ? catalogueCopy(lang).emptyCategory : c.emptyBody}</p>
                    <Button variant="secondary" onClick={clear}>
                      {c.clear}
                    </Button>
                  </div>
                ) : null}
                {results.stores.length ? (
                  <section aria-labelledby="rl-store-list" className="rl-defer">
                    <div className="rl-result-heading">
                      <h2 id="rl-store-list">{t.storesHeading}</h2>
                      <span className="rl-muted" aria-live="polite">
                        {groups.length}
                      </span>
                    </div>
                    <ul
                      className="rl-results-grid rl-store-grid"
                      data-layout="card-grid"
                      data-layout-cols="stores"
                    >
                      {groups.map((group) => {
                        const store = group[0];
                        return (
                          <li
                            className="rl-store-card rl-card"
                            key={store.id}
                            data-store={store.id}
                            data-country={store.country}
                          >
                            <div className="rl-store-top">
                              <span className="rl-store-logo">
                                <img
                                  src={storeLogo(store.brand)}
                                  alt={store.name}
                                  {...storeLogoSize(store.brand, CARD_LOGO)}
                                  loading="lazy"
                                  decoding="async"
                                />
                              </span>
                              {/* The logo tile spans the card (readable wordmarks on narrow
                                phones); the favourite is a small badge in the card corner. */}
                              <Button
                                variant="ghost"
                                className="rl-store-fav"
                                aria-pressed={favs.includes(store.id)}
                                aria-label={`${t.favorites} · ${store.name}`}
                                onClick={() => toggle(store.id)}
                              >
                                <Heart
                                  aria-hidden="true"
                                  className="rl-icon"
                                  fill={favs.includes(store.id) ? "currentColor" : "none"}
                                />
                              </Button>
                            </div>
                            <h3>
                              <bdi dir="ltr">{store.name}</bdi>
                            </h3>
                            <p
                              className="rl-store-meta"
                              title={`${countryName(store.country)} · ${store.host}`}
                            >
                              <span>{countryName(store.country)}</span>
                              <bdi dir="ltr">{store.host}</bdi>
                            </p>
                            <p className="rl-muted rl-store-categories">
                              {store.categories
                                .filter(isPublishedCategory)
                                .slice(0, 2)
                                .map((category) => t.categories[category])
                                .join(" · ")}
                            </p>
                            <Button
                              className="rl-store-primary"
                              onClick={() => setChosen(store.id)}
                              aria-haspopup="dialog"
                              aria-label={`${copy.choose} · ${store.name}`}
                            >
                              {copy.choose}
                              <Icon as={ArrowUpRight} directional />
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ) : null}
              </>
            )}
          </div>
        </div>
        <p className="rl-partner-note">
          <Icon as={Info} />
          <span>{c.noPartner}</span>
        </p>
      </section>
      <BottomSheet
        open={Boolean(selected)}
        onClose={() => setChosen(null)}
        title={selected?.name ?? copy.choose}
      >
        {selected ? (
          <div className="rl-stack rl-store-actions">
            <Field label={copy.region}>
              <Select value={selected.id} onChange={(event) => setChosen(event.target.value)}>
                {variants.map((store) => (
                  <option key={store.id} value={store.id}>
                    {countryName(store.country)} · {store.host}
                  </option>
                ))}
              </Select>
            </Field>
            <p className="rl-muted">{e.handoff}</p>
            <a
              href={selected.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rl-button rl-store-site"
              data-variant="secondary"
              onClick={() => {
                writeHandoff(selected.id);
                setChosen(null);
              }}
            >
              {e.official}
              <Icon as={ArrowUpRight} directional />
            </a>
            <Link
              to="/stores/request"
              search={{ store: selected.id, intent: "buy", item: undefined }}
              className="rl-button"
              data-variant="primary"
            >
              {t.assist}
            </Link>
            <Link
              to="/stores/request"
              search={{ store: selected.id, intent: "ship", item: undefined }}
              className="rl-button"
              data-variant="secondary"
            >
              {t.shipOwn}
            </Link>
            {selected.caution.length ? (
              <p className="rl-muted">
                {selected.caution.map((caution) => t.cautions[caution]).join(" ")}
              </p>
            ) : null}
          </div>
        ) : null}
      </BottomSheet>
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title={c.filters}>
        {filters}
        <Button onClick={() => setSheet(false)}>{c.showResults}</Button>
      </BottomSheet>
    </Shell>
  );
}
