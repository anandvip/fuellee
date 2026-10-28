import { S as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useCurrentUserState, r as Page, t as Mark } from "./shell-BIsTrsWH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DEtVoBTE.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Method, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Features, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pricing, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountBlock, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
			className: "mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-sm text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-7" }), "Fuellee"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "A private log. Not a public garage." })]
		})
	] });
}
function Hero() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "Fuel · service · account"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl",
				children: "A quiet log for the trip from A to B."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-xl text-lg leading-relaxed text-muted",
				children: "Cars, motorcycles, boats, and aircraft. Fill-ups, real economy between full tanks, and the service book — saved to your account. Fuellee does not publish your garage."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-7 flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroCta, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "#method",
					className: "btn btn-ghost",
					children: "How the figure is made"
				})]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Instrument, {})]
	});
}
function HeroCta() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block h-11 w-44 animate-pulse rounded-full bg-fg/10" });
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/garage",
		className: "btn btn-amber",
		children: "Open your garage"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		className: "btn btn-amber",
		children: "Create your garage"
	});
}
function Instrument() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "card relative overflow-hidden p-6 sm:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 right-0 h-28 w-28 rounded-bl-[4rem] bg-fg" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow relative",
				children: "Sample · not your car"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "num relative mt-6 text-5xl font-medium tracking-tight",
				children: "13.3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "relative text-sm text-muted",
				children: "km/L · last full tank"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "relative mt-8 grid grid-cols-2 gap-4 border-t border-line pt-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "eyebrow",
						children: "Per km"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "num mt-1 text-xl",
						children: "S$0.20"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "eyebrow",
						children: "That chain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "num mt-1 text-xl",
						children: "460 km"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "eyebrow",
						children: "Fuel in it"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "num mt-1 text-xl",
						children: "34.6 L"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "eyebrow",
						children: "Paid"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "num mt-1 text-xl",
						children: "S$92"
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "relative mt-5 text-sm leading-relaxed text-muted",
				children: "Full at 12,400 km. A partial, then full again at 12,860. Economy is 460 ÷ 34.6."
			})
		]
	});
}
function Method() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "method",
		className: "mt-20 scroll-mt-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "The figure"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 max-w-lg text-3xl font-semibold tracking-tight",
				children: "The meter, over what actually went in."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-8 grid gap-4 md:grid-cols-3",
				children: [
					[
						"01",
						"Two full tanks",
						"The first full tank only marks the meter. Nothing is divided yet."
					],
					[
						"02",
						"Everything between",
						"Partials count. The litres, kilograms, or kilowatt-hours all sit in the same chain."
					],
					[
						"03",
						"A gap stays a gap",
						"If you missed a fill, mark it. Fuellee will not invent a mileage across a hole."
					]
				].map(([index, title, copy]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "num text-sm text-amber",
							children: index
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 text-lg font-semibold",
							children: title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: copy
						})
					]
				}, index))
			})
		]
	});
}
function Features() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "features",
		className: "mt-20 scroll-mt-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "What the app actually does"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 text-3xl font-semibold tracking-tight",
				children: "The landing page matches the garage."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 divide-y divide-line border-y border-line",
				children: [
					["Fill", "Odometer, nautical miles, or engine hours — the meter that craft actually has."],
					["Economy", "Road craft use km/L, L/100km, or mpg. Boats and planes use nm/L, L/nm, or nautical mpg. An hour meter shows burn rate."],
					["Service", "The book follows the craft: chain and valves, anodes and impellers, annual and 100-hour. Overdue is marked, not nagged."],
					["Account", "Sign up with email, Google, or X. Sign out when you leave the seat. Delete account removes the garage and the login."],
					["Plus", "One vehicle on Garage. Plus keeps eight, a year of the spend chart, and a CSV of the log."]
				].map(([title, copy]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2 py-5 sm:grid-cols-[10rem_1fr] sm:gap-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: copy
					})]
				}, title))
			})
		]
	});
}
function Pricing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "pricing",
		className: "mt-20 scroll-mt-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "Pricing"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 text-3xl font-semibold tracking-tight",
				children: "Garage is enough for one craft. Plus is the rest."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "card p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xl font-semibold",
							children: "Garage"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "num mt-3 text-4xl",
							children: "S$0"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-5 space-y-2 text-sm text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "One active vehicle" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Fills, economy, and the service book" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Three months of the spend chart" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Sign out and delete account" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							className: "btn btn-ghost mt-6",
							children: "Start free"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "card border-amber p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xl font-semibold",
							children: "Plus"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "num mt-3 text-4xl",
							children: ["S$6.90 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-base font-sans font-medium text-muted",
								children: "/ month"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "or S$59 a year"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-5 space-y-2 text-sm text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Up to eight vehicles" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Twelve months of the chart" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "CSV export of the log" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Same private account" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/plus",
							className: "btn btn-amber mt-6",
							children: "See Plus"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm leading-relaxed text-muted",
							children: "When card checkout is connected, Plus is paid on a secure payment page before the plan turns on. Until then, confirming Plus switches your account so you can use the full garage."
						})
					]
				})]
			})
		]
	});
}
function AccountBlock() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "account",
		className: "mt-20 scroll-mt-24 grid gap-6 lg:grid-cols-[1fr_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "Your login"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 text-3xl font-semibold tracking-tight",
				children: "The log belongs to an account, so it can leave with you."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 leading-relaxed text-muted",
				children: "A fuel log without a login cannot tell one driver from another, and it cannot be deleted on purpose. Fuellee uses sign-up, sign-in, sign-out, and delete account. Rows are stored against that login and are not readable by anyone else."
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "card divide-y divide-line",
			children: [
				["Sign up", "Email and a password, or continue with Google or X."],
				["Sign in", "Come back on another browser and the garage is there."],
				["Sign out", "Leaves this browser. The account stays."],
				["Delete account", "An alert confirms it. Erase every row, or leave an anonymized fuel copy in a separate dataset and remove your name, email, and phone."]
			].map(([title, copy]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: copy
				})]
			}, title))
		})]
	});
}
//#endregion
export { Home as component };
