import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useState, type ReactNode } from "react";
import { btnGhost, btnPrimary } from "@/components/field";
import { PageHeader, Shell } from "@/components/shell";
import { SignInGate } from "@/components/sign-in-gate";
import { useI18n } from "@/lib/i18n";
import { viewerState } from "@/lib/viewer/api";
import { iqd, marketCopy } from "@/lib/market-copy";
import { marketAdmin, marketAdminComplianceScan, marketAdminSet } from "@/lib/market/api";
import { staffList } from "@/lib/requests/api";
import { StaffRequestList } from "@/components/staff-requests";

export const Route = createFileRoute("/admin")({
  loader: async () => {
    const { state } = await viewerState();
    if (state !== "in") return { gate: state, market: null, orders: null };
    const market = await marketAdmin();
    if ("error" in market) return { gate: null, market, orders: null };
    try {
      const orders = await staffList({ data: {} });
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
    orders: Awaited<ReturnType<typeof staffList>> | null;
  };
}) {
  const { lang } = useI18n();
  const t = marketCopy(lang);
  const [market, setMarket] = useState(initial.market);
  const [scan, setScan] = useState<Awaited<ReturnType<typeof marketAdminComplianceScan>> | null>(
    null,
  );
  const [scanning, setScanning] = useState(false);
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
  async function runScan() {
    setScanning(true);
    try {
      setScan(await marketAdminComplianceScan());
      setMarket(await marketAdmin());
    } finally {
      setScanning(false);
    }
  }
  return (
    <Shell>
      <PageHeader kicker={t.marketKicker} title={t.admin} lede={t.freeSort} />
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-[var(--gutter)] py-10">
        <Section title={t.reviews}>
          {market.pendingReviews.map((row) => (
            <Row key={row.id} label={`${row.rating} · ${row.body}`}>
              <button
                type="button"
                className={btnPrimary}
                onClick={() => act({ kind: "review", id: row.id, status: "approved" })}
              >
                {t.approve}
              </button>
              <button
                type="button"
                className={btnGhost}
                onClick={() => act({ kind: "review", id: row.id, status: "removed" })}
              >
                {t.reject}
              </button>
            </Row>
          ))}
        </Section>
        <Section title={t.roleSeller}>
          {market.pendingRoles.map((row) => (
            <Row key={row.userId + row.role} label={`${row.displayName} · ${row.role}`}>
              <button
                type="button"
                className={btnPrimary}
                onClick={() =>
                  act({ kind: "role", id: row.userId, role: row.role, status: "approved" })
                }
              >
                {t.approve}
              </button>
              <button
                type="button"
                className={btnGhost}
                onClick={() =>
                  act({ kind: "role", id: row.userId, role: row.role, status: "removed" })
                }
              >
                {t.reject}
              </button>
            </Row>
          ))}
        </Section>
        <Section title={t.marketTitle}>
          {market.pendingProducts.map((row) => (
            <Row
              key={row.slug}
              label={`${row.nameKu} · ${row.brand}${row.review ? ` · ${t.complianceTag}: ${row.review.join(", ")}` : ""}`}
            >
              <button
                type="button"
                className={btnPrimary}
                onClick={() => act({ kind: "product", id: row.slug, status: "approved" })}
              >
                {t.approve}
              </button>
              <button
                type="button"
                className={btnGhost}
                onClick={() => act({ kind: "product", id: row.slug, status: "removed" })}
              >
                {t.reject}
              </button>
            </Row>
          ))}
        </Section>
        <Section title={t.offers}>
          {market.pendingOffers.map((row) => (
            <Row key={row.id} label={`${row.nameKu} · ${iqd(row.price + row.shipping)}`}>
              <button
                type="button"
                className={btnPrimary}
                onClick={() => act({ kind: "offer", id: row.id, status: "approved" })}
              >
                {t.approve}
              </button>
              <button
                type="button"
                className={btnGhost}
                onClick={() => act({ kind: "offer", id: row.id, status: "removed" })}
              >
                {t.reject}
              </button>
            </Row>
          ))}
        </Section>
        <Section title={t.report}>
          {market.openReports.map((row) => (
            <p key={row.id} className="break-words text-sm">
              {row.subject} — {row.body}
            </p>
          ))}
        </Section>
        <Section title={t.complianceTitle}>
          <div>
            <button type="button" className={btnPrimary} disabled={scanning} onClick={runScan}>
              {t.complianceRun}
            </button>
          </div>
          {scan && "error" in scan ? <p className="text-sm text-muted">{t.forbidden}</p> : null}
          {scan && !("error" in scan) ? (
            <div className="flex flex-col gap-2 text-sm" dir="auto">
              <p dir="ltr" className="text-muted">
                {scan.at} · products {scan.scanned.products} · reviews {scan.scanned.reviews} ·
                offers {scan.scanned.offers} · roles {scan.scanned.roles}
              </p>
              {scan.blocked.length + scan.review.length === 0 ? <p>{t.complianceNone}</p> : null}
              {(
                [
                  ["blocked", t.complianceBlocked],
                  ["review", t.complianceReview],
                ] as const
              ).map(([key, title]) =>
                scan[key].length ? (
                  <div key={key} className="flex flex-col gap-1">
                    <h3 className="font-bold">
                      {title} ({scan[key].length})
                    </h3>
                    {scan[key].map((item) => (
                      <p key={item.table + item.id} className="break-words">
                        {item.table} · {item.label} ·{" "}
                        {[...new Set(item.matches.map((m) => `${m.category}: ${m.keyword}`))].join(
                          ", ",
                        )}
                      </p>
                    ))}
                  </div>
                ) : null,
              )}
            </div>
          ) : null}
        </Section>
        <StaffRequestList initial={initial.orders} />
      </div>
    </Shell>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xl leading-tight font-bold">{title}</h2>
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
