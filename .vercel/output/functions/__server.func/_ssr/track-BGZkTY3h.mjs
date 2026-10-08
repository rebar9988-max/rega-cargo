import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as controlClass, f as useI18n, s as btnPrimary } from "./field-ClBf72CX.mjs";
import { s as Route$5 } from "./router-D3fYEic-.mjs";
import { n as Shell, t as PageHeader } from "./shell-CA276dc0.mjs";
import { d as getDest, m as placeName, p as getOrigin } from "./corridor-DVUWnWo4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/track-BGZkTY3h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LINE = {
	Collected: {
		ku: "Hat berhevkirin",
		de: "Abgeholt",
		ar: "تم الاستلام",
		fa: "جمع شد",
		tr: "Teslim alındı"
	},
	"Hub scan": {
		ku: "Skana komê",
		de: "Hub-Scan",
		ar: "مسح المستودع",
		fa: "اسکن انبار",
		tr: "Depo taraması"
	},
	"Departed by air": {
		ku: "Bi esmanî derket",
		de: "Per Luft abgegangen",
		ar: "غادر جواً",
		fa: "هوایی حرکت کرد",
		tr: "Hava yoluyla çıktı"
	},
	"Arrived at the gateway": {
		ku: "Gihîşt deriyê",
		de: "Am Gateway angekommen",
		ar: "وصل إلى البوابة",
		fa: "به دروازه رسید",
		tr: "Kapıya vardı"
	},
	"Clearance released": {
		ku: "Gumrik hat berdan",
		de: "Verzollung freigegeben",
		ar: "أُفرج عنه جمركياً",
		fa: "ترخیص شد",
		tr: "Gümrük bırakıldı"
	},
	"Out for delivery": {
		ku: "Ji bo gihandinê derket",
		de: "In Zustellung",
		ar: "خرج للتسليم",
		fa: "برای تحویل خارج شد",
		tr: "Dağıtıma çıktı"
	},
	Delivered: {
		ku: "Gihîşt",
		de: "Zugestellt",
		ar: "تم التسليم",
		fa: "تحویل شد",
		tr: "Teslim edildi"
	},
	"Clearance paused — invoice name does not match": {
		ku: "Gumrik sekinî — navê fatûreyê li gel wergir nagire",
		de: "Verzollung pausiert — Rechnungsname stimmt nicht",
		ar: "الجمارك متوقفة — اسم الفاتورة لا يطابق المستلم",
		fa: "ترخیص متوقف شد — نام فاکتور با گیرنده یکی نیست",
		tr: "Gümrük durdu — fatura adı alıcıyla uyuşmuyor"
	},
	"Transfer to Sulaymaniyah": {
		ku: "Veguhestin bo Silêmaniyê",
		de: "Weiter nach Sulaimaniyya",
		ar: "نقل إلى السليمانية",
		fa: "انتقال به سلیمانیه",
		tr: "Süleymaniye aktarması"
	},
	"Door delivery": {
		ku: "Gihandina ber derî",
		de: "Zustellung an die Tür",
		ar: "تسليم إلى الباب",
		fa: "تحویل درب",
		tr: "Kapıya teslim"
	},
	"Departed by road": {
		ku: "Bi rê derket",
		de: "Auf der Straße abgegangen",
		ar: "غادر براً",
		fa: "زمینی حرکت کرد",
		tr: "Karayoluyla çıktı"
	},
	"At the border": {
		ku: "Li ser sînor",
		de: "An der Grenze",
		ar: "عند الحدود",
		fa: "در مرز",
		tr: "Sınırda"
	},
	"Erbil gateway": {
		ku: "Deriyê Hewlêrê",
		de: "Gateway Erbil",
		ar: "بوابة أربيل",
		fa: "دروازه اربیل",
		tr: "Erbil kapısı"
	},
	Transferred: {
		ku: "Hat veguhestin",
		de: "Weitergeleitet",
		ar: "تم التحويل",
		fa: "منتقل شد",
		tr: "Aktarıldı"
	},
	Berlin: {
		ku: "Berlîn",
		de: "Berlin",
		ar: "برلين",
		fa: "برلین",
		tr: "Berlin"
	},
	Düsseldorf: {
		ku: "Düsseldorf",
		de: "Düsseldorf",
		ar: "دوسلدورف",
		fa: "دوسلدورف",
		tr: "Düsseldorf"
	},
	Frankfurt: {
		ku: "Frankfurt",
		de: "Frankfurt",
		ar: "فرانكفورت",
		fa: "فرانکفورت",
		tr: "Frankfurt"
	},
	Erbil: {
		ku: "Hewlêr",
		de: "Erbil",
		ar: "أربيل",
		fa: "اربیل",
		tr: "Erbil"
	},
	"Erbil door": {
		ku: "Deriyê mala Hewlêrê",
		de: "Tür in Erbil",
		ar: "باب أربيل",
		fa: "درب اربیل",
		tr: "Erbil kapısı"
	},
	Stockholm: {
		ku: "Stockholm",
		de: "Stockholm",
		ar: "ستوكهولم",
		fa: "استکهلم",
		tr: "Stokholm"
	},
	Sulaymaniyah: {
		ku: "Silêmanî",
		de: "Sulaimaniyya",
		ar: "السليمانية",
		fa: "سلیمانیه",
		tr: "Süleymaniye"
	},
	"Erbil desk": {
		ku: "Masa Hewlêrê",
		de: "Schalter Erbil",
		ar: "مكتب أربيل",
		fa: "میز اربیل",
		tr: "Erbil masası"
	},
	Amsterdam: {
		ku: "Amsterdam",
		de: "Amsterdam",
		ar: "أمستردام",
		fa: "آمستردام",
		tr: "Amsterdam"
	},
	"Ibrahim Khalil": {
		ku: "Îbrahîm Xelîl",
		de: "Ibrahim Khalil",
		ar: "إبراهيم الخليل",
		fa: "ابراهیم خلیل",
		tr: "İbrahim Halil"
	},
	Duhok: {
		ku: "Dihok",
		de: "Duhok",
		ar: "دهوك",
		fa: "دهوک",
		tr: "Duhok"
	},
	London: {
		ku: "London",
		de: "London",
		ar: "لندن",
		fa: "لندن",
		tr: "Londra"
	},
	"London desk": {
		ku: "Masa Londonê",
		de: "Schalter London",
		ar: "مكتب لندن",
		fa: "میز لندن",
		tr: "Londra masası"
	},
	"Baghdad desk": {
		ku: "Masa Bexdayê",
		de: "Schalter Bagdad",
		ar: "مكتب بغداد",
		fa: "میز بغداد",
		tr: "Bağdat masası"
	},
	Baghdad: {
		ku: "Bexda",
		de: "Bagdad",
		ar: "بغداد",
		fa: "بغداد",
		tr: "Bağdat"
	},
	"Düsseldorf hub": {
		ku: "Koma Düsseldorfê",
		de: "Hub Düsseldorf",
		ar: "مستودع دوسلدورف",
		fa: "انبار دوسلدورف",
		tr: "Düsseldorf deposu"
	},
	"After release": {
		ku: "Piştî berdanê",
		de: "Nach der Freigabe",
		ar: "بعد الإفراج",
		fa: "پس از ترخیص",
		tr: "Serbest bırakmadan sonra"
	},
	"Same day as transfer": {
		ku: "Heman roja veguhestinê",
		de: "Am Tag der Weiterleitung",
		ar: "في يوم النقل نفسه",
		fa: "همان روز انتقال",
		tr: "Aktarma günü"
	},
	"After the border": {
		ku: "Piştî sînor",
		de: "Nach der Grenze",
		ar: "بعد الحدود",
		fa: "پس از مرز",
		tr: "Sınırdan sonra"
	},
	"Next morning": {
		ku: "Sibehê din",
		de: "Am nächsten Morgen",
		ar: "صباح اليوم التالي",
		fa: "صبح روز بعد",
		tr: "Ertesi sabah"
	}
};
var MONTH = {
	Sep: {
		ku: "Îlon",
		de: "Sep.",
		ar: "أيلول",
		fa: "سپتامبر",
		tr: "Eyl"
	},
	Oct: {
		ku: "Cot",
		de: "Okt.",
		ar: "تشرين الأول",
		fa: "اکتبر",
		tr: "Eki"
	}
};
function localizedTrack(lang, english, sorani) {
	if (lang === "ckb") return sorani;
	if (lang === "en") return english;
	const mapped = LINE[english]?.[lang];
	if (mapped) return mapped;
	return english.replace(/\b(Sep|Oct)\b/g, (month) => MONTH[month]?.[lang] ?? month);
}
var SHIPMENTS = [
	{
		id: "RG-48291",
		fromId: "ber",
		toId: "ebl",
		mode: "express",
		pieces: 2,
		kg: 6.4,
		l: 50,
		w: 40,
		h: 30,
		contents: "personal",
		photo: true,
		hub: "Düsseldorf hub",
		hubKu: "کۆگای دوسلدۆرف",
		events: [
			{
				title: "Collected",
				titleKu: "کۆکرایەوە",
				place: "Berlin",
				placeKu: "بەرلین",
				at: "04 Oct · 09:40",
				atKu: "04 تشرینی یەکەم · 09:40",
				phase: "done"
			},
			{
				title: "Hub scan",
				titleKu: "سکانی کۆگا",
				place: "Düsseldorf",
				placeKu: "دوسلدۆرف",
				at: "04 Oct · 18:05",
				atKu: "04 تشرینی یەکەم · 18:05",
				phase: "done"
			},
			{
				title: "Departed by air",
				titleKu: "بە ئاسمان ڕۆیشت",
				place: "Frankfurt",
				placeKu: "فرانکفورت",
				at: "06 Oct · 01:10",
				atKu: "06 تشرینی یەکەم · 01:10",
				phase: "done"
			},
			{
				title: "Arrived at the gateway",
				titleKu: "گەیشتە دەروازە",
				place: "Erbil",
				placeKu: "هەولێر",
				at: "07 Oct · 23:40",
				atKu: "07 تشرینی یەکەم · 23:40",
				phase: "done"
			},
			{
				title: "Clearance released",
				titleKu: "گومرگ ئازاد کرا",
				place: "Erbil gateway",
				placeKu: "دەروازەی هەولێر",
				at: "08 Oct · 08:20",
				atKu: "08 تشرینی یەکەم · 08:20",
				phase: "done"
			},
			{
				title: "Out for delivery",
				titleKu: "دەرچووە بۆ گەیاندن",
				place: "Erbil",
				placeKu: "هەولێر",
				at: "08 Oct · 11:30",
				atKu: "08 تشرینی یەکەم · 11:30",
				phase: "now"
			},
			{
				title: "Delivered",
				titleKu: "گەیشت",
				place: "Erbil door",
				placeKu: "دەرگای هەولێر",
				at: "08 Oct",
				atKu: "08 تشرینی یەکەم",
				phase: "next"
			}
		]
	},
	{
		id: "RG-22910",
		fromId: "sto",
		toId: "sul",
		mode: "economy",
		pieces: 1,
		kg: 8.1,
		l: 60,
		w: 40,
		h: 35,
		contents: "commercial",
		photo: true,
		hub: "Düsseldorf hub",
		hubKu: "کۆگای دوسلدۆرف",
		events: [
			{
				title: "Collected",
				titleKu: "کۆکرایەوە",
				place: "Stockholm",
				placeKu: "ستۆکهۆڵم",
				at: "02 Oct · 14:15",
				atKu: "02 تشرینی یەکەم · 14:15",
				phase: "done"
			},
			{
				title: "Hub scan",
				titleKu: "سکانی کۆگا",
				place: "Düsseldorf",
				placeKu: "دوسلدۆرف",
				at: "03 Oct · 11:00",
				atKu: "03 تشرینی یەکەم · 11:00",
				phase: "done"
			},
			{
				title: "Departed by air",
				titleKu: "بە ئاسمان ڕۆیشت",
				place: "Frankfurt",
				placeKu: "فرانکفورت",
				at: "05 Oct · 22:40",
				atKu: "05 تشرینی یەکەم · 22:40",
				phase: "done"
			},
			{
				title: "Arrived at the gateway",
				titleKu: "گەیشتە دەروازە",
				place: "Erbil",
				placeKu: "هەولێر",
				at: "07 Oct · 19:05",
				atKu: "07 تشرینی یەکەم · 19:05",
				phase: "done"
			},
			{
				title: "Clearance paused — invoice name does not match",
				titleKu: "گومرگ وەستا — ناوی پسوولە لەگەڵ وەرگر یەک ناگرێتەوە",
				place: "Erbil gateway",
				placeKu: "دەروازەی هەولێر",
				at: "08 Oct · 10:10",
				atKu: "08 تشرینی یەکەم · 10:10",
				phase: "now"
			},
			{
				title: "Transfer to Sulaymaniyah",
				titleKu: "گواستنەوە بۆ سلێمانی",
				place: "Erbil desk",
				placeKu: "مێزی هەولێر",
				at: "After release",
				atKu: "دوای ئازادکردن",
				phase: "next"
			},
			{
				title: "Door delivery",
				titleKu: "گەیاندن بۆ دەرگا",
				place: "Sulaymaniyah",
				placeKu: "سلێمانی",
				at: "Same day as transfer",
				atKu: "هەمان ڕۆژی گواستنەوە",
				phase: "next"
			}
		]
	},
	{
		id: "RG-11084",
		fromId: "ams",
		toId: "dhk",
		mode: "road",
		pieces: 3,
		kg: 42,
		l: 80,
		w: 60,
		h: 50,
		contents: "commercial",
		photo: true,
		hub: "Düsseldorf hub",
		hubKu: "کۆگای دوسلدۆرف",
		events: [
			{
				title: "Collected",
				titleKu: "کۆکرایەوە",
				place: "Amsterdam",
				placeKu: "ئەمستردام",
				at: "24 Sep · 16:20",
				atKu: "24 ئەیلوول · 16:20",
				phase: "done"
			},
			{
				title: "Hub scan",
				titleKu: "سکانی کۆگا",
				place: "Düsseldorf",
				placeKu: "دوسلدۆرف",
				at: "25 Sep · 09:30",
				atKu: "25 ئەیلوول · 09:30",
				phase: "done"
			},
			{
				title: "Departed by road",
				titleKu: "بە وشکانی ڕۆیشت",
				place: "Düsseldorf",
				placeKu: "دوسلدۆرف",
				at: "27 Sep · 06:00",
				atKu: "27 ئەیلوول · 06:00",
				phase: "done"
			},
			{
				title: "At the border",
				titleKu: "لە سنوور",
				place: "Ibrahim Khalil",
				placeKu: "ئیبراهیم خەلیل",
				at: "08 Oct · 07:50",
				atKu: "08 تشرینی یەکەم · 07:50",
				phase: "now"
			},
			{
				title: "Erbil gateway",
				titleKu: "دەروازەی هەولێر",
				place: "Erbil",
				placeKu: "هەولێر",
				at: "After the border",
				atKu: "دوای سنوور",
				phase: "next"
			},
			{
				title: "Door delivery",
				titleKu: "گەیاندن بۆ دەرگا",
				place: "Duhok",
				placeKu: "دهۆک",
				at: "Next morning",
				atKu: "بەیانیی دواتر",
				phase: "next"
			}
		]
	},
	{
		id: "RG-77302",
		fromId: "lon",
		toId: "bgw",
		mode: "express",
		pieces: 1,
		kg: 2.2,
		l: 35,
		w: 25,
		h: 12,
		contents: "documents",
		photo: true,
		hub: "London desk",
		hubKu: "مێزی لەندەن",
		events: [
			{
				title: "Collected",
				titleKu: "کۆکرایەوە",
				place: "London",
				placeKu: "لەندەن",
				at: "28 Sep · 11:05",
				atKu: "28 ئەیلوول · 11:05",
				phase: "done"
			},
			{
				title: "Hub scan",
				titleKu: "سکانی کۆگا",
				place: "London desk",
				placeKu: "مێزی لەندەن",
				at: "28 Sep · 15:40",
				atKu: "28 ئەیلوول · 15:40",
				phase: "done"
			},
			{
				title: "Departed by air",
				titleKu: "بە ئاسمان ڕۆیشت",
				place: "London",
				placeKu: "لەندەن",
				at: "30 Sep · 21:15",
				atKu: "30 ئەیلوول · 21:15",
				phase: "done"
			},
			{
				title: "Arrived at the gateway",
				titleKu: "گەیشتە دەروازە",
				place: "Erbil",
				placeKu: "هەولێر",
				at: "02 Oct · 18:25",
				atKu: "02 تشرینی یەکەم · 18:25",
				phase: "done"
			},
			{
				title: "Clearance released",
				titleKu: "گومرگ ئازاد کرا",
				place: "Erbil gateway",
				placeKu: "دەروازەی هەولێر",
				at: "02 Oct · 20:10",
				atKu: "02 تشرینی یەکەم · 20:10",
				phase: "done"
			},
			{
				title: "Transferred",
				titleKu: "گواسترایەوە",
				place: "Baghdad desk",
				placeKu: "مێزی بەغدا",
				at: "03 Oct · 09:00",
				atKu: "03 تشرینی یەکەم · 09:00",
				phase: "done"
			},
			{
				title: "Delivered",
				titleKu: "گەیشت",
				place: "Baghdad",
				placeKu: "بەغدا",
				at: "03 Oct · 16:05",
				atKu: "03 تشرینی یەکەم · 16:05",
				phase: "now"
			}
		]
	}
];
function findShipment(id) {
	const key = id.trim().toUpperCase();
	return SHIPMENTS.find((item) => item.id === key);
}
function currentEvent(shipment) {
	return shipment.events.find((event) => event.phase === "now") ?? shipment.events[shipment.events.length - 1];
}
function TrackPage() {
	const { t, lang } = useI18n();
	const { id } = Route$5.useSearch();
	const navigate = useNavigate();
	const [draft, setDraft] = (0, import_react.useState)(id ?? "");
	(0, import_react.useEffect)(() => {
		setDraft(id ?? "");
	}, [id]);
	const shipment = id ? findShipment(id) : void 0;
	const missing = Boolean(id) && !shipment;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: t.trackKicker,
		title: t.trackTitle,
		lede: t.trackLede
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-6xl flex-col gap-10 px-5 py-12 md:py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3 sm:flex-row",
				onSubmit: (event) => {
					event.preventDefault();
					navigate({
						to: "/track",
						search: { id: draft.trim().toUpperCase() }
					});
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-w-0 flex-1 flex-col gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: t.trackLabel
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						dir: "ltr",
						value: draft,
						onChange: (event) => setDraft(event.target.value),
						placeholder: "RG-48291",
						autoCapitalize: "characters"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: `${btnPrimary} sm:self-end`,
					children: t.trackButton
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: t.samples
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: SHIPMENTS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void navigate({
						to: "/track",
						search: { id: item.id }
					}),
					className: `h-12 rounded-full border px-4 text-sm ${item.id === shipment?.id ? "border-pine bg-pine text-pine-ink" : "border-line bg-surface"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
						dir: "ltr",
						children: item.id
					})
				}, item.id))
			})] }),
			missing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-clay",
				children: t.notFound
			}) : null,
			shipment ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "grid gap-8 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 lg:col-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-pine",
							children: currentEvent(shipment).phase === "next" ? t.expected : t.nowLabel
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 text-3xl font-semibold tracking-tight",
							children: localizedTrack(lang, currentEvent(shipment).title, currentEvent(shipment).titleKu)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
									dir: "ltr",
									className: "font-medium text-ink",
									children: shipment.id
								}),
								" · ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bdi", {
									dir: "ltr",
									children: [
										placeName(getOrigin(shipment.fromId), lang),
										" → ",
										placeName(getDest(shipment.toId), lang)
									]
								}),
								" · ",
								t.modes[shipment.mode].name,
								" · ",
								t.contentsOpt[shipment.contents]
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-8",
							children: shipment.events.map((event, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "grid grid-cols-[1.25rem_minmax(0,1fr)] gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: event.phase === "now" ? "size-3 rounded-full bg-pine ring-4 ring-pine/20" : event.phase === "done" ? "size-3 rounded-full bg-pine" : "size-3 rounded-full border-2 border-line bg-paper" }), index < shipment.events.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-px flex-1 bg-line" }) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pb-6",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-baseline justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: `font-medium ${event.phase === "next" ? "text-muted" : "text-ink"}`,
												children: localizedTrack(lang, event.title, event.titleKu)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-muted",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
													dir: "ltr",
													children: localizedTrack(lang, event.at, event.atKu)
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted",
											children: localizedTrack(lang, event.place, event.placeKu)
										}),
										event.phase === "next" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted",
											children: t.expected
										}) : null
									]
								})]
							}, `${event.title}-${index}`))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "h-fit rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-24",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-widest text-pine",
						children: t.hubRecord
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 flex flex-col gap-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: t.weight
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bdi", {
										dir: "ltr",
										children: [
											shipment.kg,
											" ",
											t.kg
										]
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: t.pieces
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
										dir: "ltr",
										children: shipment.pieces
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: t.length
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bdi", {
										dir: "ltr",
										children: [
											shipment.l,
											"×",
											shipment.w,
											"×",
											shipment.h,
											" ",
											t.cm
										]
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: t.hubsTitle
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 font-medium",
								children: localizedTrack(lang, shipment.hub, shipment.hubKu)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: t.photoOnFile
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 font-medium text-pine",
								children: shipment.photo ? t.photoOnFile : "—"
							})] })
						]
					})]
				})]
			}) : null
		]
	})] });
}
//#endregion
export { TrackPage as component };
