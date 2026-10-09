import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PageHeader, Shell } from "@/components/shell";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/customs")({
  head: () =>
    seo({
      path: "/customs",
      title: "گومرگ · R&L",
      description: "زانیاریی گومرگ بۆ ناردنی بار بۆ کوردستان و عێراق.",
    }),
  component: CustomsPage,
});

function CustomsPage() {
  const { t } = useI18n();
  return (
    <Shell>
      <PageHeader kicker={t.customsKicker} title={t.customsTitle} lede={t.customsLede} />
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-5 py-12 md:py-16">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">{t.lanesTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {t.lanes.map((lane) => (
              <article key={lane.title} className="rounded-2xl border border-line bg-surface p-6">
                <h3 className="text-lg font-semibold">{lane.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{lane.body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{t.flowTitle}</h2>
            <ol className="mt-5 flex flex-col gap-4">
              {t.flow.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="font-sans text-sm font-semibold text-pine">0{index + 1}</span>
                  <p className="text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{t.docsTitle}</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {t.docs.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-pine" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-2xl font-semibold tracking-tight">{t.bannedTitle}</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {t.banned.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-clay" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  );
}
