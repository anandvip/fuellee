import type { Meter } from "./constants";
import { KM_PER_NM } from "./format";
import type { Fill, ServiceRecord } from "./types";

export type Segment = {
  fillId: number;
  endOn: string;
  distanceKm: number;
  volume: number;
  cost: number;
  /** Stored meter per volume unit: kilometres, or hours when the craft logs time. */
  perUnit: number | null;
};

/** Economy between full tanks. Partials between them count. A missed fill breaks the chain. */
export function segmentsFor(fills: Fill[]): Segment[] {
  const sorted = [...fills].sort(
    (a, b) => a.odometerKm - b.odometerKm || a.filledOn.localeCompare(b.filledOn) || a.id - b.id,
  );
  const out: Segment[] = [];
  let lastFull = -1;
  for (let i = 0; i < sorted.length; i += 1) {
    if (!sorted[i].fullTank) continue;
    if (lastFull < 0) {
      lastFull = i;
      continue;
    }
    const prev = sorted[lastFull];
    const slice = sorted.slice(lastFull + 1, i + 1);
    const gap = slice.some((fill) => fill.missedBefore);
    const distanceKm = sorted[i].odometerKm - prev.odometerKm;
    const volume = slice.reduce((sum, fill) => sum + fill.volume, 0);
    const cost = slice.reduce((sum, fill) => sum + fill.totalCost, 0);
    const ok = !gap && distanceKm > 0 && volume > 0;
    out.push({
      fillId: sorted[i].id,
      endOn: sorted[i].filledOn,
      distanceKm,
      volume,
      cost,
      perUnit: ok ? distanceKm / volume : null,
    });
    lastFull = i;
  }
  return out;
}

export function weightedPerUnit(segments: Segment[]): number | null {
  let distance = 0;
  let volume = 0;
  for (const segment of segments) {
    if (segment.perUnit == null) continue;
    distance += segment.distanceKm;
    volume += segment.volume;
  }
  if (distance <= 0 || volume <= 0) return null;
  return distance / volume;
}

export function latestOdometer(fills: Fill[]): number | null {
  let max: number | null = null;
  for (const fill of fills) {
    if (max == null || fill.odometerKm > max) max = fill.odometerKm;
  }
  return max;
}

export type DueState = "overdue" | "soon";

export function soonMargin(meter: Meter): number {
  if (meter === "h") return 10;
  if (meter === "nm") return 50 * KM_PER_NM;
  return 500;
}

export function serviceDue(
  service: ServiceRecord,
  latestKm: number | null,
  today: string,
  margin = 500,
): DueState | null {
  const soonDate = addDays(today, 21);
  const dateOver = Boolean(service.nextOn && service.nextOn <= today);
  const dateSoon = Boolean(service.nextOn && soonDate && service.nextOn <= soonDate);
  const odoOver =
    service.nextOdometerKm != null && latestKm != null && latestKm >= service.nextOdometerKm;
  const odoSoon =
    service.nextOdometerKm != null &&
    latestKm != null &&
    latestKm + margin >= service.nextOdometerKm &&
    latestKm < service.nextOdometerKm;
  if (dateOver || odoOver) return "overdue";
  if (dateSoon || odoSoon) return "soon";
  return null;
}

function addDays(iso: string, days: number): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  date.setUTCDate(date.getUTCDate() + days);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

export function monthKeys(count: number, today: string): { key: string; label: string }[] {
  const match = /^(\d{4})-(\d{2})/.exec(today);
  const year = match ? Number(match[1]) : 2026;
  const month = match ? Number(match[2]) : 1;
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const rows: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(Date.UTC(year, month - 1 - i, 1));
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    rows.push({ key, label: labels[date.getUTCMonth()] });
  }
  return rows;
}

export function spendByMonth(fills: Fill[], count: number, today: string) {
  const rows = monthKeys(count, today).map((row) => ({ ...row, amount: 0 }));
  for (const fill of fills) {
    const row = rows.find((item) => item.key === fill.filledOn.slice(0, 7));
    if (row) row.amount += fill.totalCost;
  }
  return rows;
}
