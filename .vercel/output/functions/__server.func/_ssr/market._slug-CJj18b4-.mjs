import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as controlClass, f as useI18n, n as Field, o as btnGhost, s as btnPrimary } from "./field-ClBf72CX.mjs";
import { a as Route$3, b as marketReview, d as iqd, g as marketFavorite, h as marketCopy, m as marketAlert, v as marketProduct, y as marketReport } from "./router-D3fYEic-.mjs";
import { n as Shell, t as PageHeader } from "./shell-CA276dc0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market._slug-CJj18b4-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductPage() {
	const initial = Route$3.useLoaderData();
	const { slug } = Route$3.useParams();
	const { lang } = useI18n();
	const t = marketCopy(lang);
	const [data, setData] = (0, import_react.useState)(initial);
	const [message, setMessage] = (0, import_react.useState)("");
	if ("error" in data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: "R&L",
		title: t.notfound,
		lede: t.marketLede
	}) });
	const name = lang === "ckb" ? data.nameKu : data.nameEn;
	const max = Math.max(1, ...data.history.map((point) => point.total));
	async function reload() {
		setData(await marketProduct({ data: { slug } }));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: lang === "ckb" ? data.categoryKu : data.categoryEn,
		title: name,
		lede: data.descriptionKu
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[16rem_minmax(0,1fr)]",
		children: [data.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: data.image,
			alt: "",
			className: "aspect-square w-full rounded-2xl object-cover"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-square rounded-2xl bg-paper" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-sans text-sm text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
						dir: "ltr",
						children: data.brand
					}), data.specs ? ` · ${data.specs}` : ""]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: t.freeSort
				}),
				data.avg != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bdi", {
						dir: "ltr",
						children: [data.avg.toFixed(1), " / 5"]
					})
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: btnGhost,
						onClick: async () => {
							const result = await marketFavorite({ data: {
								slug,
								on: !data.favorite
							} });
							if ("error" in result) setMessage(t[result.error] ?? t.invalid);
							else reload();
						},
						children: data.favorite ? t.saved : t.favorite
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/move",
						search: {
							product: slug,
							item: name
						},
						className: btnPrimary,
						children: t.deliver
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-3",
					children: data.offers.map((offer) => {
						const best = offer.id === data.cheapestId;
						const external = offer.contact.startsWith("https://");
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: `rounded-2xl border p-4 ${best ? "border-pine bg-paper" : "border-line bg-surface"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-baseline justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold",
										children: offer.sellerName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-lg font-semibold text-pine",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
											dir: "ltr",
											children: iqd(offer.total)
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted",
									children: [
										offer.city,
										" · ",
										t.price,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
											dir: "ltr",
											children: iqd(offer.price)
										}),
										" · ",
										t.shipping,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
											dir: "ltr",
											children: iqd(offer.shipping)
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm",
									children: offer.stock === "in" ? t.inStock : offer.stock === "low" ? "کەم ماوە" : "نەماوە"
								}),
								external ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: offer.contact,
									target: "_blank",
									rel: "noreferrer",
									className: `${btnPrimary} mt-3`,
									children: t.visit
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
										dir: "ltr",
										children: offer.contact
									})
								})
							]
						}, offer.id);
					})
				}),
				data.history.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: t.history
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 flex flex-col gap-2",
					children: data.history.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid grid-cols-[minmax(0,1fr)_8rem] items-center gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block h-2 rounded-full bg-pine",
							style: { width: `${Math.max(12, point.total / max * 100)}%` }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
							dir: "ltr",
							children: iqd(point.total)
						})]
					}, point.at))
				})] }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4",
					onSubmit: async (event) => {
						event.preventDefault();
						const target = new FormData(event.currentTarget).get("target");
						const result = await marketAlert({ data: {
							slug,
							target: Number(target)
						} });
						setMessage("error" in result ? t[result.error] ?? t.invalid : t.saved);
						if (!("error" in result)) reload();
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.alert,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "target",
							dir: "ltr",
							inputMode: "numeric",
							defaultValue: data.alert ?? "",
							className: controlClass,
							required: true
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: btnPrimary,
						type: "submit",
						children: t.save
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex flex-col gap-3",
					onSubmit: async (event) => {
						event.preventDefault();
						const form = new FormData(event.currentTarget);
						const result = await marketReview({ data: {
							slug,
							rating: Number(form.get("rating")),
							body: String(form.get("body") ?? "")
						} });
						setMessage("error" in result ? t[result.error] ?? t.invalid : t.saved);
						if (!("error" in result)) reload();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold",
							children: t.review
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: t.rating,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "rating",
								dir: "ltr",
								inputMode: "numeric",
								min: 1,
								max: 5,
								defaultValue: 5,
								className: controlClass
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: t.body,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								name: "body",
								className: `${controlClass} h-24 py-3`
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: btnGhost,
							type: "submit",
							children: t.send
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "flex flex-col gap-2",
							children: data.reviews.map((review) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bdi", {
										dir: "ltr",
										children: [review.rating, "/5"]
									}),
									" ",
									review.body
								]
							}, review.at))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Report, {}),
				message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-clay",
					children: message
				}) : null
			]
		})]
	})] });
}
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
//#endregion
export { Report, ProductPage as component };
