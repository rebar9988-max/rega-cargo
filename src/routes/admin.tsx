import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { btnGhost, btnPrimary } from "@/components/field";
import { PageHeader, Shell } from "@/components/shell";
import { useI18n } from "@/lib/i18n";
import { iqd, marketCopy } from "@/lib/market-copy";
import { marketAdmin, marketAdminSet } from "@/lib/market/api";

export const Route = createFileRoute("/admin")({
  loader: () => marketAdmin(),
  head: () => ({ meta: [{ title: "بەڕێوەبەر · R&L" }] }),
  component: AdminPage,
});

function AdminPage() {
  const initial = Route.useLoaderData();
  const { lang } = useI18n();
  const t = marketCopy(lang);
  const [data, setData] = useState(initial);
  if ("error" in data) {
    return (
      <Shell>
        <PageHeader kicker="R&L" title={t.admin} lede={t.forbidden} />
      </Shell>
    );
  }
  async function act(input: Record<string, unknown>) {
    await marketAdminSet({ data: input });
    setData(await marketAdmin());
  }
  return (
    <Shell>
      <PageHeader kicker={t.marketKicker} title={t.admin} lede={t.freeSort} />
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10">
        <Section title={t.roleSeller}>
          {data.pendingRoles.map((row) => (
            <Row key={row.userId + row.role} label={`${row.displayName} · ${row.role}`}>
              <button type="button" className={btnPrimary} onClick={() => act({ kind: "role", id: row.userId, role: row.role, status: "approved" })}>{t.save}</button>
              <button type="button" className={btnGhost} onClick={() => act({ kind: "role", id: row.userId, role: row.role, status: "removed" })}>{t.cancel}</button>
            </Row>
          ))}
        </Section>
        <Section title={t.marketTitle}>
          {data.pendingProducts.map((row) => (
            <Row key={row.slug} label={`${row.nameKu} · ${row.brand}`}>
              <button type="button" className={btnPrimary} onClick={() => act({ kind: "product", id: row.slug, status: "approved" })}>{t.save}</button>
              <button type="button" className={btnGhost} onClick={() => act({ kind: "product", id: row.slug, status: "removed" })}>{t.cancel}</button>
            </Row>
          ))}
        </Section>
        <Section title={t.offers}>
          {data.pendingOffers.map((row) => (
            <Row key={row.id} label={`${row.nameKu} · ${iqd(row.price + row.shipping)}`}>
              <button type="button" className={btnPrimary} onClick={() => act({ kind: "offer", id: row.id, status: "approved" })}>{t.save}</button>
              <button type="button" className={btnGhost} onClick={() => act({ kind: "offer", id: row.id, status: "removed" })}>{t.cancel}</button>
            </Row>
          ))}
        </Section>
        <Section title={t.report}>
          {data.openReports.map((row) => (
            <p key={row.id} className="text-sm">{row.subject} — {row.body}</p>
          ))}
        </Section>
      </div>
    </Shell>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
      <p className="text-sm">{label}</p>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}
