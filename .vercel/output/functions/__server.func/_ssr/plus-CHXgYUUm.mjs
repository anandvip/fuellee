import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useCurrentUserState, n as Notice, r as Page } from "./shell-BIsTrsWH.mjs";
import { m as startCheckout } from "./server-BAZqCiv_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plus-CHXgYUUm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PlusPage() {
	const { user, isPending } = useCurrentUserState();
	const [interval, setInterval] = (0, import_react.useState)("year");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	async function confirm() {
		if (!user) return;
		setBusy(true);
		setError(null);
		try {
			const result = await startCheckout({ data: {
				interval,
				origin: window.location.origin
			} });
			if (result.mode === "stripe") {
				window.location.assign(result.url);
				return;
			}
			window.location.assign("/garage");
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Checkout did not start.");
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, {
		width: "max-w-xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "Plus"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-4xl font-semibold tracking-tight",
				children: "The rest of the garage."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 leading-relaxed text-muted",
				children: "Eight vehicles, a year of the spend chart, and a CSV of every fill. Priced in Singapore dollars."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: interval === "month" ? "btn btn-amber" : "btn btn-ghost",
					onClick: () => setInterval("month"),
					children: "S$6.90 / month"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: interval === "year" ? "btn btn-amber" : "btn btn-ghost",
					onClick: () => setInterval("year"),
					children: "S$59 / year"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card mt-6 p-5 text-sm leading-relaxed text-muted",
				children: "If a card processor is connected, this opens a secure checkout and Plus starts only after payment. If it is not, confirming switches this account to Plus so the full garage can be used. You can return to the free Garage plan from the Craft tab. Deleting the account cancels a card subscription when one exists."
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
					tone: "amber",
					children: error
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap gap-2",
				children: [
					isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block h-11 w-40 animate-pulse rounded-full bg-fg/10" }) : null,
					!isPending && !user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						className: "btn btn-amber",
						children: "Sign in to start Plus"
					}) : null,
					!isPending && user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-amber",
						disabled: busy,
						onClick: () => void confirm(),
						children: busy ? "Working…" : "Confirm Plus"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "btn btn-ghost",
						children: "Back"
					})
				]
			})
		]
	});
}
//#endregion
export { PlusPage as component };
