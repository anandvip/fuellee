import { createServerFn } from "@tanstack/react-start";
import { getSql, type Sql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  CATEGORIES,
  CURRENCIES,
  FREE_VEHICLES,
  FUELS,
  MAX_FILL_MONEY,
  MAX_FILL_VOLUME,
  MAX_METER,
  PLUS_MONTH_CENTS,
  PLUS_VEHICLES,
  PLUS_YEAR_CENTS,
  isKind,
  isMeter,
  kindById,
  meterFamily,
  volumeUnitFor,
  type Billing,
  type Currency,
  type DistanceUnit,
  type EconomyUnit,
  type FuelId,
  type KindId,
  type Meter,
  type PayProvider,
  type PlanId,
} from "./constants";
import { segmentsFor } from "./economy";
import { formatEconomy } from "./format";
import type { Fill, Garage, PlanState, ServiceRecord, Settings, Vehicle } from "./types";

type VehicleRow = {
  id: number;
  name: string;
  kind: string;
  meter: string;
  fuel: string;
  volume_unit: string;
  tank: number | null;
  archived: boolean;
};

type FillRow = {
  id: number;
  vehicle_id: number;
  filled_on: string;
  odometer_km: number;
  volume: number;
  total_cost: number;
  station: string;
  full_tank: boolean;
  missed_before: boolean;
  note: string;
};

type ServiceRow = {
  id: number;
  vehicle_id: number;
  category: string;
  serviced_on: string;
  odometer_km: number | null;
  cost: number;
  next_on: string | null;
  next_odometer_km: number | null;
  note: string;
};

function asDate(value: string | Date | null): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function isFuel(value: string): value is FuelId {
  return FUELS.some((item) => item.id === value);
}

function isCurrency(value: string): value is Currency {
  return (CURRENCIES as readonly string[]).includes(value);
}

function stripeReady(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function mapVehicle(row: VehicleRow): Vehicle {
  const fuel = isFuel(row.fuel) ? row.fuel : "petrol";
  const unit = row.volume_unit === "kg" || row.volume_unit === "kWh" ? row.volume_unit : "L";
  const kind: KindId = isKind(row.kind) ? row.kind : "car";
  const meter: Meter = isMeter(row.meter) ? row.meter : "km";
  return {
    id: row.id,
    name: row.name,
    kind,
    meter,
    fuel,
    volumeUnit: unit,
    tank: row.tank,
    archived: row.archived,
  };
}

function mapFill(row: FillRow): Fill {
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
    note: row.note,
  };
}

function mapService(row: ServiceRow): ServiceRecord {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    category: row.category,
    servicedOn: asDate(row.serviced_on) ?? "",
    odometerKm: row.odometer_km,
    cost: row.cost,
    nextOn: asDate(row.next_on),
    nextOdometerKm: row.next_odometer_km,
    note: row.note,
  };
}

async function readGarage(sql: Sql, userId: string): Promise<Garage> {
  await sql`
    insert into fuellee_settings (user_id)
    values (${userId})
    on conflict (user_id) do nothing
  `;
  const settingsRows = await sql<{
    distance_unit: string;
    economy_unit: string;
    currency: string;
    phone: string | null;
  }>`
    select distance_unit, economy_unit, currency, phone
    from fuellee_settings
    where user_id = ${userId}
  `;
  const setting = settingsRows[0];
  const settings: Settings = {
    distanceUnit: setting?.distance_unit === "mi" ? "mi" : "km",
    economyUnit:
      setting?.economy_unit === "l100" || setting?.economy_unit === "mpg"
        ? setting.economy_unit
        : "kml",
    currency: setting && isCurrency(setting.currency) ? setting.currency : "SGD",
    phone: setting?.phone?.trim() ?? "",
  };
  const planRows = await sql<{
    plan: string;
    billing: string;
    provider: string;
  }>`
    select plan, billing, provider from fuellee_plans where user_id = ${userId}
  `;
  const planRow = planRows[0];
  const plan: PlanState = {
    plan: planRow?.plan === "plus" ? "plus" : "free",
    billing: planRow?.billing === "month" || planRow?.billing === "year" ? planRow.billing : "none",
    provider:
      planRow?.provider === "preview" || planRow?.provider === "stripe" ? planRow.provider : "none",
    stripeReady: stripeReady(),
  };
  const vehicles = (
    await sql<VehicleRow>`
      select id, name, kind, meter, fuel, volume_unit, tank, archived
      from fuellee_vehicles
      where user_id = ${userId}
      order by archived asc, created_at asc, id asc
    `
  ).map(mapVehicle);
  const fills = (
    await sql<FillRow>`
      select id, vehicle_id, filled_on, odometer_km, volume, total_cost, station, full_tank, missed_before, note
      from fuellee_fills
      where user_id = ${userId}
      order by filled_on desc, odometer_km desc, id desc
    `
  ).map(mapFill);
  const services = (
    await sql<ServiceRow>`
      select id, vehicle_id, category, serviced_on, odometer_km, cost, next_on, next_odometer_km, note
      from fuellee_services
      where user_id = ${userId}
      order by serviced_on desc, id desc
    `
  ).map(mapService);
  return { settings, plan, vehicles, fills, services };
}

function vehicleLimit(plan: PlanId): number {
  return plan === "plus" ? PLUS_VEHICLES : FREE_VEHICLES;
}

function assertDate(value: string, label: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${label} needs a real date.`);
  const time = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(time)) throw new Error(`${label} needs a real date.`);
  return value;
}

function assertMoney(value: number, label: string, max = 100_000): number {
  if (!Number.isFinite(value) || value < 0 || value > max) throw new Error(`${label} looks wrong.`);
  return Math.round(value * 100) / 100;
}

function assertPositive(value: number, label: string, max: number): number {
  if (!Number.isFinite(value) || value <= 0 || value > max) throw new Error(`${label} looks wrong.`);
  return value;
}

function parseCraft(kindRaw: string, meterRaw: string | undefined): { kind: KindId; meter: Meter } {
  if (!isKind(kindRaw)) throw new Error("Pick a type of craft.");
  const kind = kindById(kindRaw);
  const meter = meterRaw && isMeter(meterRaw) ? meterRaw : kind.defaultMeter;
  if (!(kind.meters as readonly string[]).includes(meter)) {
    throw new Error("That meter does not belong on this craft.");
  }
  return { kind: kindRaw, meter };
}

function parsePhone(value: string): string {
  const compact = value.trim().replace(/[^\d+]/g, "").slice(0, 16);
  if (!compact) return "";
  const digits = compact.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15 || !/^\+?\d+$/.test(compact)) {
    throw new Error("Enter a phone number with the country code.");
  }
  return compact;
}

function parseTank(tank: number | null | undefined, kind: KindId): number | null {
  if (tank == null || Number(tank) === 0) return null;
  return assertPositive(Number(tank), "Tank size", kindById(kind).tankMax);
}

async function ownVehicle(sql: Sql, userId: string, vehicleId: number): Promise<void> {
  const rows = await sql<{ id: number }>`
    select id from fuellee_vehicles where id = ${vehicleId} and user_id = ${userId}
  `;
  if (!rows[0]) throw new Error("That vehicle is not in your garage.");
}

async function userEmail(sql: Sql, userId: string): Promise<string | null> {
  const rows = await sql<{ email: string }>`select email from "user" where id = ${userId}`;
  return rows[0]?.email ?? null;
}

type StripeObject = {
  url?: string;
  id?: string;
  status?: string;
  client_reference_id?: string | null;
  subscription?: string | { id?: string } | null;
  customer?: string | { id?: string } | null;
  metadata?: { billing?: string };
  error?: { message?: string };
};

async function stripe(
  key: string,
  path: string,
  method: "GET" | "POST" | "DELETE",
  body?: URLSearchParams,
): Promise<StripeObject> {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body,
  });
  const json = (await response.json()) as StripeObject;
  if (!response.ok) throw new Error(json.error?.message ?? "Payment could not be completed.");
  return json;
}

function idOf(value: string | { id?: string } | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

async function writePlan(
  sql: Sql,
  userId: string,
  plan: PlanId,
  billing: Billing,
  provider: PayProvider,
  stripeCustomer: string | null,
  stripeSubscription: string | null,
) {
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

export const loadGarage = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return readGarage(sql, context.userId);
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { distanceUnit: DistanceUnit; economyUnit: EconomyUnit; currency: Currency }) => {
    const distanceUnit: DistanceUnit = input.distanceUnit === "mi" ? "mi" : "km";
    const economyUnit: EconomyUnit =
      input.economyUnit === "l100" || input.economyUnit === "mpg" ? input.economyUnit : "kml";
    if (!isCurrency(input.currency)) throw new Error("Pick a currency.");
    return { distanceUnit, economyUnit, currency: input.currency };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into fuellee_settings (user_id, distance_unit, economy_unit, currency, updated_at)
      values (${context.userId}, ${data.distanceUnit}, ${data.economyUnit}, ${data.currency}, now())
      on conflict (user_id) do update set
        distance_unit = excluded.distance_unit,
        economy_unit = excluded.economy_unit,
        currency = excluded.currency,
        updated_at = now()
    `;
    return { ok: true as const };
  });

export const addVehicle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name: string; fuel: string; tank: number | null; kind?: string; meter?: string }) => {
    const name = input.name.trim().slice(0, 60);
    if (!name) throw new Error("Name the vehicle.");
    if (!isFuel(input.fuel)) throw new Error("Pick a fuel.");
    const craft = parseCraft(input.kind ?? "car", input.meter);
    return { name, fuel: input.fuel, tank: parseTank(input.tank, craft.kind), ...craft };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const garage = await readGarage(sql, context.userId);
    const active = garage.vehicles.filter((vehicle) => !vehicle.archived).length;
    if (active >= vehicleLimit(garage.plan.plan)) {
      throw new Error(
        garage.plan.plan === "plus"
          ? `Plus holds ${PLUS_VEHICLES} vehicles.`
          : "Garage includes one vehicle. Plus opens the rest.",
      );
    }
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
    return { ok: true as const };
  });

export const updateVehicle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      id: number;
      name: string;
      fuel: string;
      tank: number | null;
      archived: boolean;
      kind?: string;
      meter?: string;
    }) => {
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
        ...craft,
      };
    },
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const garage = await readGarage(sql, context.userId);
    const current = garage.vehicles.find((vehicle) => vehicle.id === data.id);
    if (!current) throw new Error("That vehicle is not in your garage.");
    if (!data.archived) {
      const active = garage.vehicles.filter((vehicle) => !vehicle.archived && vehicle.id !== data.id);
      if (active.length >= vehicleLimit(garage.plan.plan)) {
        throw new Error("That would pass the vehicle limit on this plan.");
      }
    }
    const hasFills = garage.fills.some((fill) => fill.vehicleId === data.id);
    if (hasFills && meterFamily(current.meter) !== meterFamily(data.meter)) {
      throw new Error("This craft already has fills. Distance and engine hours cannot be swapped.");
    }
    const rows = await sql<{ id: number }>`
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
    `;
    if (!rows[0]) throw new Error("That vehicle is not in your garage.");
    return { ok: true as const };
  });

export const deleteVehicle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number }) => {
    if (!Number.isInteger(input.id)) throw new Error("Missing vehicle.");
    return input;
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from fuellee_fills where vehicle_id = ${data.id} and user_id = ${context.userId}`;
    await sql`delete from fuellee_services where vehicle_id = ${data.id} and user_id = ${context.userId}`;
    const rows = await sql<{ id: number }>`
      delete from fuellee_vehicles where id = ${data.id} and user_id = ${context.userId} returning id
    `;
    if (!rows[0]) throw new Error("That vehicle is not in your garage.");
    return { ok: true as const };
  });

export const addFill = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      vehicleId: number;
      filledOn: string;
      odometerKm: number;
      volume: number;
      totalCost: number;
      station: string;
      fullTank: boolean;
      missedBefore: boolean;
      note: string;
    }) => ({
      vehicleId: input.vehicleId,
      filledOn: assertDate(input.filledOn, "Fill date"),
      odometerKm: assertPositive(Number(input.odometerKm), "Meter", MAX_METER),
      volume: assertPositive(Number(input.volume), "Amount", MAX_FILL_VOLUME),
      totalCost: assertMoney(Number(input.totalCost), "Amount paid", MAX_FILL_MONEY),
      station: (input.station ?? "").trim().slice(0, 80),
      fullTank: Boolean(input.fullTank),
      missedBefore: Boolean(input.missedBefore),
      note: (input.note ?? "").trim().slice(0, 240),
    }),
  )
  .handler(async ({ context, data }) => {
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
    return { ok: true as const };
  });

export const deleteFill = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number }) => {
    if (!Number.isInteger(input.id)) throw new Error("Missing fill.");
    return input;
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      delete from fuellee_fills where id = ${data.id} and user_id = ${context.userId} returning id
    `;
    if (!rows[0]) throw new Error("That fill is not yours.");
    return { ok: true as const };
  });

export const addService = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      vehicleId: number;
      category: string;
      servicedOn: string;
      odometerKm: number | null;
      cost: number;
      nextOn: string;
      nextOdometerKm: number | null;
      note: string;
    }) => {
      const category = CATEGORIES.find((item) => item === input.category) ?? "Other";
      const odometer =
        input.odometerKm == null || Number(input.odometerKm) === 0
          ? null
          : assertPositive(Number(input.odometerKm), "Meter", MAX_METER);
      const nextOdo =
        input.nextOdometerKm == null || Number(input.nextOdometerKm) === 0
          ? null
          : assertPositive(Number(input.nextOdometerKm), "Next meter", MAX_METER);
      const nextOn = input.nextOn?.trim() ? assertDate(input.nextOn, "Next date") : null;
      return {
        vehicleId: input.vehicleId,
        category,
        servicedOn: assertDate(input.servicedOn, "Service date"),
        odometerKm: odometer,
        cost: assertMoney(Number(input.cost) || 0, "Cost", MAX_FILL_MONEY),
        nextOn,
        nextOdometerKm: nextOdo,
        note: (input.note ?? "").trim().slice(0, 240),
      };
    },
  )
  .handler(async ({ context, data }) => {
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
    return { ok: true as const };
  });

export const deleteService = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number }) => {
    if (!Number.isInteger(input.id)) throw new Error("Missing service.");
    return input;
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      delete from fuellee_services where id = ${data.id} and user_id = ${context.userId} returning id
    `;
    if (!rows[0]) throw new Error("That service is not yours.");
    return { ok: true as const };
  });

export const exportLog = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const garage = await readGarage(sql, context.userId);
    if (garage.plan.plan !== "plus") throw new Error("CSV export is part of Plus.");
    const header = [
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
      "meter",
    ];
    const lines = [header.join(",")];
    for (const vehicle of garage.vehicles) {
      const fills = garage.fills.filter((fill) => fill.vehicleId === vehicle.id);
      const segments = segmentsFor(fills);
      for (const fill of fills) {
        const segment = segments.find((item) => item.fillId === fill.id);
        const economy = segment
          ? formatEconomy(segment.perUnit, garage.settings.economyUnit, vehicle.volumeUnit, vehicle.meter)
          : "";
        lines.push(
          [
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
            vehicle.meter,
          ]
            .map(csvCell)
            .join(","),
        );
      }
    }
    return lines.join("\n");
  });

function csvCell(value: string | number | boolean): string {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export const startCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { interval: "month" | "year"; origin: string }) => {
    const interval = input.interval === "year" ? "year" : "month";
    let origin = "";
    try {
      const url = new URL(input.origin);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("bad");
      origin = url.origin;
    } catch {
      throw new Error("Could not start checkout from this page.");
    }
    return { interval, origin } as const;
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      await writePlan(sql, context.userId, "plus", data.interval, "preview", null, null);
      return { mode: "preview" as const };
    }
    const email = await userEmail(sql, context.userId);
    const amount = data.interval === "year" ? PLUS_YEAR_CENTS : PLUS_MONTH_CENTS;
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
    return { mode: "stripe" as const, url: session.url };
  });

export const confirmCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { sessionId: string }) => {
    const sessionId = input.sessionId?.trim() ?? "";
    if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) throw new Error("That payment reference is not valid.");
    return { sessionId };
  })
  .handler(async ({ context, data }) => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Card checkout is not connected.");
    const session = await stripe(key, `checkout/sessions/${data.sessionId}`, "GET");
    if (session.client_reference_id !== context.userId) {
      throw new Error("That payment belongs to another account.");
    }
    if (session.status !== "complete") throw new Error("Payment is not complete yet.");
    const billing: Billing = session.metadata?.billing === "year" ? "year" : "month";
    const sql = await getSql();
    await writePlan(
      sql,
      context.userId,
      "plus",
      billing,
      "stripe",
      idOf(session.customer),
      idOf(session.subscription),
    );
    return { ok: true as const };
  });

export const cancelPlus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ stripe_subscription: string | null }>`
      select stripe_subscription from fuellee_plans where user_id = ${context.userId}
    `;
    const subscription = rows[0]?.stripe_subscription;
    const key = process.env.STRIPE_SECRET_KEY;
    if (subscription && key) {
      await stripe(key, `subscriptions/${subscription}`, "DELETE");
    }
    await writePlan(sql, context.userId, "free", "none", "none", null, null);
    return { ok: true as const };
  });

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name: string; phone: string }) => {
    const name = input.name.trim().slice(0, 80);
    if (!name) throw new Error("Enter the name on the account.");
    return { name, phone: parsePhone(input.phone ?? "") };
  })
  .handler(async ({ context, data }) => {
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
    return { ok: true as const };
  });

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { phrase: string; mode: string }) => {
    if (input.phrase !== "DELETE") throw new Error("Type DELETE to confirm.");
    if (input.mode !== "donate" && input.mode !== "erase") {
      throw new Error("Choose whether to donate an anonymized copy or erase everything.");
    }
    return { mode: input.mode as "donate" | "erase" };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const userId = context.userId;
    const email = await userEmail(sql, userId);
    const plan = await sql<{ stripe_subscription: string | null }>`
      select stripe_subscription from fuellee_plans where user_id = ${userId}
    `;
    const key = process.env.STRIPE_SECRET_KEY;
    const subscription = plan[0]?.stripe_subscription;
    if (subscription && key) {
      try {
        await stripe(key, `subscriptions/${subscription}`, "DELETE");
      } catch {
        /* account deletion still proceeds */
      }
    }

    const owned = await sql<{ batch_id: string }>`
      select batch_id from fuellee_training_owner where user_id = ${userId}
    `;
    for (const row of owned) {
      await sql`delete from fuellee_training_logs where batch_id = ${row.batch_id}`;
    }
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
    return { ok: true as const };
  });
