import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as controlClass, f as useI18n, n as Field, s as btnPrimary, t as Eur } from "./field-ClBf72CX.mjs";
import { n as Shell, t as PageHeader } from "./shell-CA276dc0.mjs";
import { d as getDest, f as getMode, m as placeName, o as REQUESTS_KEY, p as getOrigin, t as BOOKING_KEY } from "./corridor-DVUWnWo4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contact-Cd3E9dgi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function readRequests() {
	try {
		const raw = window.localStorage.getItem(REQUESTS_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
	} catch {
		return [];
	}
}
function ContactPage() {
	const { t, lang } = useI18n();
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [city, setCity] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [done, setDone] = (0, import_react.useState)(false);
	const [booking, setBooking] = (0, import_react.useState)(null);
	const [rows, setRows] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setRows(readRequests());
		try {
			const raw = window.sessionStorage.getItem(BOOKING_KEY);
			if (!raw) return;
			const parsed = JSON.parse(raw);
			if (parsed && typeof parsed.total === "number") {
				setBooking(parsed);
				setCity((current) => current || placeName(getDest(parsed.toId), lang));
			}
		} catch {
			setBooking(null);
		}
	}, [lang]);
	function clearBooking() {
		window.sessionStorage.removeItem(BOOKING_KEY);
		setBooking(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: t.contactKicker,
		title: t.contactTitle,
		lede: t.contactLede
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-6xl gap-12 px-5 py-12 lg:grid-cols-3 lg:py-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 lg:col-span-2",
			children: [
				booking ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pine bg-surface p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-pine",
							children: t.attached
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-medium",
							children: t.modes[getMode(booking.mode).id].name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bdi", {
								dir: "ltr",
								children: [
									placeName(getOrigin(booking.fromId), lang),
									" → ",
									placeName(getDest(booking.toId), lang)
								]
							})
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-lg font-semibold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eur, { value: booking.total })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-sm text-muted underline",
							onClick: clearBooking,
							children: t.clearRate
						})]
					})]
				}) : null,
				done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 rounded-2xl border border-line bg-surface p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-semibold",
							children: t.successTitle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-xl text-sm leading-relaxed text-muted",
							children: t.successBody
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: `${btnPrimary} mt-6`,
							onClick: () => {
								setDone(false);
								setName("");
								setPhone("");
								setNote("");
							},
							children: t.another
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-8 grid gap-4 sm:grid-cols-2",
					onSubmit: (event) => {
						event.preventDefault();
						if (name.trim().length < 2 || phone.trim().length < 5) {
							setError(t.formError);
							return;
						}
						const next = [{
							name: name.trim(),
							phone: phone.trim(),
							city: city.trim(),
							note: note.trim(),
							at: (/* @__PURE__ */ new Date()).toISOString(),
							booking
						}, ...rows ?? []].slice(0, 3);
						window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(next));
						setRows(next);
						setError("");
						setDone(true);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: t.name,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: controlClass,
								value: name,
								onChange: (e) => setName(e.target.value),
								autoComplete: "name"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: t.phone,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: controlClass,
								dir: "ltr",
								inputMode: "tel",
								value: phone,
								onChange: (e) => setPhone(e.target.value),
								autoComplete: "tel"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: t.city,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: controlClass,
								value: city,
								onChange: (e) => setCity(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "sm:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: t.note,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									className: `${controlClass} h-28 py-3`,
									value: note,
									onChange: (e) => setNote(e.target.value)
								})
							})
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-clay sm:col-span-2",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "sm:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								className: btnPrimary,
								children: t.send
							})
						})
					]
				}),
				rows && rows.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: t.yourRequests
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-2",
						children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-xl border border-line px-4 py-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: row.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
										dir: "ltr",
										children: row.phone
									}), row.city ? ` · ${row.city}` : ""]
								}),
								row.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-muted",
									children: row.note
								}) : null
							]
						}, row.at))
					})]
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "h-fit rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-24",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: t.hubsTitle
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 flex flex-col gap-4",
					children: t.hubs.map((hub) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: hub.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: hub.detail
					})] }, hub.name))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-sm font-medium",
					children: t.hoursTitle
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 flex flex-col gap-2",
					children: t.hours.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-muted",
						children: row
					}, row))
				})
			]
		})]
	})] });
}
//#endregion
export { ContactPage as component };
