import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-C7dG7qZr.js
async function guard() {
	const { assertSameSiteRequest } = await import("./isolation.server-DvIsaeer.mjs");
	assertSameSiteRequest();
}
var phoneWho_createServerFn_handler = createServerRpc({
	id: "b7e4ae87e0d21430496a9b34b472c21d39829eea5cf967d300c6ec28518c1c4d",
	name: "phoneWho",
	filename: "src/lib/phone/api.ts"
}, (opts) => phoneWho.__executeServer(opts));
var phoneWho = createServerFn({ method: "GET" }).handler(phoneWho_createServerFn_handler, async () => {
	await guard();
	const { phoneMe } = await import("./session.server-BU8_0BkD.mjs");
	return phoneMe();
});
var phoneBegin_createServerFn_handler = createServerRpc({
	id: "77944ce8c2e8e99bd2cb4c9ad16890fdbb8529a7a7711f85e29704e990af870b",
	name: "phoneBegin",
	filename: "src/lib/phone/api.ts"
}, (opts) => phoneBegin.__executeServer(opts));
var phoneBegin = createServerFn({ method: "POST" }).validator((input) => input).handler(phoneBegin_createServerFn_handler, async ({ data }) => {
	await guard();
	const { phoneStart } = await import("./session.server-BU8_0BkD.mjs");
	return phoneStart(data.dial, data.national);
});
var phoneJoin_createServerFn_handler = createServerRpc({
	id: "ddb81f6e305711400b651176e9db917aa3f0a7c77252df05b267b580972c0798",
	name: "phoneJoin",
	filename: "src/lib/phone/api.ts"
}, (opts) => phoneJoin.__executeServer(opts));
var phoneJoin = createServerFn({ method: "POST" }).validator((input) => input).handler(phoneJoin_createServerFn_handler, async ({ data }) => {
	await guard();
	const { phoneRegister } = await import("./session.server-BU8_0BkD.mjs");
	return phoneRegister(data);
});
var phoneCheck_createServerFn_handler = createServerRpc({
	id: "2d6de31c6b19c78aefe2179985a379ce1d9e57e8a0f853d02d8290850e173af6",
	name: "phoneCheck",
	filename: "src/lib/phone/api.ts"
}, (opts) => phoneCheck.__executeServer(opts));
var phoneCheck = createServerFn({ method: "POST" }).validator((input) => input).handler(phoneCheck_createServerFn_handler, async ({ data }) => {
	await guard();
	const { phoneConfirm } = await import("./session.server-BU8_0BkD.mjs");
	return phoneConfirm(data);
});
var phoneEnter_createServerFn_handler = createServerRpc({
	id: "811c38d446ecb8d2c2dca0030f30fd23915bbc93bf373c3737388aec1defec87",
	name: "phoneEnter",
	filename: "src/lib/phone/api.ts"
}, (opts) => phoneEnter.__executeServer(opts));
var phoneEnter = createServerFn({ method: "POST" }).validator((input) => input).handler(phoneEnter_createServerFn_handler, async ({ data }) => {
	await guard();
	const { phoneLogin } = await import("./session.server-BU8_0BkD.mjs");
	return phoneLogin(data);
});
var phoneLeave_createServerFn_handler = createServerRpc({
	id: "2f37ca9d2003a92ed9e933847123961f20fb64c9a3dbc61d29ed182fc663555f",
	name: "phoneLeave",
	filename: "src/lib/phone/api.ts"
}, (opts) => phoneLeave.__executeServer(opts));
var phoneLeave = createServerFn({ method: "POST" }).handler(phoneLeave_createServerFn_handler, async () => {
	await guard();
	const { phoneLogout } = await import("./session.server-BU8_0BkD.mjs");
	return phoneLogout();
});
//#endregion
export { phoneBegin_createServerFn_handler, phoneCheck_createServerFn_handler, phoneEnter_createServerFn_handler, phoneJoin_createServerFn_handler, phoneLeave_createServerFn_handler, phoneWho_createServerFn_handler };
