import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/constants-BAf5jR2i.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-1vAx-gM_.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-QCk_JiDB.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
var FUELS = [
	{
		id: "petrol",
		label: "Petrol",
		unit: "L"
	},
	{
		id: "diesel",
		label: "Diesel",
		unit: "L"
	},
	{
		id: "hybrid",
		label: "Hybrid",
		unit: "L"
	},
	{
		id: "cng",
		label: "CNG",
		unit: "kg"
	},
	{
		id: "avgas",
		label: "Avgas 100LL",
		unit: "L"
	},
	{
		id: "jeta",
		label: "Jet-A",
		unit: "L"
	},
	{
		id: "electric",
		label: "Electric",
		unit: "kWh"
	}
];
var ROAD_SERVICE = [
	"Oil",
	"Filters",
	"Brakes",
	"Tyres",
	"Battery",
	"Coolant",
	"Inspection",
	"Insurance",
	"Other"
];
var BIKE_SERVICE = [
	"Oil",
	"Chain",
	"Valve clearance",
	"Filters",
	"Brakes",
	"Tyres",
	"Battery",
	"Coolant",
	"Inspection",
	"Insurance",
	"Other"
];
/**
* Personal A-to-B craft: something that burns a measurable fuel to go from a
* departure to an arrival. Unpowered machines (bicycle, kayak, sail with no
* auxiliary) are out of scope.
*
* The meter is the part that used to be missing. A road odometer, a GPS
* nautical-mile total, and an engine-hour meter are not interchangeable:
* 1 nm = 1.852 km, and hours do not convert to distance at all.
* Water and air can use either nautical miles (specific range) or hours
* (burn rate). Road craft stay on the odometer.
*/
var KINDS = [
	{
		id: "car",
		label: "Car",
		group: "Road",
		meters: ["km"],
		defaultMeter: "km",
		fuel: "petrol",
		tankMax: 120,
		services: ROAD_SERVICE,
		log: "Road odometer. Economy is the distance between full tanks."
	},
	{
		id: "suv",
		label: "SUV",
		group: "Road",
		meters: ["km"],
		defaultMeter: "km",
		fuel: "petrol",
		tankMax: 160,
		services: ROAD_SERVICE,
		log: "Same odometer as a car. The tank cap is larger, because these fills are."
	},
	{
		id: "motorcycle",
		label: "Motorcycle",
		group: "Road",
		meters: ["km"],
		defaultMeter: "km",
		fuel: "petrol",
		tankMax: 40,
		services: BIKE_SERVICE,
		log: "Road odometer, small tank. The book adds the chain and valve clearance."
	},
	{
		id: "scooter",
		label: "Scooter",
		group: "Road",
		meters: ["km"],
		defaultMeter: "km",
		fuel: "petrol",
		tankMax: 25,
		services: BIKE_SERVICE,
		log: "Road odometer and a few litres. Same full-tank chain as a car."
	},
	{
		id: "pickup",
		label: "Pickup",
		group: "Road",
		meters: ["km"],
		defaultMeter: "km",
		fuel: "diesel",
		tankMax: 220,
		services: ROAD_SERVICE,
		log: "Road odometer. The tank cap is a light truck, not a car."
	},
	{
		id: "van",
		label: "Van",
		group: "Road",
		meters: ["km"],
		defaultMeter: "km",
		fuel: "diesel",
		tankMax: 180,
		services: ROAD_SERVICE,
		log: "Road odometer. Same chain as a car, with a larger tank."
	},
	{
		id: "three",
		label: "Three-wheeler",
		group: "Road",
		meters: ["km"],
		defaultMeter: "km",
		fuel: "cng",
		tankMax: 40,
		services: ROAD_SERVICE,
		log: "Road odometer. Often CNG, logged in kilograms rather than litres."
	},
	{
		id: "motorboat",
		label: "Motorboat",
		group: "Water",
		meters: ["nm", "h"],
		defaultMeter: "nm",
		fuel: "petrol",
		tankMax: 2e3,
		services: [
			"Oil",
			"Impeller",
			"Filters",
			"Lower unit",
			"Anodes",
			"Spark plugs",
			"Battery",
			"Hull",
			"Insurance",
			"Other"
		],
		log: "No road odometer. Nautical miles give range; engine hours give litres per hour. Enter the running total."
	},
	{
		id: "yacht",
		label: "Yacht",
		group: "Water",
		meters: ["nm", "h"],
		defaultMeter: "nm",
		fuel: "diesel",
		tankMax: 4e4,
		services: [
			"Oil",
			"Impeller",
			"Filters",
			"Anodes",
			"Antifoul",
			"Fuel system",
			"Battery",
			"Hull",
			"Survey",
			"Insurance",
			"Other"
		],
		log: "Usually diesel, and a fill can be large. Log total nautical miles or engine hours, not one passage."
	},
	{
		id: "sailboat",
		label: "Sailboat",
		group: "Water",
		meters: ["h", "nm"],
		defaultMeter: "h",
		fuel: "diesel",
		tankMax: 2e3,
		services: [
			"Oil",
			"Impeller",
			"Filters",
			"Anodes",
			"Antifoul",
			"Rigging",
			"Battery",
			"Hull",
			"Survey",
			"Insurance",
			"Other"
		],
		log: "Only the auxiliary burns fuel. Hours are the honest burn. Nautical miles count only for distance the engine made."
	},
	{
		id: "pwc",
		label: "Personal watercraft",
		group: "Water",
		meters: ["h", "nm"],
		defaultMeter: "h",
		fuel: "petrol",
		tankMax: 80,
		services: [
			"Oil",
			"Impeller",
			"Spark plugs",
			"Anodes",
			"Battery",
			"Hull",
			"Insurance",
			"Other"
		],
		log: "Small petrol tank. The hour meter is the usual log. Nautical miles if you keep a running GPS total."
	},
	{
		id: "plane",
		label: "Plane",
		group: "Air",
		meters: ["nm", "h"],
		defaultMeter: "nm",
		fuel: "avgas",
		tankMax: 3e4,
		services: [
			"Oil",
			"Filters",
			"Spark plugs",
			"Annual",
			"100-hour",
			"ELT",
			"Tyres",
			"Battery",
			"Inspection",
			"Insurance",
			"Other"
		],
		log: "Avgas or Jet-A. Nautical miles between full tanks is specific range. Hobbs hours is fuel flow."
	},
	{
		id: "helicopter",
		label: "Helicopter",
		group: "Air",
		meters: ["h", "nm"],
		defaultMeter: "h",
		fuel: "avgas",
		tankMax: 8e3,
		services: [
			"Oil",
			"Filters",
			"Rotor",
			"Gearbox",
			"100-hour",
			"Annual",
			"Battery",
			"Inspection",
			"Insurance",
			"Other"
		],
		log: "Logged on the Hobbs meter as burn per hour. Nautical miles if you keep a cumulative air log."
	}
];
var CATEGORIES = [...new Set(KINDS.flatMap((kind) => [...kind.services]))];
var CURRENCIES = [
	"SGD",
	"USD",
	"EUR",
	"GBP",
	"INR",
	"AUD"
];
var PLUS_YEAR_CENTS = 5900;
/** A single bunkering or jet fuel load can clear a car-sized money cap. */
var MAX_FILL_MONEY = 2e6;
var MAX_FILL_VOLUME = 5e4;
var MAX_METER = 2e6;
function volumeUnitFor(fuel) {
	return FUELS.find((item) => item.id === fuel)?.unit ?? "L";
}
function kindById(id) {
	return KINDS.find((item) => item.id === id) ?? KINDS[0];
}
function isKind(value) {
	return KINDS.some((item) => item.id === value);
}
function isMeter(value) {
	return value === "km" || value === "nm" || value === "h";
}
function meterFamily(meter) {
	return meter === "h" ? "time" : "distance";
}
function categoriesFor(kind) {
	return kindById(kind).services;
}
function placeLabel(group) {
	if (group === "Water") return "Marina";
	if (group === "Air") return "Field";
	return "Station";
}
//#endregion
export { MAX_FILL_MONEY as a, PLUS_YEAR_CENTS as c, isKind as d, isMeter as f, volumeUnitFor as g, placeLabel as h, KINDS as i, authMiddleware as l, meterFamily as m, CURRENCIES as n, MAX_FILL_VOLUME as o, kindById as p, FUELS as r, MAX_METER as s, CATEGORIES as t, categoriesFor as u };
