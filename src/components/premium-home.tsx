import { lazy, Suspense, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight,
  Box,
  Check,
  Globe,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Warehouse,
} from "lucide-react";
import { Chip, Icon, Deferred, Skeleton } from "./ui";
import { useI18n } from "@/lib/i18n";
import { redesignCopy } from "@/lib/redesign-copy";
import { heroCopy } from "@/lib/hero-copy";
import { rlAiEnabled } from "@/lib/ai/flag";
import { BRANDS } from "@/lib/catalog";
import type { Service } from "@/lib/service-choice";

const QuickQuote = lazy(() =>
  import("./quote-panel").then(({ QuotePanel }) => ({ default: QuotePanel })),
);

export function PremiumHome({
  service,
  onService,
  children,
}: {
  service: Service;
  onService: (next: Service) => void;
  children?: ReactNode;
}) {
  const { lang, t } = useI18n();
  const c = redesignCopy(lang);
  const h = heroCopy(lang);
  const ai = rlAiEnabled();
  // The AI entry opens the existing /ai route; show a busy state while it loads.
  const opening = useRouterState({
    select: (state) => state.status === "pending" && state.location.pathname === "/ai",
  });
  return (
    <>
      {/* The AI hero is one static section directly under the header: no slides, no autoplay,
          nothing inserted above it. It is server-rendered with fixed copy and is centred, so it
          sits in the same place and keeps the same hierarchy in every language. */}
      <section className="rl-ai-hero" aria-labelledby="rl-hero-title">
        {/* A brand-red card inside the page gutter (Figma "Mobile Home Concept", Hero 1:8). */}
        <div className="page">
          <div className="rl-ai-hero-inner">
            {ai ? (
              <p className="rl-ai-hero-badge">
                <Icon as={Sparkles} />
                <span>{h.eyebrow}</span>
              </p>
            ) : (
              <p className="rl-eyebrow" lang="en" dir="ltr">
                {t.brandSub}
              </p>
            )}
            <h1 id="rl-hero-title">{ai ? h.title : c.heroTitle}</h1>
            <p className="rl-ai-hero-subtitle">{ai ? h.subtitle : c.heroBody}</p>
            <div className="rl-ai-hero-actions" data-ai={ai || undefined}>
              {/* With AI off for this deployment the marketplace is the primary action, so the
                hero never links to an assistant that is not there. */}
              {ai ? (
                <Link
                  to="/ai"
                  className="rl-button rl-ai-hero-cta"
                  data-variant="primary"
                  aria-busy={opening || undefined}
                  aria-label={opening ? `${h.cta}. ${h.ctaOpening}` : undefined}
                >
                  <Icon as={Sparkles} />
                  {h.cta}
                </Link>
              ) : null}
              <div className="rl-ai-hero-more">
                <Link
                  to="/stores"
                  className="rl-button rl-hero-shop"
                  data-variant={ai ? "secondary" : "primary"}
                >
                  {c.heroShop}
                  <Icon as={ArrowRight} directional />
                </Link>
                <Link
                  to="/quote"
                  search={{ from: undefined, to: undefined, kg: undefined }}
                  className="rl-button rl-hero-secondary"
                  data-variant="secondary"
                >
                  {c.heroShip}
                </Link>
              </div>
            </div>
            <p className="rl-hero-location">
              <Icon as={Warehouse} />
              {c.warehouse}
            </p>
          </div>
        </div>
      </section>
      {/* Parcel tracking entry (Figma "Your parcels" 1:31). It shows no parcel, status or
          progress of its own: those exist only for a real shipment number on /track. */}
      <section className="page rl-track-entry" aria-labelledby="rl-home-track">
        <div className="rl-track-card">
          <span className="rl-track-icon" aria-hidden="true">
            <Icon as={Box} />
          </span>
          <div className="rl-track-copy">
            <p className="rl-eyebrow">{t.trackKicker}</p>
            <h2 id="rl-home-track">{t.trackTitle}</h2>
          </div>
          <Link to="/track" search={{ id: undefined }} className="rl-text-link rl-track-link">
            {t.trackButton}
            <Icon as={ArrowRight} directional />
          </Link>
        </div>
      </section>
      <section className="page rl-section rl-stack" aria-labelledby="rl-home-calc">
        <div className="rl-section-heading">
          <div>
            <p className="rl-eyebrow">{c.shipping}</p>
            <h2 id="rl-home-calc">{c.calculator}</h2>
            <p>{c.calculatorBody}</p>
          </div>
          <div className="rl-row">
            <Chip selected={service === "bazaar"} onClick={() => onService("bazaar")}>
              {c.marketplace}
            </Chip>
            <Chip selected={service === "delivery"} onClick={() => onService("delivery")}>
              {c.shipping}
            </Chip>
          </div>
        </div>
        <Deferred
          className="rl-deferred-calculator"
          fallback={
            <div className="rl-calc-placeholder">
              <Skeleton />
              <Link
                to="/quote"
                search={{ from: undefined, to: undefined, kg: undefined }}
                className="rl-button"
                data-variant="secondary"
              >
                {t.hero.fullQuote}
              </Link>
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="rl-calc-placeholder">
                <Skeleton />
              </div>
            }
          >
            <QuickQuote variant="quick" />
          </Suspense>
        </Deferred>
        {children}
      </section>
      {/* The category list lives in one place, the marketplace (/stores); the hero's primary
          button and the bottom bar lead there. */}
      <section className="rl-brand-section rl-defer">
        <div className="page rl-section">
          <div className="rl-section-heading">
            <div>
              <h2>{c.storesTitle}</h2>
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
            <p className="rl-eyebrow">{c.howBody}</p>
            <h2>{c.how}</h2>
          </div>
        </div>
        <ol className="rl-process-grid">
          {c.steps.map((step, i) => (
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
