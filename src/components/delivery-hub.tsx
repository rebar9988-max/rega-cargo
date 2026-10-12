import { useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, MapPin, ShoppingBag, Tag, Truck, type LucideIcon } from "lucide-react";
import { BrandHero, IconBadge, TrustRow } from "@/components/brand";
import { Field, btnPrimary, controlClass } from "@/components/field";
import { DESIGN_COPY } from "@/lib/design-copy";
import { DESTS, ORIGINS, SAMPLE_BOX, getDest, getOrigin, placeName } from "@/lib/corridor";
import { useI18n } from "@/lib/i18n";
import { parseKg } from "@/lib/quote-search";
import type { Service } from "@/lib/service-choice";
import { Icon } from "@/components/ui";

/** One accessible service selector; each tab opens only its own home panel. */
export function ServiceSwitch({
  value,
  onChange,
}: {
  value: Service;
  onChange: (service: Service) => void;
}) {
  const { lang } = useI18n();
  const d = DESIGN_COPY[lang];
  const tabs = useRef<Partial<Record<Service, HTMLButtonElement>>>({});
  const items: { id: Service; icon: LucideIcon; label: string; sub: string }[] = [
    { id: "bazaar", icon: ShoppingBag, label: d.bazaar, sub: d.bazaarSub },
    { id: "delivery", icon: Truck, label: d.delivery, sub: d.deliverySub },
  ];
  return (
    <div className="page rl-service-switch">
      <div className="rl-service-tabs" role="tablist" aria-label={d.services}>
        {items.map((item) => {
          const on = value === item.id;
          return (
            <button
              key={item.id}
              ref={(element) => {
                if (element) tabs.current[item.id] = element;
              }}
              id={`rl-service-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`rl-service-panel-${item.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(item.id)}
              onKeyDown={(event) => {
                let next: Service;
                if (event.key === "Home") next = "bazaar";
                else if (event.key === "End") next = "delivery";
                else if (event.key === "ArrowLeft" || event.key === "ArrowRight")
                  next = item.id === "bazaar" ? "delivery" : "bazaar";
                else return;
                event.preventDefault();
                onChange(next);
                tabs.current[next]?.focus();
              }}
              className="rl-service-tab"
            >
              <span className="rl-service-tab-icon">
                <Icon as={item.icon} />
              </span>
              <span className="rl-service-tab-copy">
                <span dir="auto" className="rl-service-tab-label">
                  {item.label}
                </span>
                <span dir="auto" className="rl-service-tab-sub">
                  {item.sub}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CardHead({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <IconBadge icon={Icon} size="sm" tone="soft" />
      <h2 dir="auto" className="text-base font-bold">
        {title}
      </h2>
    </div>
  );
}

/** Delivery service home: quick quote, track by code, move/send — all into the real routes. */
export function DeliveryHub({ embedded = false }: { embedded?: boolean } = {}) {
  const { t, lang } = useI18n();
  const d = DESIGN_COPY[lang];
  const navigate = useNavigate();
  const [from, setFrom] = useState(getOrigin().id);
  const [to, setTo] = useState(getDest().id);
  const [kg, setKg] = useState(String(SAMPLE_BOX.kg));
  const [code, setCode] = useState("");

  return (
    <>
      {!embedded ? (
        <>
          <BrandHero title={d.deliveryTitle} route={d.route} />
          <TrustRow />
        </>
      ) : null}
      <div className={`page grid items-start gap-3 pt-8 pb-12 md:grid-cols-3 md:gap-5 md:pt-12`}>
        <form
          className="flex flex-col gap-4 rl-soft rounded-2xl border border-line bg-surface p-5"
          onSubmit={(event) => {
            event.preventDefault();
            void navigate({ to: "/quote", search: { from, to, kg: parseKg(kg) } });
          }}
        >
          <CardHead icon={Tag} title={d.quoteCard} />
          <Field label={t.from}>
            <select className={controlClass} value={from} onChange={(e) => setFrom(e.target.value)}>
              {ORIGINS.map((item) => (
                <option key={item.id} value={item.id}>
                  {placeName(item, lang)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.to}>
            <select className={controlClass} value={to} onChange={(e) => setTo(e.target.value)}>
              {DESTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {placeName(item, lang)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={`${t.weight} (${t.kg})`}>
            <input
              className={controlClass}
              dir="ltr"
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={kg}
              onChange={(e) => setKg(e.target.value)}
            />
          </Field>
          <button type="submit" className={`${btnPrimary} w-full`}>
            {d.quoteGo}
          </button>
        </form>
        <form
          className="flex flex-col gap-4 rl-soft rounded-2xl border border-line bg-surface p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const id = code.trim().toUpperCase();
            void navigate({ to: "/track", search: { id: id || undefined } });
          }}
        >
          <CardHead icon={MapPin} title={d.trackCard} />
          <Field label={t.trackLabel}>
            <input
              className={controlClass}
              dir="ltr"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="RG-48291"
              autoComplete="off"
            />
          </Field>
          <button type="submit" className={`${btnPrimary} w-full`}>
            {t.trackButton}
          </button>
        </form>
        <Link
          to={"/move" as string}
          className="flex items-center gap-3 rl-soft rounded-2xl border border-line bg-surface p-5"
        >
          <IconBadge icon={Truck} size="sm" tone="soft" />
          <span className="flex min-w-0 flex-1 flex-col items-start">
            <span dir="auto" className="text-base font-bold">
              {d.moveSend}
            </span>
            <span dir="auto" className="text-sm text-muted">
              {d.moveSub}
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden="true" />
        </Link>
      </div>
    </>
  );
}

const DELIVERY_LINKS = [
  { to: "/quote", icon: Tag },
  { to: "/track", icon: MapPin },
  { to: "/move", icon: Truck },
] as const;

/** Sub-navigation shared by the delivery pages (/quote, /track, /move). */
export function DeliveryTabs({ active }: { active: "/quote" | "/track" | "/move" }) {
  const { t, lang } = useI18n();
  const d = DESIGN_COPY[lang];
  const label = { "/quote": t.nav.quote, "/track": t.nav.track, "/move": d.moveSend };
  return (
    <nav className="border-b border-line bg-surface" aria-label={d.delivery}>
      <div className="page-bleed grid grid-cols-3">
        {DELIVERY_LINKS.map((item) => {
          const on = item.to === active;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to as string}
              aria-current={on ? "page" : undefined}
              className={`relative flex h-12 items-center justify-center gap-1.5 px-1 text-xs md:text-sm ${on ? "font-semibold text-pine" : "text-muted"}`}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span dir="auto" className="line-clamp-2 min-w-0 text-center leading-tight">
                {label[item.to]}
              </span>
              <span
                className={`absolute inset-x-6 bottom-0 h-0.5 ${on ? "bg-pine" : "bg-transparent"}`}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
