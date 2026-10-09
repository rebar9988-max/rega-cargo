import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useState, type ReactNode } from "react";
import { btnGhost, btnPrimary } from "@/components/field";
import { PageHeader, Shell } from "@/components/shell";
import { SignInGate } from "@/components/sign-in-gate";
import { useI18n } from "@/lib/i18n";
import { viewerState } from "@/lib/viewer/api";
import { iqd, marketCopy } from "@/lib/market-copy";
import { marketAdmin, marketAdminSet } from "@/lib/market/api";
import { orderAdmin, orderAdminSet } from "@/lib/orders/api";

const ORDER_STATUS = ["received", "confirmed", "in_transit", "delivered", "cancelled"] as const;

export const Route = createFileRoute("/admin")({
  loader: async () => {
    const { state } = await viewerState();
    if (state !== "in") return { gate: state, market: null, orders: null };
    const market = await marketAdmin();
    if ("error" in market) return { gate: null, market, orders: null };
    try {
      const orders = await orderAdmin();
      return { gate: null, market, orders };
    } catch {
      return { gate: null, market, orders: { error: "unavailable" as const } };
    }
  },
  head: () =>
    seo({
      path: "/admin",
      title: "بەڕێوەبەر · R&L",
      description: "بەڕێوەبردنی R&L.",
      noindex: true,
    }),
  component: AdminPage,
});

function AdminPage() {
  const data = Route.useLoaderData();
  if (data.gate || !data.market) return <SignInGate state={data.gate ?? "out"} kicker="R&L" />;
  return <AdminSignedIn initial={{ market: data.market, orders: data.orders }} />;
}

function AdminSignedIn({
  initial,
}: {
  initial: {
    market: Awaited<ReturnType<typeof marketAdmin>>;
    orders: Awaited<ReturnType<typeof orderAdmin>> | { error: "unavailable" } | null;
  };
}) {
  const { lang } = useI18n();
  const t = marketCopy(lang);
  const [market, setMarket] = useState(initial.market);
  const [orders, setOrders] = useState(initial.orders);
  if ("error" in market) {
    return (
      <Shell>
        <PageHeader kicker="R&L" title={t.admin} lede={t.forbidden} />
      </Shell>
    );
  }
  async function act(input: Record<string, unknown>) {
    await marketAdminSet({ data: input });
    setMarket(await marketAdmin());
  }
  async function setStatus(id: string, status: string) {
    await orderAdminSet({ data: { id, status } });
    setOrders(await orderAdmin());
  }
  const statusLabel: Record<string, string> = {
    received: t.received,
    confirmed: t.confirmed,
    in_transit: t.transit,
    delivered: t.delivered,
    cancelled: t.cancelled,
  };
  return (
    <Shell>
      <PageHeader kicker={t.marketKicker} title={t.admin} lede={t.freeSort} />
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10">
        <Section title={t.reviews}>
          {market.pendingReviews.map((row) => (
            <Row key={row.id} label={`${row.rating} · ${row.body}`}>
              <button type="button" className={btnPrimary} onClick={() => act({ kind: "review", id: row.id, status: "approved" })}>{t.approve}</button>
              <button type="button" className={btnGhost} onClick={() => act({ kind: "review", id: row.id, status: "removed" })}>{t.reject}</button>
            </Row>
          ))}
        </Section>
        <Section title={t.roleSeller}>
          {market.pendingRoles.map((row) => (
            <Row key={row.userId + row.role} label={`${row.displayName} · ${row.role}`}>
              <button type="button" className={btnPrimary} onClick={() => act({ kind: "role", id: row.userId, role: row.role, status: "approved" })}>{t.approve}</button>
              <button type="button" className={btnGhost} onClick={() => act({ kind: "role", id: row.userId, role: row.role, status: "removed" })}>{t.reject}</button>
            </Row>
          ))}
        </Section>
        <Section title={t.marketTitle}>
          {market.pendingProducts.map((row) => (
            <Row key={row.slug} label={`${row.nameKu} · ${row.brand}`}>
              <button type="button" className={btnPrimary} onClick={() => act({ kind: "product", id: row.slug, status: "approved" })}>{t.approve}</button>
              <button type="button" className={btnGhost} onClick={() => act({ kind: "product", id: row.slug, status: "removed" })}>{t.reject}</button>
            </Row>
          ))}
        </Section>
        <Section title={t.offers}>
          {market.pendingOffers.map((row) => (
            <Row key={row.id} label={`${row.nameKu} · ${iqd(row.price + row.shipping)}`}>
              <button type="button" className={btnPrimary} onClick={() => act({ kind: "offer", id: row.id, status: "approved" })}>{t.approve}</button>
              <button type="button" className={btnGhost} onClick={() => act({ kind: "offer", id: row.id, status: "removed" })}>{t.reject}</button>
            </Row>
          ))}
        </Section>
        <Section title={t.report}>
          {market.openReports.map((row) => (
            <p key={row.id} className="break-words text-sm">{row.subject} — {row.body}</p>
          ))}
        </Section>
        <Section title={t.orders}>
          {orders && "error" in orders ? <p className="text-sm text-muted">{t.notfound}</p> : null}
          {orders && !("error" in orders)
            ? orders.orders.map((row) => (
              <Row key={row.id} label={`${row.trackingId} · ${row.kind === "store" ? t.storeKind : t.quoteKind} · ${statusLabel[row.status] ?? row.status}`}>
                {ORDER_STATUS.filter((status) => status !== row.status).map((status) => (
                  <button key={status} type="button" className={btnGhost} onClick={() => setStatus(row.id, status)}>{statusLabel[status]}</button>
                ))}
              </Row>
            ))
            : null}
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
      <p className="min-w-0 break-words text-sm">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
