//#region node_modules/.nitro/vite/services/ssr/assets/format-CV26oMVC.js
var KM_PER_MI = 1.609344;
/** International nautical mile. */
var KM_PER_NM = 1.852;
var LITRE_PER_US_GAL = 3.785411784;
/** US miles per gallon for one kilometre per litre. */
var MPG_PER_KML = LITRE_PER_US_GAL / KM_PER_MI;
function todayISO() {
	const date = /* @__PURE__ */ new Date();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${month}-${day}`;
}
function toKm(value, unit) {
	return unit === "mi" ? value * KM_PER_MI : value;
}
function fromKm(km, unit) {
	return unit === "mi" ? km / KM_PER_MI : km;
}
function formatNumber(value, digits = 1) {
	return new Intl.NumberFormat("en", {
		maximumFractionDigits: digits,
		minimumFractionDigits: digits
	}).format(value);
}
/** Store a reading. Nautical miles become kilometres. Hours stay hours. */
function toStored(value, meter, distanceUnit) {
	if (meter === "h") return value;
	if (meter === "nm") return value * KM_PER_NM;
	return toKm(value, distanceUnit);
}
function fromStored(stored, meter, distanceUnit) {
	if (meter === "h") return stored;
	if (meter === "nm") return stored / KM_PER_NM;
	return fromKm(stored, distanceUnit);
}
function meterUnit(meter, distanceUnit) {
	if (meter === "h") return "h";
	if (meter === "nm") return "nm";
	return distanceUnit;
}
function formatMeter(stored, meter, distanceUnit) {
	const digits = meter === "km" && distanceUnit === "km" ? 0 : 1;
	return `${formatNumber(fromStored(stored, meter, distanceUnit), digits)} ${meterUnit(meter, distanceUnit)}`;
}
function meterFieldLabel(meter, distanceUnit) {
	if (meter === "h") return "Hour meter";
	if (meter === "nm") return "Total nautical miles";
	return `Odometer (${distanceUnit})`;
}
function nextMeterLabel(meter, distanceUnit) {
	if (meter === "h") return "Next hours";
	if (meter === "nm") return "Next meter (nm)";
	return `Next odometer (${distanceUnit})`;
}
function economyNote(meter) {
	if (meter === "h") return "Burn rate is the hours between one full tank and the next, under every unit filled in between. A missed fill breaks that chain. The first full tank only sets the hour meter.";
	if (meter === "nm") return "Range is the nautical miles from one full tank to the next, divided by every unit filled in between. Enter the running total, not one leg. A missed fill breaks the chain. One nautical mile is 1.852 km.";
	return "Economy is the distance from one full tank to the next, divided by every unit filled in between. A missed fill breaks that chain. The first full tank only sets the odometer.";
}
function formatMoney(amount, currency) {
	return new Intl.NumberFormat("en", {
		style: "currency",
		currency,
		maximumFractionDigits: 2
	}).format(amount);
}
function formatPlainDate(iso) {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!match) return iso;
	const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
	return new Intl.DateTimeFormat("en", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC"
	}).format(date);
}
/** Display figure. `perUnit` is stored-meter per volume (km or hours). */
function economyFigure(perUnit, economy, volumeUnit, meter = "km") {
	if (perUnit == null || !Number.isFinite(perUnit) || perUnit <= 0) return null;
	if (meter === "h") return {
		value: formatNumber(1 / perUnit, 1),
		unit: `${volumeUnit}/h`
	};
	if (meter === "nm") {
		const nmPer = perUnit / KM_PER_NM;
		if (volumeUnit !== "L") return {
			value: formatNumber(nmPer, 2),
			unit: `nm/${volumeUnit}`
		};
		if (economy === "l100") return {
			value: formatNumber(1 / nmPer, 2),
			unit: "L/nm"
		};
		if (economy === "mpg") return {
			value: formatNumber(nmPer * LITRE_PER_US_GAL, 1),
			unit: "nmpg"
		};
		return {
			value: formatNumber(nmPer, 2),
			unit: "nm/L"
		};
	}
	if (volumeUnit !== "L") return {
		value: formatNumber(perUnit, 1),
		unit: `km/${volumeUnit}`
	};
	if (economy === "l100") return {
		value: formatNumber(100 / perUnit, 1),
		unit: "L/100km"
	};
	if (economy === "mpg") return {
		value: formatNumber(perUnit * MPG_PER_KML, 1),
		unit: "mpg"
	};
	return {
		value: formatNumber(perUnit, 1),
		unit: "km/L"
	};
}
function formatEconomy(perUnit, economy, volumeUnit, meter = "km") {
	const figure = economyFigure(perUnit, economy, volumeUnit, meter);
	return figure ? `${figure.value} ${figure.unit}` : "—";
}
//#endregion
export { formatMoney as a, meterFieldLabel as c, toStored as d, todayISO as f, formatMeter as i, meterUnit as l, economyNote as n, formatPlainDate as o, formatEconomy as r, fromStored as s, KM_PER_NM as t, nextMeterLabel as u };
