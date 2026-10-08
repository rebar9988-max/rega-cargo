import { r as createServerFn, u as __exportAll } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-C7kPZ0x3.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-B_xVp1SE.js
var JOB_FLOW = [
	"requested",
	"accepted",
	"picked_up",
	"on_the_way",
	"delivered"
];
var MarketError = class extends Error {
	code;
	constructor(code) {
		super(code);
		this.name = "MarketError";
		this.code = code;
	}
};
function cleanText(value, max, min = 1) {
	if (typeof value !== "string") throw new MarketError("invalid");
	const text = value.trim().replace(/\s+/g, " ");
	if (text.length < min || text.length > max) throw new MarketError("invalid");
	return text;
}
function cleanOptional(value, max) {
	if (value == null || value === "") return "";
	return cleanText(value, max, 0);
}
function cleanMoney(value, max, allowZero) {
	const n = typeof value === "number" ? value : Number(String(value ?? "").trim());
	if (!Number.isInteger(n) || n > max || n < (allowZero ? 0 : 1)) throw new MarketError("invalid");
	return n;
}
function cleanContact(value) {
	const text = cleanText(value, 200);
	if (text.includes("://") && !text.startsWith("https://")) throw new MarketError("invalid");
	return text;
}
function cleanImage(value) {
	if (value == null || value === "") return null;
	const text = cleanText(value, 200);
	if (text.startsWith("/bazaar/") || text.startsWith("https://")) return text;
	throw new MarketError("invalid");
}
function cleanStock(value) {
	if (value === "in" || value === "low" || value === "out") return value;
	throw new MarketError("invalid");
}
function likePattern(query) {
	return `%${query.replace(/[%_\\]/g, "\\$&")}%`;
}
function offerTotal(price, shipping) {
	return price + shipping;
}
function rankOffers(offers) {
	return offers.map((offer) => ({
		...offer,
		total: offerTotal(offer.price, offer.shipping)
	})).sort((a, b) => Number(a.stock === "out") - Number(b.stock === "out") || a.total - b.total || a.price - b.price);
}
function cheapest(offers) {
	return offers.find((offer) => offer.stock !== "out") ?? null;
}
function slugify(name) {
	const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
	const suffix = Math.random().toString(36).slice(2, 6);
	return `${base || "item"}-${suffix}`;
}
function canSetJobStatus(from, to, who) {
	if (from === to) return false;
	if (to === "cancelled") return who === "requester" && from !== "delivered" && from !== "cancelled";
	if (who !== "courier") return false;
	const current = JOB_FLOW.indexOf(from);
	const next = JOB_FLOW.indexOf(to);
	return current >= 1 && next === current + 1;
}
function pageWindow(page) {
	const n = typeof page === "number" ? page : Number(page ?? 1);
	if (!Number.isInteger(n) || n < 1 || n > 100) return 1;
	return n;
}
var api_exports = /* @__PURE__ */ __exportAll({
	marketAdminSet_createServerFn_handler: () => marketAdminSet_createServerFn_handler,
	marketAdmin_createServerFn_handler: () => marketAdmin_createServerFn_handler,
	marketAlert_createServerFn_handler: () => marketAlert_createServerFn_handler,
	marketFavorite_createServerFn_handler: () => marketFavorite_createServerFn_handler,
	marketHome_createServerFn_handler: () => marketHome_createServerFn_handler,
	marketMe_createServerFn_handler: () => marketMe_createServerFn_handler,
	marketMine_createServerFn_handler: () => marketMine_createServerFn_handler,
	marketProduct_createServerFn_handler: () => marketProduct_createServerFn_handler,
	marketReport_createServerFn_handler: () => marketReport_createServerFn_handler,
	marketReview_createServerFn_handler: () => marketReview_createServerFn_handler,
	marketRole_createServerFn_handler: () => marketRole_createServerFn_handler,
	marketSaveOffer_createServerFn_handler: () => marketSaveOffer_createServerFn_handler,
	marketSaveProduct_createServerFn_handler: () => marketSaveProduct_createServerFn_handler,
	moveChoose_createServerFn_handler: () => moveChoose_createServerFn_handler,
	moveCreateDelivery_createServerFn_handler: () => moveCreateDelivery_createServerFn_handler,
	moveCreateTransport_createServerFn_handler: () => moveCreateTransport_createServerFn_handler,
	moveJobs_createServerFn_handler: () => moveJobs_createServerFn_handler,
	moveOffer_createServerFn_handler: () => moveOffer_createServerFn_handler,
	moveRate_createServerFn_handler: () => moveRate_createServerFn_handler,
	moveStatus_createServerFn_handler: () => moveStatus_createServerFn_handler
});
async function optionalUser() {
	try {
		const { currentPhoneUserId } = await import("./session.server-BU8_0BkD.mjs");
		const phone = await currentPhoneUserId();
		if (phone) return phone;
	} catch {}
	try {
		const { requireUserId } = await import("./verify.server-DiPgIurV.mjs");
		return await requireUserId();
	} catch {
		return null;
	}
}
async function actor(userId) {
	try {
		const { currentPhoneUserId } = await import("./session.server-BU8_0BkD.mjs");
		return await currentPhoneUserId() ?? userId;
	} catch {
		return userId;
	}
}
function fail(err) {
	if (err instanceof MarketError) return { error: err.code };
	console.error("[market]", err);
	return { error: "invalid" };
}
var marketHome_createServerFn_handler = createServerRpc({
	id: "f425b05cfe1240010bbcfeaa42dc870cad11e06386a4c5787c6432396d837c30",
	name: "marketHome",
	filename: "src/lib/market/api.ts"
}, (opts) => marketHome.__executeServer(opts));
var marketHome = createServerFn({ method: "GET" }).validator((input) => input).handler(marketHome_createServerFn_handler, async ({ data }) => {
	try {
		const { listProducts } = await import("./handlers.server-CdzKhNJ1.mjs");
		const userId = await optionalUser();
		return await listProducts({
			...data,
			userId
		});
	} catch (err) {
		return fail(err);
	}
});
var marketProduct_createServerFn_handler = createServerRpc({
	id: "43a63167f0fab5e8f885cbc068033ccd60bf8c4893d081a6ca60d15ef34af49d",
	name: "marketProduct",
	filename: "src/lib/market/api.ts"
}, (opts) => marketProduct.__executeServer(opts));
var marketProduct = createServerFn({ method: "GET" }).validator((input) => input).handler(marketProduct_createServerFn_handler, async ({ data }) => {
	try {
		const { getProduct } = await import("./handlers.server-CdzKhNJ1.mjs");
		return await getProduct(data.slug, await optionalUser());
	} catch (err) {
		return fail(err);
	}
});
var marketMe_createServerFn_handler = createServerRpc({
	id: "d94be8a45995d73c7546d487bfd5bb5983ef1411f501bca2cdb351d338125d9b",
	name: "marketMe",
	filename: "src/lib/market/api.ts"
}, (opts) => marketMe.__executeServer(opts));
var marketMe = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(marketMe_createServerFn_handler, async ({ context }) => {
	const { getMe } = await import("./handlers.server-CdzKhNJ1.mjs");
	return getMe(await actor(context.userId));
});
var marketRole_createServerFn_handler = createServerRpc({
	id: "2e1a366adc5876d42f166d4dcd500a5f77d3e16f04a50983e8b195fe208dbf56",
	name: "marketRole",
	filename: "src/lib/market/api.ts"
}, (opts) => marketRole.__executeServer(opts));
var marketRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(marketRole_createServerFn_handler, async ({ data, context }) => {
	try {
		const { requestRole } = await import("./handlers.server-CdzKhNJ1.mjs");
		return await requestRole(await actor(context.userId), data);
	} catch (err) {
		return fail(err);
	}
});
var marketSaveProduct_createServerFn_handler = createServerRpc({
	id: "104f886b521387d4926b30927d123d1873500a3511049042cc77ec2f22e65f71",
	name: "marketSaveProduct",
	filename: "src/lib/market/api.ts"
}, (opts) => marketSaveProduct.__executeServer(opts));
var marketSaveProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(marketSaveProduct_createServerFn_handler, async ({ data, context }) => {
	try {
		const { saveProduct } = await import("./handlers.server-CdzKhNJ1.mjs");
		return await saveProduct(await actor(context.userId), data);
	} catch (err) {
		return fail(err);
	}
});
var marketSaveOffer_createServerFn_handler = createServerRpc({
	id: "438c9311b4059a34323f2787ddb2b60560e8cec58ccad4ee5e1f99b57cdaa5e4",
	name: "marketSaveOffer",
	filename: "src/lib/market/api.ts"
}, (opts) => marketSaveOffer.__executeServer(opts));
var marketSaveOffer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(marketSaveOffer_createServerFn_handler, async ({ data, context }) => {
	try {
		const { saveOffer } = await import("./handlers.server-CdzKhNJ1.mjs");
		return await saveOffer(await actor(context.userId), data);
	} catch (err) {
		return fail(err);
	}
});
var marketMine_createServerFn_handler = createServerRpc({
	id: "e5c6b64118976b1d4e878968a783448196a6bbbba5823fbf75ee8b7252cfadd4",
	name: "marketMine",
	filename: "src/lib/market/api.ts"
}, (opts) => marketMine.__executeServer(opts));
var marketMine = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(marketMine_createServerFn_handler, async ({ context }) => {
	const { myOffers } = await import("./handlers.server-CdzKhNJ1.mjs");
	return myOffers(await actor(context.userId));
});
var marketFavorite_createServerFn_handler = createServerRpc({
	id: "fbcb8e7bf0b13dc664eee25a36ea71768796ea55db3d3fdca1fd35001c7a701a",
	name: "marketFavorite",
	filename: "src/lib/market/api.ts"
}, (opts) => marketFavorite.__executeServer(opts));
var marketFavorite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(marketFavorite_createServerFn_handler, async ({ data, context }) => {
	try {
		const { setFavorite } = await import("./handlers.server-CdzKhNJ1.mjs");
		return await setFavorite(await actor(context.userId), data.slug, data.on);
	} catch (err) {
		return fail(err);
	}
});
var marketAlert_createServerFn_handler = createServerRpc({
	id: "7c7f73f2a0ed5a0c248a3b3539eb7b5e60c633b5985c0523b6d1f06c7193a63f",
	name: "marketAlert",
	filename: "src/lib/market/api.ts"
}, (opts) => marketAlert.__executeServer(opts));
var marketAlert = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(marketAlert_createServerFn_handler, async ({ data, context }) => {
	try {
		const { setAlert } = await import("./handlers.server-CdzKhNJ1.mjs");
		return await setAlert(await actor(context.userId), data.slug, data.target);
	} catch (err) {
		return fail(err);
	}
});
var marketReview_createServerFn_handler = createServerRpc({
	id: "7057ba966b8591c645df7563a663323818b18d6699b6d50f1ccbb47fe9773c33",
	name: "marketReview",
	filename: "src/lib/market/api.ts"
}, (opts) => marketReview.__executeServer(opts));
var marketReview = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(marketReview_createServerFn_handler, async ({ data, context }) => {
	try {
		const { addReview } = await import("./handlers.server-CdzKhNJ1.mjs");
		return await addReview(await actor(context.userId), data.slug, data.rating, data.body);
	} catch (err) {
		return fail(err);
	}
});
var marketReport_createServerFn_handler = createServerRpc({
	id: "ff11603f1cf385b28fcbfb8d362212c6619c35ce4b14ab4fe21dad833c2b6a65",
	name: "marketReport",
	filename: "src/lib/market/api.ts"
}, (opts) => marketReport.__executeServer(opts));
var marketReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(marketReport_createServerFn_handler, async ({ data, context }) => {
	try {
		const { reportProblem } = await import("./handlers.server-CdzKhNJ1.mjs");
		return await reportProblem(await actor(context.userId), data.subject, data.body);
	} catch (err) {
		return fail(err);
	}
});
var marketAdmin_createServerFn_handler = createServerRpc({
	id: "723fa572eba433b865bd68f9368335fd468c6ffc41b10e702eae4fde008ee6a5",
	name: "marketAdmin",
	filename: "src/lib/market/api.ts"
}, (opts) => marketAdmin.__executeServer(opts));
var marketAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(marketAdmin_createServerFn_handler, async ({ context }) => {
	try {
		const { adminQueue } = await import("./handlers.server-CdzKhNJ1.mjs");
		return await adminQueue(await actor(context.userId));
	} catch (err) {
		return fail(err);
	}
});
var marketAdminSet_createServerFn_handler = createServerRpc({
	id: "ee620131b73da37cfe46c144e10c17a7eafe7d99e2b14fb527a294190a2a19cf",
	name: "marketAdminSet",
	filename: "src/lib/market/api.ts"
}, (opts) => marketAdminSet.__executeServer(opts));
var marketAdminSet = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(marketAdminSet_createServerFn_handler, async ({ data, context }) => {
	try {
		const { adminSet } = await import("./handlers.server-CdzKhNJ1.mjs");
		return await adminSet(await actor(context.userId), data);
	} catch (err) {
		return fail(err);
	}
});
var moveCreateDelivery_createServerFn_handler = createServerRpc({
	id: "a51e5d750a00d4ef8b087fb69fe162431506952fe834990c942756b9fdd64828",
	name: "moveCreateDelivery",
	filename: "src/lib/market/api.ts"
}, (opts) => moveCreateDelivery.__executeServer(opts));
var moveCreateDelivery = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(moveCreateDelivery_createServerFn_handler, async ({ data, context }) => {
	try {
		const { createDelivery } = await import("./handlers.server-CdzKhNJ1.mjs");
		return await createDelivery(await actor(context.userId), data);
	} catch (err) {
		return fail(err);
	}
});
var moveCreateTransport_createServerFn_handler = createServerRpc({
	id: "318d3b3bb3a2f729b52076394a01c623acf75eabfbba10559257a4ed21631e32",
	name: "moveCreateTransport",
	filename: "src/lib/market/api.ts"
}, (opts) => moveCreateTransport.__executeServer(opts));
var moveCreateTransport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(moveCreateTransport_createServerFn_handler, async ({ data, context }) => {
	try {
		const { createTransport } = await import("./handlers.server-CdzKhNJ1.mjs");
		return await createTransport(await actor(context.userId), data);
	} catch (err) {
		return fail(err);
	}
});
var moveJobs_createServerFn_handler = createServerRpc({
	id: "c1e6f39e1ea0f62c8edadf2cf4b02fc0242732496ad8785ee9a285d88fd26c1a",
	name: "moveJobs",
	filename: "src/lib/market/api.ts"
}, (opts) => moveJobs.__executeServer(opts));
var moveJobs = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(moveJobs_createServerFn_handler, async ({ context }) => {
	const { listJobs } = await import("./handlers.server-CdzKhNJ1.mjs");
	return listJobs(await actor(context.userId));
});
var moveOffer_createServerFn_handler = createServerRpc({
	id: "f22d5774ee087bb6d71559cbda5c673b5aa9b2528caa8029cc9add131202072a",
	name: "moveOffer",
	filename: "src/lib/market/api.ts"
}, (opts) => moveOffer.__executeServer(opts));
var moveOffer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(moveOffer_createServerFn_handler, async ({ data, context }) => {
	try {
		const { offerJob } = await import("./handlers.server-CdzKhNJ1.mjs");
		return await offerJob(await actor(context.userId), data.kind, data.id, data.note);
	} catch (err) {
		return fail(err);
	}
});
var moveChoose_createServerFn_handler = createServerRpc({
	id: "85eddc7598cc697a398a28b6667aad576fcdfe6059fe4511846db05385aca6dd",
	name: "moveChoose",
	filename: "src/lib/market/api.ts"
}, (opts) => moveChoose.__executeServer(opts));
var moveChoose = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(moveChoose_createServerFn_handler, async ({ data, context }) => {
	try {
		const { chooseCourier } = await import("./handlers.server-CdzKhNJ1.mjs");
		return await chooseCourier(await actor(context.userId), data.kind, data.id, data.courierId);
	} catch (err) {
		return fail(err);
	}
});
var moveStatus_createServerFn_handler = createServerRpc({
	id: "ce4674e4135ebf09e95db05567c2f76284d5a41d148a64b7ae84ea29ea3d3857",
	name: "moveStatus",
	filename: "src/lib/market/api.ts"
}, (opts) => moveStatus.__executeServer(opts));
var moveStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(moveStatus_createServerFn_handler, async ({ data, context }) => {
	try {
		const { setJobStatus } = await import("./handlers.server-CdzKhNJ1.mjs");
		return await setJobStatus(await actor(context.userId), data.kind, data.id, data.status);
	} catch (err) {
		return fail(err);
	}
});
var moveRate_createServerFn_handler = createServerRpc({
	id: "943246361cca1b17efde75fc627f75ba932930cb7540429836c2fc18b5e75694",
	name: "moveRate",
	filename: "src/lib/market/api.ts"
}, (opts) => moveRate.__executeServer(opts));
var moveRate = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(moveRate_createServerFn_handler, async ({ data, context }) => {
	try {
		const { rateJob } = await import("./handlers.server-CdzKhNJ1.mjs");
		return await rateJob(await actor(context.userId), data.kind, data.id, data.rating, data.body);
	} catch (err) {
		return fail(err);
	}
});
//#endregion
export { cleanContact as a, cleanOptional as c, likePattern as d, offerTotal as f, slugify as h, cheapest as i, cleanStock as l, rankOffers as m, MarketError as n, cleanImage as o, pageWindow as p, canSetJobStatus as r, cleanMoney as s, api_exports as t, cleanText as u };
