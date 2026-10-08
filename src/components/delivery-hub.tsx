import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, MapPin, ShoppingBag, Tag, Truck, type LucideIcon } from "lucide-react";
import { Field, btnPrimary, controlClass } from "@/components/field";
import { DESIGN_COPY } from "@/lib/design-copy";
import { DESTS, ORIGINS, SAMPLE_BOX, getDest, getOrigin, placeName } from "@/lib/corridor";
import { useI18n } from "@/lib/i18n";
import type { Service } from "@/lib/service-choice";

/** Two equal cards under the search strip: Bazaar (shopping) and Delivery (shipping/moving). */
export function ServiceSwitch({
  value,
  onChange,
}: {
  value: Service;
  onChange: (service: Service) => void;
}) {
  const { lang } = useI18n();
  const d = DESIGN_COPY[lang];
  const items: { id: Service; icon: LucideIcon; label: string; sub: string }[] = [
    { id: "bazaar", icon: ShoppingBag, label: d.bazaar, sub: d.bazaarSub },
    { id: "delivery", icon: Truck, label: d.delivery, sub: d.deliverySub },
  ];
  return (
    <div className="bg-paper">
      <div
        className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-3 md:px-5"
        role="tablist"
        aria-label={d.services}
        style={{ direction: "ltr" }}
      >
        {items.map((item) => {
          const on = value === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onChange(item.id)}
              className={`flex min-h-20 min-w-0 items-center gap-3 rounded-2xl border bg-surface p-3 text-start transition-colors ${on ? "border-pine ring-1 ring-pine" : "border-line"}`}
            >
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${on ? "bg-pine text-white" : "bg-paper text-ink"}`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span
                  dir="auto"
                  className={`text-base leading-tight font-bold ${on ? "text-pine" : "text-ink"}`}
                >
                  {item.label}
                </span>
                <span dir="auto" className="mt-1 text-xs leading-snug text-muted">
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
    <div className="flex items-center gap-3" style={{ direction: "ltr" }}>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper text-ink">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h2 dir="auto" className="text-lg font-bold">
        {title}
      </h2>
    </div>
  );
}

/** Delivery service home: quick quote, track by code, move/send — all into the real routes. */
export function DeliveryHub() {
  const { t, lang } = useI18n();
  const d = DESIGN_COPY[lang];
  const navigate = useNavigate();
  const [from, setFrom] = useState(getOrigin().id);
  const [to, setTo] = useState(getDest().id);
  const [kg, setKg] = useState(String(SAMPLE_BOX.kg));
  const [code, setCode] = useState("");

  return (
    <>
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
          <p dir="ltr" className="text-end font-sans text-[11px] tracking-[0.2em] text-paper/60">
            R&amp;L
          </p>
          <h1 className="mt-3 text-3xl leading-snug font-bold tracking-tight text-paper md:text-5xl">
            {d.deliveryTitle}
          </h1>
          <p className="mt-4 text-sm text-paper/60">{d.route}</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl items-start gap-3 px-4 py-6 md:grid-cols-3 md:gap-5 md:px-5 md:py-10">
        <form
          className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5"
          onSubmit={(event) => {
            event.preventDefault();
            void navigate({ to: "/quote", search: { from, to, kg: kg.trim() || undefined } });
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
          className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5"
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
          className="flex items-center gap-3 rounded-3xl border border-line bg-surface p-5"
          style={{ direction: "ltr" }}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper text-ink">
            <Truck className="size-5" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col items-start">
            <span dir="auto" className="text-lg font-bold">
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
      <div className="mx-auto grid max-w-6xl grid-cols-3" style={{ direction: "ltr" }}>
        {DELIVERY_LINKS.map((item) => {
          const on = item.to === active;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to as string}
              aria-current={on ? "page" : undefined}
              className={`relative flex h-12 items-center justify-center gap-1.5 px-1 text-sm ${on ? "font-semibold text-pine" : "text-muted"}`}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span dir="auto" className="truncate">
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
