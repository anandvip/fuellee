export const FUELS = [
  { id: "petrol", label: "Petrol", unit: "L" },
  { id: "diesel", label: "Diesel", unit: "L" },
  { id: "hybrid", label: "Hybrid", unit: "L" },
  { id: "cng", label: "CNG", unit: "kg" },
  { id: "avgas", label: "Avgas 100LL", unit: "L" },
  { id: "jeta", label: "Jet-A", unit: "L" },
  { id: "electric", label: "Electric", unit: "kWh" },
] as const;

const ROAD_SERVICE = [
  "Oil",
  "Filters",
  "Brakes",
  "Tyres",
  "Battery",
  "Coolant",
  "Inspection",
  "Insurance",
  "Other",
] as const;

const BIKE_SERVICE = [
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
  "Other",
] as const;

const BOAT_SERVICE = [
  "Oil",
  "Impeller",
  "Filters",
  "Lower unit",
  "Anodes",
  "Spark plugs",
  "Battery",
  "Hull",
  "Insurance",
  "Other",
] as const;

const YACHT_SERVICE = [
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
  "Other",
] as const;

const SAIL_SERVICE = [
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
  "Other",
] as const;

const PWC_SERVICE = [
  "Oil",
  "Impeller",
  "Spark plugs",
  "Anodes",
  "Battery",
  "Hull",
  "Insurance",
  "Other",
] as const;

const PLANE_SERVICE = [
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
  "Other",
] as const;

const HELI_SERVICE = [
  "Oil",
  "Filters",
  "Rotor",
  "Gearbox",
  "100-hour",
  "Annual",
  "Battery",
  "Inspection",
  "Insurance",
  "Other",
] as const;

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
export const KINDS = [
  {
    id: "car",
    label: "Car",
    group: "Road",
    meters: ["km"],
    defaultMeter: "km",
    fuel: "petrol",
    tankMax: 120,
    services: ROAD_SERVICE,
    log: "Road odometer. Economy is the distance between full tanks.",
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
    log: "Same odometer as a car. The tank cap is larger, because these fills are.",
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
    log: "Road odometer, small tank. The book adds the chain and valve clearance.",
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
    log: "Road odometer and a few litres. Same full-tank chain as a car.",
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
    log: "Road odometer. The tank cap is a light truck, not a car.",
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
    log: "Road odometer. Same chain as a car, with a larger tank.",
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
    log: "Road odometer. Often CNG, logged in kilograms rather than litres.",
  },
  {
    id: "motorboat",
    label: "Motorboat",
    group: "Water",
    meters: ["nm", "h"],
    defaultMeter: "nm",
    fuel: "petrol",
    tankMax: 2_000,
    services: BOAT_SERVICE,
    log: "No road odometer. Nautical miles give range; engine hours give litres per hour. Enter the running total.",
  },
  {
    id: "yacht",
    label: "Yacht",
    group: "Water",
    meters: ["nm", "h"],
    defaultMeter: "nm",
    fuel: "diesel",
    tankMax: 40_000,
    services: YACHT_SERVICE,
    log: "Usually diesel, and a fill can be large. Log total nautical miles or engine hours, not one passage.",
  },
  {
    id: "sailboat",
    label: "Sailboat",
    group: "Water",
    meters: ["h", "nm"],
    defaultMeter: "h",
    fuel: "diesel",
    tankMax: 2_000,
    services: SAIL_SERVICE,
    log: "Only the auxiliary burns fuel. Hours are the honest burn. Nautical miles count only for distance the engine made.",
  },
  {
    id: "pwc",
    label: "Personal watercraft",
    group: "Water",
    meters: ["h", "nm"],
    defaultMeter: "h",
    fuel: "petrol",
    tankMax: 80,
    services: PWC_SERVICE,
    log: "Small petrol tank. The hour meter is the usual log. Nautical miles if you keep a running GPS total.",
  },
  {
    id: "plane",
    label: "Plane",
    group: "Air",
    meters: ["nm", "h"],
    defaultMeter: "nm",
    fuel: "avgas",
    tankMax: 30_000,
    services: PLANE_SERVICE,
    log: "Avgas or Jet-A. Nautical miles between full tanks is specific range. Hobbs hours is fuel flow.",
  },
  {
    id: "helicopter",
    label: "Helicopter",
    group: "Air",
    meters: ["h", "nm"],
    defaultMeter: "h",
    fuel: "avgas",
    tankMax: 8_000,
    services: HELI_SERVICE,
    log: "Logged on the Hobbs meter as burn per hour. Nautical miles if you keep a cumulative air log.",
  },
] as const;

export const CATEGORIES = [
  ...new Set(KINDS.flatMap((kind) => [...kind.services])),
] as string[];

export const CURRENCIES = ["SGD", "USD", "EUR", "GBP", "INR", "AUD"] as const;

export const FREE_VEHICLES = 1;
export const PLUS_VEHICLES = 8;
export const PLUS_MONTH_CENTS = 690;
export const PLUS_YEAR_CENTS = 5900;

/** A single bunkering or jet fuel load can clear a car-sized money cap. */
export const MAX_FILL_MONEY = 2_000_000;
export const MAX_FILL_VOLUME = 50_000;
export const MAX_METER = 2_000_000;

export type FuelId = (typeof FUELS)[number]["id"];
export type VolumeUnit = (typeof FUELS)[number]["unit"];
export type Currency = (typeof CURRENCIES)[number];
export type DistanceUnit = "km" | "mi";
export type EconomyUnit = "kml" | "l100" | "mpg";
export type PlanId = "free" | "plus";
export type Billing = "none" | "month" | "year";
export type PayProvider = "none" | "preview" | "stripe";
export type KindId = (typeof KINDS)[number]["id"];
export type KindGroup = (typeof KINDS)[number]["group"];
export type Meter = "km" | "nm" | "h";

export function volumeUnitFor(fuel: string): VolumeUnit {
  return FUELS.find((item) => item.id === fuel)?.unit ?? "L";
}

export function kindById(id: string) {
  return KINDS.find((item) => item.id === id) ?? KINDS[0];
}

export function isKind(value: string): value is KindId {
  return KINDS.some((item) => item.id === value);
}

export function isMeter(value: string): value is Meter {
  return value === "km" || value === "nm" || value === "h";
}

export function meterFamily(meter: Meter): "distance" | "time" {
  return meter === "h" ? "time" : "distance";
}

export function categoriesFor(kind: string): readonly string[] {
  return kindById(kind).services;
}

export function placeLabel(group: KindGroup): string {
  if (group === "Water") return "Marina";
  if (group === "Air") return "Field";
  return "Station";
}
