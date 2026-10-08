import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as controlClass, f as useI18n, n as Field, s as btnPrimary } from "./field-ClBf72CX.mjs";
import { C as marketSaveProduct, S as marketSaveOffer, _ as marketMine, d as iqd, h as marketCopy, r as Route$2, x as marketRole } from "./router-D3fYEic-.mjs";
import { n as Shell, t as PageHeader } from "./shell-CA276dc0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market.sell-C3PtIYUx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SellPage() {
	const initial = Route$2.useLoaderData();
	const { lang } = useI18n();
	const t = marketCopy(lang);
	const [message, setMessage] = (0, import_react.useState)("");
	const [mine, setMine] = (0, import_react.useState)(initial.mine);
	const seller = initial.me.roles.some((role) => role.role === "seller" && role.status === "approved");
	async function refresh() {
		setMine(await marketMine());
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: t.marketKicker,
		title: t.sell,
		lede: t.marketLede
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10",
		children: [
			initial.me.notes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4 text-sm",
				children: initial.me.notes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: lang === "ckb" ? note.bodyKu : note.bodyEn }, note.id))
			}) : null,
			!seller ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3",
				onSubmit: async (event) => {
					event.preventDefault();
					const form = new FormData(event.currentTarget);
					const result = await marketRole({ data: {
						role: "seller",
						displayName: form.get("name"),
						city: form.get("city"),
						phone: form.get("phone")
					} });
					setMessage("error" in result ? t[result.error] ?? t.invalid : t.pending);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold",
						children: t.roleSeller
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.name,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "name",
							required: true,
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.city,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "city",
							required: true,
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.phone,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "phone",
							dir: "ltr",
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: btnPrimary,
						type: "submit",
						children: t.send
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3",
				onSubmit: async (event) => {
					event.preventDefault();
					const form = new FormData(event.currentTarget);
					const result = await marketSaveProduct({ data: {
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
						contact: form.get("contact")
					} });
					setMessage("error" in result ? t[result.error] ?? t.invalid : t.pending);
					if (!("error" in result)) refresh();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.nameKu,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "nameKu",
							required: true,
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.nameEn,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "nameEn",
							required: true,
							dir: "ltr",
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.brand,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "brand",
							required: true,
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.category,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							name: "category",
							className: controlClass,
							children: [
								"electronics",
								"home",
								"beauty",
								"fashion",
								"baby",
								"sports"
							].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: id,
								children: id
							}, id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.body,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							name: "description",
							className: `${controlClass} h-24 py-3`
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.specs,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "specs",
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Image",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							name: "image",
							className: controlClass,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "—"
							}), [
								"earbuds",
								"kettle",
								"cream",
								"sneakers",
								"perfume",
								"ball",
								"baby",
								"dress"
							].map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: `/bazaar/${name}.jpg`,
								children: name
							}, name))]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.price,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "price",
							required: true,
							dir: "ltr",
							inputMode: "numeric",
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.shipping,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "shipping",
							dir: "ltr",
							inputMode: "numeric",
							defaultValue: 0,
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.stock,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							name: "stock",
							className: controlClass,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "in",
									children: "in"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "low",
									children: "low"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "out",
									children: "out"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.contact,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "contact",
							required: true,
							dir: "ltr",
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: btnPrimary,
						type: "submit",
						children: t.add
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 rounded-2xl border border-line p-4",
				onSubmit: async (event) => {
					event.preventDefault();
					const form = new FormData(event.currentTarget);
					const result = await marketSaveOffer({ data: {
						slug: form.get("slug"),
						price: Number(form.get("price")),
						shipping: Number(form.get("shipping") || 0),
						stock: form.get("stock"),
						contact: form.get("contact")
					} });
					setMessage("error" in result ? t[result.error] ?? t.invalid : t.saved);
					if (!("error" in result)) refresh();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: t.offers
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "slug",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "slug",
							required: true,
							dir: "ltr",
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.price,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "price",
							required: true,
							dir: "ltr",
							inputMode: "numeric",
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.shipping,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "shipping",
							dir: "ltr",
							inputMode: "numeric",
							defaultValue: 0,
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.stock,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							name: "stock",
							className: controlClass,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "in",
									children: "in"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "low",
									children: "low"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "out",
									children: "out"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.contact,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "contact",
							required: true,
							dir: "ltr",
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: btnPrimary,
						type: "submit",
						children: t.save
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2 text-sm",
				children: mine.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-line p-3",
					children: [
						lang === "ckb" ? row.nameKu : row.nameEn,
						" · ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
							dir: "ltr",
							children: iqd(row.price + row.shipping)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [
								" · ",
								row.productStatus,
								" / ",
								row.offerStatus
							]
						})
					]
				}, row.slug + row.contact))
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-clay",
				children: message
			}) : null
		]
	})] });
}
//#endregion
export { SellPage as component };
