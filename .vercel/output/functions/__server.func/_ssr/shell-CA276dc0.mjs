import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, b as Link, p as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { a as LANGS, c as controlClass, d as langMeta, f as useI18n, l as createSsrRpc, s as btnPrimary } from "./field-ClBf72CX.mjs";
import { c as House, d as Check, i as Store, o as Menu, r as Tag, s as LayoutGrid, t as X, u as ChevronDown } from "../_libs/lucide-react.mjs";
import { r as flag, t as COUNTRIES } from "./format-BNUSC0Sf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-CA276dc0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var phoneWho = createServerFn({ method: "GET" }).handler(createSsrRpc("b7e4ae87e0d21430496a9b34b472c21d39829eea5cf967d300c6ec28518c1c4d"));
var phoneBegin = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("77944ce8c2e8e99bd2cb4c9ad16890fdbb8529a7a7711f85e29704e990af870b"));
var phoneJoin = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("ddb81f6e305711400b651176e9db917aa3f0a7c77252df05b267b580972c0798"));
var phoneCheck = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("2d6de31c6b19c78aefe2179985a379ce1d9e57e8a0f853d02d8290850e173af6"));
var phoneEnter = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("811c38d446ecb8d2c2dca0030f30fd23915bbc93bf373c3737388aec1defec87"));
var phoneLeave = createServerFn({ method: "POST" }).handler(createSsrRpc("2f37ca9d2003a92ed9e933847123961f20fb64c9a3dbc61d29ed182fc663555f"));
var copy = {
	ckb: {
		in: "ژوورەوە",
		out: "دەرچوون",
		title: "بە ژمارەی تەلەفۆن",
		lede: "کۆدی وڵات هەڵبژێرە. کۆدەکە دەچێت بۆ واتسئەپ و بۆ سیمەکەت.",
		both: "کۆدەکە بۆ واتسئەپ و بۆ سیمەکەت نێردرا.",
		waOnly: "تەنها واتسئەپ گەیشت. کورتەنامەکە نەچوو.",
		smsOnly: "تەنها کورتەنامە بۆ سیمەکەت چوو. واتسئەپ نەگەیشت.",
		offline: "هێڵی واتسئەپ و کورتەنامە هێشتا نەبەستراون، بۆیە کۆدەکە خۆت دادەنێیت.",
		country: "وڵات",
		search: "گەڕان بە وڵات یان کۆد",
		number: "ژمارە",
		next: "بەردەوامبە",
		name: "ناو",
		pin: "کۆدی چوار ژمارە",
		join: "تۆمارکردن",
		enter: "هاتنەژوورەوە",
		back: "گەڕانەوە",
		phone: "ئەم ژمارەیە دروست نییە.",
		rate: "زۆر هەوڵدرا. کەمێک بوەستە.",
		wrong: "کۆدەکە هەڵەیە.",
		invalid: "ناو و کۆدی چوار ژمارە پێویستە.",
		exists: "ئەم ژمارەیە تۆمارکراوە."
	},
	en: {
		in: "Enter",
		out: "Sign out",
		title: "With your phone",
		lede: "Pick a country code. The code is sent on WhatsApp and as a text to the SIM.",
		both: "The code was sent on WhatsApp and to the SIM.",
		waOnly: "Only WhatsApp went through. The text did not.",
		smsOnly: "Only the SIM text went through. WhatsApp did not.",
		offline: "WhatsApp and SMS are not connected yet, so you choose the code yourself.",
		country: "Country",
		search: "Search a country or code",
		number: "Number",
		next: "Continue",
		name: "Name",
		pin: "Four-digit code",
		join: "Create account",
		enter: "Enter",
		back: "Back",
		phone: "That number is not valid.",
		rate: "Too many tries. Wait a little.",
		wrong: "That code is wrong.",
		invalid: "A name and a four-digit code are required.",
		exists: "This number is already registered."
	}
};
function PhoneButton() {
	const { lang } = useI18n();
	const t = lang === "ckb" ? copy.ckb : copy.en;
	const [open, setOpen] = (0, import_react.useState)(false);
	const [me, setMe] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		phoneWho().then((user) => setMe(user));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: () => setOpen(true),
		className: "inline-flex h-10 max-w-28 items-center truncate rounded-full border border-line px-3 text-sm",
		children: me ? me.name : t.in
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneDialog, {
		t,
		me,
		onClose: () => setOpen(false),
		onUser: (user) => {
			setMe(user);
			setOpen(false);
		}
	}) : null] });
}
function PhoneDialog({ t, me, onClose, onUser }) {
	const [country, setCountry] = (0, import_react.useState)(COUNTRIES[0]);
	const [picking, setPicking] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const [national, setNational] = (0, import_react.useState)("");
	const [exists, setExists] = (0, import_react.useState)(null);
	const [channels, setChannels] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [pin, setPin] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const matches = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		if (!q) return COUNTRIES;
		return COUNTRIES.filter((item) => `${item.name} ${item.local} ${item.dial} ${item.iso}`.toLowerCase().includes(q));
	}, [query]);
	async function begin() {
		setBusy(true);
		setError("");
		const result = await phoneBegin({ data: {
			dial: country.dial,
			national
		} });
		setBusy(false);
		if ("error" in result && result.error) {
			setError(t[result.error] ?? t.phone);
			return;
		}
		if ("exists" in result) {
			setExists(result.exists);
			setChannels(result.sent ? {
				whatsapp: result.whatsapp,
				sms: result.sms
			} : null);
		}
	}
	async function finish() {
		setBusy(true);
		setError("");
		const result = channels ? await phoneCheck({ data: {
			dial: country.dial,
			national,
			pin,
			name
		} }) : exists ? await phoneEnter({ data: {
			dial: country.dial,
			national,
			pin
		} }) : await phoneJoin({ data: {
			dial: country.dial,
			national,
			name,
			pin
		} });
		setBusy(false);
		if ("error" in result && result.error) {
			setError(t[result.error] ?? t.invalid);
			return;
		}
		if ("name" in result && result.name && "phone" in result && result.phone) onUser({
			name: result.name,
			phone: result.phone
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-ink/40 md:items-center md:p-6",
		role: "dialog",
		"aria-modal": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex max-h-[94vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl md:rounded-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 px-5 pt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-3xl font-semibold tracking-tight",
						children: me ? me.name : t.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "inline-flex size-10 items-center justify-center rounded-full border border-line",
						"aria-label": "close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-5 pt-2 text-sm leading-relaxed text-muted",
					children: me ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
						dir: "ltr",
						children: me.phone
					}) : t.lede
				}),
				me ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `${btnPrimary} mt-6 w-full`,
					onClick: async () => {
						await phoneLeave();
						onUser(null);
					},
					children: t.out
				}) : picking ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex min-h-0 flex-1 flex-col border-t border-line",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: t.search,
						"aria-label": t.search,
						className: "h-12 w-full bg-transparent px-5 text-base outline-none"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "min-h-0 flex-1 overflow-auto",
						children: matches.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex h-12 w-full items-center gap-3 px-5 text-start text-sm hover:bg-paper",
							onClick: () => {
								setCountry(item);
								setPicking(false);
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: flag(item.iso) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 flex-1 truncate",
									children: item.local
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bdi", {
									dir: "ltr",
									className: "text-muted",
									children: ["+", item.dial]
								})
							]
						}) }, item.iso + item.dial))
					})]
				}) : exists == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 px-5 py-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex h-14 items-center rounded-2xl border border-line",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setPicking(true),
								className: "flex h-full items-center gap-2 border-e border-line px-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: flag(country.iso)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bdi", {
									dir: "ltr",
									className: "font-medium",
									children: ["+", country.dial]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: national,
								onChange: (event) => setNational(event.target.value),
								inputMode: "tel",
								dir: "ltr",
								autoComplete: "tel-national",
								placeholder: "7xx xxx xxxx",
								"aria-label": t.number,
								className: "h-full w-full bg-transparent px-3 text-lg outline-none"
							})]
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-clay",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy,
							onClick: () => void begin(),
							className: `${btnPrimary} h-12 w-full rounded-2xl`,
							children: t.next
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex flex-col gap-3 px-5 py-6",
					onSubmit: (event) => {
						event.preventDefault();
						finish();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: channels ? channels.whatsapp && channels.sms ? t.both : channels.whatsapp ? t.waOnly : t.smsOnly : t.offline
						}),
						!exists ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: name,
							onChange: (event) => setName(event.target.value),
							required: true,
							placeholder: t.name,
							"aria-label": t.name,
							className: controlClass
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: pin,
							onChange: (event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4)),
							inputMode: "numeric",
							dir: "ltr",
							autoComplete: exists ? "current-password" : "new-password",
							placeholder: t.pin,
							"aria-label": t.pin,
							className: `${controlClass} text-center font-sans text-2xl tracking-[0.4em]`
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-clay",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy,
							className: `${btnPrimary} w-full`,
							children: exists ? t.enter : t.join
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-sm text-muted",
							onClick: () => {
								setExists(null);
								setChannels(null);
								setError("");
							},
							children: t.back
						})
					]
				})
			]
		})
	});
}
var LINKS = [
	{
		to: "/",
		key: "home",
		exact: true
	},
	{
		to: "/quote",
		key: "quote",
		exact: false
	},
	{
		to: "/track",
		key: "track",
		exact: false
	},
	{
		to: "/customs",
		key: "customs",
		exact: false
	},
	{
		to: "/stores",
		key: "stores",
		exact: false
	},
	{
		to: "/market",
		key: "market",
		exact: false
	},
	{
		to: "/move",
		key: "move",
		exact: false
	},
	{
		to: "/contact",
		key: "contact",
		exact: false
	}
];
var TABS = [
	{
		to: "/",
		key: "home",
		exact: true,
		icon: House
	},
	{
		to: "/stores",
		key: "stores",
		exact: false,
		icon: Store
	},
	{
		to: "/quote",
		key: "quote",
		exact: false,
		icon: Tag
	},
	{
		to: "/market",
		key: "market",
		exact: false,
		icon: LayoutGrid
	}
];
function isOn(path, to, exact) {
	if (exact) return path === to;
	return path === to || path.startsWith(`${to}/`);
}
function Mark({ className = "size-14" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: "/rega-logo.jpg?v=7",
		alt: "R&L",
		width: 56,
		height: 56,
		className: `${className} shrink-0 rounded-xl`
	});
}
function PageHeader({ kicker, title, lede }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "border-b border-line bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-5 py-10 md:py-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-pine",
					children: kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-ink md:text-5xl",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg",
					children: lede
				})
			]
		})
	});
}
function Shell({ children }) {
	const { t, lang, setLang } = useI18n();
	const path = useRouterState({ select: (state) => state.location.pathname });
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setOpen(false);
	}, [path]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#content",
				className: "sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-pine focus:px-4 focus:py-2 focus:text-pine-ink",
				children: t.skip
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-20 border-b border-line bg-surface text-ink",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-16 max-w-6xl items-center gap-3 px-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex min-w-0 items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-11 md:size-12" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden min-w-0 flex-col leading-none xl:flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-sans text-xs font-semibold tracking-wide text-ink",
									children: "MOVE SMART. DELIVER FAST."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 font-sans text-xs text-muted",
									children: "EUROPE ↔ KURDISTAN ↔ IRAQ"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "ms-auto hidden items-center gap-3 lg:flex",
							children: LINKS.map((link) => {
								const on = isOn(path, link.to, link.exact);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: link.to,
									className: `text-sm ${on ? "font-medium text-pine" : "text-muted hover:text-ink"}`,
									children: t.nav[link.key]
								}, link.to);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ms-auto flex shrink-0 items-center gap-1 md:ms-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "hidden lg:block",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LangSwitch, {
										lang,
										setLang
									}, path)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneButton, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "inline-flex size-12 items-center justify-center rounded-full border border-line text-ink lg:hidden",
									"aria-expanded": open,
									"aria-label": open ? t.menuClose : t.menuOpen,
									onClick: () => setOpen((value) => !value),
									children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
								})
							]
						})
					]
				}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex flex-col border-t border-line bg-surface px-5 py-2 lg:hidden",
					children: [LINKS.map((link) => {
						const on = isOn(path, link.to, link.exact);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: link.to,
							className: `flex h-12 items-center text-base ${on ? "font-medium text-pine" : "text-ink"}`,
							children: t.nav[link.key]
						}, link.to);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-line py-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LangSwitch, {
							lang,
							setLang
						}, `${path}-menu`)
					})]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				id: "content",
				className: "flex-1 pb-20 lg:pb-0",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "bg-ink pb-24 text-paper lg:pb-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "leading-none",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-sans text-xs font-semibold tracking-wide text-paper",
										children: "MOVE SMART. DELIVER FAST."
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-sans text-xs text-paper/70",
										children: "EUROPE ↔ KURDISTAN ↔ IRAQ"
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-xs text-sm leading-relaxed text-paper/70",
								children: t.footerBlurb
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: t.hubsTitle
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 flex flex-col gap-3",
							children: t.hubs.map((hub) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: hub.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-paper/70",
								children: hub.detail
							})] }, hub.name))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: t.hoursTitle
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 flex flex-col gap-2",
							children: t.hours.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
								dir: "ltr",
								className: "text-sm text-paper/70",
								children: row
							}) }, row))
						})] })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-paper/15",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-relaxed text-paper/60",
							children: t.footerNote
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/rega-cargo.pdf",
							download: "rega-cargo.pdf",
							className: "inline-flex h-10 shrink-0 items-center rounded-full border border-paper/25 px-4 text-xs font-medium text-paper",
							children: "PDF"
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-3xl border border-line bg-surface/95 px-1 py-1 shadow-lg backdrop-blur lg:hidden",
				children: TABS.map((tab) => {
					const on = isOn(path, tab.to, tab.exact);
					const Icon = tab.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: tab.to,
						className: `flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] ${on ? "bg-ink text-pine-ink" : "text-muted"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), t.nav[tab.key]]
					}, tab.to);
				})
			})
		]
	});
}
function LangSwitch({ lang, setLang }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const ref = (0, import_react.useRef)(null);
	const current = langMeta(lang);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		function onDoc(event) {
			if (!ref.current?.contains(event.target)) setOpen(false);
		}
		function onKey(event) {
			if (event.key === "Escape") setOpen(false);
		}
		document.addEventListener("mousedown", onDoc);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDoc);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-haspopup": "listbox",
			"aria-expanded": open,
			"aria-label": current.name,
			onClick: () => setOpen((value) => !value),
			className: "inline-flex h-12 items-center gap-1 rounded-full px-1 text-sm text-ink",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: current.dir === "rtl" ? "font-ar" : "font-sans",
				children: current.short
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `size-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}` })]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "listbox",
			"aria-label": current.name,
			className: "absolute end-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-paper/10 bg-ink p-1.5 shadow-2xl",
			children: LANGS.map((item) => {
				const on = item.id === lang;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "option",
					"aria-selected": on,
					onClick: () => {
						setLang(item.id);
						setOpen(false);
					},
					className: `grid h-11 w-full grid-cols-[1.25rem_minmax(0,1fr)_2.5rem] items-center gap-2 rounded-xl px-3 text-sm ${on ? "bg-pine/25 text-pine" : "text-paper hover:bg-paper/5"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex justify-center",
							children: on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "size-4",
								strokeWidth: 2.5
							}) : null
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `truncate text-center font-medium ${item.dir === "rtl" ? "font-ar" : "font-sans"}`,
							children: item.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `text-end text-xs tracking-wide ${on ? "text-pine" : "text-paper/45"}`,
							children: item.code
						})
					]
				}, item.id);
			})
		}) : null]
	});
}
//#endregion
export { Shell as n, PageHeader as t };
