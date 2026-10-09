import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { UX_COPY } from "@/lib/ux-copy";
import { UserRound, X } from "lucide-react";
import { btnPrimary, controlClass } from "@/components/field";
import { useI18n } from "@/lib/i18n";
import { phoneBegin, phoneCheck, phoneLeave, phoneStatus, phoneWho } from "@/lib/phone/api";
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
    unavailable: "چوونەژوورەوە بە ژمارەی تەلەفۆن ئێستا بەردەست نییە. تکایە دواتر هەوڵ بدەرەوە.",
    country: "وڵات",
    search: "گەڕان بە وڵات یان کۆد",
    number: "ژمارە",
    next: "بەردەوامبە",
    name: "ناو",
    pin: "کۆدی شەش ژمارە",
    join: "تۆمارکردن",
    enter: "هاتنەژوورەوە",
    back: "گەڕانەوە",
    phone: "ئەم ژمارەیە دروست نییە.",
    rate: "زۆر هەوڵدرا. کەمێک بوەستە.",
    wrong: "کۆدەکە هەڵەیە.",
    invalid: "ناو و کۆدی شەش ژمارە پێویستە.",
    exists: "ئەم ژمارەیە تۆمارکراوە.",
  },
  fa: {
    in: "ورود",
    out: "خروج",
    title: "با شمارهٔ تلفن",
    lede: "کد کشور را انتخاب کن. کد از طریق واتس‌اپ و پیامک به سیم‌کارتت فرستاده می‌شود.",
    both: "کد از طریق واتس‌اپ و پیامک به سیم‌کارتت فرستاده شد.",
    waOnly: "فقط واتس‌اپ رسید. پیامک نرفت.",
    smsOnly: "فقط پیامک به سیم‌کارت رفت. واتس‌اپ نرسید.",
    unavailable: "ورود با تلفن موقتاً در دسترس نیست. لطفاً بعداً دوباره امتحان کن.",
    country: "کشور",
    search: "جستجوی کشور یا کد",
    number: "شماره",
    next: "ادامه",
    name: "نام",
    pin: "کد شش رقمی",
    join: "ساختن حساب",
    enter: "ورود",
    back: "بازگشت",
    phone: "این شماره معتبر نیست.",
    rate: "تلاش‌ها زیاد بود. کمی صبر کن.",
    wrong: "کد اشتباه است.",
    invalid: "نام و کد شش رقمی لازم است.",
    exists: "این شماره قبلاً ثبت شده است.",
  },
  // "ku" is Kurmancî (Badînî), Latin script — matching src/lib/messages/ku.ts and langs.ts.
  // Central Kurdish (Sorani, Arabic script) is "ckb" above, not "ku".
  ku: {
    in: "Têkeve",
    out: "Derkeve",
    title: "Bi hejmara telefonê",
    lede: "Koda welat hilbijêre. Kod bi WhatsAppê û wek peyamekê ji SIMa te re tê şandin.",
    both: "Kod bi WhatsAppê û bo SIMa te hate şandin.",
    waOnly: "Tenê WhatsApp gihîşt. Peyam neçû.",
    smsOnly: "Tenê peyama SIMê çû. WhatsApp negihîşt.",
    unavailable: "Têketina bi telefonê niha ne berdest e. Ji kerema xwe paşê dîsa biceribîne.",
    country: "Welat",
    search: "Li welatekî an kodekê bigere",
    number: "Hejmar",
    next: "Berdewam bike",
    name: "Nav",
    pin: "Koda şeş reqemî",
    join: "Hesabekî çêke",
    enter: "Têkeve",
    back: "Vegere",
    phone: "Ev hejmar ne rast e.",
    rate: "Gelek hewl hatin dan. Hinekî bisekine.",
    wrong: "Ev kod şaş e.",
    invalid: "Nav û koda çar reqemî pêwîst in.",
    exists: "Ev hejmar berê hatiye tomarkirin.",
  },
  de: {
    in: "Anmelden",
    out: "Abmelden",
    title: "Mit Ihrer Telefonnummer",
    lede: "Wählen Sie die Ländervorwahl. Der Code kommt per WhatsApp und als SMS auf die SIM.",
    both: "Der Code wurde per WhatsApp und als SMS an die SIM gesendet.",
    waOnly: "Nur WhatsApp ist angekommen. Die SMS nicht.",
    smsOnly: "Nur die SMS an die SIM ist angekommen. WhatsApp nicht.",
    unavailable:
      "Die Anmeldung per Telefon ist vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut.",
    country: "Land",
    search: "Land oder Vorwahl suchen",
    number: "Nummer",
    next: "Weiter",
    name: "Name",
    pin: "Sechsstelliger Code",
    join: "Konto erstellen",
    enter: "Anmelden",
    back: "Zurück",
    phone: "Diese Nummer ist ungültig.",
    rate: "Zu viele Versuche. Bitte kurz warten.",
    wrong: "Der Code ist falsch.",
    invalid: "Name und vierstelliger Code sind erforderlich.",
    exists: "Diese Nummer ist bereits registriert.",
  },
  ar: {
    in: "دخول",
    out: "خروج",
    title: "برقم الهاتف",
    lede: "اختر رمز البلد. يُرسل الرمز عبر واتساب وكرسالة نصية إلى شريحتك.",
    both: "أُرسل الرمز عبر واتساب وإلى شريحتك.",
    waOnly: "وصل واتساب فقط. لم تصل الرسالة النصية.",
    smsOnly: "وصلت الرسالة النصية إلى الشريحة فقط. لم يصل واتساب.",
    unavailable: "تسجيل الدخول بالهاتف غير متاح مؤقتًا. يرجى المحاولة لاحقًا.",
    country: "البلد",
    search: "ابحث عن بلد أو رمز",
    number: "الرقم",
    next: "متابعة",
    name: "الاسم",
    pin: "رمز من ستة أرقام",
    join: "إنشاء حساب",
    enter: "دخول",
    back: "رجوع",
    phone: "هذا الرقم غير صالح.",
    rate: "محاولات كثيرة. انتظر قليلًا.",
    wrong: "الرمز غير صحيح.",
    invalid: "الاسم ورمز من ستة أرقام مطلوبان.",
    exists: "هذا الرقم مسجل بالفعل.",
  },
  tr: {
    in: "Giriş",
    out: "Çıkış",
    title: "Telefon numaranla",
    lede: "Ülke kodunu seç. Kod WhatsApp'tan ve SIM'ine SMS olarak gönderilir.",
    both: "Kod WhatsApp'tan ve SIM'ine gönderildi.",
    waOnly: "Yalnızca WhatsApp ulaştı. SMS gitmedi.",
    smsOnly: "Yalnızca SIM'e SMS gitti. WhatsApp ulaşmadı.",
    unavailable: "Telefonla giriş geçici olarak kullanılamıyor. Lütfen daha sonra tekrar dene.",
    country: "Ülke",
    search: "Ülke veya kod ara",
    number: "Numara",
    next: "Devam",
    name: "Ad",
    pin: "Altı haneli kod",
    join: "Hesap oluştur",
    enter: "Giriş",
    back: "Geri",
    phone: "Bu numara geçerli değil.",
    rate: "Çok fazla deneme. Biraz bekle.",
    wrong: "Kod yanlış.",
    invalid: "Ad ve dört haneli kod gerekli.",
    exists: "Bu numara zaten kayıtlı.",
  },
  en: {
    in: "Enter",
    out: "Sign out",
    title: "With your phone",
    lede: "Pick a country code. The code is sent on WhatsApp and as a text to the SIM.",
    both: "The code was sent on WhatsApp and to the SIM.",
    waOnly: "Only WhatsApp went through. The text did not.",
    smsOnly: "Only the SIM text went through. WhatsApp did not.",
    unavailable: "Phone sign-in is temporarily unavailable. Please try again later.",
    country: "Country",
    search: "Search a country or code",
    number: "Number",
    next: "Continue",
    name: "Name",
    pin: "Six-digit code",
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

export function PhoneButton({
  variant = "pill",
  label,
  onUser: onUserChange,
}: {
  variant?: "pill" | "icon" | "block";
  label?: string;
  onUser?: (user: { name: string; phone: string } | null) => void;
} = {}) {
  const { lang } = useI18n();
  const t: PhoneCopy = copy[lang] ?? copy.en;
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    void phoneWho().then((user) => setMe(user));
  }, []);

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={label ?? t.in}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink hover:bg-paper md:hidden"
        >
          <UserRound className="size-5" aria-hidden="true" />
        </button>
      ) : variant === "block" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-pine px-4 text-sm font-semibold text-pine-ink"
        >
          <span className="truncate">{me ? me.name : t.in}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="hidden h-10 w-21 shrink-0 items-center md:inline-flex justify-center rounded-full border border-line px-2 text-sm"
        >
          <span className="truncate">{me ? me.name : t.in}</span>
        </button>
      )}
      {open ? (
        <PhoneDialog
          t={t}
          me={me}
          lang={lang}
          onClose={() => setOpen(false)}
          onUser={(user) => {
            setMe(user);
            setOpen(false);
            onUserChange?.(user);
          }}
        />
      ) : null}
    </>
  );
}

function PhoneDialog({
  t,
  lang,
  me,
  onClose,
  onUser,
}: {
  t: PhoneCopy;
  lang: keyof typeof UX_COPY;
  me: { name: string; phone: string } | null;
  onClose: () => void;
  onUser: (user: { name: string; phone: string } | null) => void;
}) {
  const [country, setCountry] = useState<PhoneCountry>(COUNTRIES[0]);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const [national, setNational] = useState("");
  const [sent, setSent] = useState(false);
  const [channels, setChannels] = useState<{ whatsapp: boolean; sms: boolean } | null>(null);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const closeLabel = UX_COPY[lang]?.close ?? UX_COPY.en.close;
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Modal behaviour: focus moves in, Tab stays inside, Escape closes, focus returns to the trigger.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])")];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, []);
  useEffect(() => {
    let live = true;
    phoneStatus()
      .then((status) => {
        if (live) setAvailable(status.available);
      })
      .catch(() => {
        if (live) setAvailable(false);
      });
    return () => {
      live = false;
    };
  }, []);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((item) =>
      `${item.name} ${item.local} ${item.dial} ${item.iso}`.toLowerCase().includes(q),
    );
  }, [query]);

  async function begin() {
    setBusy(true);
    setError("");
    const result = await phoneBegin({ data: { dial: country.dial, national } });
    setBusy(false);
    if ("error" in result && result.error) {
      setError(
        result.error === "unavailable" ? t.unavailable : (t[result.error as "phone"] ?? t.phone),
      );
      return;
    }
    if ("sent" in result && result.sent) {
      setSent(true);
      setChannels({ whatsapp: Boolean(result.whatsapp), sms: Boolean(result.sms) });
    } else {
      setError(t.unavailable);
    }
  }

  async function finish() {
    setBusy(true);
    setError("");
    if (!channels) {
      setBusy(false);
      setError(t.unavailable);
      return;
    }
    const result = await phoneCheck({ data: { dial: country.dial, national, pin, name } });
    setBusy(false);
    if ("error" in result && result.error) {
      setError(t[result.error as "wrong"] ?? t.invalid);
      return;
    }
    if ("name" in result && result.name && "phone" in result && result.phone)
      onUser({ name: result.name, phone: result.phone });
  }

  // Portal to <body>: inside the sticky header the sheet was painted under the bottom nav.
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 md:items-center md:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex max-h-[94vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-2xl outline-none md:rounded-3xl"
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <h2 id={titleId} className="text-2xl leading-tight font-bold tracking-tight">{me ? me.name : t.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line"
            aria-label={closeLabel}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        {me ? (
          <p className="px-5 pt-2 text-sm leading-relaxed text-muted">
            <bdi dir="ltr">{me.phone}</bdi>
          </p>
        ) : available === false ? null : (
          <p className="px-5 pt-2 text-sm leading-relaxed text-muted">{t.lede}</p>
        )}

        {me ? (
          <button
            type="button"
            className={`${btnPrimary} mt-6 w-full`}
            onClick={async () => {
              await phoneLeave();
              navigator.serviceWorker?.controller?.postMessage("rl-sign-out");
              onUser(null);
            }}
          >
            {t.out}
          </button>
        ) : available === false ? (
          <p role="status" className="px-5 py-6 text-sm leading-relaxed text-clay">
            {t.unavailable}
          </p>
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
                    <bdi dir="ltr" className="text-muted">
                      +{item.dial}
                    </bdi>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : !sent || !channels ? (
          <div className="flex flex-col gap-4 px-5 py-6">
            <label className="flex h-14 items-center rounded-2xl border border-line">
              <button
                type="button"
                onClick={() => setPicking(true)}
                className="flex h-full items-center gap-2 border-e border-line px-3"
              >
                <span aria-hidden="true">{flag(country.iso)}</span>
                <bdi dir="ltr" className="font-medium">
                  +{country.dial}
                </bdi>
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
            <button
              type="button"
              disabled={busy}
              onClick={() => void begin()}
              className={`${btnPrimary} h-12 w-full rounded-2xl`}
            >
              {t.next}
            </button>
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
              {channels.whatsapp && channels.sms
                ? t.both
                : channels.whatsapp
                  ? t.waOnly
                  : t.smsOnly}
            </p>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t.name}
              aria-label={t.name}
              className={controlClass}
            />
            <input
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              dir="ltr"
              autoComplete="one-time-code"
              placeholder={t.pin}
              aria-label={t.pin}
              className={`${controlClass} text-center font-sans text-2xl tracking-[0.4em]`}
            />
            {error ? <p className="text-sm text-clay">{error}</p> : null}
            <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
              {t.next}
            </button>
            <button
              type="button"
              className="text-sm text-muted"
              onClick={() => {
                setSent(false);
                setChannels(null);
                setError("");
              }}
            >
              {t.back}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
