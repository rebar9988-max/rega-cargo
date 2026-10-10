import { lazy, Suspense, useRef, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  Globe,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Warehouse,
} from "lucide-react";
import { Button, Chip, Icon, Deferred, Skeleton } from "./ui";
import { useI18n } from "@/lib/i18n";
import { redesignCopy } from "@/lib/redesign-copy";
import { heroCopy } from "@/lib/hero-copy";
import { rlAiEnabled } from "@/lib/ai/flag";
import { storeCopy } from "@/lib/store-copy";
import { LAYOUT_DIR } from "@/lib/langs";
import { BRANDS } from "@/lib/catalog";
import { GOODS } from "@/lib/stores";
import { responsiveImage } from "@/lib/images";
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
  const sc = storeCopy(lang);
  const h = heroCopy(lang);
  const ai = rlAiEnabled();
  // The AI entry opens the existing /ai route; show a busy state while it loads.
  const opening = useRouterState({
    select: (state) => state.status === "pending" && state.location.pathname === "/ai",
  });
  const [slide, setSlide] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const slides = [
    // With AI off for this deployment the first slide keeps its original shopping copy.
    ai
      ? { title: h.title, body: h.body, image: "sneakers", ai: true }
      : { title: c.heroTitle, body: c.heroBody, image: "sneakers", ai: false },
    { title: c.heroShippingTitle, body: c.heroShippingBody, image: "earbuds", ai: false },
  ];
  function go(index: number) {
    const at = (index + slides.length) % slides.length;
    setSlide(at);
    rail.current?.children[at]?.scrollIntoView({
      block: "nearest",
      inline: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }
  function sync() {
    if (!rail.current) return;
    const root = rail.current.getBoundingClientRect();
    const rtl = LAYOUT_DIR === "rtl";
    let best = 0;
    let distance = Infinity;
    Array.from(rail.current.children).forEach((el, i) => {
      const box = el.getBoundingClientRect();
      const d = Math.abs(rtl ? root.right - box.right : root.left - box.left);
      if (d < distance) {
        distance = d;
        best = i;
      }
    });
    setSlide(best);
  }
  return (
    <>
      <section
        className="rl-hero-carousel"
        aria-label={c.heroShop}
        aria-roledescription={c.carousel}
      >
        <div
          ref={rail}
          className="rl-hero-rail"
          onScroll={sync}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              go(
                slide +
                  (e.key === "ArrowRight"
                    ? LAYOUT_DIR === "rtl"
                      ? -1
                      : 1
                    : LAYOUT_DIR === "rtl"
                      ? 1
                      : -1),
              );
            }
          }}
        >
          {slides.map((s, i) => {
            const Heading = i === slide ? "h1" : "h2";
            const image = GOODS.find((g) => g.id === s.image)!;
            return (
              <div
                className="rl-hero-slide"
                key={s.title}
                inert={i !== slide}
                aria-hidden={i !== slide}
              >
                <div className="page rl-hero-layout">
                  <div className="rl-hero-copy">
                    {s.ai ? (
                      <p className="rl-eyebrow">{h.eyebrow}</p>
                    ) : (
                      <p className="rl-eyebrow">
                        <bdi lang="en" dir="ltr">
                          {t.brandSub}
                        </bdi>
                      </p>
                    )}
                    <Heading>{s.title}</Heading>
                    <p className="rl-hero-description">{s.body}</p>
                    {s.ai ? (
                      <ul className="rl-hero-trust">
                        {h.trust.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="rl-hero-location">
                        <Icon as={Warehouse} />
                        {c.warehouse}
                      </p>
                    )}
                    {/* The same actions on every slide, pinned to the bottom of the copy, so
                        they never move or disappear while the slides change. */}
                    <div className="rl-hero-actions" data-ai={ai || undefined}>
                      <Link to="/stores" className="rl-button rl-hero-shop" data-variant="primary">
                        {c.heroShop}
                        <Icon as={ArrowRight} directional />
                      </Link>
                      {ai ? (
                        <Link
                          to="/ai"
                          className="rl-button rl-hero-cta"
                          aria-busy={opening || undefined}
                          aria-label={opening ? `${h.ctaShort}. ${h.ctaOpening}` : undefined}
                        >
                          <Icon as={Sparkles} />
                          {h.ctaShort}
                        </Link>
                      ) : null}
                      <Link
                        to="/quote"
                        search={{ from: undefined, to: undefined, kg: undefined }}
                        className="rl-button rl-hero-secondary"
                      >
                        {c.heroShip}
                      </Link>
                    </div>
                  </div>
                  <figure className="rl-hero-art">
                    <img
                      {...responsiveImage(image.image, "(min-width: 1024px) 560px, 128px")}
                      width={640}
                      height={640}
                      alt={sc.goods[image.id]}
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : undefined}
                      decoding="async"
                    />
                    <figcaption>{c.exampleTitle}</figcaption>
                  </figure>
                </div>
              </div>
            );
          })}
        </div>
        <div className="page rl-carousel-controls">
          <div className="rl-row" aria-live="polite">
            <span>
              {c.slide}{" "}
              <bdi dir="ltr">
                {slide + 1} / {slides.length}
              </bdi>
            </span>
            {slides.map((s, i) => (
              <button
                key={s.title}
                type="button"
                className="rl-carousel-dot"
                aria-label={`${c.slide} ${i + 1}`}
                aria-pressed={i === slide}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <div className="rl-row">
            <Button variant="ghost" aria-label={c.prevSlide} onClick={() => go(slide - 1)}>
              <Icon as={ArrowLeft} directional />
            </Button>
            <Button variant="ghost" aria-label={c.nextSlide} onClick={() => go(slide + 1)}>
              <Icon as={ArrowRight} directional />
            </Button>
          </div>
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
