import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as useI18n } from "./field-ClBf72CX.mjs";
import { c as Route$7 } from "./router-D3fYEic-.mjs";
import { n as Shell, t as PageHeader } from "./shell-CA276dc0.mjs";
import { t as QuotePanel } from "./quote-panel-DQICFmsg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quote-CG9YVpNc.js
var import_jsx_runtime = require_jsx_runtime();
function QuotePage() {
	const { t } = useI18n();
	const { from, to, kg } = Route$7.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: t.quoteKicker,
		title: t.quoteTitle,
		lede: t.quoteLede
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-6xl px-5 py-12 md:py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuotePanel, {
			variant: "full",
			initial: {
				from,
				to,
				kg
			}
		})
	})] });
}
//#endregion
export { QuotePage as component };
