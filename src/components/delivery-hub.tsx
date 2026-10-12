import { Link } from "@tanstack/react-router";
import { MapPin, Tag, Truck } from "lucide-react";
import { DESIGN_COPY } from "@/lib/design-copy";
import { useI18n } from "@/lib/i18n";

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
