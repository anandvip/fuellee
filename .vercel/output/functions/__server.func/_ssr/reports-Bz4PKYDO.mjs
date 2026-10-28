import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as kindById, r as FUELS } from "./constants-BAf5jR2i.mjs";
import { i as useCurrentUserState, n as Notice, r as Page } from "./shell-BIsTrsWH.mjs";
import { i as rememberGarage, r as recallGarage, t as RedirectToSignIn } from "./device-copy-Cy5habV0.mjs";
import { d as loadGarage } from "./server-BAZqCiv_.mjs";
import { a as formatMoney, o as formatPlainDate } from "./format-CV26oMVC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-Bz4PKYDO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReportsPage() {
	const { user, isPending } = useCurrentUserState();
	const now = /* @__PURE__ */ new Date();
	const [garage, setGarage] = (0, import_react.useState)(null);
	const [offline, setOffline] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [span, setSpan] = (0, import_react.useState)("month");
	const [year, setYear] = (0, import_react.useState)(now.getFullYear());
	const [month, setMonth] = (0, import_react.useState)(now.getMonth() + 1);
	const [half, setHalf] = (0, import_react.useState)(now.getMonth() < 6 ? 1 : 2);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let cancel = false;
		loadGarage().then((next) => {
			if (cancel) return;
			rememberGarage(user.id, next);
			setGarage(next);
			setOffline(false);
		}).catch(() => {
			if (cancel) return;
			const copy = recallGarage(user.id);
			if (copy) {
				setGarage(copy);
				setOffline(true);
			} else setError("Could not load the log, and this device has no saved copy.");
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page, {
		width: "max-w-5xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportSheet, {
			garage,
			error,
			offline,
			name: user.displayName ?? "Account holder",
			email: user.primaryEmail ?? "",
			span,
			year,
			month,
			half,
			onSpan: setSpan,
			onYear: setYear,
			onMonth: setMonth,
			onHalf: setHalf
		})
	});
}
function ReportSheet({ garage, error, offline, name, email, span, year, month, half, onSpan, onYear, onMonth, onHalf }) {
	const period = (0, import_react.useMemo)(() => bounds(span, year, month, half), [
		span,
		year,
		month,
		half
	]);
	const fills = garage?.fills.filter((fill) => fill.filledOn >= period.start && fill.filledOn <= period.end) ?? [];
	const services = garage?.services.filter((service) => service.servicedOn >= period.start && service.servicedOn <= period.end) ?? [];
	const fuelTotal = fills.reduce((sum, fill) => sum + fill.totalCost, 0);
	const serviceTotal = services.reduce((sum, service) => sum + service.cost, 0);
	const volume = volumeByUnit(fills, garage);
	const years = Array.from({ length: 8 }, (_, index) => (/* @__PURE__ */ new Date()).getFullYear() - index);
	const currency = garage?.settings.currency ?? "SGD";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-print flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Expense record"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-3xl font-semibold tracking-tight",
					children: "Fuel for the period"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/garage",
							className: "btn btn-ghost",
							children: "Garage"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/account",
							className: "btn btn-ghost",
							children: "Account"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-amber",
							onClick: () => window.print(),
							children: "Print"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "no-print card grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-muted",
							children: "Period"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "field",
							value: span,
							onChange: (event) => onSpan(event.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "month",
									children: "Month"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "half",
									children: "Half year"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "year",
									children: "Year"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-muted",
							children: "Year"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "field",
							value: year,
							onChange: (event) => onYear(Number(event.target.value)),
							children: years.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
						})]
					}),
					span === "month" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-muted",
							children: "Month"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "field",
							value: month,
							onChange: (event) => onMonth(Number(event.target.value)),
							children: MONTHS.map((label, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: index + 1,
								children: label
							}, label))
						})]
					}) : null,
					span === "half" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-muted",
							children: "Half"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "field",
							value: half,
							onChange: (event) => onHalf(Number(event.target.value)),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: 1,
								children: "January – June"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: 2,
								children: "July – December"
							})]
						})]
					}) : null
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
				tone: "amber",
				children: error
			}) : null,
			offline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "no-print",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
					tone: "amber",
					children: "Showing the copy saved on this device. A new fill needs a connection."
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "card p-5 sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "border-b border-line pb-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "Fuellee · fuel expense record"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 text-2xl font-semibold",
								children: period.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-4 grid gap-2 text-sm sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted",
										children: "Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "font-medium",
										children: name
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted",
										children: "Email"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "break-all font-medium",
										children: email || "—"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted",
										children: "Phone"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "font-medium",
										children: garage?.settings.phone || "—"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted",
										children: "Currency"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "font-medium",
										children: currency
									})] })
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-6 font-semibold",
						children: "Fuel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[36rem] border-collapse text-left text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-line text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 font-medium",
										children: "Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 font-medium",
										children: "Craft"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 font-medium",
										children: "Fuel"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 font-medium",
										children: "Quantity"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 font-medium",
										children: "Paid"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 font-medium",
										children: "Place"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: fills.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3 text-muted",
								colSpan: 6,
								children: "No fuel in this period."
							}) }) : fills.slice().sort((a, b) => a.filledOn.localeCompare(b.filledOn) || a.id - b.id).map((fill) => {
								const vehicle = garage?.vehicles.find((item) => item.id === fill.vehicleId);
								const fuel = FUELS.find((item) => item.id === vehicle?.fuel);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-line/80",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3 whitespace-nowrap",
											children: formatPlainDate(fill.filledOn)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-2 pr-3",
											children: [vehicle?.name ?? "Removed", vehicle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-muted",
												children: [" · ", kindById(vehicle.kind).label]
											}) : null]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3",
											children: fuel?.label ?? vehicle?.fuel ?? "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "num py-2 pr-3 whitespace-nowrap",
											children: [
												fill.volume,
												" ",
												vehicle?.volumeUnit ?? ""
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "num py-2 pr-3 whitespace-nowrap",
											children: formatMoney(fill.totalCost, currency)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2",
											children: fill.station || "—"
										})
									]
								}, fill.id);
							}) })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm",
						children: [
							"Fuel paid: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "num font-semibold",
								children: formatMoney(fuelTotal, currency)
							}),
							volume.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [" · ", volume.join(" · ")]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-8 font-semibold",
						children: "Upkeep"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[28rem] border-collapse text-left text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-line text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 font-medium",
										children: "Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 font-medium",
										children: "Craft"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 font-medium",
										children: "Work"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 font-medium",
										children: "Paid"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: services.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3 text-muted",
								colSpan: 4,
								children: "No upkeep in this period."
							}) }) : services.slice().sort((a, b) => a.servicedOn.localeCompare(b.servicedOn) || a.id - b.id).map((service) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceRow, {
								service,
								garage,
								currency
							}, service.id)) })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm",
						children: ["Upkeep paid: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "num font-semibold",
							children: formatMoney(serviceTotal, currency)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 border-t border-line pt-4 text-base font-semibold",
						children: ["Period total: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "num",
							children: formatMoney(fuelTotal + serviceTotal, currency)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm leading-relaxed text-muted",
						children: [
							"Amounts are what you logged, in ",
							currency,
							". This is a private record for your expense file. It is not a tax assessment."
						]
					})
				]
			})
		]
	});
}
function ServiceRow({ service, garage, currency }) {
	const vehicle = garage?.vehicles.find((item) => item.id === service.vehicleId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: "border-b border-line/80",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-2 pr-3 whitespace-nowrap",
				children: formatPlainDate(service.servicedOn)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-2 pr-3",
				children: vehicle?.name ?? "Removed"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-2 pr-3",
				children: service.category
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "num py-2 whitespace-nowrap",
				children: formatMoney(service.cost, currency)
			})
		]
	});
}
var MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];
function bounds(span, year, month, half) {
	if (span === "month") {
		const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
		const mm = String(month).padStart(2, "0");
		return {
			start: `${year}-${mm}-01`,
			end: `${year}-${mm}-${String(last).padStart(2, "0")}`,
			label: `${MONTHS[month - 1]} ${year}`
		};
	}
	if (span === "half") return half === 1 ? {
		start: `${year}-01-01`,
		end: `${year}-06-30`,
		label: `January – June ${year}`
	} : {
		start: `${year}-07-01`,
		end: `${year}-12-31`,
		label: `July – December ${year}`
	};
	return {
		start: `${year}-01-01`,
		end: `${year}-12-31`,
		label: String(year)
	};
}
function volumeByUnit(fills, garage) {
	const totals = /* @__PURE__ */ new Map();
	for (const fill of fills) {
		const unit = garage?.vehicles.find((item) => item.id === fill.vehicleId)?.volumeUnit ?? "units";
		totals.set(unit, (totals.get(unit) ?? 0) + fill.volume);
	}
	return [...totals.entries()].map(([unit, amount]) => `${amount.toFixed(1)} ${unit}`);
}
//#endregion
export { ReportsPage as component };
