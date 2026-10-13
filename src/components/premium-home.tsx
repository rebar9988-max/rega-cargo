import { DEFAULT_MARKET_SEARCH } from "@/lib/market/search";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight,
  Box,
  Check,
  Globe,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Warehouse,
  Truck,
  ShoppingBag,
} from "lucide-react";
import { Icon } from "./ui";
import { useI18n } from "@/lib/i18n";
import { redesignCopy } from "@/lib/redesign-copy";
import { heroCopy } from "@/lib/hero-copy";
import { rlAiEnabled } from "@/lib/ai/flag";
import { MarketDiscovery, type DiscoveryData } from "./market-discovery";
import { JOURNEY_COPY } from "@/lib/journey-copy";
import { BRANDS } from "@/lib/catalog";
import { REQUEST_COPY } from "@/lib/requests/copy";
import { useHydrated } from "@/lib/use-hydrated";
export function PremiumHome({ market }: { market: DiscoveryData | null }) {
  const { lang, t } = useI18n();
  const c = redesignCopy(lang);
  const h = heroCopy(lang);
  const ai = rlAiEnabled();
  const j = JOURNEY_COPY[lang];
  const navigate = useNavigate();
  const ready = useHydrated();
  // The AI entry opens the existing /ai route; show a busy state while it loads.
  const opening = useRouterState({
    select: (state) => state.status === "pending" && state.location.pathname === "/ai",
  });
  return (
    <>
      <section className="rl-ai-hero" aria-labelledby="rl-hero-title">
        <div className="page">
          <div className="rl-ai-hero-inner">
            <p className="rl-eyebrow" lang="en" dir="ltr">
              {t.brandSub}
            </p>
            <h1 id="rl-hero-title">{j.title}</h1>
            <p className="rl-ai-hero-subtitle">{j.body}</p>
            <div className="rl-ai-hero-actions" data-ai={ai || undefined}>
              <Link
                to="/market"
                search={DEFAULT_MARKET_SEARCH}
                className="rl-button rl-hero-shop"
                data-variant="primary"
              >
                {j.shop}
                <Icon as={ArrowRight} directional />
              </Link>
              <Link
                to="/stores/request"
                search={{ intent: "buy", store: undefined, item: undefined }}
                className="rl-button rl-hero-bring"
                data-variant="secondary"
              >
                {j.bring}
                <Icon as={ShoppingBag} />
              </Link>
            </div>
            {ai ? (
              <Link
                to="/ai"
                className="rl-ai-hero-cta rl-hero-assist"
                aria-busy={opening || undefined}
                aria-label={opening ? `${h.cta}. ${h.ctaOpening}` : undefined}
              >
                <Icon as={Sparkles} />
                {h.cta}
              </Link>
            ) : null}
            <p className="rl-hero-location">
              <Icon as={Warehouse} />
              {c.warehouse}
            </p>
          </div>
        </div>
      </section>
      <section className="page rl-track-entry" aria-labelledby="rl-track-title">
        <div className="rl-track-card">
          <span className="rl-track-icon">
            <Icon as={Truck} />
          </span>
          <div className="rl-track-copy">
            <h2 id="rl-track-title">{t.nav.track}</h2>
            <p className="text-sm text-muted" id="rl-home-track-hint">
              {j.trackHint}
            </p>
          </div>
          <form
            className="rl-home-track-form"
            onSubmit={(event) => {
              event.preventDefault();
              const id = String(new FormData(event.currentTarget).get("id") ?? "").trim();
              if (id) void navigate({ to: "/track", search: { id } });
            }}
          >
            <input
              name="id"
              type="text"
              dir="ltr"
              autoComplete="off"
              autoCapitalize="characters"
              required
              maxLength={40}
              className="rl-control"
              aria-label={t.trackLabel}
              aria-describedby="rl-home-track-hint"
            />
            <button
              type="submit"
              className="rl-button"
              data-variant="secondary"
              disabled={!ready}
              aria-busy={!ready}
            >
              {t.trackButton}
            </button>
          </form>
        </div>
      </section>
      <MarketDiscovery data={market} />
      <section className="rl-brand-section rl-defer">
        <div className="page rl-section">
          <div className="rl-section-heading">
            <div>
              <h2>{j.stores}</h2>
              <p>{c.noPartner}</p>
            </div>
            <Link to="/stores" className="rl-text-link">
              {c.browse}
              <Icon as={ArrowRight} directional />
            </Link>
          </div>
          <ul className="rl-logo-strip">
            {BRANDS.map((b) => (
              <li key={b.name}>
                <Link to="/stores" search={{ cat: b.category }} className="rl-logo-tile">
                  <img
                    src={b.logo}
                    alt={b.name}
                    width={112}
                    height={40}
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="page rl-section rl-defer">
        <div className="rl-section-heading">
          <div>
            <p className="text-sm text-muted">{j.bringBody}</p>
            <h2>{j.bring}</h2>
          </div>
        </div>
        <ol className="rl-process-grid">
          {[
            c.steps[0],
            { title: REQUEST_COPY[lang].statuses.reviewing, body: c.howBody },
            { title: c.steps[1].title, body: REQUEST_COPY[lang].acceptNote },
            c.steps[3],
          ].map((step, i) => (
            <li key={step.title}>
              <span className="rl-step-number">
                <bdi dir="ltr">{String(i + 1).padStart(2, "0")}</bdi>
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="page rl-section rl-defer">
        <div className="rl-card rl-stack">
          <h2 className="text-2xl font-bold">{c.shipping}</h2>
          <p className="text-sm text-muted">{j.deliveryBody}</p>
          <Link
            to="/quote"
            search={{ from: undefined, to: undefined, kg: undefined }}
            className="rl-text-link rl-hero-secondary"
          >
            {c.calculator}
            <Icon as={ArrowRight} directional />
          </Link>
          <Link to="/contact" className="rl-text-link">
            {j.help}
          </Link>
        </div>
      </section>
      <section className="rl-trust-section rl-defer">
        <div className="page rl-section">
          <div className="rl-section-heading">
            <div>
              <h2>{c.trustTitle}</h2>
              <p>{c.trustBody}</p>
            </div>
          </div>
          <ul className="rl-trust-grid">
            {c.trust.map((item, i) => {
              const icons = [Check, ShieldCheck, Globe, PackageCheck];
              return (
                <li key={item.title}>
                  <Icon as={icons[i]!} />
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </li>
              );
            })}
          </ul>
          <div className="rl-restrictions">
            <Icon as={Box} />
            <div>
              <h3>{c.restrictions}</h3>
              <p>{c.restrictionsBody}</p>
              <Link to="/prohibited-items" className="rl-text-link">
                {t.bannedTitle}
                <Icon as={ArrowRight} directional />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
