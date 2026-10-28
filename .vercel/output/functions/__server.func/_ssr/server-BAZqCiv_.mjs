import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { a as MAX_FILL_MONEY, d as isKind, f as isMeter, l as authMiddleware, n as CURRENCIES, o as MAX_FILL_VOLUME, p as kindById, r as FUELS, s as MAX_METER, t as CATEGORIES } from "./constants-BAf5jR2i.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-BAZqCiv_.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function isFuel(value) {
	return FUELS.some((item) => item.id === value);
}
function isCurrency(value) {
	return CURRENCIES.includes(value);
}
function assertDate(value, label) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${label} needs a real date.`);
	const time = Date.parse(`${value}T00:00:00Z`);
	if (Number.isNaN(time)) throw new Error(`${label} needs a real date.`);
	return value;
}
function assertMoney(value, label, max = 1e5) {
	if (!Number.isFinite(value) || value < 0 || value > max) throw new Error(`${label} looks wrong.`);
	return Math.round(value * 100) / 100;
}
function assertPositive(value, label, max) {
	if (!Number.isFinite(value) || value <= 0 || value > max) throw new Error(`${label} looks wrong.`);
	return value;
}
function parseCraft(kindRaw, meterRaw) {
	if (!isKind(kindRaw)) throw new Error("Pick a type of craft.");
	const kind = kindById(kindRaw);
	const meter = meterRaw && isMeter(meterRaw) ? meterRaw : kind.defaultMeter;
	if (!kind.meters.includes(meter)) throw new Error("That meter does not belong on this craft.");
	return {
		kind: kindRaw,
		meter
	};
}
function parsePhone(value) {
	const compact = value.trim().replace(/[^\d+]/g, "").slice(0, 16);
	if (!compact) return "";
	const digits = compact.replace(/\D/g, "");
	if (digits.length < 8 || digits.length > 15 || !/^\+?\d+$/.test(compact)) throw new Error("Enter a phone number with the country code.");
	return compact;
}
function parseTank(tank, kind) {
	if (tank == null || Number(tank) === 0) return null;
	return assertPositive(Number(tank), "Tank size", kindById(kind).tankMax);
}
var loadGarage = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4606703aa406c77159edb4e26d69e13dff25d58e04f623bed9a4d75d48b94ffa"));
var saveSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const distanceUnit = input.distanceUnit === "mi" ? "mi" : "km";
	const economyUnit = input.economyUnit === "l100" || input.economyUnit === "mpg" ? input.economyUnit : "kml";
	if (!isCurrency(input.currency)) throw new Error("Pick a currency.");
	return {
		distanceUnit,
		economyUnit,
		currency: input.currency
	};
}).handler(createSsrRpc("a006a10326c0b6972592958190f8b37d3896e8122b85775b75b224e06b1a4ca8"));
var addVehicle = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = input.name.trim().slice(0, 60);
	if (!name) throw new Error("Name the vehicle.");
	if (!isFuel(input.fuel)) throw new Error("Pick a fuel.");
	const craft = parseCraft(input.kind ?? "car", input.meter);
	return {
		name,
		fuel: input.fuel,
		tank: parseTank(input.tank, craft.kind),
		...craft
	};
}).handler(createSsrRpc("9e8655aebf1a78074e22211b7eb7d509ba70a21d2698938a50530056f34f21d2"));
var updateVehicle = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = input.name.trim().slice(0, 60);
	if (!name) throw new Error("Name the vehicle.");
	if (!isFuel(input.fuel)) throw new Error("Pick a fuel.");
	if (!Number.isInteger(input.id)) throw new Error("Missing vehicle.");
	const craft = parseCraft(input.kind ?? "car", input.meter);
	return {
		id: input.id,
		name,
		fuel: input.fuel,
		tank: parseTank(input.tank, craft.kind),
		archived: Boolean(input.archived),
		...craft
	};
}).handler(createSsrRpc("eb1a18c94e0a70101bffb7b73508e63fc671d30cde2b40254a64a775a0fac785"));
var deleteVehicle = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!Number.isInteger(input.id)) throw new Error("Missing vehicle.");
	return input;
}).handler(createSsrRpc("a6c1551188e4327f3939c01eb4365df8e6ad4adf06e68da605facc80625a90e0"));
var addFill = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	vehicleId: input.vehicleId,
	filledOn: assertDate(input.filledOn, "Fill date"),
	odometerKm: assertPositive(Number(input.odometerKm), "Meter", MAX_METER),
	volume: assertPositive(Number(input.volume), "Amount", MAX_FILL_VOLUME),
	totalCost: assertMoney(Number(input.totalCost), "Amount paid", MAX_FILL_MONEY),
	station: (input.station ?? "").trim().slice(0, 80),
	fullTank: Boolean(input.fullTank),
	missedBefore: Boolean(input.missedBefore),
	note: (input.note ?? "").trim().slice(0, 240)
})).handler(createSsrRpc("96160a6f9b0a87c5c2253c72daac640110901cfdb1cabde6f8015ce11895e1f8"));
var deleteFill = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!Number.isInteger(input.id)) throw new Error("Missing fill.");
	return input;
}).handler(createSsrRpc("2c39bf6a170ce766ec0069f6358367aead54e738fb6fda78e0378678f2d7e117"));
var addService = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const category = CATEGORIES.find((item) => item === input.category) ?? "Other";
	const odometer = input.odometerKm == null || Number(input.odometerKm) === 0 ? null : assertPositive(Number(input.odometerKm), "Meter", MAX_METER);
	const nextOdo = input.nextOdometerKm == null || Number(input.nextOdometerKm) === 0 ? null : assertPositive(Number(input.nextOdometerKm), "Next meter", MAX_METER);
	const nextOn = input.nextOn?.trim() ? assertDate(input.nextOn, "Next date") : null;
	return {
		vehicleId: input.vehicleId,
		category,
		servicedOn: assertDate(input.servicedOn, "Service date"),
		odometerKm: odometer,
		cost: assertMoney(Number(input.cost) || 0, "Cost", MAX_FILL_MONEY),
		nextOn,
		nextOdometerKm: nextOdo,
		note: (input.note ?? "").trim().slice(0, 240)
	};
}).handler(createSsrRpc("b9fadb40ebb40f209495a91f252f882b565f1639b84d9bf04b892dec2358c0db"));
var deleteService = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!Number.isInteger(input.id)) throw new Error("Missing service.");
	return input;
}).handler(createSsrRpc("4d35e693901afc8929bface9053fd03127835e8d24b653936949dc955cfcf3c5"));
var exportLog = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("aca2de6f43d30e5fad2ef3dddaddb796735efa4ec4b33d71c8c85a48958d0a59"));
var startCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const interval = input.interval === "year" ? "year" : "month";
	let origin = "";
	try {
		const url = new URL(input.origin);
		if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("bad");
		origin = url.origin;
	} catch {
		throw new Error("Could not start checkout from this page.");
	}
	return {
		interval,
		origin
	};
}).handler(createSsrRpc("dcd4ac2c6af5302f2d3a13762088935295f06a9edb6dbcae6832b76c52322082"));
var confirmCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const sessionId = input.sessionId?.trim() ?? "";
	if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) throw new Error("That payment reference is not valid.");
	return { sessionId };
}).handler(createSsrRpc("f2c5f3c03b2dbecb744eb0651ef684047bf9631028e6f367c3269877be26cf54"));
var cancelPlus = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("d9583968ccae5b57e850e20cd98dde1ba3bdacf0b4ff8aba9dc1ba66e3e4cf3c"));
var saveProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = input.name.trim().slice(0, 80);
	if (!name) throw new Error("Enter the name on the account.");
	return {
		name,
		phone: parsePhone(input.phone ?? "")
	};
}).handler(createSsrRpc("dbb2a898889b94b56ebe4fbf3d7941b355f2d98df219c396334963279fc8d798"));
var deleteAccount = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (input.phrase !== "DELETE") throw new Error("Type DELETE to confirm.");
	if (input.mode !== "donate" && input.mode !== "erase") throw new Error("Choose whether to donate an anonymized copy or erase everything.");
	return { mode: input.mode };
}).handler(createSsrRpc("16e2bd7a9c8cf3ecb6e8847597eeb313b8ed559515b277fe9e514efce2f9606a"));
//#endregion
export { confirmCheckout as a, deleteService as c, loadGarage as d, saveProfile as f, updateVehicle as h, cancelPlus as i, deleteVehicle as l, startCheckout as m, addService as n, deleteAccount as o, saveSettings as p, addVehicle as r, deleteFill as s, addFill as t, exportLog as u };
