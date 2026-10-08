import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as controlClass, f as useI18n, n as Field, o as btnGhost, s as btnPrimary } from "./field-ClBf72CX.mjs";
import { A as moveStatus, D as moveJobs, E as moveCreateTransport, O as moveOffer, T as moveCreateDelivery, h as marketCopy, i as Report, k as moveRate, l as Route$8, w as moveChoose, x as marketRole } from "./router-D3fYEic-.mjs";
import { n as Shell, t as PageHeader } from "./shell-CA276dc0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/move-DwFN5Out.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MovePage() {
	const initial = Route$8.useLoaderData();
	const { product, item } = Route$8.useSearch();
	const { lang } = useI18n();
	const t = marketCopy(lang);
	const [jobs, setJobs] = (0, import_react.useState)(initial);
	const [message, setMessage] = (0, import_react.useState)("");
	async function refresh() {
		setJobs(await moveJobs());
	}
	function note(result) {
		const error = "error" in result ? result.error : void 0;
		setMessage(error ? t[error] ?? t.invalid : t.saved);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: t.moveKicker,
		title: t.moveTitle,
		lede: t.moveLede
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4",
				onSubmit: async (event) => {
					event.preventDefault();
					const form = new FormData(event.currentTarget);
					const result = await moveCreateDelivery({ data: {
						pickup: form.get("pickup"),
						dropoff: form.get("dropoff"),
						item: form.get("item"),
						size: form.get("size"),
						date: form.get("date"),
						product: product || void 0
					} });
					note(result);
					if (!("error" in result)) refresh();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold",
						children: t.deliver
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.pickup,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "pickup",
							required: true,
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.dropoff,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "dropoff",
							required: true,
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.item,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "item",
							required: true,
							defaultValue: item,
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.size,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "size",
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.date,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "date",
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4",
				onSubmit: async (event) => {
					event.preventDefault();
					const form = new FormData(event.currentTarget);
					const result = await moveCreateTransport({ data: {
						origin: form.get("origin"),
						destination: form.get("destination"),
						load: form.get("load"),
						date: form.get("date")
					} });
					note(result);
					if (!("error" in result)) refresh();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold",
						children: t.load
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.origin,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "origin",
							required: true,
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.destination,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "destination",
							required: true,
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.load,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "load",
							required: true,
							className: controlClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t.date,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "date",
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
			}),
			!jobs.courier ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3 md:col-span-2",
				onSubmit: async (event) => {
					event.preventDefault();
					const form = new FormData(event.currentTarget);
					note(await marketRole({ data: {
						role: "courier",
						displayName: form.get("name"),
						city: form.get("city"),
						phone: form.get("phone")
					} }));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold",
						children: t.roleDriver
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
						className: btnGhost,
						type: "submit",
						children: t.send
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold",
						children: t.myJobs
					}),
					jobs.deliveries.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobCard, {
						kind: "delivery",
						id: job.id,
						status: job.status,
						label: `${job.pickup} → ${job.dropoff}`,
						bids: jobs.bids.filter((bid) => bid.jobId === job.id && bid.kind === "delivery"),
						onDone: refresh,
						onNote: note
					}, job.id)),
					jobs.transports.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobCard, {
						kind: "transport",
						id: job.id,
						status: job.status,
						label: `${job.origin} → ${job.destination}`,
						bids: jobs.bids.filter((bid) => bid.jobId === job.id && bid.kind === "transport"),
						onDone: refresh,
						onNote: note
					}, job.id))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold",
						children: t.openJobs
					}),
					jobs.openDeliveries.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenCard, {
						kind: "delivery",
						id: job.id,
						label: `${job.pickup} → ${job.dropoff} · ${job.item}`,
						onDone: refresh,
						onNote: note
					}, job.id)),
					jobs.openTransports.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenCard, {
						kind: "transport",
						id: job.id,
						label: `${job.origin} → ${job.destination} · ${job.load}`,
						onDone: refresh,
						onNote: note
					}, job.id))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "md:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Report, {})
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-clay md:col-span-2",
				children: message
			}) : null
		]
	})] });
}
function JobCard({ kind, id, status, label, bids, onDone, onNote }) {
	const { lang } = useI18n();
	const t = marketCopy(lang);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-2xl border border-line bg-surface p-4 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-semibold",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-muted",
				children: [
					status,
					" · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
						dir: "ltr",
						children: id.slice(0, 8)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					status === "requested" ? bids.map((bid) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: btnGhost,
						onClick: async () => {
							const result = await moveChoose({ data: {
								kind,
								id,
								courierId: bid.courierId
							} });
							onNote(result);
							if (!("error" in result)) await onDone();
						},
						children: [
							t.choose,
							" ",
							bid.name
						]
					}, bid.courierId)) : null,
					status !== "requested" && status !== "delivered" && status !== "cancelled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: btnGhost,
						onClick: async () => {
							const result = await moveStatus({ data: {
								kind,
								id,
								status: status === "accepted" ? "picked_up" : status === "picked_up" ? "on_the_way" : "delivered"
							} });
							onNote(result);
							if (!("error" in result)) await onDone();
						},
						children: status === "accepted" ? t.picked : status === "picked_up" ? t.way : t.done
					}) : null,
					status !== "delivered" && status !== "cancelled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: btnGhost,
						onClick: async () => {
							const result = await moveStatus({ data: {
								kind,
								id,
								status: "cancelled"
							} });
							onNote(result);
							if (!("error" in result)) await onDone();
						},
						children: t.cancel
					}) : null
				]
			}),
			status === "delivered" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-3 flex gap-2",
				onSubmit: async (event) => {
					event.preventDefault();
					const rating = new FormData(event.currentTarget).get("rating");
					onNote(await moveRate({ data: {
						kind,
						id,
						rating: Number(rating),
						body: ""
					} }));
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "rating",
					dir: "ltr",
					inputMode: "numeric",
					defaultValue: 5,
					className: `${controlClass} max-w-24`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: btnGhost,
					type: "submit",
					children: t.rating
				})]
			}) : null
		]
	});
}
function OpenCard({ kind, id, label, onDone, onNote }) {
	const { lang } = useI18n();
	const t = marketCopy(lang);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-2xl border border-line p-4 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: `${btnPrimary} mt-3`,
			onClick: async () => {
				const result = await moveOffer({ data: {
					kind,
					id,
					note: ""
				} });
				onNote(result);
				if (!("error" in result)) await onDone();
			},
			children: t.offer
		})]
	});
}
//#endregion
export { MovePage as component };
