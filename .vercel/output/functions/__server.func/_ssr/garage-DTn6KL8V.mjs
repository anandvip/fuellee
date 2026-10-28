import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { h as placeLabel, i as KINDS, m as meterFamily, p as kindById, r as FUELS, u as categoriesFor } from "./constants-BAf5jR2i.mjs";
import { i as useCurrentUserState, n as Notice, r as Page } from "./shell-BIsTrsWH.mjs";
import { i as rememberGarage, t as RedirectToSignIn } from "./device-copy-Cy5habV0.mjs";
import { a as confirmCheckout, c as deleteService, d as loadGarage, h as updateVehicle, i as cancelPlus, l as deleteVehicle, n as addService, r as addVehicle, s as deleteFill, t as addFill, u as exportLog } from "./server-BAZqCiv_.mjs";
import { a as formatMoney, c as meterFieldLabel, d as toStored, f as todayISO, i as formatMeter, l as meterUnit, n as economyNote, r as formatEconomy, s as fromStored, u as nextMeterLabel } from "./format-CV26oMVC.mjs";
import { a as spendByMonth, i as soonMargin, n as segmentsFor, o as weightedPerUnit, r as serviceDue, t as latestOdometer } from "./economy-CwuCs3wy.mjs";
import { n as Route$4 } from "./router-D4PT0dhA.mjs";
import { a as ResponsiveContainer, i as Area, n as YAxis, o as Tooltip, r as XAxis, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/garage-DTn6KL8V.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function messageOf(error) {
	if (error instanceof Error && error.message) return error.message;
	return "Something went wrong. Try again.";
}
function GarageApp({ sessionId }) {
	const { user } = useCurrentUserState();
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [notice, setNotice] = (0, import_react.useState)(null);
	const [tab, setTab] = (0, import_react.useState)("board");
	const [vehicleId, setVehicleId] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function refresh() {
		const next = await loadGarage();
		if (user?.id) rememberGarage(user.id, next);
		setData(next);
		setVehicleId((current) => {
			if (current && next.vehicles.some((vehicle) => vehicle.id === current)) return current;
			return next.vehicles.find((vehicle) => !vehicle.archived)?.id ?? next.vehicles[0]?.id ?? null;
		});
		return next;
	}
	(0, import_react.useEffect)(() => {
		let cancel = false;
		refresh().catch((reason) => {
			if (!cancel) setError(messageOf(reason));
		});
		return () => {
			cancel = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!sessionId) return;
		let cancel = false;
		confirmCheckout({ data: { sessionId } }).then(() => refresh()).then(() => {
			if (!cancel) setNotice("Plus is active on this account.");
		}).catch((reason) => {
			if (!cancel) setError(messageOf(reason));
		});
		return () => {
			cancel = true;
		};
	}, [sessionId]);
	async function run(task, done) {
		setBusy(true);
		setError(null);
		try {
			await task();
			await refresh();
			if (done) setNotice(done);
		} catch (reason) {
			setError(messageOf(reason));
		} finally {
			setBusy(false);
		}
	}
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-48 animate-pulse rounded-full bg-fg/10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card h-28 animate-pulse" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card h-28 animate-pulse" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card h-28 animate-pulse" })
			]
		})]
	});
	const vehicle = data.vehicles.find((item) => item.id === vehicleId) ?? null;
	const fills = data.fills.filter((fill) => fill.vehicleId === vehicle?.id);
	const services = data.services.filter((service) => service.vehicleId === vehicle?.id);
	const months = data.plan.plan === "plus" ? 12 : 3;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Your garage"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 text-3xl font-semibold tracking-tight",
						children: vehicle ? vehicle.name : "No craft yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							vehicle ? `${kindById(vehicle.kind).label} · ` : "",
							data.plan.plan === "plus" ? "Plus" : "Garage",
							" plan",
							data.plan.provider === "preview" ? " · preview billing" : "",
							data.plan.provider === "stripe" ? " · card billing" : ""
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						data.vehicles.filter((item) => !item.archived).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setVehicleId(item.id),
							className: item.id === vehicle?.id ? "btn btn-ink" : "btn btn-ghost",
							children: item.name
						}, item.id)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/reports",
							className: "btn btn-ghost",
							children: "Tax record"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/account",
							className: "btn btn-ghost",
							children: "Account"
						})
					]
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
				tone: "amber",
				children: error
			}) : null,
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, { children: notice }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto",
				role: "tablist",
				children: [
					["board", "Board"],
					["fill", "Fill"],
					["service", "Service"],
					["craft", "Craft"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "tab",
					"aria-selected": tab === id,
					onClick: () => setTab(id),
					className: tab === id ? "btn btn-ink" : "btn btn-ghost",
					children: label
				}, id))
			}),
			tab === "board" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Board, {
				garage: data,
				vehicle,
				fills,
				services,
				months,
				busy,
				onExport: () => run(async () => {
					const csv = await exportLog();
					const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
					const url = URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.href = url;
					link.download = "fuellee-log.csv";
					link.click();
					URL.revokeObjectURL(url);
				})
			}) : null,
			tab === "fill" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FillPanel, {
				garage: data,
				vehicle,
				fills,
				busy,
				onAdd: (input) => run(() => addFill({ data: input }), "Fill saved."),
				onDelete: (id) => run(() => deleteFill({ data: { id } }))
			}) : null,
			tab === "service" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServicePanel, {
				garage: data,
				vehicle,
				services,
				fills,
				busy,
				onAdd: (input) => run(() => addService({ data: input }), "Service saved."),
				onDelete: (id) => run(() => deleteService({ data: { id } }))
			}) : null,
			tab === "craft" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarPanel, {
				garage: data,
				busy,
				onAdd: (input) => run(() => addVehicle({ data: input }), "Craft added."),
				onUpdate: (input) => run(() => updateVehicle({ data: input }), "Vehicle updated."),
				onDelete: (id) => run(() => deleteVehicle({ data: { id } }), "Vehicle removed."),
				onCancelPlus: () => run(() => cancelPlus(), "Back on the Garage plan.")
			}) : null
		]
	});
}
function Board({ garage, vehicle, fills, services, months, busy, onExport }) {
	const today = todayISO();
	const segments = (0, import_react.useMemo)(() => segmentsFor(fills), [fills]);
	const average = weightedPerUnit(segments);
	const latest = [...segments].reverse().find((segment) => segment.perUnit != null) ?? null;
	const measured = segments.filter((segment) => segment.perUnit != null);
	const distance = measured.reduce((sum, segment) => sum + segment.distanceKm, 0);
	const measuredCost = measured.reduce((sum, segment) => sum + segment.cost, 0);
	const spend = fills.reduce((sum, fill) => sum + fill.totalCost, 0);
	const perDistance = distance > 0 && vehicle ? measuredCost / fromStored(distance, vehicle.meter, garage.settings.distanceUnit) : null;
	const chart = spendByMonth(fills, months, today).map((row) => ({
		label: row.label,
		amount: Math.round(row.amount * 100) / 100
	}));
	const odo = latestOdometer(fills);
	const due = services.map((service) => ({
		service,
		state: serviceDue(service, odo, today, vehicle ? soonMargin(vehicle.meter) : 500)
	})).filter((item) => item.state);
	if (!vehicle) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "card p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-xl font-semibold",
			children: "Start with a craft"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-lg text-muted",
			children: "Open the Craft tab and name one. The first full tank only sets the meter. Economy appears at the next full tank."
		})]
	});
	const hours = vehicle.meter === "h";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: hours ? "Last burn" : "Last full tank",
						value: formatEconomy(latest?.perUnit ?? null, garage.settings.economyUnit, vehicle.volumeUnit, vehicle.meter)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: hours ? "Average burn" : "Average",
						value: formatEconomy(average, garage.settings.economyUnit, vehicle.volumeUnit, vehicle.meter)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: `Cost per ${meterUnit(vehicle.meter, garage.settings.distanceUnit)}`,
						value: perDistance == null ? "—" : formatMoney(perDistance, garage.settings.currency)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Fuel spend"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								months === 12 ? "Twelve months" : "Three months on Garage",
								" ·",
								" ",
								formatMoney(spend, garage.settings.currency),
								" logged"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 h-48 min-w-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: chart,
								margin: {
									top: 8,
									right: 12,
									left: 12,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "label",
										interval: months > 6 ? 1 : 0,
										tick: {
											fill: "var(--color-muted)",
											fontSize: 12
										},
										axisLine: false,
										tickLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { hide: true }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										formatter: (value) => formatMoney(Number(value), garage.settings.currency),
										contentStyle: {
											background: "var(--color-surface)",
											border: "1px solid var(--color-line)",
											borderRadius: 12
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "amount",
										stroke: "var(--color-amber)",
										fill: "var(--color-amber)",
										fillOpacity: .18,
										strokeWidth: 2
									})
								]
							})
						})
					}),
					garage.plan.plan === "free" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/plus",
								className: "font-semibold text-fg underline-offset-2 hover:underline",
								children: "Plus"
							}),
							" ",
							"keeps a year of this chart and exports the log."
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ghost mt-3",
						disabled: busy,
						onClick: onExport,
						children: "Export CSV"
					})
				]
			}),
			due.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Due"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: due.map(({ service, state }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [service.category, service.nextOn ? ` · ${service.nextOn}` : ""] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: state === "overdue" ? "font-semibold text-amber" : "font-semibold text-pine",
							children: state === "overdue" ? "Overdue" : "Soon"
						})]
					}, service.id))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: economyNote(vehicle.meter)
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "card p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "eyebrow",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "num mt-2 text-2xl font-medium tracking-tight",
			children: value
		})]
	});
}
function FillPanel({ garage, vehicle, fills, busy, onAdd, onDelete }) {
	const [filledOn, setFilledOn] = (0, import_react.useState)(todayISO);
	const [odometer, setOdometer] = (0, import_react.useState)("");
	const [volume, setVolume] = (0, import_react.useState)("");
	const [total, setTotal] = (0, import_react.useState)("");
	const [station, setStation] = (0, import_react.useState)("");
	const [fullTank, setFullTank] = (0, import_react.useState)(true);
	const [missed, setMissed] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	const [confirmId, setConfirmId] = (0, import_react.useState)(null);
	const segments = segmentsFor(fills);
	if (!vehicle) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeedCar, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "card grid gap-3 p-5 sm:grid-cols-2",
			onSubmit: (event) => {
				event.preventDefault();
				onAdd({
					vehicleId: vehicle.id,
					filledOn,
					odometerKm: toStored(Number(odometer), vehicle.meter, garage.settings.distanceUnit),
					volume: Number(volume),
					totalCost: Number(total),
					station,
					fullTank,
					missedBefore: missed,
					note
				});
				setVolume("");
				setTotal("");
				setNote("");
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "sm:col-span-2 text-lg font-semibold",
					children: "New fill"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Date",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						type: "date",
						required: true,
						value: filledOn,
						onChange: (event) => setFilledOn(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: meterFieldLabel(vehicle.meter, garage.settings.distanceUnit),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field num",
						inputMode: "decimal",
						required: true,
						value: odometer,
						onChange: (event) => setOdometer(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: `Amount (${vehicle.volumeUnit})`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field num",
						inputMode: "decimal",
						required: true,
						value: volume,
						onChange: (event) => setVolume(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: `Paid (${garage.settings.currency})`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field num",
						inputMode: "decimal",
						required: true,
						value: total,
						onChange: (event) => setTotal(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: placeLabel(kindById(vehicle.kind).group),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						value: station,
						onChange: (event) => setStation(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Note",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						value: note,
						onChange: (event) => setNote(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-h-11 items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: fullTank,
						onChange: (event) => setFullTank(event.target.checked)
					}), "Full tank"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-h-11 items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: missed,
						onChange: (event) => setMissed(event.target.checked)
					}), "Missed a fill before this"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted sm:col-span-2",
					children: vehicle.meter === "km" ? "The reading is the odometer, not the length of this trip." : "Running total, the same idea as an odometer — not this trip alone."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-amber sm:col-span-2",
					type: "submit",
					disabled: busy,
					children: "Save fill"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "card divide-y divide-line",
			children: fills.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "p-5 text-sm text-muted",
				children: "No fills for this craft yet."
			}) : fills.map((fill) => {
				const segment = segments.find((item) => item.fillId === fill.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start justify-between gap-3 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: [
								fill.filledOn,
								" · ",
								formatMeter(fill.odometerKm, vehicle.meter, garage.settings.distanceUnit)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								fill.volume,
								" ",
								vehicle.volumeUnit,
								" · ",
								formatMoney(fill.totalCost, garage.settings.currency),
								fill.station ? ` · ${fill.station}` : "",
								fill.fullTank ? "" : " · partial",
								fill.missedBefore ? " · gap" : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "num mt-1 text-sm",
							children: segment ? formatEconomy(segment.perUnit, garage.settings.economyUnit, vehicle.volumeUnit, vehicle.meter) : fill.fullTank ? "Baseline" : "Partial"
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ghost",
						disabled: busy,
						onClick: () => {
							if (confirmId === fill.id) onDelete(fill.id);
							else setConfirmId(fill.id);
						},
						children: confirmId === fill.id ? "Confirm" : "Remove"
					})]
				}, fill.id);
			})
		})]
	});
}
function ServicePanel({ garage, vehicle, services, fills, busy, onAdd, onDelete }) {
	const book = categoriesFor(vehicle?.kind ?? "car");
	const [category, setCategory] = (0, import_react.useState)(book[0]);
	const [servicedOn, setServicedOn] = (0, import_react.useState)(todayISO);
	const [odometer, setOdometer] = (0, import_react.useState)("");
	const [cost, setCost] = (0, import_react.useState)("");
	const [nextOn, setNextOn] = (0, import_react.useState)("");
	const [nextOdo, setNextOdo] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [confirmId, setConfirmId] = (0, import_react.useState)(null);
	const today = todayISO();
	const odo = latestOdometer(fills);
	(0, import_react.useEffect)(() => {
		setCategory((current) => book.includes(current) ? current : book[0]);
	}, [book, vehicle?.id]);
	if (!vehicle) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeedCar, {});
	const meter = vehicle.meter;
	const distanceUnit = garage.settings.distanceUnit;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "card grid gap-3 p-5 sm:grid-cols-2",
			onSubmit: (event) => {
				event.preventDefault();
				onAdd({
					vehicleId: vehicle.id,
					category,
					servicedOn,
					odometerKm: odometer ? toStored(Number(odometer), meter, distanceUnit) : null,
					cost: cost ? Number(cost) : 0,
					nextOn,
					nextOdometerKm: nextOdo ? toStored(Number(nextOdo), meter, distanceUnit) : null,
					note
				});
				setCost("");
				setNote("");
				setNextOn("");
				setNextOdo("");
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "sm:col-span-2 text-lg font-semibold",
					children: "Service book"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Work",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "field",
						value: category,
						onChange: (event) => setCategory(event.target.value),
						children: book.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Date",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						type: "date",
						required: true,
						value: servicedOn,
						onChange: (event) => setServicedOn(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: meterFieldLabel(meter, distanceUnit),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field num",
						inputMode: "decimal",
						value: odometer,
						onChange: (event) => setOdometer(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: `Cost (${garage.settings.currency})`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field num",
						inputMode: "decimal",
						value: cost,
						onChange: (event) => setCost(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Next date",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						type: "date",
						value: nextOn,
						onChange: (event) => setNextOn(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: nextMeterLabel(meter, distanceUnit),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field num",
						inputMode: "decimal",
						value: nextOdo,
						onChange: (event) => setNextOdo(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Note",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field sm:col-span-2",
						value: note,
						onChange: (event) => setNote(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-amber sm:col-span-2",
					type: "submit",
					disabled: busy,
					children: "Save service"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "card divide-y divide-line",
			children: services.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "p-5 text-sm text-muted",
				children: "Nothing in the book yet."
			}) : services.map((service) => {
				const state = serviceDue(service, odo, today, soonMargin(meter));
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start justify-between gap-3 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: [
								service.category,
								" · ",
								service.servicedOn
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								service.odometerKm != null ? formatMeter(service.odometerKm, meter, distanceUnit) : "No meter",
								" · ",
								formatMoney(service.cost, garage.settings.currency),
								service.note ? ` · ${service.note}` : ""
							]
						}),
						state ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: state === "overdue" ? "text-sm font-semibold text-amber" : "text-sm font-semibold text-pine",
							children: [
								state === "overdue" ? "Overdue" : "Coming up",
								service.nextOn ? ` · ${service.nextOn}` : "",
								service.nextOdometerKm != null ? ` · ${formatMeter(service.nextOdometerKm, meter, distanceUnit)}` : ""
							]
						}) : null
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ghost",
						disabled: busy,
						onClick: () => {
							if (confirmId === service.id) onDelete(service.id);
							else setConfirmId(service.id);
						},
						children: confirmId === service.id ? "Confirm" : "Remove"
					})]
				}, service.id);
			})
		})]
	});
}
function CarPanel({ garage, busy, onAdd, onUpdate, onDelete, onCancelPlus }) {
	const [name, setName] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("car");
	const [meter, setMeter] = (0, import_react.useState)("km");
	const [fuel, setFuel] = (0, import_react.useState)("petrol");
	const [tank, setTank] = (0, import_react.useState)("");
	const limit = garage.plan.plan === "plus" ? 8 : 1;
	const active = garage.vehicles.filter((vehicle) => !vehicle.archived).length;
	const picked = kindById(kind);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "card grid gap-3 p-5",
			onSubmit: (event) => {
				event.preventDefault();
				onAdd({
					name,
					fuel,
					tank: tank ? Number(tank) : null,
					kind,
					meter
				});
				setName("");
				setTank("");
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Add a craft"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						active,
						" of ",
						limit,
						" active on this plan."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						required: true,
						value: name,
						onChange: (event) => setName(event.target.value),
						placeholder: "Daily"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CraftChoice, {
					kind,
					meter,
					fuel,
					tank,
					onKind: (id) => {
						const next = kindById(id);
						setKind(id);
						setMeter(next.meters.includes(meter) ? meter : next.defaultMeter);
						setFuel(next.fuel);
					},
					onMeter: setMeter,
					onFuel: setFuel,
					onTank: setTank
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-relaxed text-muted",
					children: picked.log
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-amber",
					type: "submit",
					disabled: busy,
					children: "Add craft"
				}),
				garage.plan.plan === "free" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						"Need another craft?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/plus",
							className: "font-semibold text-fg underline-offset-2 hover:underline",
							children: "See Plus"
						}),
						"."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn btn-ghost",
					disabled: busy,
					onClick: onCancelPlus,
					children: "Return to Garage plan"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-3",
			children: garage.vehicles.map((vehicle) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VehicleEditor, {
				vehicle,
				hasFills: garage.fills.some((fill) => fill.vehicleId === vehicle.id),
				busy,
				onUpdate,
				onDelete
			}, vehicle.id))
		})]
	});
}
function VehicleEditor({ vehicle, hasFills, busy, onUpdate, onDelete }) {
	const [name, setName] = (0, import_react.useState)(vehicle.name);
	const [kind, setKind] = (0, import_react.useState)(vehicle.kind);
	const [meter, setMeter] = (0, import_react.useState)(vehicle.meter);
	const [fuel, setFuel] = (0, import_react.useState)(vehicle.fuel);
	const [tank, setTank] = (0, import_react.useState)(vehicle.tank ? String(vehicle.tank) : "");
	const [confirm, setConfirm] = (0, import_react.useState)(false);
	const locked = hasFills ? meterFamily(vehicle.meter) : null;
	const draft = () => ({
		id: vehicle.id,
		name,
		fuel,
		tank: tank ? Number(tank) : null,
		kind,
		meter
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "card grid gap-3 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [kindById(kind).label, vehicle.archived ? " · archived" : ""]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Name",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field",
					value: name,
					onChange: (event) => setName(event.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CraftChoice, {
				kind,
				meter,
				fuel,
				tank,
				locked,
				onKind: (id) => {
					const allowed = kindById(id).meters.filter((item) => !locked || meterFamily(item) === locked);
					if (allowed.length === 0) return;
					setKind(id);
					setMeter(allowed.includes(meter) ? meter : allowed[0]);
				},
				onMeter: setMeter,
				onFuel: setFuel,
				onTank: setTank
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-relaxed text-muted",
				children: kindById(kind).log
			}),
			hasFills ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Fills are already logged, so this craft stays on ",
					locked === "time" ? "engine hours" : "distance",
					"."
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ink",
						disabled: busy,
						onClick: () => onUpdate({
							...draft(),
							archived: vehicle.archived
						}),
						children: "Save"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ghost",
						disabled: busy,
						onClick: () => onUpdate({
							...draft(),
							archived: !vehicle.archived
						}),
						children: vehicle.archived ? "Restore" : "Archive"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ghost",
						disabled: busy,
						onClick: () => {
							if (confirm) onDelete(vehicle.id);
							else setConfirm(true);
						},
						children: confirm ? "Confirm delete" : "Delete"
					})
				]
			})
		]
	});
}
function CraftChoice({ kind, meter, fuel, tank, locked, onKind, onMeter, onFuel, onTank }) {
	const picked = kindById(kind);
	const meters = picked.meters.filter((item) => !locked || meterFamily(item) === locked);
	const unit = FUELS.find((item) => item.id === fuel)?.unit ?? "L";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "Type",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				className: "field",
				value: kind,
				onChange: (event) => onKind(event.target.value),
				children: [
					"Road",
					"Water",
					"Air"
				].map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
					label: group,
					children: KINDS.filter((item) => item.group === group).map((item) => {
						const compatible = !locked || item.meters.some((entry) => meterFamily(entry) === locked);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: item.id,
							disabled: !compatible,
							children: [item.label, compatible ? "" : " — different meter"]
						}, item.id);
					})
				}, group))
			})
		}),
		meters.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "Log",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				className: "field",
				value: meter,
				onChange: (event) => onMeter(event.target.value),
				children: meters.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: item,
					children: item === "nm" ? "Nautical miles — range" : "Engine hours — burn rate"
				}, item))
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "Fuel",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				className: "field",
				value: fuel,
				onChange: (event) => onFuel(event.target.value),
				children: FUELS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: item.id,
					children: item.label
				}, item.id))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: `Tank (${unit}, up to ${picked.tankMax})`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "field num",
				inputMode: "decimal",
				value: tank,
				onChange: (event) => onTank(event.target.value)
			})
		})
	] });
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "grid gap-1 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium text-muted",
			children: label
		}), children]
	});
}
function NeedCar() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "card p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-xl font-semibold",
			children: "Name a craft first"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "The log hangs off a craft. Add one on the Craft tab."
		})]
	});
}
function GaragePage() {
	const { session_id } = Route$4.useSearch();
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-40 animate-pulse rounded-full bg-fg/10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card mt-6 h-48 animate-pulse" })] });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GarageApp, { sessionId: session_id }) });
}
//#endregion
export { GaragePage as component };
