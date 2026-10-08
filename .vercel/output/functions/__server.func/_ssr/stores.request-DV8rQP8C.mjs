import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as controlClass, f as useI18n, n as Field, s as btnPrimary } from "./field-ClBf72CX.mjs";
import { n as Route } from "./router-D3fYEic-.mjs";
import { n as Shell, t as PageHeader } from "./shell-CA276dc0.mjs";
import { m as placeName, n as DESTS } from "./corridor-DVUWnWo4.mjs";
import { a as hostAllowed, c as storeCopy, i as goodById, s as storeById } from "./stores-CHQiDGWG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stores.request-DV8rQP8C.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var REQUEST_KEY = "rl-buy-requests";
function RequestPage() {
	const { lang } = useI18n();
	const t = storeCopy(lang);
	const { store: storeId, intent, item } = Route.useSearch();
	const store = storeById(storeId);
	const good = goodById(item);
	const [url, setUrl] = (0, import_react.useState)("");
	const [size, setSize] = (0, import_react.useState)("");
	const [color, setColor] = (0, import_react.useState)("");
	const [qty, setQty] = (0, import_react.useState)("1");
	const [dest, setDest] = (0, import_react.useState)(DESTS[0].id);
	const [notes, setNotes] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [warn, setWarn] = (0, import_react.useState)("");
	const [saved, setSaved] = (0, import_react.useState)(null);
	function submit(event) {
		event.preventDefault();
		let href = "";
		const trimmed = url.trim();
		if (trimmed) {
			let parsed;
			try {
				parsed = new URL(trimmed);
			} catch {
				setError(t.invalidUrl);
				return;
			}
			if (parsed.protocol !== "https:") {
				setError(t.invalidUrl);
				return;
			}
			href = parsed.href;
			setWarn(hostAllowed(store, href) ? "" : t.wrongHost);
		} else if (!good) {
			setError(t.invalidUrl);
			return;
		} else setWarn("");
		setError("");
		const id = `RL-${Date.now().toString(36).toUpperCase()}`;
		const row = {
			id,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			intent,
			storeId: store?.id ?? null,
			item: good?.id ?? null,
			url: href,
			size,
			color,
			qty,
			dest,
			notes
		};
		const prev = JSON.parse(window.localStorage.getItem(REQUEST_KEY) ?? "[]");
		window.localStorage.setItem(REQUEST_KEY, JSON.stringify([row, ...Array.isArray(prev) ? prev : []].slice(0, 20)));
		setSaved(id);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: t.requestKicker,
		title: intent === "ship" ? t.shipTitle : t.buyTitle,
		lede: t.requestLede
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[minmax(0,1fr)_20rem] md:py-16",
		children: [saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-line bg-surface p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-semibold",
					children: t.sentTitle
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-relaxed text-muted",
					children: t.sentBody
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 font-sans text-sm font-semibold",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
						dir: "ltr",
						children: saved
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/stores",
					className: "mt-6 inline-flex h-12 items-center rounded-full border border-line px-5 text-sm",
					children: t.back
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6",
			children: [
				good ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: good.image,
						alt: "",
						className: "size-16 rounded-xl object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: t.goods[good.id]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: t.sample
					})] })]
				}) : null,
				store ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-sans text-sm text-muted",
					children: [
						store.name,
						" · ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
							dir: "ltr",
							children: store.host
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: t.url,
					hint: t.urlHint,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						dir: "ltr",
						inputMode: "url",
						value: url,
						onChange: (event) => setUrl(event.target.value),
						required: !good
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: t.size,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: controlClass,
								value: size,
								onChange: (event) => setSize(event.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: t.color,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: controlClass,
								value: color,
								onChange: (event) => setColor(event.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: t.qty,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: controlClass,
								dir: "ltr",
								inputMode: "numeric",
								value: qty,
								onChange: (event) => setQty(event.target.value)
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: t.dest,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: controlClass,
						value: dest,
						onChange: (event) => setDest(event.target.value),
						children: DESTS.map((place) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: place.id,
							children: placeName(place, lang)
						}, place.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: t.notesLabel,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: `${controlClass} h-28 py-3`,
						value: notes,
						onChange: (event) => setNotes(event.target.value)
					})
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-clay",
					children: error
				}) : null,
				warn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-clay",
					children: warn
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: btnPrimary,
					children: t.submit
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-line bg-surface p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: t.costs
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-col gap-3",
						children: t.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-baseline justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
								dir: "ltr",
								className: "shrink-0 text-muted",
								children: t.awaiting
							})]
						}, row))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-line bg-surface p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: t.whoTitle
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-relaxed text-muted",
						children: intent === "ship" ? t.shipBody : t.whoBody
					})]
				}),
				store && store.caution.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-line bg-surface p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: t.cautionTitle
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-2",
						children: store.caution.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-sm text-clay",
							children: t.cautions[item]
						}, item))
					})]
				}) : null
			]
		})]
	})] });
}
//#endregion
export { RequestPage as component };
