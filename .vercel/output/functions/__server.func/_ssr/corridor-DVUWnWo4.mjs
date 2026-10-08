//#region node_modules/.nitro/vite/services/ssr/assets/corridor-DVUWnWo4.js
var BOOKING_KEY = "rega-booking";
var HELD_KEY = "rega-held";
var REQUESTS_KEY = "rega-requests";
var SAMPLE_BOX = {
	kg: 3.2,
	l: 40,
	w: 30,
	h: 20
};
var MODES = [
	{
		id: "express",
		perKg: 7.8,
		min: 32,
		days: [3, 5],
		divisor: 5e3
	},
	{
		id: "economy",
		perKg: 4.6,
		min: 22,
		days: [6, 9],
		divisor: 5e3
	},
	{
		id: "road",
		perKg: 2.35,
		min: 18,
		days: [12, 18],
		divisor: 4e3
	}
];
var ORIGINS = [
	{
		id: "ber",
		city: "Berlin",
		cityKu: "بەرلین",
		country: "Germany",
		countryKu: "ئەڵمانیا",
		code: "BER",
		factor: 1
	},
	{
		id: "dus",
		city: "Düsseldorf",
		cityKu: "دوسلدۆرف",
		country: "Germany",
		countryKu: "ئەڵمانیا",
		code: "DUS",
		factor: .96
	},
	{
		id: "ams",
		city: "Amsterdam",
		cityKu: "ئەمستردام",
		country: "Netherlands",
		countryKu: "هۆڵەندا",
		code: "AMS",
		factor: .98
	},
	{
		id: "bru",
		city: "Brussels",
		cityKu: "برۆکسل",
		country: "Belgium",
		countryKu: "بەلجیکا",
		code: "BRU",
		factor: 1
	},
	{
		id: "par",
		city: "Paris",
		cityKu: "پاریس",
		country: "France",
		countryKu: "فەڕەنسا",
		code: "PAR",
		factor: 1.04
	},
	{
		id: "vie",
		city: "Vienna",
		cityKu: "ڤیەننا",
		country: "Austria",
		countryKu: "نەمسا",
		code: "VIE",
		factor: 1.05
	},
	{
		id: "waw",
		city: "Warsaw",
		cityKu: "وارسۆ",
		country: "Poland",
		countryKu: "پۆڵەندا",
		code: "WAW",
		factor: 1.02
	},
	{
		id: "mil",
		city: "Milan",
		cityKu: "میلان",
		country: "Italy",
		countryKu: "ئیتالیا",
		code: "MIL",
		factor: 1.12
	},
	{
		id: "mad",
		city: "Madrid",
		cityKu: "مەدرید",
		country: "Spain",
		countryKu: "ئیسپانیا",
		code: "MAD",
		factor: 1.16
	},
	{
		id: "sto",
		city: "Stockholm",
		cityKu: "ستۆکهۆڵم",
		country: "Sweden",
		countryKu: "سوید",
		code: "STO",
		factor: 1.14
	},
	{
		id: "lon",
		city: "London",
		cityKu: "لەندەن",
		country: "United Kingdom",
		countryKu: "بەریتانیا",
		code: "LON",
		factor: 1.1
	}
];
var DESTS = [
	{
		id: "ebl",
		city: "Erbil",
		cityKu: "هەولێر",
		surcharge: 0
	},
	{
		id: "sul",
		city: "Sulaymaniyah",
		cityKu: "سلێمانی",
		surcharge: 4
	},
	{
		id: "dhk",
		city: "Duhok",
		cityKu: "دهۆک",
		surcharge: 6
	},
	{
		id: "krk",
		city: "Kirkuk",
		cityKu: "کەرکووک",
		surcharge: 9
	},
	{
		id: "bgw",
		city: "Baghdad",
		cityKu: "بەغدا",
		surcharge: 14
	}
];
var CITY = {
	Berlin: {
		ku: "Berlîn",
		ar: "برلين",
		fa: "برلین",
		tr: "Berlin",
		de: "Berlin"
	},
	Düsseldorf: {
		ku: "Düsseldorf",
		ar: "دوسلدورف",
		fa: "دوسلدورف",
		tr: "Düsseldorf",
		de: "Düsseldorf"
	},
	Amsterdam: {
		ku: "Amsterdam",
		ar: "أمستردام",
		fa: "آمستردام",
		tr: "Amsterdam",
		de: "Amsterdam"
	},
	Brussels: {
		ku: "Bruksel",
		ar: "بروكسل",
		fa: "بروکسل",
		tr: "Brüksel",
		de: "Brüssel"
	},
	Paris: {
		ku: "Parîs",
		ar: "باريس",
		fa: "پاریس",
		tr: "Paris",
		de: "Paris"
	},
	Vienna: {
		ku: "Viyana",
		ar: "فيينا",
		fa: "وین",
		tr: "Viyana",
		de: "Wien"
	},
	Warsaw: {
		ku: "Warşova",
		ar: "وارسو",
		fa: "ورشو",
		tr: "Varşova",
		de: "Warschau"
	},
	Milan: {
		ku: "Mîlano",
		ar: "ميلانو",
		fa: "میلان",
		tr: "Milano",
		de: "Mailand"
	},
	Madrid: {
		ku: "Madrîd",
		ar: "مدريد",
		fa: "مادرید",
		tr: "Madrid",
		de: "Madrid"
	},
	Stockholm: {
		ku: "Stockholm",
		ar: "ستوكهولم",
		fa: "استکهلم",
		tr: "Stokholm",
		de: "Stockholm"
	},
	London: {
		ku: "London",
		ar: "لندن",
		fa: "لندن",
		tr: "Londra",
		de: "London"
	},
	Erbil: {
		ku: "Hewlêr",
		ar: "أربيل",
		fa: "اربیل",
		tr: "Erbil",
		de: "Erbil"
	},
	Sulaymaniyah: {
		ku: "Silêmanî",
		ar: "السليمانية",
		fa: "سلیمانیه",
		tr: "Süleymaniye",
		de: "Sulaimaniyya"
	},
	Duhok: {
		ku: "Dihok",
		ar: "دهوك",
		fa: "دهوک",
		tr: "Duhok",
		de: "Duhok"
	},
	Kirkuk: {
		ku: "Kerkûk",
		ar: "كركوك",
		fa: "کرکوک",
		tr: "Kerkük",
		de: "Kirkuk"
	},
	Baghdad: {
		ku: "Bexda",
		ar: "بغداد",
		fa: "بغداد",
		tr: "Bağdat",
		de: "Bagdad"
	}
};
var COUNTRY = {
	Germany: {
		ku: "Almanya",
		ar: "ألمانيا",
		fa: "آلمان",
		tr: "Almanya",
		de: "Deutschland"
	},
	Netherlands: {
		ku: "Holenda",
		ar: "هولندا",
		fa: "هلند",
		tr: "Hollanda",
		de: "Niederlande"
	},
	Belgium: {
		ku: "Belçîka",
		ar: "بلجيكا",
		fa: "بلژیک",
		tr: "Belçika",
		de: "Belgien"
	},
	France: {
		ku: "Fransa",
		ar: "فرنسا",
		fa: "فرانسه",
		tr: "Fransa",
		de: "Frankreich"
	},
	Austria: {
		ku: "Awistirya",
		ar: "النمسا",
		fa: "اتریش",
		tr: "Avusturya",
		de: "Österreich"
	},
	Poland: {
		ku: "Polonya",
		ar: "بولندا",
		fa: "لهستان",
		tr: "Polonya",
		de: "Polen"
	},
	Italy: {
		ku: "Îtalya",
		ar: "إيطاليا",
		fa: "ایتالیا",
		tr: "İtalya",
		de: "Italien"
	},
	Spain: {
		ku: "Spanya",
		ar: "إسبانيا",
		fa: "اسپانیا",
		tr: "İspanya",
		de: "Spanien"
	},
	Sweden: {
		ku: "Swêd",
		ar: "السويد",
		fa: "سوئد",
		tr: "İsveç",
		de: "Schweden"
	},
	"United Kingdom": {
		ku: "Brîtanya",
		ar: "المملكة المتحدة",
		fa: "بریتانیا",
		tr: "Birleşik Krallık",
		de: "Vereinigtes Königreich"
	}
};
function placeName(place, lang) {
	if (lang === "ckb") return place.cityKu;
	if (lang === "en") return place.city;
	return CITY[place.city]?.[lang] ?? place.city;
}
function countryName(origin, lang) {
	if (lang === "ckb") return origin.countryKu;
	if (lang === "en") return origin.country;
	return COUNTRY[origin.country]?.[lang] ?? origin.country;
}
function tenth(n) {
	return Math.round(n * 10) / 10;
}
function cents(n) {
	return Math.round(n * 100) / 100;
}
function priceShipment(input) {
	const volumetric = tenth(input.l * input.w * input.h / input.mode.divisor);
	const chargeable = tenth(Math.max(input.weightKg, volumetric));
	const bulky = input.l > 120 || input.w > 120 || input.h > 120;
	let rated = chargeable * input.mode.perKg * input.origin.factor;
	if (bulky) rated *= 1.12;
	rated = cents(rated);
	const minApplied = rated < input.mode.min;
	const total = cents(Math.max(rated, input.mode.min) + input.dest.surcharge);
	return {
		volumetric,
		chargeable,
		volumetricWins: volumetric > input.weightKg,
		minApplied,
		bulky,
		total
	};
}
function dutyEstimate(contents, declaredEur) {
	if (contents === "documents") return 0;
	if (contents === "personal" && declaredEur <= 200) return 0;
	return cents(declaredEur * (contents === "personal" ? .05 : .08));
}
function formatEur(value) {
	return new Intl.NumberFormat("en-GB", {
		style: "currency",
		currency: "EUR",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(value);
}
function getOrigin(id) {
	return ORIGINS.find((item) => item.id === id) ?? ORIGINS[0];
}
function getDest(id) {
	return DESTS.find((item) => item.id === id) ?? DESTS[0];
}
function getMode(id) {
	return MODES.find((item) => item.id === id) ?? MODES[1];
}
//#endregion
export { ORIGINS as a, countryName as c, getDest as d, getMode as f, priceShipment as h, MODES as i, dutyEstimate as l, placeName as m, DESTS as n, REQUESTS_KEY as o, getOrigin as p, HELD_KEY as r, SAMPLE_BOX as s, BOOKING_KEY as t, formatEur as u };
