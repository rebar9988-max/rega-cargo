import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as useI18n } from "./field-ClBf72CX.mjs";
import { a as Search, l as Heart } from "../_libs/lucide-react.mjs";
import { n as Shell } from "./shell-CA276dc0.mjs";
import { t as QuotePanel } from "./quote-panel-DQICFmsg.mjs";
import { c as storeCopy, l as writeFavs, n as STORES, o as readFavs, r as STORE_CATEGORIES, s as storeById, t as GOODS } from "./stores-CHQiDGWG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bazaar-page-CA53C0wM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BRANDS = [
	{
		name: "NIVEA",
		category: "beauty"
	},
	{
		name: "L'ORÉAL",
		category: "beauty"
	},
	{
		name: "GARNIER",
		category: "beauty"
	},
	{
		name: "KÉRASTASE",
		category: "beauty"
	},
	{
		name: "SEPHORA",
		category: "beauty"
	},
	{
		name: "ZARA",
		category: "fashion"
	},
	{
		name: "H&M",
		category: "fashion"
	},
	{
		name: "ZALANDO",
		category: "fashion"
	},
	{
		name: "AMAZON",
		category: "electronics"
	},
	{
		name: "OTTO",
		category: "home"
	},
	{
		name: "DECATHLON",
		category: "sports"
	}
];
function BazaarPage() {
	const { lang } = useI18n();
	const t = storeCopy(lang);
	const [q, setQ] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("all");
	const [brandName, setBrandName] = (0, import_react.useState)(null);
	const [country, setCountry] = (0, import_react.useState)("all");
	const [onlyFav, setOnlyFav] = (0, import_react.useState)(false);
	const [favs, setFavs] = (0, import_react.useState)(() => readFavs());
	const query = q.trim().toLowerCase();
	const goods = (0, import_react.useMemo)(() => {
		return GOODS.filter((good) => {
			if (category !== "all" && good.category !== category) return false;
			if (!query) return true;
			const shop = storeById(good.storeId);
			return `${t.goods[good.id]} ${shop?.name ?? ""} ${shop?.host ?? ""}`.toLowerCase().includes(query);
		});
	}, [
		category,
		query,
		t
	]);
	const list = (0, import_react.useMemo)(() => {
		return STORES.filter((store) => {
			if (onlyFav && !favs.includes(store.id)) return false;
			if (category !== "all" && !store.categories.includes(category)) return false;
			if (country !== "all" && store.country !== country) return false;
			if (!query) return true;
			return `${store.name} ${store.host}`.toLowerCase().includes(query);
		});
	}, [
		query,
		category,
		country,
		onlyFav,
		favs
	]);
	function toggle(id) {
		const next = favs.includes(id) ? favs.filter((item) => item !== id) : [...favs, id];
		setFavs(next);
		writeFavs(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "border-b border-line bg-paper",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl items-start gap-6 px-5 py-6 md:grid-cols-[minmax(0,1fr)_24rem] md:gap-8 md:py-14",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-xs font-semibold tracking-[0.16em] text-pine",
					children: "EUROPE ↔ KURDISTAN ↔ IRAQ"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-3xl font-semibold tracking-tight text-ink md:text-5xl",
					children: t.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "hidden max-w-xl text-base leading-relaxed text-muted md:block",
							children: t.lede
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBox, {
							q,
							setQ,
							label: t.search
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-xs text-muted",
							children: t.notPartner
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 flex gap-2 overflow-x-auto pb-1",
					children: BRANDS.map((brand) => {
						const on = brandName === brand.name;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": on,
							onClick: () => {
								setBrandName(brand.name);
								setCategory(brand.category);
							},
							className: `h-11 shrink-0 rounded-full border px-4 font-sans text-sm ${on ? "border-ink bg-ink text-pine-ink" : "border-line bg-surface text-ink"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
								dir: "ltr",
								children: brand.name
							})
						}, brand.name);
					})
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden md:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuotePanel, { variant: "compact" })
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-6xl flex-col gap-8 px-5 py-6 md:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 overflow-x-auto pb-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					on: category === "all" && !brandName,
					onClick: () => {
						setBrandName(null);
						setCategory("all");
					},
					children: t.allCategories
				}), STORE_CATEGORIES.filter((item) => item !== "general").map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					on: category === item && !brandName,
					onClick: () => {
						setBrandName(null);
						setCategory(item);
					},
					children: t.categories[item]
				}, item))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5",
				children: goods.map((good) => {
					const shop = storeById(good.storeId);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-hidden rounded-2xl bg-surface",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: good.image,
								alt: t.goods[good.id],
								className: "aspect-[3/4] w-full object-cover"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-1 flex-col gap-1 px-1 pt-3",
							children: [
								shop ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-sans text-[10px] font-semibold tracking-[0.16em] text-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
										dir: "ltr",
										children: shop.name
									})
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm font-medium leading-snug",
									children: t.goods[good.id]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: t.awaiting
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/stores/request",
									search: {
										store: good.storeId,
										intent: "buy",
										item: good.id
									},
									className: "mt-2 inline-flex h-10 items-center justify-center rounded-full bg-ink text-sm text-pine-ink",
									children: t.order
								})
							]
						})]
					}, good.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-semibold tracking-tight md:text-3xl",
					children: t.storesHeading
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: country,
						onChange: (event) => setCountry(event.target.value),
						"aria-label": t.allCountries,
						className: "h-11 rounded-full border border-line bg-surface px-4 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: t.allCountries
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "DE",
								children: t.germany
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "INT",
								children: t.international
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": onlyFav,
						onClick: () => setOnlyFav((value) => !value),
						className: `inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm ${onlyFav ? "border-pine text-pine" : "border-line"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
							className: "size-4",
							fill: onlyFav ? "currentColor" : "none"
						}), t.favorites]
					})]
				})]
			}),
			list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t.empty
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
				children: list.map((store) => {
					const loved = favs.includes(store.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-col rounded-3xl border border-line bg-surface p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-14 shrink-0 place-items-center rounded-2xl bg-ink font-sans text-lg font-semibold text-pine-ink",
									children: store.name.slice(0, 1)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-sans text-xl font-semibold tracking-tight",
											children: store.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-pressed": loved,
											"aria-label": t.favorites,
											onClick: () => toggle(store.id),
											className: "inline-flex size-10 items-center justify-center rounded-full border border-line",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
												className: `size-4 ${loved ? "text-pine" : "text-muted"}`,
												fill: loved ? "currentColor" : "none"
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-muted",
										children: [
											store.country === "DE" ? t.germany : t.international,
											" · ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
												dir: "ltr",
												children: store.host
											})
										]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm text-muted",
								children: store.categories.map((item) => t.categories[item]).join(" · ")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: store.url,
								target: "_blank",
								rel: "noreferrer",
								className: "mt-5 inline-flex h-11 items-center justify-center rounded-full bg-ink text-sm font-medium text-pine-ink",
								children: t.open
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/stores/request",
									search: {
										store: store.id,
										intent: "buy",
										item: void 0
									},
									className: "text-ink underline-offset-4 hover:underline",
									children: t.assist
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/stores/request",
									search: {
										store: store.id,
										intent: "ship",
										item: void 0
									},
									className: "text-muted underline-offset-4 hover:underline",
									children: t.shipOwn
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
								className: "mt-3 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
										className: "cursor-pointer",
										children: t.external
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 leading-relaxed",
										children: t.notes[store.note]
									}),
									store.caution.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-2 flex flex-col gap-1",
										children: store.caution.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: t.cautions[item] }, item))
									}) : null
								]
							})
						]
					}, store.id);
				})
			})
		]
	})] });
}
function SearchBox({ q, setQ, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "mt-4 flex h-14 max-w-xl items-center gap-3 rounded-full border border-line bg-surface px-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 shrink-0 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			value: q,
			onChange: (event) => setQ(event.target.value),
			placeholder: label,
			"aria-label": label,
			className: "h-full w-full bg-transparent text-base text-ink outline-none"
		})]
	});
}
function Chip({ on, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: `h-11 shrink-0 rounded-full border px-4 text-sm ${on ? "border-ink bg-ink text-pine-ink" : "border-line bg-surface text-ink"}`,
		children
	});
}
//#endregion
export { BazaarPage as t };
