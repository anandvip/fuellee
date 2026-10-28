import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react, b as Navigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-1vAx-gM_.mjs";
import { i as useCurrentUserState, r as Page } from "./shell-BIsTrsWH.mjs";
import { f as saveProfile } from "./server-BAZqCiv_.mjs";
import { t as GROK_PROVIDERS } from "./server-BHGMIssW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BPIbRrxH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BEARER_KEY = "grok-auth.bearer-token";
var PENDING_PHONE = "fuellee.pendingPhone";
function LoginPage() {
	const { user, isPending } = useCurrentUserState();
	const [mode, setMode] = (0, import_react.useState)("up");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page, {
		width: "max-w-5xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card h-80 animate-pulse" })
	});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/garage" });
	async function submit(event) {
		event.preventDefault();
		setBusy(true);
		setError(null);
		const options = { onSuccess(ctx) {
			const token = ctx.response.headers.get("set-auth-token");
			if (token) window.sessionStorage.setItem(BEARER_KEY, token);
		} };
		const result = mode === "up" ? await authClient.signUp.email({
			email,
			password,
			name: name.trim() || email
		}, options) : await authClient.signIn.email({
			email,
			password
		}, options);
		if (result.error) {
			setBusy(false);
			setError(result.error.message ?? "That did not work.");
			return;
		}
		if (mode === "up") try {
			window.sessionStorage.setItem(PENDING_PHONE, phone);
			await saveProfile({ data: {
				name: name.trim() || email,
				phone
			} });
			window.sessionStorage.removeItem(PENDING_PHONE);
		} catch (reason) {
			setBusy(false);
			setError(reason instanceof Error ? reason.message : "The account exists. Add the phone number in settings.");
			window.location.assign("/account");
			return;
		}
		window.location.assign("/garage");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page, {
		width: "max-w-5xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "order-2 lg:order-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Free account"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-3xl font-semibold tracking-tight sm:text-4xl",
						children: mode === "up" ? "Register, then the log is yours." : "Welcome back."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-md text-sm leading-relaxed text-muted",
						children: "Email and a phone number. No card. The garage stays on this login, and you can erase it later."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1",
						children: [
							["Name", "How the tax record addresses you."],
							["Email", "The login. Also printed on an expense record."],
							["Phone", "Stored on the profile. Fuellee does not text a code."]
						].map(([title, copy]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-muted",
								children: copy
							})]
						}, title))
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "order-1 lg:order-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "card grid gap-4 p-5 sm:p-6",
					onSubmit: (event) => void submit(event),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: mode === "up" ? "btn btn-amber" : "btn btn-ghost",
								onClick: () => setMode("up"),
								children: "Register"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: mode === "in" ? "btn btn-amber" : "btn btn-ghost",
								onClick: () => setMode("in"),
								children: "Sign in"
							})]
						}),
						GROK_PROVIDERS.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "btn btn-ink w-full",
								onClick: () => {
									signIn(provider.providerId, { callbackURL: "/account" }).catch((reason) => {
										setError(reason instanceof Error ? reason.message : "Sign-in failed.");
									});
								},
								children: ["Continue with ", provider.label]
							}, provider.providerId)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-center text-sm text-muted",
								children: "or email"
							})]
						}) : null,
						mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: "Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								autoComplete: "name",
								required: true,
								value: name,
								onChange: (event) => setName(event.target.value)
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: "Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								type: "email",
								required: true,
								autoComplete: "email",
								value: email,
								onChange: (event) => setEmail(event.target.value)
							})]
						}),
						mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: "Phone"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								type: "tel",
								required: true,
								autoComplete: "tel",
								inputMode: "tel",
								placeholder: "+65 9123 4567",
								value: phone,
								onChange: (event) => setPhone(event.target.value)
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: "Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								type: "password",
								required: true,
								minLength: 8,
								autoComplete: mode === "up" ? "new-password" : "current-password",
								value: password,
								onChange: (event) => setPassword(event.target.value)
							})]
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-amber",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-amber w-full",
							type: "submit",
							disabled: busy,
							children: busy ? "Working…" : mode === "up" ? "Create free account" : "Sign in"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "font-medium text-fg",
								children: "Back to the overview"
							})
						})
					]
				})
			})]
		})
	});
}
//#endregion
export { LoginPage as component };
