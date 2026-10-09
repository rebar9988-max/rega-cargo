import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useState } from "react";
import { btnPrimary, controlClass, Field } from "@/components/field";
import { PageHeader, Shell } from "@/components/shell";
import { SignInGate } from "@/components/sign-in-gate";
import { useI18n } from "@/lib/i18n";
import { viewerState } from "@/lib/viewer/api";
import { iqd, marketCopy } from "@/lib/market-copy";
import { marketMe, marketMine, marketRole, marketSaveOffer, marketSaveProduct } from "@/lib/market/api";

export const Route = createFileRoute("/market/sell")({
  loader: async () => {
    const { state } = await viewerState();
    if (state !== "in") return { gate: state };
    const [me, mine] = await Promise.all([marketMe(), marketMine()]);
    return { gate: null, me, mine };
  },
  head: () =>
    seo({
      path: "/market/sell",
      title: "فرۆشتن · R&L",
      description: "فرۆشتن لە بازاڕی R&L.",
      noindex: true,
    }),
  component: SellPage,
});

function SellPage() {
  const data = Route.useLoaderData();
  const { lang } = useI18n();
  const t = marketCopy(lang);
  if (data.gate) return <SignInGate state={data.gate} kicker={t.marketKicker} />;
  return <SellSignedIn initial={data} />;
}

function SellSignedIn({
  initial,
}: {
  initial: { me: Awaited<ReturnType<typeof marketMe>>; mine: Awaited<ReturnType<typeof marketMine>> };
}) {
  const { lang } = useI18n();
  const t = marketCopy(lang);
  const [message, setMessage] = useState("");
  const [mine, setMine] = useState(initial.mine);
  const seller = initial.me.roles.some((role) => role.role === "seller" && role.status === "approved");
  async function refresh() {
    setMine(await marketMine());
  }
  return (
    <Shell>
      <PageHeader kicker={t.marketKicker} title={t.sell} lede={t.marketLede} />
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10">
        {initial.me.notes.length > 0 ? (
          <ul className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4 text-sm">
            {initial.me.notes.map((note) => (
              <li key={note.id}>{lang === "ckb" ? note.bodyKu : note.bodyEn}</li>
            ))}
          </ul>
        ) : null}
        {!seller ? (
          <form
            className="flex flex-col gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const result = await marketRole({ data: { role: "seller", displayName: form.get("name"), city: form.get("city"), phone: form.get("phone") } });
              setMessage("error" in result ? t[result.error as "invalid"] ?? t.invalid : t.pending);
            }}
          >
            <h2 className="text-xl font-semibold">{t.roleSeller}</h2>
            <Field label={t.name}><input name="name" required className={controlClass} /></Field>
            <Field label={t.city}><input name="city" required className={controlClass} /></Field>
            <Field label={t.phone}><input name="phone" dir="ltr" className={controlClass} /></Field>
            <button className={btnPrimary} type="submit">{t.send}</button>
          </form>
        ) : (
          <>
            <form
              className="grid gap-3"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const result = await marketSaveProduct({
                  data: {
                    nameKu: form.get("nameKu"),
                    nameEn: form.get("nameEn"),
                    brand: form.get("brand"),
                    category: form.get("category"),
                    description: form.get("description"),
                    specs: form.get("specs"),
                    image: form.get("image"),
                    price: Number(form.get("price")),
                    shipping: Number(form.get("shipping") || 0),
                    stock: form.get("stock"),
                    contact: form.get("contact"),
                  },
                });
                setMessage("error" in result ? t[result.error as "invalid"] ?? t.invalid : t.pending);
                if (!("error" in result)) void refresh();
              }}
            >
              <Field label={t.nameKu}><input name="nameKu" required className={controlClass} /></Field>
              <Field label={t.nameEn}><input name="nameEn" required dir="ltr" className={controlClass} /></Field>
              <Field label={t.brand}><input name="brand" required className={controlClass} /></Field>
              <Field label={t.category}>
                <select name="category" className={controlClass}>
                  {["electronics", "home", "beauty", "fashion", "baby", "sports"].map((id) => <option key={id} value={id}>{id}</option>)}
                </select>
              </Field>
              <Field label={t.body}><textarea name="description" className={`${controlClass} h-24 py-3`} /></Field>
              <Field label={t.specs}><input name="specs" className={controlClass} /></Field>
              <Field label="Image">
                <select name="image" className={controlClass}>
                  <option value="">—</option>
                  {["earbuds", "kettle", "cream", "sneakers", "perfume", "ball", "baby", "dress"].map((name) => (
                    <option key={name} value={`/bazaar/${name}.jpg`}>{name}</option>
                  ))}
                </select>
              </Field>
              <Field label={t.price}><input name="price" required dir="ltr" inputMode="numeric" className={controlClass} /></Field>
              <Field label={t.shipping}><input name="shipping" dir="ltr" inputMode="numeric" defaultValue={0} className={controlClass} /></Field>
              <Field label={t.stock}>
                <select name="stock" className={controlClass}><option value="in">in</option><option value="low">low</option><option value="out">out</option></select>
              </Field>
              <Field label={t.contact}><input name="contact" required dir="ltr" className={controlClass} /></Field>
              <button className={btnPrimary} type="submit">{t.add}</button>
            </form>
            <form
              className="grid gap-3 rounded-2xl border border-line p-4"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const result = await marketSaveOffer({
                  data: {
                    slug: form.get("slug"),
                    price: Number(form.get("price")),
                    shipping: Number(form.get("shipping") || 0),
                    stock: form.get("stock"),
                    contact: form.get("contact"),
                  },
                });
                setMessage("error" in result ? t[result.error as "invalid"] ?? t.invalid : t.saved);
                if (!("error" in result)) void refresh();
              }}
            >
              <h2 className="text-lg font-semibold">{t.offers}</h2>
              <Field label="slug"><input name="slug" required dir="ltr" className={controlClass} /></Field>
              <Field label={t.price}><input name="price" required dir="ltr" inputMode="numeric" className={controlClass} /></Field>
              <Field label={t.shipping}><input name="shipping" dir="ltr" inputMode="numeric" defaultValue={0} className={controlClass} /></Field>
              <Field label={t.stock}><select name="stock" className={controlClass}><option value="in">in</option><option value="low">low</option><option value="out">out</option></select></Field>
              <Field label={t.contact}><input name="contact" required dir="ltr" className={controlClass} /></Field>
              <button className={btnPrimary} type="submit">{t.save}</button>
            </form>
          </>
        )}
        <ul className="flex flex-col gap-2 text-sm">
          {mine.map((row) => (
            <li key={row.slug + row.contact} className="rounded-xl border border-line p-3">
              {lang === "ckb" ? row.nameKu : row.nameEn} · <bdi dir="ltr">{iqd(row.price + row.shipping)}</bdi>
              <span className="text-muted"> · {row.productStatus} / {row.offerStatus}</span>
            </li>
          ))}
        </ul>
        {message ? <p className="text-sm text-clay">{message}</p> : null}
      </div>
    </Shell>
  );
}
