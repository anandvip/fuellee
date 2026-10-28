import type { DistanceUnit, EconomyUnit, Meter, VolumeUnit } from "./constants";

export const KM_PER_MI = 1.609344;
/** International nautical mile. */
export const KM_PER_NM = 1.852;
const LITRE_PER_US_GAL = 3.785411784;
/** US miles per gallon for one kilometre per litre. */
export const MPG_PER_KML = LITRE_PER_US_GAL / KM_PER_MI;

export function todayISO(): string {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function toKm(value: number, unit: DistanceUnit): number {
  return unit === "mi" ? value * KM_PER_MI : value;
}

export function fromKm(km: number, unit: DistanceUnit): number {
  return unit === "mi" ? km / KM_PER_MI : km;
}

export function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatOdo(km: number, unit: DistanceUnit): string {
  return formatMeter(km, "km", unit);
}

/** Store a reading. Nautical miles become kilometres. Hours stay hours. */
export function toStored(value: number, meter: Meter, distanceUnit: DistanceUnit): number {
  if (meter === "h") return value;
  if (meter === "nm") return value * KM_PER_NM;
  return toKm(value, distanceUnit);
}

export function fromStored(stored: number, meter: Meter, distanceUnit: DistanceUnit): number {
  if (meter === "h") return stored;
  if (meter === "nm") return stored / KM_PER_NM;
  return fromKm(stored, distanceUnit);
}

export function meterUnit(meter: Meter, distanceUnit: DistanceUnit): string {
  if (meter === "h") return "h";
  if (meter === "nm") return "nm";
  return distanceUnit;
}

export function formatMeter(stored: number, meter: Meter, distanceUnit: DistanceUnit): string {
  const digits = meter === "km" && distanceUnit === "km" ? 0 : 1;
  return `${formatNumber(fromStored(stored, meter, distanceUnit), digits)} ${meterUnit(meter, distanceUnit)}`;
}

export function meterFieldLabel(meter: Meter, distanceUnit: DistanceUnit): string {
  if (meter === "h") return "Hour meter";
  if (meter === "nm") return "Total nautical miles";
  return `Odometer (${distanceUnit})`;
}

export function nextMeterLabel(meter: Meter, distanceUnit: DistanceUnit): string {
  if (meter === "h") return "Next hours";
  if (meter === "nm") return "Next meter (nm)";
  return `Next odometer (${distanceUnit})`;
}

export function economyNote(meter: Meter): string {
  if (meter === "h") {
    return "Burn rate is the hours between one full tank and the next, under every unit filled in between. A missed fill breaks that chain. The first full tank only sets the hour meter.";
  }
  if (meter === "nm") {
    return "Range is the nautical miles from one full tank to the next, divided by every unit filled in between. Enter the running total, not one leg. A missed fill breaks the chain. One nautical mile is 1.852 km.";
  }
  return "Economy is the distance from one full tank to the next, divided by every unit filled in between. A missed fill breaks that chain. The first full tank only sets the odometer.";
}

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPlainDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Display figure. `perUnit` is stored-meter per volume (km or hours). */
export function economyFigure(
  perUnit: number | null,
  economy: EconomyUnit,
  volumeUnit: VolumeUnit,
  meter: Meter = "km",
): { value: string; unit: string } | null {
  if (perUnit == null || !Number.isFinite(perUnit) || perUnit <= 0) return null;
  if (meter === "h") {
    return { value: formatNumber(1 / perUnit, 1), unit: `${volumeUnit}/h` };
  }
  if (meter === "nm") {
    const nmPer = perUnit / KM_PER_NM;
    if (volumeUnit !== "L") return { value: formatNumber(nmPer, 2), unit: `nm/${volumeUnit}` };
    if (economy === "l100") return { value: formatNumber(1 / nmPer, 2), unit: "L/nm" };
    if (economy === "mpg") return { value: formatNumber(nmPer * LITRE_PER_US_GAL, 1), unit: "nmpg" };
    return { value: formatNumber(nmPer, 2), unit: "nm/L" };
  }
  if (volumeUnit !== "L") {
    return { value: formatNumber(perUnit, 1), unit: `km/${volumeUnit}` };
  }
  if (economy === "l100") return { value: formatNumber(100 / perUnit, 1), unit: "L/100km" };
  if (economy === "mpg") return { value: formatNumber(perUnit * MPG_PER_KML, 1), unit: "mpg" };
  return { value: formatNumber(perUnit, 1), unit: "km/L" };
}

export function formatEconomy(
  perUnit: number | null,
  economy: EconomyUnit,
  volumeUnit: VolumeUnit,
  meter: Meter = "km",
): string {
  const figure = economyFigure(perUnit, economy, volumeUnit, meter);
  return figure ? `${figure.value} ${figure.unit}` : "—";
}
