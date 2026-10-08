import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, S as useRouter, X as require_react, _ as lazyRouteComponent, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, v as createFileRoute, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn, u as __exportAll } from "./ssr.mjs";
import { c as controlClass, f as useI18n, l as createSsrRpc, o as btnGhost, r as I18nProvider } from "./field-ClBf72CX.mjs";
import { t as authMiddleware } from "./middleware-C7kPZ0x3.mjs";
import { fn as literal, hn as object, mn as number, vn as string, yn as union } from "../_libs/@better-auth/core+[...].mjs";
import { n as TriangleAlert } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-copy-CvXBmcM1.js
var marketHome = createServerFn({ method: "GET" }).validator((input) => input).handler(createSsrRpc("f425b05cfe1240010bbcfeaa42dc870cad11e06386a4c5787c6432396d837c30"));
var marketProduct = createServerFn({ method: "GET" }).validator((input) => input).handler(createSsrRpc("43a63167f0fab5e8f885cbc068033ccd60bf8c4893d081a6ca60d15ef34af49d"));
var marketMe = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("d94be8a45995d73c7546d487bfd5bb5983ef1411f501bca2cdb351d338125d9b"));
var marketRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("2e1a366adc5876d42f166d4dcd500a5f77d3e16f04a50983e8b195fe208dbf56"));
var marketSaveProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("104f886b521387d4926b30927d123d1873500a3511049042cc77ec2f22e65f71"));
var marketSaveOffer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("438c9311b4059a34323f2787ddb2b60560e8cec58ccad4ee5e1f99b57cdaa5e4"));
var marketMine = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("e5c6b64118976b1d4e878968a783448196a6bbbba5823fbf75ee8b7252cfadd4"));
var marketFavorite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("fbcb8e7bf0b13dc664eee25a36ea71768796ea55db3d3fdca1fd35001c7a701a"));
var marketAlert = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("7c7f73f2a0ed5a0c248a3b3539eb7b5e60c633b5985c0523b6d1f06c7193a63f"));
var marketReview = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("7057ba966b8591c645df7563a663323818b18d6699b6d50f1ccbb47fe9773c33"));
var marketReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("ff11603f1cf385b28fcbfb8d362212c6619c35ce4b14ab4fe21dad833c2b6a65"));
var marketAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("723fa572eba433b865bd68f9368335fd468c6ffc41b10e702eae4fde008ee6a5"));
var marketAdminSet = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("ee620131b73da37cfe46c144e10c17a7eafe7d99e2b14fb527a294190a2a19cf"));
var moveCreateDelivery = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("a51e5d750a00d4ef8b087fb69fe162431506952fe834990c942756b9fdd64828"));
var moveCreateTransport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("318d3b3bb3a2f729b52076394a01c623acf75eabfbba10559257a4ed21631e32"));
var moveJobs = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("c1e6f39e1ea0f62c8edadf2cf4b02fc0242732496ad8785ee9a285d88fd26c1a"));
var moveOffer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("f22d5774ee087bb6d71559cbda5c673b5aa9b2528caa8029cc9add131202072a"));
var moveChoose = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("85eddc7598cc697a398a28b6667aad576fcdfe6059fe4511846db05385aca6dd"));
var moveStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("ce4674e4135ebf09e95db05567c2f76284d5a41d148a64b7ae84ea29ea3d3857"));
var moveRate = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("943246361cca1b17efde75fc627f75ba932930cb7540429836c2fc18b5e75694"));
var en = {
	marketKicker: "Free comparison",
	marketTitle: "Marketplace",
	marketLede: "One product, several sellers. The cheapest total is first. No payment, no ads, no paid place.",
	search: "Search",
	all: "All",
	brand: "Brand",
	min: "Min",
	max: "Max",
	inStock: "In stock",
	newest: "Newest",
	priceSort: "Price",
	offers: "offers",
	none: "Nothing matches.",
	freeSort: "Sorted only by price plus shipping.",
	from: "From",
	visit: "Visit seller",
	price: "Price",
	shipping: "Shipping",
	total: "Total",
	seller: "Seller",
	history: "Price history",
	favorite: "Favorite",
	alert: "Alert me on this device under",
	save: "Save",
	review: "Review",
	rating: "Rating",
	deliver: "Request delivery",
	report: "Report a problem",
	subject: "Subject",
	body: "What happened",
	send: "Send",
	sell: "Sell",
	admin: "Admin",
	pending: "Waiting for approval",
	saved: "Saved",
	invalid: "Check the fields and try again.",
	rate: "Too many tries. Wait a little.",
	forbidden: "You cannot do that.",
	notfound: "Not found.",
	moveKicker: "Free",
	moveTitle: "Delivery and transport",
	moveLede: "Ask for a delivery or a larger load. A driver can offer to take it. You choose. No fee inside the app.",
	pickup: "Pickup",
	dropoff: "Drop-off",
	item: "Item",
	size: "Size or weight",
	date: "Date",
	origin: "From",
	destination: "To",
	load: "Load",
	myJobs: "My jobs",
	openJobs: "Open jobs",
	offer: "I can take this",
	choose: "Choose",
	cancel: "Cancel",
	picked: "Picked up",
	way: "On the way",
	done: "Delivered",
	roleSeller: "Become a seller",
	roleDriver: "Become a driver",
	name: "Name",
	city: "City",
	phone: "Phone",
	nameKu: "Kurdish name",
	nameEn: "English name",
	category: "Category",
	specs: "Specs",
	contact: "Link or phone",
	stock: "Availability",
	add: "Add",
	notes: "Notices"
};
var ALL = {
	en,
	ckb: {
		marketKicker: "بەراوردی خۆڕایی",
		marketTitle: "بازاڕ",
		marketLede: "یەک کاڵا، چەند فرۆشیار. هەرزانترین کۆی نرخ لە سەرەوەیە. بێ پارەدان، بێ ڕیکلام، بێ شوێنی پارەدراو.",
		search: "گەڕان",
		all: "هەموو",
		brand: "براند",
		min: "کەمترین",
		max: "زۆرترین",
		inStock: "بەردەست",
		newest: "نوێترین",
		priceSort: "نرخ",
		offers: "ئۆفەر",
		none: "هیچ شتێک ناگونجێت.",
		freeSort: "ڕیزکردن تەنها بەپێی نرخ و گەیاندنە.",
		from: "لە",
		visit: "سەردانی فرۆشیار",
		price: "نرخ",
		shipping: "گەیاندن",
		total: "کۆ",
		seller: "فرۆشیار",
		history: "مێژووی نرخ",
		favorite: "دڵخواز",
		alert: "لەناو ئەپ ئاگادارم بکەرەوە ئەگەر کۆی نرخ کەمتر بوو لە",
		save: "پاشەکەوت",
		review: "هەڵسەنگاندن",
		rating: "نمرە",
		deliver: "داوای گەیاندن",
		report: "سکاڵا",
		subject: "بابەت",
		body: "چی ڕوویدا",
		send: "ناردن",
		sell: "فرۆشتن",
		admin: "بەڕێوەبەر",
		pending: "چاوەڕوانی پەسەند",
		saved: "پاشەکەوتکراو",
		invalid: "خانەکان بپشکنە و دووبارە هەوڵ بدە.",
		rate: "زۆر هەوڵدرا. کەمێک بوەستە.",
		forbidden: "ئەمەت بۆ ناکرێت.",
		notfound: "نەدۆزرایەوە.",
		moveKicker: "خۆڕایی",
		moveTitle: "گەیاندن و گواستنەوە",
		moveLede: "داوای گەیاندن یان باری گەورە بکە. شۆفێر دەتوانێت بیبات. تۆ هەڵیدەبژێریت. هیچ کرێیەک لەناو ئەپدا نییە.",
		pickup: "هەڵگرتن",
		dropoff: "دانان",
		item: "کاڵا",
		size: "قەبارە یان کێش",
		date: "بەروار",
		origin: "لە",
		destination: "بۆ",
		load: "بار",
		myJobs: "کارەکانی من",
		openJobs: "کارە کراوەکان",
		offer: "دەتوانم بیبەم",
		choose: "هەڵبژاردن",
		cancel: "هەڵوەشاندنەوە",
		picked: "هەڵگیرا",
		way: "لە ڕێگادایە",
		done: "گەیشت",
		roleSeller: "ببە بە فرۆشیار",
		roleDriver: "ببە بە شۆفێر",
		name: "ناو",
		city: "شار",
		phone: "تەلەفۆن",
		nameKu: "ناوی کوردی",
		nameEn: "ناوی ئینگلیزی",
		category: "جۆر",
		specs: "تایبەتمەندی",
		contact: "لینک یان تەلەفۆن",
		stock: "بەردەستبوون",
		add: "زیادکردن",
		notes: "ئاگاداری"
	},
	ar: {
		...en,
		marketTitle: "السوق",
		moveTitle: "التوصيل والنقل",
		search: "بحث",
		sell: "بيع",
		admin: "إدارة"
	},
	de: {
		...en,
		marketTitle: "Marktplatz",
		moveTitle: "Lieferung und Transport",
		search: "Suche",
		sell: "Verkaufen",
		admin: "Verwaltung"
	},
	ku: {
		...en,
		marketTitle: "Bazar",
		moveTitle: "Radestkirin",
		search: "Lêgerîn",
		sell: "Firotin"
	},
	fa: {
		...en,
		marketTitle: "بازار",
		moveTitle: "تحویل و حمل",
		search: "جستجو",
		sell: "فروش"
	},
	tr: {
		...en,
		marketTitle: "Pazar",
		moveTitle: "Teslimat ve taşıma",
		search: "Ara",
		sell: "Sat"
	}
};
function marketCopy(lang) {
	return ALL[lang];
}
function iqd(value) {
	return `${new Intl.NumberFormat("en-GB").format(value)} IQD`;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-D3fYEic-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6 text-center text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-clay",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-muted",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-CCm2v5xc.css";
var Route$14 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "R&L · MOVE SMART. DELIVER FAST." },
			{
				name: "description",
				content: "R&L — Move smart. Deliver fast. Europe, Kurdistan, and Iraq. Chargeable-weight prices in euro and dinar."
			},
			{
				name: "theme-color",
				content: "#f4f4f4"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/png",
				href: "/favicon.png?v=6"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "ckb",
		dir: "ltr",
		"data-textdir": "rtl",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(I18nProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$13 = () => import("./routes-BpW_9Z63.mjs");
var Route$13 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "بازاڕ · R&L" }, {
		name: "description",
		content: "فرۆشگا فەرمییەکانی ئەوروپا. وێنەکان ببینە و داوا بکە. هیچ شتێک ناکڕدرێت تا نرخەکە پشتڕاست بکەیتەوە."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./admin-BnOlU1XW.mjs");
var Route$12 = createFileRoute("/admin")({
	loader: () => marketAdmin(),
	head: () => ({ meta: [{ title: "بەڕێوەبەر · R&L" }] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./contact-Cd3E9dgi.mjs");
var Route$11 = createFileRoute("/contact")({
	head: () => ({ meta: [{ title: "پەیوەندی · R&L" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./customs-CeZaRbyl.mjs");
var Route$10 = createFileRoute("/customs")({
	head: () => ({ meta: [{ title: "گومرگ · R&L" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./market-DZZzVmiz.mjs");
var Route$9 = createFileRoute("/market")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./move-DwFN5Out.mjs");
var Route$8 = createFileRoute("/move")({
	validateSearch: (search) => ({
		product: typeof search.product === "string" ? search.product : "",
		item: typeof search.item === "string" ? search.item : ""
	}),
	loader: () => moveJobs(),
	head: () => ({ meta: [{ title: "گەیاندن · R&L" }, {
		name: "description",
		content: "داوای گەیاندن و گواستنەوە. شۆفێر خۆی پێشنیار دەکات و تۆ هەڵیدەبژێریت."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./quote-CG9YVpNc.mjs");
var Route$7 = createFileRoute("/quote")({
	validateSearch: (search) => ({
		from: typeof search.from === "string" && search.from ? search.from : void 0,
		to: typeof search.to === "string" && search.to ? search.to : void 0,
		kg: typeof search.kg === "string" && search.kg ? search.kg : void 0
	}),
	head: () => ({ meta: [{ title: "نرخ · R&L" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./stores-4B_Ti0uB.mjs");
var Route$6 = createFileRoute("/stores")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./track-BGZkTY3h.mjs");
var Route$5 = createFileRoute("/track")({
	validateSearch: (search) => ({ id: typeof search.id === "string" && search.id ? search.id : void 0 }),
	head: () => ({ meta: [{ title: "شوێنپێکردن · R&L" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./market.index-DWgCvd45.mjs");
var Route$4 = createFileRoute("/market/")({
	validateSearch: (search) => ({
		q: typeof search.q === "string" ? search.q : "",
		category: typeof search.category === "string" ? search.category : "",
		brand: typeof search.brand === "string" ? search.brand : "",
		min: typeof search.min === "string" ? search.min : "",
		max: typeof search.max === "string" ? search.max : "",
		stock: search.stock === "in" ? "in" : "",
		sort: search.sort === "new" ? "new" : "price",
		page: typeof search.page === "number" && search.page > 0 ? search.page : 1,
		saved: search.saved === "1" || search.saved === true ? "1" : ""
	}),
	loaderDeps: ({ search }) => search,
	loader: ({ deps }) => marketHome({ data: {
		...deps,
		saved: deps.saved === "1"
	} }),
	head: () => ({ meta: [{ title: "بازاڕ · R&L" }, {
		name: "description",
		content: "بەراوردی نرخی کاڵا لە چەند فرۆشیارێک. بێ پارەدان و بێ ڕیکلام."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./market._slug-CJj18b4-.mjs");
var Route$3 = createFileRoute("/market/$slug")({
	loader: ({ params }) => marketProduct({ data: { slug: params.slug } }),
	head: ({ loaderData }) => ({ meta: [{ title: `${loaderData && "nameKu" in loaderData ? loaderData.nameKu : "R&L"} · R&L` }, {
		name: "description",
		content: loaderData && "descriptionKu" in loaderData ? loaderData.descriptionKu : "R&L"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
function Report() {
	const { lang } = useI18n();
	const t = marketCopy(lang);
	const [message, setMessage] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-col gap-3 rounded-2xl border border-line p-4",
		onSubmit: async (event) => {
			event.preventDefault();
			const form = new FormData(event.currentTarget);
			const result = await marketReport({ data: {
				subject: String(form.get("subject") ?? ""),
				body: String(form.get("body") ?? "")
			} });
			setMessage("error" in result ? t[result.error] ?? t.invalid : t.saved);
			if (!("error" in result)) event.currentTarget.reset();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: t.report
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				name: "subject",
				required: true,
				placeholder: t.subject,
				"aria-label": t.subject,
				className: controlClass
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				name: "body",
				required: true,
				placeholder: t.body,
				"aria-label": t.body,
				className: `${controlClass} h-24 py-3`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: btnGhost,
				type: "submit",
				children: t.send
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: message
			}) : null
		]
	});
}
var $$splitComponentImporter$2 = () => import("./market.sell-C3PtIYUx.mjs");
var Route$2 = createFileRoute("/market/sell")({
	loader: async () => {
		const [me, mine] = await Promise.all([marketMe(), marketMine()]);
		return {
			me,
			mine
		};
	},
	head: () => ({ meta: [{ title: "فرۆشتن · R&L" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./stores.index-C5Gcoc3M.mjs");
var Route$1 = createFileRoute("/stores/")({
	head: () => ({ meta: [{ title: "بازاڕ · R&L" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./stores.request-DV8rQP8C.mjs");
var Route = createFileRoute("/stores/request")({
	validateSearch: (search) => ({
		store: typeof search.store === "string" ? search.store : void 0,
		item: typeof search.item === "string" ? search.item : void 0,
		intent: search.intent === "ship" ? "ship" : "buy"
	}),
	head: () => ({ meta: [{ title: "لینکی کاڵا · R&L" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$13.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$14
});
var AdminRoute = Route$12.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$14
});
var ContactRoute = Route$11.update({
	id: "/contact",
	path: "/contact",
	getParentRoute: () => Route$14
});
var CustomsRoute = Route$10.update({
	id: "/customs",
	path: "/customs",
	getParentRoute: () => Route$14
});
var MarketRoute = Route$9.update({
	id: "/market",
	path: "/market",
	getParentRoute: () => Route$14
});
var MoveRoute = Route$8.update({
	id: "/move",
	path: "/move",
	getParentRoute: () => Route$14
});
var QuoteRoute = Route$7.update({
	id: "/quote",
	path: "/quote",
	getParentRoute: () => Route$14
});
var StoresRoute = Route$6.update({
	id: "/stores",
	path: "/stores",
	getParentRoute: () => Route$14
});
var TrackRoute = Route$5.update({
	id: "/track",
	path: "/track",
	getParentRoute: () => Route$14
});
var MarketIndexRoute = Route$4.update({
	id: "/",
	path: "/",
	getParentRoute: () => MarketRoute
});
var MarketSlugRoute = Route$3.update({
	id: "/$slug",
	path: "/$slug",
	getParentRoute: () => MarketRoute
});
var MarketSellRoute = Route$2.update({
	id: "/sell",
	path: "/sell",
	getParentRoute: () => MarketRoute
});
var StoresIndexRoute = Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => StoresRoute
});
var StoresRequestRoute = Route.update({
	id: "/request",
	path: "/request",
	getParentRoute: () => StoresRoute
});
var MarketRouteChildren = {
	MarketSlugRoute,
	MarketSellRoute,
	MarketIndexRoute
};
var MarketRouteWithChildren = MarketRoute._addFileChildren(MarketRouteChildren);
var StoresRouteChildren = {
	StoresRequestRoute,
	StoresIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AdminRoute,
	ContactRoute,
	CustomsRoute,
	MarketRoute: MarketRouteWithChildren,
	MoveRoute,
	QuoteRoute,
	StoresRoute: StoresRoute._addFileChildren(StoresRouteChildren),
	TrackRoute
};
var routeTree = Route$14._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { moveStatus as A, marketSaveProduct as C, moveJobs as D, moveCreateTransport as E, moveOffer as O, marketSaveOffer as S, moveCreateDelivery as T, marketMine as _, Route$3 as a, marketReview as b, Route$7 as c, iqd as d, marketAdmin as f, marketFavorite as g, marketCopy as h, Report as i, moveRate as k, Route$8 as l, marketAlert as m, Route as n, Route$4 as o, marketAdminSet as p, Route$2 as r, Route$5 as s, router_exports as t, Route$12 as u, marketProduct as v, moveChoose as w, marketRole as x, marketReport as y };
