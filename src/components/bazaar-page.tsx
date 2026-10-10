import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, SlidersHorizontal, ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PremiumHome } from "./premium-home";
import { DeliveryHub, ServiceSwitch } from "./delivery-hub";
import { Shell, PageHeader } from "./shell";
import { Badge, BottomSheet, Button, Chip, Icon, Select, Skeleton } from "./ui";
import { Field } from "./field";
import { responsiveImage } from "@/lib/images";
import { readService, writeService, type Service } from "@/lib/service-choice";
import type { BazaarSearch } from "@/lib/bazaar-search";
import { selectBazaar } from "@/lib/bazaar-listing";
import { redesignCopy } from "@/lib/redesign-copy";
import { DESIGN_COPY } from "@/lib/design-copy";
import { useI18n } from "@/lib/i18n";
import { storeCopy } from "@/lib/store-copy";
import { readFavs, STORE_CATEGORIES, STORES, storeById, storeLogo, writeFavs } from "@/lib/stores";

export function BazaarPage({
  home = false,
  initialService = "bazaar",
}: {
  home?: boolean;
  initialService?: Service;
} = {}) {
  const { lang } = useI18n();
  const t = storeCopy(lang),
    c = redesignCopy(lang),
    d = DESIGN_COPY[lang];
  const params = useRouterState({ select: (state) => state.location.search as BazaarSearch });
  const pending = useRouterState({ select: (state) => state.status === "pending" });
  const navigate = useNavigate();
  const [sheet, setSheet] = useState(false);
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => setFavs(readFavs()), []);
  const [service, setService] = useState<Service>(initialService);
  useEffect(() => {
    if (!home) return;
    const stored = readService();
    if (stored !== initialService) {
      setService(stored);
      writeService(stored);
    }
  }, [home, initialService]);
  const chooseService = (next: Service) => {
    setService(next);
    writeService(next);
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
      who: undefined,
      store: undefined,
      country: undefined,
      fav: undefined,
    });
  const results = useMemo(
    () => selectBazaar({ params, favs, labels: t.goods }),
    [params, favs, t.goods],
  );
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
          onChange={(e) => setFilter({ cat: e.target.value || undefined })}
        >
          <option value="">{t.allCategories}</option>
          {STORE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {t.categories[category]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={c.store}>
        <Select
          value={params.store ?? ""}
          onChange={(e) => setFilter({ store: e.target.value || undefined })}
        >
          <option value="">{c.all}</option>
          {STORES.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={c.country}>
        <Select
          value={params.country ?? ""}
          onChange={(e) => setFilter({ country: e.target.value || undefined })}
        >
          <option value="">{t.allCountries}</option>
          {[...new Set(STORES.map((store) => store.country))].map((country) => (
            <option key={country} value={country}>
              {country === "DE" ? t.germany : country === "INT" ? t.international : country}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={c.price} hint={c.priceUnavailable}>
        <Select disabled value="">
          <option value="">{t.awaiting}</option>
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
  if (
    home &&
    !params.q &&
    !params.cat &&
    !params.fav &&
    !params.who &&
    !params.store &&
    !params.country
  )
    return (
      <Shell>
        <PremiumHome service={service} onService={chooseService}>
          {service === "delivery" ? <DeliveryHub embedded /> : null}
        </PremiumHome>
      </Shell>
    );
  return (
    <Shell search={{ q: params.q ?? "", setQ: (q) => setFilter({ q: q || undefined }) }}>
      {home ? <ServiceSwitch value={service} onChange={chooseService} /> : null}
      {home && service === "delivery" ? (
        <DeliveryHub />
      ) : (
        <>
          <PageHeader kicker={c.marketplace} title={c.storesTitle} lede={t.lede} />
          <section className="page rl-marketplace">
            <div className="rl-market-toolbar">
              <div className="rl-chip-row">
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
              <Button
                variant="secondary"
                className="rl-mobile-filters"
                onClick={() => setSheet(true)}
              >
                <Icon as={SlidersHorizontal} />
                {c.filters}
              </Button>
            </div>
            <p className="rl-partner-note">{c.noPartner}</p>
            <div className="rl-market-layout">
              <aside className="rl-filter-sidebar" aria-label={c.filters}>
                <h2>{c.filters}</h2>
                {filters}
              </aside>
              <div className="rl-market-results" aria-busy={pending}>
                {pending ? (
                  <div className="rl-results-grid">
                    {[0, 1, 2, 3].map((i) => (
                      <Skeleton key={i} className="rl-product-skeleton" />
                    ))}
                  </div>
                ) : (
                  <>
                    {!results.goods.length && !results.stores.length ? (
                      <div className="rl-empty-state" role="status">
                        <h2>{c.emptyTitle}</h2>
                        <p>{c.emptyBody}</p>
                        <Button variant="secondary" onClick={clear}>
                          {c.clear}
                        </Button>
                      </div>
                    ) : null}
                    {results.goods.length ? (
                      <section aria-labelledby="rl-samples">
                        <div className="rl-result-heading">
                          <h2 id="rl-samples">{c.samples}</h2>
                          <p>{c.samplesBody}</p>
                        </div>
                        <ul className="rl-results-grid" data-layout="card-grid">
                          {results.goods.map((good, index) => (
                            <li key={good.id} className="rl-product-card" data-good={good.id}>
                              <Link
                                to="/stores/request"
                                search={{ store: good.storeId, intent: "buy", item: good.id }}
                                className="rl-product-image"
                              >
                                <img
                                  {...responsiveImage(
                                    good.image,
                                    "(min-width: 1024px) 280px, (min-width: 768px) 30vw, 45vw",
                                  )}
                                  alt={t.goods[good.id]}
                                  width={640}
                                  height={640}
                                  loading={index < 2 ? "eager" : "lazy"}
                                  decoding="async"
                                />
                                <Badge>{c.exampleTitle}</Badge>
                              </Link>
                              <div className="rl-product-body">
                                <p className="rl-eyebrow">
                                  <bdi dir="ltr">{storeById(good.storeId)?.name}</bdi>
                                </p>
                                <h3>{t.goods[good.id]}</h3>
                                <p className="rl-muted">{t.awaiting}</p>
                                <Link
                                  to="/stores/request"
                                  search={{ store: good.storeId, intent: "buy", item: good.id }}
                                  className="rl-button"
                                >
                                  {t.order}
                                </Link>
                                <div className="rl-product-quick" aria-label={c.quickActions}>
                                  <Link
                                    to="/stores/request"
                                    search={{ store: good.storeId, intent: "ship", item: good.id }}
                                  >
                                    {t.shipOwn}
                                  </Link>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}
                    {results.stores.length ? (
                      <section aria-labelledby="rl-store-list">
                        <div className="rl-result-heading">
                          <h2 id="rl-store-list">{t.storesHeading}</h2>
                          <p>{c.noPartner}</p>
                        </div>
                        <ul className="rl-results-grid" data-layout="card-grid">
                          {results.stores.map((store) => (
                            <li
                              className="rl-store-card rl-card"
                              key={store.id}
                              data-store={store.id}
                            >
                              <div className="rl-store-top">
                                <span className="rl-store-logo">
                                  <img
                                    src={storeLogo(store.id)}
                                    alt={store.name}
                                    width={128}
                                    height={32}
                                    loading="lazy"
                                    decoding="async"
                                  />
                                </span>
                                <Button
                                  variant="ghost"
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
                              <Badge>{t.external}</Badge>
                              <p className="rl-muted">
                                {store.country === "DE"
                                  ? t.germany
                                  : store.country === "INT"
                                    ? t.international
                                    : store.country}{" "}
                                · <bdi dir="ltr">{store.host}</bdi>
                              </p>
                              <p className="rl-muted">
                                {store.categories
                                  .map((category) => t.categories[category])
                                  .join(" · ")}
                              </p>
                              <a
                                href={store.url}
                                target="_blank"
                                rel="noreferrer"
                                className="rl-button"
                                data-variant="secondary"
                              >
                                {t.open}
                                <Icon as={ArrowUpRight} directional />
                              </a>
                              <Link
                                to="/stores/request"
                                search={{ store: store.id, intent: "buy", item: undefined }}
                                className="rl-button"
                              >
                                {t.assist}
                              </Link>
                              <Link
                                to="/stores/request"
                                search={{ store: store.id, intent: "ship", item: undefined }}
                                className="rl-text-action"
                              >
                                {t.shipOwn}
                              </Link>
                              <details>
                                <summary>{t.external}</summary>
                                <p>{t.notes[store.note]}</p>
                                {store.caution.map((caution) => (
                                  <p key={caution}>{t.cautions[caution]}</p>
                                ))}
                              </details>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </section>
          <BottomSheet open={sheet} onClose={() => setSheet(false)} title={c.filters}>
            {filters}
            <Button onClick={() => setSheet(false)}>{c.showResults}</Button>
          </BottomSheet>
        </>
      )}
    </Shell>
  );
}
