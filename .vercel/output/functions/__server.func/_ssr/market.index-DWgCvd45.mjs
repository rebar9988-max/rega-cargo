import { C as require_jsx_runtime, b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as controlClass, f as useI18n } from "./field-ClBf72CX.mjs";
import { d as iqd, h as marketCopy, o as Route$4 } from "./router-D3fYEic-.mjs";
import { n as Shell, t as PageHeader } from "./shell-CA276dc0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market.index-DWgCvd45.js
var import_jsx_runtime = require_jsx_runtime();
function MarketHome() {
	const data = Route$4.useLoaderData();
	const search = Route$4.useSearch();
	const navigate = useNavigate({ from: "/market/" });
	const { lang } = useI18n();
	const t = marketCopy(lang);
	if ("error" in data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: t.marketKicker,
		title: t.marketTitle,
		lede: t.marketLede
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mx-auto max-w-6xl px-5 py-10 text-sm text-clay",
		children: t.invalid
	})] });
	function set(patch) {
		navigate({ search: {
			...search,
			page: 1,
			...patch
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: t.marketKicker,
		title: t.marketTitle,
		lede: t.marketLede
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/market/sell",
						className: "text-pine",
						children: t.sell
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/admin",
						className: "text-pine",
						children: t.admin
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-pine",
						onClick: () => set({ saved: search.saved === "1" ? "" : "1" }),
						children: t.favorite
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 md:grid-cols-4",
				onSubmit: (event) => {
					event.preventDefault();
					const form = new FormData(event.currentTarget);
					set({
						q: String(form.get("q") ?? ""),
						category: String(form.get("category") ?? ""),
						brand: String(form.get("brand") ?? ""),
						min: String(form.get("min") ?? ""),
						max: String(form.get("max") ?? ""),
						stock: form.get("stock") === "on" ? "in" : "",
						sort: String(form.get("sort") ?? "price") === "new" ? "new" : "price"
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "q",
						defaultValue: search.q,
						placeholder: t.search,
						"aria-label": t.search,
						className: controlClass
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						name: "category",
						defaultValue: search.category,
						"aria-label": t.all,
						className: controlClass,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: t.all
						}), data.categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: cat.id,
							children: lang === "ckb" ? cat.name_ku : cat.name_en
						}, cat.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						name: "brand",
						defaultValue: search.brand,
						"aria-label": t.brand,
						className: controlClass,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: t.brand
						}), data.brands.map((brand) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: brand,
							children: brand
						}, brand))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						name: "sort",
						defaultValue: search.sort,
						"aria-label": t.priceSort,
						className: controlClass,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "price",
							children: t.priceSort
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "new",
							children: t.newest
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "min",
						defaultValue: search.min,
						inputMode: "numeric",
						dir: "ltr",
						placeholder: t.min,
						"aria-label": t.min,
						className: controlClass
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "max",
						defaultValue: search.max,
						inputMode: "numeric",
						dir: "ltr",
						placeholder: t.max,
						"aria-label": t.max,
						className: controlClass
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex h-12 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "stock",
							type: "checkbox",
							defaultChecked: search.stock === "in"
						}), t.inStock]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "h-12 rounded-full bg-pine px-5 text-sm font-medium text-pine-ink",
						children: t.search
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t.freeSort
			}),
			data.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t.none
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-4",
				children: data.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "overflow-hidden rounded-2xl border border-line bg-surface",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/market/$slug",
						params: { slug: item.slug },
						className: "flex h-full flex-col",
						children: [item.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: item.image,
							alt: "",
							className: "aspect-square w-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "aspect-square bg-paper" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex flex-1 flex-col gap-1 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: lang === "ckb" ? item.nameKu : item.nameEn
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-sans text-xs text-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
										dir: "ltr",
										children: item.brand
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-pine",
									children: item.lowest == null ? "—" : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
										dir: "ltr",
										children: iqd(item.lowest)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
											dir: "ltr",
											children: item.offerCount
										}),
										" ",
										t.offers
									]
								})
							]
						})]
					})
				}, item.slug))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3",
				children: [
					search.page > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-sm text-pine",
						onClick: () => set({ page: search.page - 1 }),
						children: "←"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bdi", {
							dir: "ltr",
							children: [
								search.page,
								" / ",
								data.pages
							]
						})
					}),
					search.page < data.pages ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-sm text-pine",
						onClick: () => navigate({ search: {
							...search,
							page: search.page + 1
						} }),
						children: "→"
					}) : null
				]
			})
		]
	})] });
}
//#endregion
export { MarketHome as component };
