import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { QuotePanel } from "@/components/quote-panel";
import { Eur, btnGhost, btnPrimary } from "@/components/field";
import { Shell } from "@/components/shell";
import {
  DESTS,
  MODES,
  ORIGINS,
  SAMPLE_BOX,
  countryName,
  formatEur,
  getDest,
  getOrigin,
  placeName,
  priceShipment,
} from "@/lib/corridor";
import { dayRange, useI18n } from "@/lib/i18n";

export function HomePage() {
  const { t, lang } = useI18n();
  const origin = getOrigin("ber");
  const dest = getDest("ebl");
  const priced = MODES.map((mode) => ({
    mode,
    price: priceShipment({
      mode,
      origin,
      dest,
      weightKg: SAMPLE_BOX.kg,
      l: SAMPLE_BOX.l,
      w: SAMPLE_BOX.w,
      h: SAMPLE_BOX.h,
    }),
  }));
  const expressTotal = priced[0]?.price.total ?? 0;

  const groups: { country: string; cities: typeof ORIGINS }[] = [];
  for (const item of ORIGINS) {
    const country = countryName(item, lang);
    const last = groups[groups.length - 1];
    if (last && last.country === country) last.cities.push(item);
    else groups.push({ country, cities: [item] });
  }

  return (
    <Shell>
      <section className="bg-paper">
        <div className="mx-auto grid max-w-6xl items-start gap-8 px-5 py-8 md:grid-cols-2 md:gap-16 md:py-20">
          <div className="min-w-0">
            <p className="font-sans text-xs font-semibold tracking-wide text-ink">MOVE SMART. DELIVER FAST.</p>
            <p className="mt-2 font-sans text-sm font-medium tracking-wide text-pine">EUROPE ↔ KURDISTAN ↔ IRAQ</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-ink md:mt-4 md:text-5xl md:leading-tight">
              {t.hero.title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">{t.hero.lede}</p>
            <div className="mt-6 flex flex-wrap gap-3 md:mt-8">
              <Link
                to="/quote"
                search={{ from: undefined, to: undefined, kg: undefined }}
                className={btnPrimary}
              >
                {t.hero.fullQuote}
              </Link>
              <Link to="/track" search={{ id: "RG-48291" }} className={btnGhost}>
                {t.hero.track}
              </Link>
            </div>
          </div>
          <QuotePanel variant="compact" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
          {t.stats.map((item) => (
            <div key={item.k} className="bg-surface p-5">
              <dd className="font-sans text-2xl font-semibold tracking-tight text-pine">
                <bdi dir="ltr">{item.v}</bdi>
              </dd>
              <dt className="mt-2 text-sm leading-snug text-muted">{item.k}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <p className="text-sm font-medium text-pine">{t.stepsKicker}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">{t.stepsTitle}</h2>
        <ol className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
          {t.steps.map((step, index) => (
            <li key={step.title} className="bg-surface p-5">
              <p className="font-sans text-sm font-semibold text-pine">0{index + 1}</p>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <p className="text-sm font-medium text-pine">{t.gapKicker}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">{t.gapTitle}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{t.gapLede}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {t.columns.map((column, index) => {
            const rega = index === t.columns.length - 1;
            return (
              <article
                key={column.title}
                className={`flex flex-col gap-4 rounded-2xl border p-6 ${rega ? "border-pine bg-surface" : "border-line bg-surface"}`}
              >
                <h3 className="text-lg font-semibold">{column.title}</h3>
                <ul className="flex flex-col gap-3">
                  {column.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
                      <span className={`mt-2 size-1.5 shrink-0 rounded-full ${rega ? "bg-pine" : "bg-line"}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <p className="text-sm font-medium text-pine">{t.modesKicker}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">{t.modesTitle}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{t.modesLede}</p>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {priced.map((row) => {
            const save = Math.round((expressTotal - row.price.total) * 100) / 100;
            return (
              <article key={row.mode.id} className="flex flex-col rounded-2xl border border-line bg-surface p-6">
                {row.mode.id === "economy" ? <p className="text-xs font-medium text-pine">{t.usual}</p> : null}
                <h3 className="mt-1 text-xl font-semibold">{t.modes[row.mode.id].name}</h3>
                <p className="mt-2 text-sm text-muted">
                  <bdi dir="ltr">{dayRange(t.dayRange, row.mode.days[0], row.mode.days[1])}</bdi>
                </p>
                <p className="mt-5 text-3xl font-semibold tracking-tight">
                  <Eur value={row.price.total} />
                </p>
                {save > 0.5 ? (
                  <p className="mt-2 text-sm text-pine">
                    <Eur value={save} /> {t.saveVs}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted">{t.freight}</p>
                )}
                <p className="mt-4 text-sm leading-relaxed text-muted">{t.modes[row.mode.id].blurb}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <p className="text-sm font-medium text-pine">{t.boardKicker}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">{t.boardTitle}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{t.boardLede}</p>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted">{t.europeTitle}</h3>
            <div className="mt-4 flex flex-col gap-5">
              {groups.map((group) => (
                <div key={group.country}>
                  <p className="text-sm text-muted">{group.country}</p>
                  <ul className="mt-1">
                    {group.cities.map((city) => (
                      <li key={city.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                        <span className="font-medium">{placeName(city, lang)}</span>
                        <bdi dir="ltr" className="font-sans text-xs tracking-widest text-muted">
                          {city.code}
                        </bdi>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted">{t.kurdistanTitle}</h3>
            <ul className="mt-4">
              {DESTS.map((city) => (
                <li key={city.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                  <span className="font-medium">{placeName(city, lang)}</span>
                  <span className="text-sm text-muted">
                    {city.surcharge === 0 ? (
                      t.gateway
                    ) : (
                      <>
                        <bdi dir="ltr">+{formatEur(city.surcharge)}</bdi> {t.cityDrop}
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">{t.boardNote}</p>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <p className="text-sm font-medium text-pine">{t.faqKicker}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{t.faqTitle}</h2>
        <div className="mt-6 border-t border-line">
          {t.faq.map((item) => (
            <details key={item.q} className="group border-b border-line py-4">
              <summary className="flex items-center justify-between gap-4 text-base font-medium">
                {item.q}
                <ChevronDown className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-14 md:py-20">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-ink md:text-4xl">{t.closeTitle}</h2>
          <p className="max-w-xl text-base leading-relaxed text-muted">{t.closeLede}</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/quote" search={{ from: undefined, to: undefined, kg: undefined }} className={btnPrimary}>
              {t.hero.fullQuote}
            </Link>
            <Link to="/track" search={{ id: "RG-48291" }} className={btnGhost}>
              {t.hero.track}
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
