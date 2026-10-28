import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { a as MAX_FILL_MONEY, c as PLUS_YEAR_CENTS, d as isKind, f as isMeter, g as volumeUnitFor, l as authMiddleware, m as meterFamily, n as CURRENCIES, o as MAX_FILL_VOLUME, p as kindById, r as FUELS, s as MAX_METER, t as CATEGORIES } from "./constants-BAf5jR2i.mjs";
import { r as formatEconomy } from "./format-CV26oMVC.mjs";
import { n as segmentsFor } from "./economy-CwuCs3wy.mjs";
import { r as getSql } from "./db-D2v4gUMA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-DdP-o-J1.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function asDate(value) {
	if (!value) return null;
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	return String(value).slice(0, 10);
}
function isFuel(value) {
	return FUELS.some((item) => item.id === value);
}
function isCurrency(value) {
	return CURRENCIES.includes(value);
}
function stripeReady() {
	return Boolean(process.env.STRIPE_SECRET_KEY);
}
function mapVehicle(row) {
	const fuel = isFuel(row.fuel) ? row.fuel : "petrol";
	const unit = row.volume_unit === "kg" || row.volume_unit === "kWh" ? row.volume_unit : "L";
	const kind = isKind(row.kind) ? row.kind : "car";
	const meter = isMeter(row.meter) ? row.meter : "km";
	return {
		id: row.id,
		name: row.name,
		kind,
		meter,
		fuel,
		volumeUnit: unit,
		tank: row.tank,
		archived: row.archived
	};
}
function mapFill(row) {
	return {
		id: row.id,
		vehicleId: row.vehicle_id,
		filledOn: asDate(row.filled_on) ?? "",
		odometerKm: row.odometer_km,
		volume: row.volume,
		totalCost: row.total_cost,
		station: row.station,
		fullTank: row.full_tank,
		missedBefore: row.missed_before,
		note: row.note
	};
}
function mapService(row) {
	return {
		id: row.id,
		vehicleId: row.vehicle_id,
		category: row.category,
		servicedOn: asDate(row.serviced_on) ?? "",
		odometerKm: row.odometer_km,
		cost: row.cost,
		nextOn: asDate(row.next_on),
		nextOdometerKm: row.next_odometer_km,
		note: row.note
	};
}
async function readGarage(sql, userId) {
	await sql`
    insert into fuellee_settings (user_id)
    values (${userId})
    on conflict (user_id) do nothing
  `;
	const setting = (await sql`
    select distance_unit, economy_unit, currency, phone
    from fuellee_settings
    where user_id = ${userId}
  `)[0];
	const settings = {
		distanceUnit: setting?.distance_unit === "mi" ? "mi" : "km",
		economyUnit: setting?.economy_unit === "l100" || setting?.economy_unit === "mpg" ? setting.economy_unit : "kml",
		currency: setting && isCurrency(setting.currency) ? setting.currency : "SGD",
		phone: setting?.phone?.trim() ?? ""
	};
	const planRow = (await sql`
    select plan, billing, provider from fuellee_plans where user_id = ${userId}
  `)[0];
	return {
		settings,
		plan: {
			plan: planRow?.plan === "plus" ? "plus" : "free",
			billing: planRow?.billing === "month" || planRow?.billing === "year" ? planRow.billing : "none",
			provider: planRow?.provider === "preview" || planRow?.provider === "stripe" ? planRow.provider : "none",
			stripeReady: stripeReady()
		},
		vehicles: (await sql`
      select id, name, kind, meter, fuel, volume_unit, tank, archived
      from fuellee_vehicles
      where user_id = ${userId}
      order by archived asc, created_at asc, id asc
    `).map(mapVehicle),
		fills: (await sql`
      select id, vehicle_id, filled_on, odometer_km, volume, total_cost, station, full_tank, missed_before, note
      from fuellee_fills
      where user_id = ${userId}
      order by filled_on desc, odometer_km desc, id desc
    `).map(mapFill),
		services: (await sql`
      select id, vehicle_id, category, serviced_on, odometer_km, cost, next_on, next_odometer_km, note
      from fuellee_services
      where user_id = ${userId}
      order by serviced_on desc, id desc
    `).map(mapService)
	};
}
function vehicleLimit(plan) {
	return plan === "plus" ? 8 : 1;
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
async function ownVehicle(sql, userId, vehicleId) {
	if (!(await sql`
    select id from fuellee_vehicles where id = ${vehicleId} and user_id = ${userId}
  `)[0]) throw new Error("That vehicle is not in your garage.");
}
async function userEmail(sql, userId) {
	return (await sql`select email from "user" where id = ${userId}`)[0]?.email ?? null;
}
async function stripe(key, path, method, body) {
	const response = await fetch(`https://api.stripe.com/v1/${path}`, {
		method,
		headers: {
			Authorization: `Bearer ${key}`,
			...body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}
		},
		body
	});
	const json = await response.json();
	if (!response.ok) throw new Error(json.error?.message ?? "Payment could not be completed.");
	return json;
}
function idOf(value) {
	if (!value) return null;
	if (typeof value === "string") return value;
	return value.id ?? null;
}
async function writePlan(sql, userId, plan, billing, provider, stripeCustomer, stripeSubscription) {
	await sql`
    insert into fuellee_plans (user_id, plan, billing, provider, stripe_customer, stripe_subscription, updated_at)
    values (${userId}, ${plan}, ${billing}, ${provider}, ${stripeCustomer}, ${stripeSubscription}, now())
    on conflict (user_id) do update set
      plan = excluded.plan,
      billing = excluded.billing,
      provider = excluded.provider,
      stripe_customer = coalesce(excluded.stripe_customer, fuellee_plans.stripe_customer),
      stripe_subscription = excluded.stripe_subscription,
      updated_at = now()
  `;
}
var loadGarage_createServerFn_handler = createServerRpc({
	id: "4606703aa406c77159edb4e26d69e13dff25d58e04f623bed9a4d75d48b94ffa",
	name: "loadGarage",
	filename: "src/lib/fuellee/server.ts"
}, (opts) => loadGarage.__executeServer(opts));
var loadGarage = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadGarage_createServerFn_handler, async ({ context }) => {
	return readGarage(await getSql(), context.userId);
});
var saveSettings_createServerFn_handler = createServerRpc({
	id: "a006a10326c0b6972592958190f8b37d3896e8122b85775b75b224e06b1a4ca8",
	name: "saveSettings",
	filename: "src/lib/fuellee/server.ts"
}, (opts) => saveSettings.__executeServer(opts));
var saveSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const distanceUnit = input.distanceUnit === "mi" ? "mi" : "km";
	const economyUnit = input.economyUnit === "l100" || input.economyUnit === "mpg" ? input.economyUnit : "kml";
	if (!isCurrency(input.currency)) throw new Error("Pick a currency.");
	return {
		distanceUnit,
		economyUnit,
		currency: input.currency
	};
}).handler(saveSettings_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`
      insert into fuellee_settings (user_id, distance_unit, economy_unit, currency, updated_at)
      values (${context.userId}, ${data.distanceUnit}, ${data.economyUnit}, ${data.currency}, now())
      on conflict (user_id) do update set
        distance_unit = excluded.distance_unit,
        economy_unit = excluded.economy_unit,
        currency = excluded.currency,
        updated_at = now()
    `;
	return { ok: true };
});
var addVehicle_createServerFn_handler = createServerRpc({
	id: "9e8655aebf1a78074e22211b7eb7d509ba70a21d2698938a50530056f34f21d2",
	name: "addVehicle",
	filename: "src/lib/fuellee/server.ts"
}, (opts) => addVehicle.__executeServer(opts));
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
}).handler(addVehicle_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const garage = await readGarage(sql, context.userId);
	if (garage.vehicles.filter((vehicle) => !vehicle.archived).length >= vehicleLimit(garage.plan.plan)) throw new Error(garage.plan.plan === "plus" ? `Plus holds 8 vehicles.` : "Garage includes one vehicle. Plus opens the rest.");
	await sql`
      insert into fuellee_vehicles (user_id, name, kind, meter, fuel, volume_unit, tank)
      values (
        ${context.userId},
        ${data.name},
        ${data.kind},
        ${data.meter},
        ${data.fuel},
        ${volumeUnitFor(data.fuel)},
        ${data.tank}
      )
    `;
	return { ok: true };
});
var updateVehicle_createServerFn_handler = createServerRpc({
	id: "eb1a18c94e0a70101bffb7b73508e63fc671d30cde2b40254a64a775a0fac785",
	name: "updateVehicle",
	filename: "src/lib/fuellee/server.ts"
}, (opts) => updateVehicle.__executeServer(opts));
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
}).handler(updateVehicle_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const garage = await readGarage(sql, context.userId);
	const current = garage.vehicles.find((vehicle) => vehicle.id === data.id);
	if (!current) throw new Error("That vehicle is not in your garage.");
	if (!data.archived) {
		if (garage.vehicles.filter((vehicle) => !vehicle.archived && vehicle.id !== data.id).length >= vehicleLimit(garage.plan.plan)) throw new Error("That would pass the vehicle limit on this plan.");
	}
	if (garage.fills.some((fill) => fill.vehicleId === data.id) && meterFamily(current.meter) !== meterFamily(data.meter)) throw new Error("This craft already has fills. Distance and engine hours cannot be swapped.");
	if (!(await sql`
      update fuellee_vehicles
      set name = ${data.name},
          kind = ${data.kind},
          meter = ${data.meter},
          fuel = ${data.fuel},
          volume_unit = ${volumeUnitFor(data.fuel)},
          tank = ${data.tank},
          archived = ${data.archived}
      where id = ${data.id} and user_id = ${context.userId}
      returning id
    `)[0]) throw new Error("That vehicle is not in your garage.");
	return { ok: true };
});
var deleteVehicle_createServerFn_handler = createServerRpc({
	id: "a6c1551188e4327f3939c01eb4365df8e6ad4adf06e68da605facc80625a90e0",
	name: "deleteVehicle",
	filename: "src/lib/fuellee/server.ts"
}, (opts) => deleteVehicle.__executeServer(opts));
var deleteVehicle = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!Number.isInteger(input.id)) throw new Error("Missing vehicle.");
	return input;
}).handler(deleteVehicle_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await sql`delete from fuellee_fills where vehicle_id = ${data.id} and user_id = ${context.userId}`;
	await sql`delete from fuellee_services where vehicle_id = ${data.id} and user_id = ${context.userId}`;
	if (!(await sql`
      delete from fuellee_vehicles where id = ${data.id} and user_id = ${context.userId} returning id
    `)[0]) throw new Error("That vehicle is not in your garage.");
	return { ok: true };
});
var addFill_createServerFn_handler = createServerRpc({
	id: "96160a6f9b0a87c5c2253c72daac640110901cfdb1cabde6f8015ce11895e1f8",
	name: "addFill",
	filename: "src/lib/fuellee/server.ts"
}, (opts) => addFill.__executeServer(opts));
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
})).handler(addFill_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ownVehicle(sql, context.userId, data.vehicleId);
	await sql`
      insert into fuellee_fills (
        user_id, vehicle_id, filled_on, odometer_km, volume, total_cost, station, full_tank, missed_before, note
      ) values (
        ${context.userId},
        ${data.vehicleId},
        ${data.filledOn},
        ${data.odometerKm},
        ${data.volume},
        ${data.totalCost},
        ${data.station},
        ${data.fullTank},
        ${data.missedBefore},
        ${data.note}
      )
    `;
	return { ok: true };
});
var deleteFill_createServerFn_handler = createServerRpc({
	id: "2c39bf6a170ce766ec0069f6358367aead54e738fb6fda78e0378678f2d7e117",
	name: "deleteFill",
	filename: "src/lib/fuellee/server.ts"
}, (opts) => deleteFill.__executeServer(opts));
var deleteFill = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!Number.isInteger(input.id)) throw new Error("Missing fill.");
	return input;
}).handler(deleteFill_createServerFn_handler, async ({ context, data }) => {
	if (!(await (await getSql())`
      delete from fuellee_fills where id = ${data.id} and user_id = ${context.userId} returning id
    `)[0]) throw new Error("That fill is not yours.");
	return { ok: true };
});
var addService_createServerFn_handler = createServerRpc({
	id: "b9fadb40ebb40f209495a91f252f882b565f1639b84d9bf04b892dec2358c0db",
	name: "addService",
	filename: "src/lib/fuellee/server.ts"
}, (opts) => addService.__executeServer(opts));
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
}).handler(addService_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ownVehicle(sql, context.userId, data.vehicleId);
	await sql`
      insert into fuellee_services (
        user_id, vehicle_id, category, serviced_on, odometer_km, cost, next_on, next_odometer_km, note
      ) values (
        ${context.userId},
        ${data.vehicleId},
        ${data.category},
        ${data.servicedOn},
        ${data.odometerKm},
        ${data.cost},
        ${data.nextOn},
        ${data.nextOdometerKm},
        ${data.note}
      )
    `;
	return { ok: true };
});
var deleteService_createServerFn_handler = createServerRpc({
	id: "4d35e693901afc8929bface9053fd03127835e8d24b653936949dc955cfcf3c5",
	name: "deleteService",
	filename: "src/lib/fuellee/server.ts"
}, (opts) => deleteService.__executeServer(opts));
var deleteService = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!Number.isInteger(input.id)) throw new Error("Missing service.");
	return input;
}).handler(deleteService_createServerFn_handler, async ({ context, data }) => {
	if (!(await (await getSql())`
      delete from fuellee_services where id = ${data.id} and user_id = ${context.userId} returning id
    `)[0]) throw new Error("That service is not yours.");
	return { ok: true };
});
var exportLog_createServerFn_handler = createServerRpc({
	id: "aca2de6f43d30e5fad2ef3dddaddb796735efa4ec4b33d71c8c85a48958d0a59",
	name: "exportLog",
	filename: "src/lib/fuellee/server.ts"
}, (opts) => exportLog.__executeServer(opts));
var exportLog = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(exportLog_createServerFn_handler, async ({ context }) => {
	const garage = await readGarage(await getSql(), context.userId);
	if (garage.plan.plan !== "plus") throw new Error("CSV export is part of Plus.");
	const lines = [[
		"date",
		"vehicle",
		"odometer_km",
		"volume",
		"volume_unit",
		"total_cost",
		"currency",
		"station",
		"full_tank",
		"missed_before",
		"economy",
		"note",
		"kind",
		"meter"
	].join(",")];
	for (const vehicle of garage.vehicles) {
		const fills = garage.fills.filter((fill) => fill.vehicleId === vehicle.id);
		const segments = segmentsFor(fills);
		for (const fill of fills) {
			const segment = segments.find((item) => item.fillId === fill.id);
			const economy = segment ? formatEconomy(segment.perUnit, garage.settings.economyUnit, vehicle.volumeUnit, vehicle.meter) : "";
			lines.push([
				fill.filledOn,
				vehicle.name,
				fill.odometerKm,
				fill.volume,
				vehicle.volumeUnit,
				fill.totalCost,
				garage.settings.currency,
				fill.station,
				fill.fullTank ? "yes" : "no",
				fill.missedBefore ? "yes" : "no",
				economy,
				fill.note,
				vehicle.kind,
				vehicle.meter
			].map(csvCell).join(","));
		}
	}
	return lines.join("\n");
});
function csvCell(value) {
	const text = String(value ?? "");
	if (/[",\n]/.test(text)) return `"${text.replaceAll("\"", "\"\"")}"`;
	return text;
}
var startCheckout_createServerFn_handler = createServerRpc({
	id: "dcd4ac2c6af5302f2d3a13762088935295f06a9edb6dbcae6832b76c52322082",
	name: "startCheckout",
	filename: "src/lib/fuellee/server.ts"
}, (opts) => startCheckout.__executeServer(opts));
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
}).handler(startCheckout_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) {
		await writePlan(sql, context.userId, "plus", data.interval, "preview", null, null);
		return { mode: "preview" };
	}
	const email = await userEmail(sql, context.userId);
	const amount = data.interval === "year" ? PLUS_YEAR_CENTS : 690;
	const body = new URLSearchParams();
	body.set("mode", "subscription");
	body.set("success_url", `${data.origin}/garage?session_id={CHECKOUT_SESSION_ID}`);
	body.set("cancel_url", `${data.origin}/plus`);
	body.set("client_reference_id", context.userId);
	body.set("metadata[billing]", data.interval);
	body.set("metadata[userId]", context.userId);
	if (email) body.set("customer_email", email);
	body.set("line_items[0][quantity]", "1");
	body.set("line_items[0][price_data][currency]", "sgd");
	body.set("line_items[0][price_data][unit_amount]", String(amount));
	body.set("line_items[0][price_data][recurring][interval]", data.interval);
	body.set("line_items[0][price_data][product_data][name]", "Fuellee Plus");
	const session = await stripe(key, "checkout/sessions", "POST", body);
	if (!session.url) throw new Error("Payment page did not open.");
	return {
		mode: "stripe",
		url: session.url
	};
});
var confirmCheckout_createServerFn_handler = createServerRpc({
	id: "f2c5f3c03b2dbecb744eb0651ef684047bf9631028e6f367c3269877be26cf54",
	name: "confirmCheckout",
	filename: "src/lib/fuellee/server.ts"
}, (opts) => confirmCheckout.__executeServer(opts));
var confirmCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const sessionId = input.sessionId?.trim() ?? "";
	if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) throw new Error("That payment reference is not valid.");
	return { sessionId };
}).handler(confirmCheckout_createServerFn_handler, async ({ context, data }) => {
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) throw new Error("Card checkout is not connected.");
	const session = await stripe(key, `checkout/sessions/${data.sessionId}`, "GET");
	if (session.client_reference_id !== context.userId) throw new Error("That payment belongs to another account.");
	if (session.status !== "complete") throw new Error("Payment is not complete yet.");
	const billing = session.metadata?.billing === "year" ? "year" : "month";
	await writePlan(await getSql(), context.userId, "plus", billing, "stripe", idOf(session.customer), idOf(session.subscription));
	return { ok: true };
});
var cancelPlus_createServerFn_handler = createServerRpc({
	id: "d9583968ccae5b57e850e20cd98dde1ba3bdacf0b4ff8aba9dc1ba66e3e4cf3c",
	name: "cancelPlus",
	filename: "src/lib/fuellee/server.ts"
}, (opts) => cancelPlus.__executeServer(opts));
var cancelPlus = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(cancelPlus_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const subscription = (await sql`
      select stripe_subscription from fuellee_plans where user_id = ${context.userId}
    `)[0]?.stripe_subscription;
	const key = process.env.STRIPE_SECRET_KEY;
	if (subscription && key) await stripe(key, `subscriptions/${subscription}`, "DELETE");
	await writePlan(sql, context.userId, "free", "none", "none", null, null);
	return { ok: true };
});
var saveProfile_createServerFn_handler = createServerRpc({
	id: "dbb2a898889b94b56ebe4fbf3d7941b355f2d98df219c396334963279fc8d798",
	name: "saveProfile",
	filename: "src/lib/fuellee/server.ts"
}, (opts) => saveProfile.__executeServer(opts));
var saveProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = input.name.trim().slice(0, 80);
	if (!name) throw new Error("Enter the name on the account.");
	return {
		name,
		phone: parsePhone(input.phone ?? "")
	};
}).handler(saveProfile_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await sql`
      update "user"
      set name = ${data.name}, "updatedAt" = now()
      where id = ${context.userId}
    `;
	await sql`
      insert into fuellee_settings (user_id, phone, updated_at)
      values (${context.userId}, ${data.phone}, now())
      on conflict (user_id) do update set
        phone = excluded.phone,
        updated_at = now()
    `;
	return { ok: true };
});
var deleteAccount_createServerFn_handler = createServerRpc({
	id: "16e2bd7a9c8cf3ecb6e8847597eeb313b8ed559515b277fe9e514efce2f9606a",
	name: "deleteAccount",
	filename: "src/lib/fuellee/server.ts"
}, (opts) => deleteAccount.__executeServer(opts));
var deleteAccount = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (input.phrase !== "DELETE") throw new Error("Type DELETE to confirm.");
	if (input.mode !== "donate" && input.mode !== "erase") throw new Error("Choose whether to donate an anonymized copy or erase everything.");
	return { mode: input.mode };
}).handler(deleteAccount_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const userId = context.userId;
	const email = await userEmail(sql, userId);
	const plan = await sql`
      select stripe_subscription from fuellee_plans where user_id = ${userId}
    `;
	const key = process.env.STRIPE_SECRET_KEY;
	const subscription = plan[0]?.stripe_subscription;
	if (subscription && key) try {
		await stripe(key, `subscriptions/${subscription}`, "DELETE");
	} catch {}
	const owned = await sql`
      select batch_id from fuellee_training_owner where user_id = ${userId}
    `;
	for (const row of owned) await sql`delete from fuellee_training_logs where batch_id = ${row.batch_id}`;
	await sql`delete from fuellee_training_owner where user_id = ${userId}`;
	if (data.mode === "donate") {
		const garage = await readGarage(sql, userId);
		if (garage.fills.length > 0) {
			const batchId = crypto.randomUUID();
			for (const fill of garage.fills) {
				const vehicle = garage.vehicles.find((item) => item.id === fill.vehicleId);
				await sql`
            insert into fuellee_training_logs (
              batch_id, dataset, kind, meter, fuel, volume_unit, filled_on, volume, total_cost, currency, full_tank
            ) values (
              ${batchId},
              'behaviour',
              ${vehicle?.kind ?? "car"},
              ${vehicle?.meter ?? "km"},
              ${vehicle?.fuel ?? "petrol"},
              ${vehicle?.volumeUnit ?? "L"},
              ${fill.filledOn},
              ${fill.volume},
              ${fill.totalCost},
              ${garage.settings.currency},
              ${fill.fullTank}
            )
          `;
			}
			await sql`
          insert into fuellee_training_owner (user_id, batch_id, deleted_at)
          values (${userId}, ${batchId}, now())
        `;
		}
	}
	await sql`delete from fuellee_fills where user_id = ${userId}`;
	await sql`delete from fuellee_services where user_id = ${userId}`;
	await sql`delete from fuellee_vehicles where user_id = ${userId}`;
	await sql`delete from fuellee_settings where user_id = ${userId}`;
	await sql`delete from fuellee_plans where user_id = ${userId}`;
	if (email) await sql`delete from "verification" where identifier = ${email}`;
	await sql`delete from "session" where "userId" = ${userId}`;
	await sql`delete from "account" where "userId" = ${userId}`;
	await sql`delete from "user" where id = ${userId}`;
	return { ok: true };
});
//#endregion
export { addFill_createServerFn_handler, addService_createServerFn_handler, addVehicle_createServerFn_handler, cancelPlus_createServerFn_handler, confirmCheckout_createServerFn_handler, deleteAccount_createServerFn_handler, deleteFill_createServerFn_handler, deleteService_createServerFn_handler, deleteVehicle_createServerFn_handler, exportLog_createServerFn_handler, loadGarage_createServerFn_handler, saveProfile_createServerFn_handler, saveSettings_createServerFn_handler, startCheckout_createServerFn_handler, updateVehicle_createServerFn_handler };
