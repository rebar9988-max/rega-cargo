import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as controlClass, f as useI18n, i as Iqd, n as Field, o as btnGhost, s as btnPrimary, t as Eur, u as dayRange } from "./field-ClBf72CX.mjs";
import { a as ORIGINS, c as countryName, d as getDest, h as priceShipment, i as MODES, l as dutyEstimate, m as placeName, n as DESTS, p as getOrigin, r as HELD_KEY, s as SAMPLE_BOX, t as BOOKING_KEY, u as formatEur } from "./corridor-DVUWnWo4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quote-panel-DQICFmsg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function readHeld() {
	try {
		const raw = window.localStorage.getItem(HELD_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed.slice(0, 4) : [];
	} catch {
		return [];
	}
}
function QuotePanel({ variant, initial }) {
	const { t, lang } = useI18n();
	const navigate = useNavigate();
	const [fromId, setFromId] = (0, import_react.useState)(getOrigin(initial?.from).id);
	const [toId, setToId] = (0, import_react.useState)(getDest(initial?.to).id);
	const [kg, setKg] = (0, import_react.useState)(initial?.kg && Number(initial.kg) > 0 ? initial.kg : String(SAMPLE_BOX.kg));
	const [length, setLength] = (0, import_react.useState)(String(SAMPLE_BOX.l));
	const [width, setWidth] = (0, import_react.useState)(String(SAMPLE_BOX.w));
	const [height, setHeight] = (0, import_react.useState)(String(SAMPLE_BOX.h));
	const [pieces, setPieces] = (0, import_react.useState)("1");
	const [contents, setContents] = (0, import_react.useState)("personal");
	const [value, setValue] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [held, setHeld] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (variant === "full") setHeld(readHeld());
	}, [variant]);
	const origin = getOrigin(fromId);
	const dest = getDest(toId);
	const weight = Number(kg);
	const dims = variant === "compact" ? SAMPLE_BOX : {
		l: Number(length),
		w: Number(width),
		h: Number(height)
	};
	const weightOk = Number.isFinite(weight) && weight >= .2 && weight <= 300;
	const dimsOk = variant === "compact" || [
		dims.l,
		dims.w,
		dims.h
	].every((n) => Number.isFinite(n) && n >= 0 && n <= 300);
	const valid = weightOk && dimsOk;
	const pieceCount = Math.min(50, Math.max(1, Math.round(Number(pieces) || 1)));
	const declared = Number(value);
	const safeValue = Number.isFinite(declared) && declared > 0 ? declared : 0;
	const rows = (0, import_react.useMemo)(() => {
		if (!valid) return [];
		return MODES.map((mode) => ({
			mode,
			price: priceShipment({
				mode,
				origin,
				dest,
				weightKg: weight,
				l: dims.l,
				w: dims.w,
				h: dims.h
			})
		}));
	}, [
		valid,
		origin,
		dest,
		weight,
		dims.l,
		dims.w,
		dims.h
	]);
	const lead = rows[0];
	const duty = dutyEstimate(contents, safeValue);
	function persist(modeId, total, chargeable) {
		return {
			fromId,
			toId,
			mode: modeId,
			total,
			kg: weight,
			chargeable,
			contents
		};
	}
	function book(modeId, total, chargeable) {
		const draft = persist(modeId, total, chargeable);
		window.sessionStorage.setItem(BOOKING_KEY, JSON.stringify(draft));
		navigate({ to: "/contact" });
	}
	function save(modeId, total, chargeable) {
		const next = [{
			...persist(modeId, total, chargeable),
			at: (/* @__PURE__ */ new Date()).toISOString()
		}, ...(held ?? []).filter((item) => !(item.fromId === fromId && item.toId === toId && item.mode === modeId))].slice(0, 4);
		window.localStorage.setItem(HELD_KEY, JSON.stringify(next));
		setHeld(next);
		setNotice(t.saved);
	}
	function removeHeld(index) {
		const next = (held ?? []).filter((_, i) => i !== index);
		window.localStorage.setItem(HELD_KEY, JSON.stringify(next));
		setHeld(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: variant === "compact" ? "ticket rounded-2xl border border-line bg-surface p-5 md:p-6" : "flex flex-col gap-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: variant === "full" ? "ticket rounded-2xl border border-line bg-surface p-5 md:p-6" : "",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-widest text-pine",
						children: t.waybill
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
							dir: "ltr",
							children: "EUR · IQD"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 grid gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.from,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: controlClass,
							value: fromId,
							onChange: (event) => setFromId(event.target.value),
							children: ORIGINS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: item.id,
								children: [
									placeName(item, lang),
									" — ",
									countryName(item, lang)
								]
							}, item.id))
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.to,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: controlClass,
							value: toId,
							onChange: (event) => setToId(event.target.value),
							children: DESTS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: item.id,
								children: placeName(item, lang)
							}, item.id))
						})
					})]
				}),
				variant === "compact" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium",
								children: t.weight
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bdi", {
								dir: "ltr",
								className: "text-lg font-semibold tabular-nums",
								children: [
									Number.isFinite(weight) ? weight.toFixed(1) : "—",
									" ",
									t.kg
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "mt-2 h-12 w-full",
							type: "range",
							min: .5,
							max: 30,
							step: .1,
							value: Math.min(30, Math.max(.5, Number.isFinite(weight) ? weight : 3.2)),
							"aria-label": t.weight,
							onChange: (event) => setKg(event.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bdi", {
								dir: "ltr",
								children: [
									SAMPLE_BOX.l,
									" × ",
									SAMPLE_BOX.w,
									" × ",
									SAMPLE_BOX.h,
									" ",
									t.cm
								]
							})
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `${t.weight} (${t.kg})`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: controlClass,
								dir: "ltr",
								inputMode: "decimal",
								value: kg,
								onChange: (event) => setKg(event.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: t.pieces,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: controlClass,
								dir: "ltr",
								inputMode: "numeric",
								value: pieces,
								onChange: (event) => setPieces(event.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `${t.length} (${t.cm})`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: controlClass,
								dir: "ltr",
								inputMode: "decimal",
								value: length,
								onChange: (e) => setLength(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `${t.width} (${t.cm})`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: controlClass,
								dir: "ltr",
								inputMode: "decimal",
								value: width,
								onChange: (e) => setWidth(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `${t.height} (${t.cm})`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: controlClass,
								dir: "ltr",
								inputMode: "decimal",
								value: height,
								onChange: (e) => setHeight(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: t.inside,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: controlClass,
								value: contents,
								onChange: (event) => setContents(event.target.value),
								children: Object.keys(t.contentsOpt).map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: key,
									children: t.contentsOpt[key]
								}, key))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `${t.value} (€)`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: controlClass,
								dir: "ltr",
								inputMode: "decimal",
								value,
								onChange: (e) => setValue(e.target.value)
							})
						})
					]
				}),
				!weightOk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-clay",
					children: t.weightError
				}) : null,
				!dimsOk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-clay",
					children: t.dimError
				}) : null,
				variant === "full" && pieceCount > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: t.perPiece
				}) : null,
				valid && lead ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5",
					"aria-live": "polite",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
									k: t.scale,
									v: `${weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(1)} ${t.kg}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
									k: t.volumeWord,
									v: `${lead.price.volumetric.toFixed(1)} ${t.kg}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
									k: t.chargeable,
									v: `${lead.price.chargeable.toFixed(1)} ${t.kg}`,
									hot: lead.price.volumetricWins
								})
							]
						}),
						lead.price.volumetricWins ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-pine",
							children: t.boxSets
						}) : null,
						variant === "compact" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 divide-y divide-line",
							children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-3 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: t.modes[row.mode.id].name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bdi", {
											dir: "ltr",
											children: [
												dayRange(t.dayRange, row.mode.days[0], row.mode.days[1]),
												" · ",
												row.price.chargeable.toFixed(1),
												" ",
												t.kg
											]
										})
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-end",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eur, { value: row.price.total })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Iqd, { eur: row.price.total })
									})]
								})]
							}, row.mode.id))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 flex flex-col gap-3",
							children: rows.map((row) => {
								const less = Math.round((rows[0].price.total - row.price.total) * 100) / 100;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "rounded-xl border border-line bg-paper p-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-start justify-between gap-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [
													row.mode.id === "economy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs font-medium text-pine",
														children: t.usual
													}) : null,
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
														className: "text-lg font-semibold",
														children: t.modes[row.mode.id].name
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-sm text-muted",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
															dir: "ltr",
															children: dayRange(t.dayRange, row.mode.days[0], row.mode.days[1])
														})
													})
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-end",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-2xl font-semibold tracking-tight",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eur, { value: row.price.total })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Iqd, { eur: row.price.total })
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-sm leading-relaxed text-muted",
											children: t.modes[row.mode.id].blurb
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-3 text-sm leading-relaxed text-muted",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bdi", {
													dir: "ltr",
													className: "tabular-nums text-ink",
													children: [
														row.price.chargeable.toFixed(1),
														" kg × €",
														row.mode.perKg.toFixed(2),
														" × ",
														origin.factor.toFixed(2)
													]
												}),
												row.price.minApplied ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [" · ", t.minApplied] }) : null,
												row.price.bulky ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [" · ", t.bulky] }) : null,
												dest.surcharge > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													" ",
													"· ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bdi", {
														dir: "ltr",
														children: ["+", formatEur(dest.surcharge)]
													}),
													" ",
													t.cityDrop
												] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [" · ", t.gateway] })
											]
										}),
										less > .5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-sm text-pine",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eur, { value: less }),
												" ",
												t.saveVs
											]
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-4 flex flex-wrap gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: btnPrimary,
												onClick: () => book(row.mode.id, row.price.total, row.price.chargeable),
												children: t.book
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: btnGhost,
												onClick: () => save(row.mode.id, row.price.total, row.price.chargeable),
												children: t.save
											})]
										})
									]
								}, row.mode.id);
							})
						}),
						variant === "full" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-xl border border-line bg-paper p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.duty }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eur, { value: duty })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-muted",
								children: contents === "documents" ? t.dutyDocs : safeValue > 0 && safeValue <= 200 && contents === "personal" ? t.dutyLow : t.dutyPlan
							})]
						}) : null
					]
				}) : null,
				variant === "compact" && valid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/quote",
					search: {
						from: fromId,
						to: toId,
						kg
					},
					className: `${btnPrimary} mt-4 w-full`,
					children: t.changeBox
				}) : null,
				notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-pine",
					children: notice
				}) : null,
				variant === "full" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm leading-relaxed text-muted",
					children: t.footnote
				}) : null
			]
		}), variant === "full" && held && held.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-semibold",
			children: t.heldTitle
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 flex flex-col gap-2",
			children: held.map((item, index) => {
				const from = getOrigin(item.fromId);
				const to = getDest(item.toId);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: t.modes[item.mode].name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bdi", {
								dir: "ltr",
								children: [
									placeName(from, lang),
									" → ",
									placeName(to, lang)
								]
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eur, { value: item.total })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-sm text-muted underline",
							onClick: () => removeHeld(index),
							children: t.remove
						})]
					})]
				}, `${item.at}-${index}`);
			})
		})] }) : null]
	});
}
function Meter({ k, v, hot }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `bg-surface px-3 py-3 ${hot ? "text-pine" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm font-semibold",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
				dir: "ltr",
				className: "tabular-nums",
				children: v
			})
		})]
	});
}
//#endregion
export { QuotePanel as t };
