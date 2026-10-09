import { createFileRoute } from "@tanstack/react-router";
import { Ban, Mail, Route as RouteIcon, ShieldAlert } from "lucide-react";
import { seo } from "@/lib/seo";
import { btnPrimary } from "@/components/field";
import { PageHeader, Shell } from "@/components/shell";
import { useI18n } from "@/lib/i18n";
import { CONTACT_EMAIL } from "@/lib/contact";
import { PROHIBITED } from "@/lib/compliance/rules";
import { DECLARE_COPY } from "@/lib/declare-copy";
import { ITEMS_COPY } from "@/lib/items-copy";

export const Route = createFileRoute("/prohibited-items")({
  head: () =>
    seo({
      path: "/prohibited-items",
      title: "کاڵا قەدەغە و سنووردارەکان · R&L",
      description: "پێش داواکردن بپشکنە: کاڵا قەدەغەکان، کاڵای سنووردار کە پشکنینی تیمیان پێویستە، و یاساکان بەپێی ڕێگا.",
    }),
  component: ItemsPage,
});

function ItemsPage() {
  const { lang } = useI18n();
  const t = ITEMS_COPY[lang];
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.subject)}`;
  return (
    <Shell>
      <PageHeader kicker={t.kicker} title={t.title} lede={t.lede} />
      <div className="page flex flex-col gap-10 py-10 md:py-14">
        <div className="flex flex-col gap-3 rounded-2xl border border-pine bg-surface p-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm leading-relaxed">{t.askBody}</p>
          <a href={mailto} className={`${btnPrimary} shrink-0`}>
            <Mail className="size-4" aria-hidden="true" />
            {t.ask}
          </a>
        </div>

        <section aria-labelledby="prohibited" className="flex flex-col gap-4">
          <h2 id="prohibited" className="flex items-center gap-2 text-2xl leading-tight font-bold">
            <Ban className="size-6 shrink-0 text-pine" aria-hidden="true" />
            {t.prohibitedTitle}
          </h2>
          <p className="text-sm leading-relaxed text-muted">{t.prohibitedBody}</p>
          <ul className="card-grid">
            {PROHIBITED.map((category) => (
              <li key={category.slug} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-sm font-medium">
                <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-pine text-pine-ink">
                  <Ban className="size-4" />
                </span>
                {t.categories[category.slug] ?? category.name_en}
              </li>
            ))}
          </ul>
          <h3 className="pt-2 text-base font-bold">{t.alsoTitle}</h3>
          <ul className="flex flex-wrap gap-2">
            {t.also.map((item) => (
              <li key={item} className="rounded-full border border-line bg-surface px-4 py-2 text-sm">{item}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="restricted" className="flex flex-col gap-4">
          <h2 id="restricted" className="flex items-center gap-2 text-2xl leading-tight font-bold">
            <ShieldAlert className="size-6 shrink-0 text-pine" aria-hidden="true" />
            {t.restrictedTitle}
          </h2>
          <p className="text-sm leading-relaxed text-muted">{t.restrictedBody}</p>
          <ul className="card-grid">
            {t.restricted.map((item) => (
              <li key={item.title} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-5">
                <h3 className="text-base font-bold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{item.body}</p>
                <span className="mt-auto inline-flex w-fit rounded-full border border-pine px-3 py-1 text-xs font-medium text-pine">{t.notApproved}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="route" className="flex flex-col gap-4">
          <h2 id="route" className="flex items-center gap-2 text-2xl leading-tight font-bold">
            <RouteIcon className="size-6 shrink-0 text-pine" aria-hidden="true" />
            {t.routeTitle}
          </h2>
          <p className="text-sm leading-relaxed text-muted">{t.routeBody}</p>
          <dl className="grid gap-3 md:grid-cols-2">
            {t.route.map((item) => (
              <div key={item.title} className="rounded-2xl border border-line bg-surface p-4">
                <dt className="text-sm font-bold">{item.title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted">{item.body}</dd>
              </div>
            ))}
          </dl>
          <p className="rounded-2xl bg-paper p-4 text-sm leading-relaxed">{t.unsure}</p>
        </section>

        <section aria-labelledby="declare" className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
          <h2 id="declare" className="text-xl leading-tight font-bold">{t.declareTitle}</h2>
          <p className="text-sm text-muted">{t.declareBody}</p>
          <blockquote className="border-s-4 border-pine ps-4 text-sm leading-relaxed">{DECLARE_COPY[lang].declare}</blockquote>
          <p className="text-sm text-muted">{t.autoCheck}</p>
        </section>

        <a href={mailto} className={`${btnPrimary} self-start`}>
          <Mail className="size-4" aria-hidden="true" />
          {t.ask}
        </a>
      </div>
    </Shell>
  );
}
