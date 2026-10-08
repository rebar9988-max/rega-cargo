import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { btnPrimary, controlClass } from "@/components/field";
import { useI18n } from "@/lib/i18n";
import { phoneBegin, phoneCheck, phoneEnter, phoneJoin, phoneLeave, phoneWho } from "@/lib/phone/api";
import { COUNTRIES, flag, type PhoneCountry } from "@/lib/phone/format";

const copy = {
  ckb: {
    in: "ژوورەوە",
    out: "دەرچوون",
    title: "بە ژمارەی تەلەفۆن",
    lede: "کۆدی وڵات هەڵبژێرە. کۆدەکە دەچێت بۆ واتسئەپ و بۆ سیمەکەت.",
    both: "کۆدەکە بۆ واتسئەپ و بۆ سیمەکەت نێردرا.",
    waOnly: "تەنها واتسئەپ گەیشت. کورتەنامەکە نەچوو.",
    smsOnly: "تەنها کورتەنامە بۆ سیمەکەت چوو. واتسئەپ نەگەیشت.",
    offline: "هێڵی واتسئەپ و کورتەنامە هێشتا نەبەستراون، بۆیە کۆدەکە خۆت دادەنێیت.",
    country: "وڵات",
    search: "گەڕان بە وڵات یان کۆد",
    number: "ژمارە",
    next: "بەردەوامبە",
    name: "ناو",
    pin: "کۆدی چوار ژمارە",
    join: "تۆمارکردن",
    enter: "هاتنەژوورەوە",
    back: "گەڕانەوە",
    phone: "ئەم ژمارەیە دروست نییە.",
    rate: "زۆر هەوڵدرا. کەمێک بوەستە.",
    wrong: "کۆدەکە هەڵەیە.",
    invalid: "ناو و کۆدی چوار ژمارە پێویستە.",
    exists: "ئەم ژمارەیە تۆمارکراوە.",
  },
  en: {
    in: "Enter",
    out: "Sign out",
    title: "With your phone",
    lede: "Pick a country code. The code is sent on WhatsApp and as a text to the SIM.",
    both: "The code was sent on WhatsApp and to the SIM.",
    waOnly: "Only WhatsApp went through. The text did not.",
    smsOnly: "Only the SIM text went through. WhatsApp did not.",
    offline: "WhatsApp and SMS are not connected yet, so you choose the code yourself.",
    country: "Country",
    search: "Search a country or code",
    number: "Number",
    next: "Continue",
    name: "Name",
    pin: "Four-digit code",
    join: "Create account",
    enter: "Enter",
    back: "Back",
    phone: "That number is not valid.",
    rate: "Too many tries. Wait a little.",
    wrong: "That code is wrong.",
    invalid: "A name and a four-digit code are required.",
    exists: "This number is already registered.",
  },
};

type PhoneCopy = { [K in keyof typeof copy.en]: string };

export function PhoneButton() {
  const { lang } = useI18n();
  const t = lang === "ckb" ? copy.ckb : copy.en;
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    void phoneWho().then((user) => setMe(user));
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 max-w-28 items-center truncate rounded-full border border-line px-3 text-sm"
      >
        {me ? me.name : t.in}
      </button>
      {open ? (
        <PhoneDialog
          t={t}
          me={me}
          onClose={() => setOpen(false)}
          onUser={(user) => {
            setMe(user);
            setOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function PhoneDialog({
  t,
  me,
  onClose,
  onUser,
}: {
  t: PhoneCopy;
  me: { name: string; phone: string } | null;
  onClose: () => void;
  onUser: (user: { name: string; phone: string } | null) => void;
}) {
  const [country, setCountry] = useState<PhoneCountry>(COUNTRIES[0]);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const [national, setNational] = useState("");
  const [exists, setExists] = useState<boolean | null>(null);
  const [channels, setChannels] = useState<{ whatsapp: boolean; sms: boolean } | null>(null);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((item) => `${item.name} ${item.local} ${item.dial} ${item.iso}`.toLowerCase().includes(q));
  }, [query]);

  async function begin() {
    setBusy(true);
    setError("");
    const result = await phoneBegin({ data: { dial: country.dial, national } });
    setBusy(false);
    if ("error" in result && result.error) {
      setError(t[result.error as "phone"] ?? t.phone);
      return;
    }
    if ("exists" in result) {
      setExists(result.exists);
      setChannels(result.sent ? { whatsapp: result.whatsapp, sms: result.sms } : null);
    }
  }

  async function finish() {
    setBusy(true);
    setError("");
    const result = channels
      ? await phoneCheck({ data: { dial: country.dial, national, pin, name } })
      : exists
        ? await phoneEnter({ data: { dial: country.dial, national, pin } })
        : await phoneJoin({ data: { dial: country.dial, national, name, pin } });
    setBusy(false);
    if ("error" in result && result.error) {
      setError(t[result.error as "wrong"] ?? t.invalid);
      return;
    }
    if ("name" in result && result.name && "phone" in result && result.phone) onUser({ name: result.name, phone: result.phone });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 md:items-center md:p-6" role="dialog" aria-modal="true">
      <div className="flex max-h-[94vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl md:rounded-3xl">
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <h2 className="text-3xl font-semibold tracking-tight">{me ? me.name : t.title}</h2>
          <button type="button" onClick={onClose} className="inline-flex size-10 items-center justify-center rounded-full border border-line" aria-label="close">
            <X className="size-4" />
          </button>
        </div>
        <p className="px-5 pt-2 text-sm leading-relaxed text-muted">{me ? <bdi dir="ltr">{me.phone}</bdi> : t.lede}</p>

        {me ? (
          <button
            type="button"
            className={`${btnPrimary} mt-6 w-full`}
            onClick={async () => {
              await phoneLeave();
              onUser(null);
            }}
          >
            {t.out}
          </button>
        ) : picking ? (
          <div className="mt-4 flex min-h-0 flex-1 flex-col border-t border-line">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.search}
              aria-label={t.search}
              className="h-12 w-full bg-transparent px-5 text-base outline-none"
            />
            <ul className="min-h-0 flex-1 overflow-auto">
              {matches.map((item) => (
                <li key={item.iso + item.dial}>
                  <button
                    type="button"
                    className="flex h-12 w-full items-center gap-3 px-5 text-start text-sm hover:bg-paper"
                    onClick={() => {
                      setCountry(item);
                      setPicking(false);
                    }}
                  >
                    <span>{flag(item.iso)}</span>
                    <span className="min-w-0 flex-1 truncate">{item.local}</span>
                    <bdi dir="ltr" className="text-muted">+{item.dial}</bdi>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : exists == null ? (
          <div className="flex flex-col gap-4 px-5 py-6">
            <label className="flex h-14 items-center rounded-2xl border border-line">
              <button type="button" onClick={() => setPicking(true)} className="flex h-full items-center gap-2 border-e border-line px-3">
                <span aria-hidden="true">{flag(country.iso)}</span>
                <bdi dir="ltr" className="font-medium">+{country.dial}</bdi>
              </button>
              <input
                value={national}
                onChange={(event) => setNational(event.target.value)}
                inputMode="tel"
                dir="ltr"
                autoComplete="tel-national"
                placeholder="7xx xxx xxxx"
                aria-label={t.number}
                className="h-full w-full bg-transparent px-3 text-lg outline-none"
              />
            </label>
            {error ? <p className="text-sm text-clay">{error}</p> : null}
            <button type="button" disabled={busy} onClick={() => void begin()} className={`${btnPrimary} h-12 w-full rounded-2xl`}>{t.next}</button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-3 px-5 py-6"
            onSubmit={(event) => {
              event.preventDefault();
              void finish();
            }}
          >
            <p className="text-sm text-muted">
              {channels ? (channels.whatsapp && channels.sms ? t.both : channels.whatsapp ? t.waOnly : t.smsOnly) : t.offline}
            </p>
            {!exists ? <input value={name} onChange={(event) => setName(event.target.value)} required placeholder={t.name} aria-label={t.name} className={controlClass} /> : null}
            <input
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              dir="ltr"
              autoComplete={exists ? "current-password" : "new-password"}
              placeholder={t.pin}
              aria-label={t.pin}
              className={`${controlClass} text-center font-sans text-2xl tracking-[0.4em]`}
            />
            {error ? <p className="text-sm text-clay">{error}</p> : null}
            <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>{exists ? t.enter : t.join}</button>
            <button type="button" className="text-sm text-muted" onClick={() => { setExists(null); setChannels(null); setError(""); }}>{t.back}</button>
          </form>
        )}
      </div>
    </div>
  );
}
