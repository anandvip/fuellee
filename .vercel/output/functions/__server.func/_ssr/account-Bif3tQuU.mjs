import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as signOut } from "./client-1vAx-gM_.mjs";
import { n as CURRENCIES } from "./constants-BAf5jR2i.mjs";
import { i as useCurrentUserState, n as Notice, r as Page } from "./shell-BIsTrsWH.mjs";
import { n as forgetGarage, t as RedirectToSignIn } from "./device-copy-Cy5habV0.mjs";
import { d as loadGarage, f as saveProfile, o as deleteAccount, p as saveSettings } from "./server-BAZqCiv_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-Bif3tQuU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccountPage() {
	const { user, isPending } = useCurrentUserState();
	const [garage, setGarage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [notice, setNotice] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [phrase, setPhrase] = (0, import_react.useState)("");
	const [mode, setMode] = (0, import_react.useState)("erase");
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [distanceUnit, setDistanceUnit] = (0, import_react.useState)("km");
	const [economyUnit, setEconomyUnit] = (0, import_react.useState)("kml");
	const [currency, setCurrency] = (0, import_react.useState)("SGD");
	(0, import_react.useEffect)(() => {
		if (!user) return;
		setName(user.displayName ?? "");
		const pending = window.sessionStorage.getItem("fuellee.pendingPhone");
		if (pending) setPhone(pending);
	}, [user?.id, user?.displayName]);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let cancel = false;
		loadGarage().then((next) => {
			if (cancel) return;
			setGarage(next);
			setDistanceUnit(next.settings.distanceUnit);
			setEconomyUnit(next.settings.economyUnit);
			setCurrency(next.settings.currency);
			if (next.settings.phone) setPhone(next.settings.phone);
		}).catch((reason) => {
			if (!cancel) setError(reason instanceof Error ? reason.message : "Could not load the account.");
		});
		return () => {
			cancel = true;
		};
	}, [user?.id]);
	if (isPending || user && !garage && !error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page, {
		width: "max-w-5xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card h-64 animate-pulse" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const erase = mode === "erase";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page, {
		width: "max-w-5xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "card grid gap-4 p-5 lg:sticky lg:top-24",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "Profile"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-2 truncate text-2xl font-semibold tracking-tight",
								children: name || "Your account"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 break-all text-sm text-muted",
								children: user.primaryEmail
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: phone || "No phone yet"
							})
						]
					}),
					garage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: ["Plan: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: garage.plan.plan === "plus" ? "Plus" : "Garage, free"
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/garage",
								className: "btn btn-ghost w-full",
								children: "Garage"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/reports",
								className: "btn btn-ink w-full",
								children: "Tax record"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/plus",
								className: "btn btn-ghost w-full",
								children: "Plus"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-ghost w-full",
								onClick: () => {
									signOut("/").catch((reason) => {
										setError(reason instanceof Error ? reason.message : "Sign-out did not finish.");
									});
								},
								children: "Sign out"
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid min-w-0 gap-6",
				children: [
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
						tone: "amber",
						children: error
					}) : null,
					notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, { children: notice }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "card grid gap-3 p-5",
						onSubmit: (event) => {
							event.preventDefault();
							setBusy(true);
							setError(null);
							saveProfile({ data: {
								name,
								phone
							} }).then(() => {
								window.sessionStorage.removeItem("fuellee.pendingPhone");
								setNotice("Profile saved.");
							}).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not save.")).finally(() => setBusy(false));
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold",
								children: "Name and phone"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "grid gap-1 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-muted",
										children: "Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										autoComplete: "name",
										required: true,
										value: name,
										onChange: (event) => setName(event.target.value)
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "grid gap-1 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-muted",
										children: "Phone"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										type: "tel",
										autoComplete: "tel",
										inputMode: "tel",
										placeholder: "+91 98100 00000",
										required: true,
										value: phone,
										onChange: (event) => setPhone(event.target.value)
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									"Email stays ",
									user.primaryEmail,
									". It is the login and cannot be edited here."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ink w-full sm:w-auto",
								type: "submit",
								disabled: busy,
								children: "Save profile"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "card grid gap-3 p-5",
						onSubmit: (event) => {
							event.preventDefault();
							setBusy(true);
							setError(null);
							saveSettings({ data: {
								distanceUnit,
								economyUnit,
								currency
							} }).then(() => setNotice("Units saved.")).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not save.")).finally(() => setBusy(false));
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold",
								children: "Units"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed text-muted",
								children: "Kilometres and miles apply to road craft. Boats and aircraft keep nautical miles or engine hours."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "grid gap-1 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-muted",
											children: "Distance"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											className: "field",
											value: distanceUnit,
											onChange: (event) => setDistanceUnit(event.target.value),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "km",
												children: "Kilometres"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "mi",
												children: "Miles"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "grid gap-1 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-muted",
											children: "Economy"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											className: "field",
											value: economyUnit,
											onChange: (event) => setEconomyUnit(event.target.value),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "kml",
													children: "km/L"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "l100",
													children: "L/100km"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "mpg",
													children: "mpg (US)"
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "grid gap-1 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-muted",
											children: "Currency"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											className: "field",
											value: currency,
											onChange: (event) => setCurrency(event.target.value),
											children: CURRENCIES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ink w-full sm:w-auto",
								type: "submit",
								disabled: busy,
								children: "Save units"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "card grid gap-3 border-amber/50 p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold",
								children: "Delete account"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed text-muted",
								children: "The login, name, email, and phone are removed either way. An alert asks you to confirm before anything is deleted."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
								className: "grid gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
										className: "sr-only",
										children: "What happens to the log"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex min-h-11 items-start gap-3 rounded-2xl border border-line p-3 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "radio",
											name: "fate",
											checked: erase,
											onChange: () => setMode("erase")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold",
											children: "Erase everything"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block text-muted",
											children: "Removes the log and any donated copy from the behaviour dataset. Nothing of this account remains."
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex min-h-11 items-start gap-3 rounded-2xl border border-line p-3 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "radio",
											name: "fate",
											checked: !erase,
											onChange: () => setMode("donate")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold",
											children: "Donate an anonymized copy"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block text-muted",
											children: "A separate behaviour dataset keeps fuel type, amount, cost, and date. No name, email, phone, craft name, or place. It is not sent to a model from here."
										})] })]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "grid gap-1 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-muted",
									children: "Type DELETE to confirm"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									value: phrase,
									onChange: (event) => setPhrase(event.target.value),
									autoComplete: "off"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-amber w-full sm:w-auto",
								disabled: busy || phrase !== "DELETE",
								onClick: () => {
									const warning = erase ? "Erase this account completely? The login and every fuel row, including a donated copy, will be removed. This cannot be undone." : "Delete this login and keep an anonymized fuel copy in the behaviour dataset? Your name, email, and phone will not be in that copy. This cannot be undone.";
									if (!window.confirm(warning)) return;
									setBusy(true);
									setError(null);
									deleteAccount({ data: {
										phrase,
										mode
									} }).then(() => {
										forgetGarage();
										return signOut("/");
									}).catch((reason) => {
										setError(reason instanceof Error ? reason.message : "Could not delete the account.");
										setBusy(false);
									});
								},
								children: erase ? "Erase account" : "Delete and donate the copy"
							})
						]
					})
				]
			})]
		})
	});
}
//#endregion
export { AccountPage as component };
