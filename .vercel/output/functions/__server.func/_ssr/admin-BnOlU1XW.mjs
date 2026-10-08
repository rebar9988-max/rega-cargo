import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as useI18n, o as btnGhost, s as btnPrimary } from "./field-ClBf72CX.mjs";
import { d as iqd, f as marketAdmin, h as marketCopy, p as marketAdminSet, u as Route$12 } from "./router-D3fYEic-.mjs";
import { n as Shell, t as PageHeader } from "./shell-CA276dc0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-BnOlU1XW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminPage() {
	const initial = Route$12.useLoaderData();
	const { lang } = useI18n();
	const t = marketCopy(lang);
	const [data, setData] = (0, import_react.useState)(initial);
	if ("error" in data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: "R&L",
		title: t.admin,
		lede: t.forbidden
	}) });
	async function act(input) {
		await marketAdminSet({ data: input });
		setData(await marketAdmin());
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: t.marketKicker,
		title: t.admin,
		lede: t.freeSort
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: t.roleSeller,
				children: data.pendingRoles.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Row, {
					label: `${row.displayName} · ${row.role}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: btnPrimary,
						onClick: () => act({
							kind: "role",
							id: row.userId,
							role: row.role,
							status: "approved"
						}),
						children: t.save
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: btnGhost,
						onClick: () => act({
							kind: "role",
							id: row.userId,
							role: row.role,
							status: "removed"
						}),
						children: t.cancel
					})]
				}, row.userId + row.role))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: t.marketTitle,
				children: data.pendingProducts.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Row, {
					label: `${row.nameKu} · ${row.brand}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: btnPrimary,
						onClick: () => act({
							kind: "product",
							id: row.slug,
							status: "approved"
						}),
						children: t.save
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: btnGhost,
						onClick: () => act({
							kind: "product",
							id: row.slug,
							status: "removed"
						}),
						children: t.cancel
					})]
				}, row.slug))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: t.offers,
				children: data.pendingOffers.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Row, {
					label: `${row.nameKu} · ${iqd(row.price + row.shipping)}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: btnPrimary,
						onClick: () => act({
							kind: "offer",
							id: row.id,
							status: "approved"
						}),
						children: t.save
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: btnGhost,
						onClick: () => act({
							kind: "offer",
							id: row.id,
							status: "removed"
						}),
						children: t.cancel
					})]
				}, row.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: t.report,
				children: data.openReports.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm",
					children: [
						row.subject,
						" — ",
						row.body
					]
				}, row.id))
			})
		]
	})] });
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-xl font-semibold",
			children: title
		}), children]
	});
}
function Row({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-2",
			children
		})]
	});
}
//#endregion
export { AdminPage as component };
