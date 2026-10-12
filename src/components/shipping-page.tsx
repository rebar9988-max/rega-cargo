import { Link } from "@tanstack/react-router";
import { ArrowRight, Box, MapPin, Package, Truck } from "lucide-react";
import { Shell } from "./shell";
import { DeliveryTabs } from "./delivery-hub";
import { QuotePanel } from "./quote-panel";
import { Icon } from "./ui";
import { useI18n } from "@/lib/i18n";
import { redesignCopy } from "@/lib/redesign-copy";
import { shippingCopy } from "@/lib/shipping-copy";

/** Dedicated shipping experience. The store catalogue is owned by BazaarPage. */
export function ShippingPage({
  initial,
}: {
  initial?: Parameters<typeof QuotePanel>[0]["initial"];
}) {
  const { lang, t } = useI18n();
  const c = redesignCopy(lang);
  const s = shippingCopy(lang);
  const steps = [
    { label: s.routeStep, icon: MapPin, href: "#shipping-route" },
    { label: s.parcelStep, icon: Package, href: "#shipping-parcel" },
    { label: s.optionsStep, icon: Truck, href: "#shipping-options" },
  ];

  return (
    <Shell>
      <div className="rl-shipping-page">
        <DeliveryTabs active="/quote" />
        <header className="page rl-shipping-header">
          <div className="rl-shipping-intro">
            <p className="rl-eyebrow">
              <Icon as={Truck} />
              {c.shipping}
            </p>
            <h1>{c.calculator}</h1>
            <p className="rl-page-lede">{c.calculatorBody}</p>
          </div>
          <ol className="rl-shipping-steps" aria-label={c.calculator}>
            {steps.map((step, index) => (
              <li key={step.href}>
                <a href={step.href}>
                  <span className="rl-shipping-step-number">
                    <bdi dir="ltr">0{index + 1}</bdi>
                  </span>
                  <Icon as={step.icon} />
                  <span>{step.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </header>
        <div className="page rl-shipping-content">
          <QuotePanel variant="full" initial={initial} />
          <section className="rl-shipping-track" aria-labelledby="shipping-track-title">
            <span className="rl-shipping-track-icon">
              <Icon as={Box} />
            </span>
            <div>
              <p className="rl-eyebrow">{t.trackKicker}</p>
              <h2 id="shipping-track-title">{t.trackTitle}</h2>
            </div>
            <Link
              to="/track"
              search={{ id: undefined }}
              className="rl-button"
              data-variant="secondary"
            >
              {t.trackButton}
              <Icon as={ArrowRight} directional />
            </Link>
          </section>
        </div>
      </div>
    </Shell>
  );
}
