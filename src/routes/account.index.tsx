import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { btnGhost, btnPrimary } from "@/components/field";
import { PageHeader, Shell } from "@/components/shell";
import { SignInGate } from "@/components/sign-in-gate";
import { SignOutButton } from "@/components/phone-gate";
import { IqdAmount, RequestHelp, StatusBadge } from "@/components/request-bits";
import { when } from "@/lib/requests/format";
import { useI18n } from "@/lib/i18n";
import { viewerState } from "@/lib/viewer/api";
import { REQUEST_COPY } from "@/lib/requests/copy";
import { requestMine } from "@/lib/requests/api";

export const Route = createFileRoute("/account/")({
  loader: async () => {
    const { state } = await viewerState();
    if (state !== "in") return { gate: state, list: null };
    return { gate: null, list: await requestMine() };
  },
  head: () =>
    seo({
      path: "/account",
      title: "داواکارییەکانم · R&L",
      description: "داواکارییەکانت، دۆخ و نرخی پشتڕاستکراوە.",
      noindex: true,
    }),
  component: AccountPage,
});

function AccountPage() {
  const data = Route.useLoaderData();
  const { lang } = useI18n();
  const t = REQUEST_COPY[lang];
  if (data.gate || !data.list) return <SignInGate state={data.gate ?? "out"} kicker={t.kicker} />;
  const list = data.list;
  return (
    <Shell>
      <PageHeader kicker={t.kicker} title={t.dashTitle} lede={t.dashLede} />
      <div className="page flex flex-col gap-6 py-10">
        <div className="flex flex-wrap gap-2">
          <Link to="/request" search={{ flow: "buy" }} className={btnPrimary}>
            {t.newBuy}
          </Link>
          <Link to="/request" search={{ flow: "forward" }} className={btnGhost}>
            {t.newForward}
          </Link>
          <SignOutButton className={`${btnGhost} ms-auto`} />
        </div>
        {"error" in list ? (
          <p role="alert" className="text-sm text-clay">
            {t.err[String(list.error)] ?? t.err.unavailable}
          </p>
        ) : list.requests.length === 0 ? (
          <p className="rounded-2xl border border-line bg-surface p-6 text-sm text-muted">
            {t.empty}
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {list.requests.map((row) => (
              <li key={row.ref}>
                <Link
                  to="/account/$ref"
                  params={{ ref: row.ref }}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-pine"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <bdi dir="ltr" className="font-bold tabular-nums">
                      {row.ref}
                    </bdi>
                    <StatusBadge status={row.status} t={t} />
                  </div>
                  <p className="text-sm text-muted">
                    {t.kinds[row.kind] ?? row.kind} · <bdi dir="ltr">{when(row.at, false)}</bdi>
                  </p>
                  {row.title ? (
                    <p dir="auto" className="line-clamp-2 break-words text-sm">
                      {row.title}
                    </p>
                  ) : null}
                  <p className="text-sm">
                    {row.quote ? (
                      <>
                        <span className="text-muted">{t.quote}: </span>
                        <IqdAmount value={row.quote.amountIqd} /> ·{" "}
                        {row.quote.customsIncluded ? t.customsIn : t.customsOut}
                      </>
                    ) : (
                      <span className="text-muted">{t.noQuote}</span>
                    )}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <RequestHelp t={t} />
      </div>
    </Shell>
  );
}
