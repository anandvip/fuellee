import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { rememberGarage } from "@/lib/fuellee/device-copy";
import { Link } from "@tanstack/react-router";
import {
  FUELS,
  KINDS,
  categoriesFor,
  kindById,
  meterFamily,
  placeLabel,
  type FuelId,
  type KindId,
  type Meter,
} from "@/lib/fuellee/constants";
import { latestOdometer, segmentsFor, serviceDue, soonMargin, spendByMonth, weightedPerUnit } from "@/lib/fuellee/economy";
import {
  economyNote,
  formatEconomy,
  formatMeter,
  formatMoney,
  fromStored,
  meterFieldLabel,
  meterUnit,
  nextMeterLabel,
  todayISO,
  toStored,
} from "@/lib/fuellee/format";
import {
  addFill,
  addService,
  addVehicle,
  cancelPlus,
  confirmCheckout,
  deleteFill,
  deleteService,
  deleteVehicle,
  exportLog,
  loadGarage,
  updateVehicle,
} from "@/lib/fuellee/server";
import type { Fill, Garage, ServiceRecord, Vehicle } from "@/lib/fuellee/types";
import { Notice } from "./shell";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Tab = "board" | "fill" | "service" | "craft";

function messageOf(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Try again.";
}

export function GarageApp({ sessionId }: { sessionId?: string }) {
  const { user } = useCurrentUserState();
  const [data, setData] = useState<Garage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("board");
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

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

  useEffect(() => {
    let cancel = false;
    refresh().catch((reason) => {
      if (!cancel) setError(messageOf(reason));
    });
    return () => {
      cancel = true;
    };
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    let cancel = false;
    confirmCheckout({ data: { sessionId } })
      .then(() => refresh())
      .then(() => {
        if (!cancel) setNotice("Plus is active on this account.");
      })
      .catch((reason) => {
        if (!cancel) setError(messageOf(reason));
      });
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function run(task: () => Promise<unknown>, done?: string) {
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

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-full bg-fg/10" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="card h-28 animate-pulse" />
          <div className="card h-28 animate-pulse" />
          <div className="card h-28 animate-pulse" />
        </div>
      </div>
    );
  }

  const vehicle = data.vehicles.find((item) => item.id === vehicleId) ?? null;
  const fills = data.fills.filter((fill) => fill.vehicleId === vehicle?.id);
  const services = data.services.filter((service) => service.vehicleId === vehicle?.id);
  const months = data.plan.plan === "plus" ? 12 : 3;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your garage</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {vehicle ? vehicle.name : "No craft yet"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {vehicle ? `${kindById(vehicle.kind).label} · ` : ""}
            {data.plan.plan === "plus" ? "Plus" : "Garage"} plan
            {data.plan.provider === "preview" ? " · preview billing" : ""}
            {data.plan.provider === "stripe" ? " · card billing" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.vehicles.filter((item) => !item.archived).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setVehicleId(item.id)}
              className={item.id === vehicle?.id ? "btn btn-ink" : "btn btn-ghost"}
            >
              {item.name}
            </button>
          ))}
          <Link to="/reports" className="btn btn-ghost">
            Tax record
          </Link>
          <Link to="/account" className="btn btn-ghost">
            Account
          </Link>
        </div>
      </div>

      {error ? <Notice tone="amber">{error}</Notice> : null}
      {notice ? <Notice>{notice}</Notice> : null}

      <div className="flex gap-2 overflow-x-auto" role="tablist">
        {(
          [
            ["board", "Board"],
            ["fill", "Fill"],
            ["service", "Service"],
            ["craft", "Craft"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={tab === id ? "btn btn-ink" : "btn btn-ghost"}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "board" ? (
        <Board
          garage={data}
          vehicle={vehicle}
          fills={fills}
          services={services}
          months={months}
          busy={busy}
          onExport={() =>
            run(async () => {
              const csv = await exportLog();
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "fuellee-log.csv";
              link.click();
              URL.revokeObjectURL(url);
            })
          }
        />
      ) : null}
      {tab === "fill" ? (
        <FillPanel
          garage={data}
          vehicle={vehicle}
          fills={fills}
          busy={busy}
          onAdd={(input) => run(() => addFill({ data: input }), "Fill saved.")}
          onDelete={(id) => run(() => deleteFill({ data: { id } }))}
        />
      ) : null}
      {tab === "service" ? (
        <ServicePanel
          garage={data}
          vehicle={vehicle}
          services={services}
          fills={fills}
          busy={busy}
          onAdd={(input) => run(() => addService({ data: input }), "Service saved.")}
          onDelete={(id) => run(() => deleteService({ data: { id } }))}
        />
      ) : null}
      {tab === "craft" ? (
        <CarPanel
          garage={data}
          busy={busy}
          onAdd={(input) => run(() => addVehicle({ data: input }), "Craft added.")}
          onUpdate={(input) => run(() => updateVehicle({ data: input }), "Vehicle updated.")}
          onDelete={(id) => run(() => deleteVehicle({ data: { id } }), "Vehicle removed.")}
          onCancelPlus={() => run(() => cancelPlus(), "Back on the Garage plan.")}
        />
      ) : null}
    </div>
  );
}

function Board({
  garage,
  vehicle,
  fills,
  services,
  months,
  busy,
  onExport,
}: {
  garage: Garage;
  vehicle: Vehicle | null;
  fills: Fill[];
  services: ServiceRecord[];
  months: number;
  busy: boolean;
  onExport: () => void;
}) {
  const today = todayISO();
  const segments = useMemo(() => segmentsFor(fills), [fills]);
  const average = weightedPerUnit(segments);
  const latest = [...segments].reverse().find((segment) => segment.perUnit != null) ?? null;
  const measured = segments.filter((segment) => segment.perUnit != null);
  const distance = measured.reduce((sum, segment) => sum + segment.distanceKm, 0);
  const measuredCost = measured.reduce((sum, segment) => sum + segment.cost, 0);
  const spend = fills.reduce((sum, fill) => sum + fill.totalCost, 0);
  const perDistance =
    distance > 0 && vehicle
      ? measuredCost / fromStored(distance, vehicle.meter, garage.settings.distanceUnit)
      : null;
  const chart = spendByMonth(fills, months, today).map((row) => ({
    label: row.label,
    amount: Math.round(row.amount * 100) / 100,
  }));
  const odo = latestOdometer(fills);
  const due = services
    .map((service) => ({
      service,
      state: serviceDue(service, odo, today, vehicle ? soonMargin(vehicle.meter) : 500),
    }))
    .filter((item) => item.state);

  if (!vehicle) {
    return (
      <section className="card p-6">
        <h2 className="text-xl font-semibold">Start with a craft</h2>
        <p className="mt-2 max-w-lg text-muted">
          Open the Craft tab and name one. The first full tank only sets the meter. Economy appears at the next full tank.
        </p>
      </section>
    );
  }

  const hours = vehicle.meter === "h";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label={hours ? "Last burn" : "Last full tank"}
          value={formatEconomy(latest?.perUnit ?? null, garage.settings.economyUnit, vehicle.volumeUnit, vehicle.meter)}
        />
        <Stat
          label={hours ? "Average burn" : "Average"}
          value={formatEconomy(average, garage.settings.economyUnit, vehicle.volumeUnit, vehicle.meter)}
        />
        <Stat
          label={`Cost per ${meterUnit(vehicle.meter, garage.settings.distanceUnit)}`}
          value={perDistance == null ? "—" : formatMoney(perDistance, garage.settings.currency)}
        />
      </div>
      <section className="card p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-semibold">Fuel spend</h2>
          <p className="text-sm text-muted">
            {months === 12 ? "Twelve months" : "Three months on Garage"} ·{" "}
            {formatMoney(spend, garage.settings.currency)} logged
          </p>
        </div>
        <div className="mt-4 h-48 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ top: 8, right: 12, left: 12, bottom: 0 }}>
              <XAxis
                dataKey="label"
                interval={months > 6 ? 1 : 0}
                tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                formatter={(value) => formatMoney(Number(value), garage.settings.currency)}
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-line)",
                  borderRadius: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--color-amber)"
                fill="var(--color-amber)"
                fillOpacity={0.18}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {garage.plan.plan === "free" ? (
          <p className="mt-2 text-sm text-muted">
            <Link to="/plus" className="font-semibold text-fg underline-offset-2 hover:underline">
              Plus
            </Link>{" "}
            keeps a year of this chart and exports the log.
          </p>
        ) : (
          <button type="button" className="btn btn-ghost mt-3" disabled={busy} onClick={onExport}>
            Export CSV
          </button>
        )}
      </section>
      {due.length > 0 ? (
        <section className="card p-5">
          <h2 className="font-semibold">Due</h2>
          <ul className="mt-3 space-y-2">
            {due.map(({ service, state }) => (
              <li key={service.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {service.category}
                  {service.nextOn ? ` · ${service.nextOn}` : ""}
                </span>
                <span className={state === "overdue" ? "font-semibold text-amber" : "font-semibold text-pine"}>
                  {state === "overdue" ? "Overdue" : "Soon"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="text-sm text-muted">{economyNote(vehicle.meter)}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <section className="card p-5">
      <p className="eyebrow">{label}</p>
      <p className="num mt-2 text-2xl font-medium tracking-tight">{value}</p>
    </section>
  );
}

function FillPanel({
  garage,
  vehicle,
  fills,
  busy,
  onAdd,
  onDelete,
}: {
  garage: Garage;
  vehicle: Vehicle | null;
  fills: Fill[];
  busy: boolean;
  onAdd: (input: {
    vehicleId: number;
    filledOn: string;
    odometerKm: number;
    volume: number;
    totalCost: number;
    station: string;
    fullTank: boolean;
    missedBefore: boolean;
    note: string;
  }) => void;
  onDelete: (id: number) => void;
}) {
  const [filledOn, setFilledOn] = useState(todayISO);
  const [odometer, setOdometer] = useState("");
  const [volume, setVolume] = useState("");
  const [total, setTotal] = useState("");
  const [station, setStation] = useState("");
  const [fullTank, setFullTank] = useState(true);
  const [missed, setMissed] = useState(false);
  const [note, setNote] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const segments = segmentsFor(fills);

  if (!vehicle) return <NeedCar />;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <form
        className="card grid gap-3 p-5 sm:grid-cols-2"
        onSubmit={(event) => {
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
            note,
          });
          setVolume("");
          setTotal("");
          setNote("");
        }}
      >
        <h2 className="sm:col-span-2 text-lg font-semibold">New fill</h2>
        <Field label="Date">
          <input className="field" type="date" required value={filledOn} onChange={(event) => setFilledOn(event.target.value)} />
        </Field>
        <Field label={meterFieldLabel(vehicle.meter, garage.settings.distanceUnit)}>
          <input className="field num" inputMode="decimal" required value={odometer} onChange={(event) => setOdometer(event.target.value)} />
        </Field>
        <Field label={`Amount (${vehicle.volumeUnit})`}>
          <input className="field num" inputMode="decimal" required value={volume} onChange={(event) => setVolume(event.target.value)} />
        </Field>
        <Field label={`Paid (${garage.settings.currency})`}>
          <input className="field num" inputMode="decimal" required value={total} onChange={(event) => setTotal(event.target.value)} />
        </Field>
        <Field label={placeLabel(kindById(vehicle.kind).group)}>
          <input className="field" value={station} onChange={(event) => setStation(event.target.value)} />
        </Field>
        <Field label="Note">
          <input className="field" value={note} onChange={(event) => setNote(event.target.value)} />
        </Field>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={fullTank} onChange={(event) => setFullTank(event.target.checked)} />
          Full tank
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={missed} onChange={(event) => setMissed(event.target.checked)} />
          Missed a fill before this
        </label>
        <p className="text-sm text-muted sm:col-span-2">
          {vehicle.meter === "km"
            ? "The reading is the odometer, not the length of this trip."
            : "Running total, the same idea as an odometer — not this trip alone."}
        </p>
        <button className="btn btn-amber sm:col-span-2" type="submit" disabled={busy}>
          Save fill
        </button>
      </form>
      <ul className="card divide-y divide-line">
        {fills.length === 0 ? (
          <li className="p-5 text-sm text-muted">No fills for this craft yet.</li>
        ) : (
          fills.map((fill) => {
            const segment = segments.find((item) => item.fillId === fill.id);
            return (
              <li key={fill.id} className="flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    {fill.filledOn} · {formatMeter(fill.odometerKm, vehicle.meter, garage.settings.distanceUnit)}
                  </p>
                  <p className="text-sm text-muted">
                    {fill.volume} {vehicle.volumeUnit} · {formatMoney(fill.totalCost, garage.settings.currency)}
                    {fill.station ? ` · ${fill.station}` : ""}
                    {fill.fullTank ? "" : " · partial"}
                    {fill.missedBefore ? " · gap" : ""}
                  </p>
                  <p className="num mt-1 text-sm">
                    {segment
                      ? formatEconomy(segment.perUnit, garage.settings.economyUnit, vehicle.volumeUnit, vehicle.meter)
                      : fill.fullTank
                        ? "Baseline"
                        : "Partial"}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={busy}
                  onClick={() => {
                    if (confirmId === fill.id) onDelete(fill.id);
                    else setConfirmId(fill.id);
                  }}
                >
                  {confirmId === fill.id ? "Confirm" : "Remove"}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

function ServicePanel({
  garage,
  vehicle,
  services,
  fills,
  busy,
  onAdd,
  onDelete,
}: {
  garage: Garage;
  vehicle: Vehicle | null;
  services: ServiceRecord[];
  fills: Fill[];
  busy: boolean;
  onAdd: (input: {
    vehicleId: number;
    category: string;
    servicedOn: string;
    odometerKm: number | null;
    cost: number;
    nextOn: string;
    nextOdometerKm: number | null;
    note: string;
  }) => void;
  onDelete: (id: number) => void;
}) {
  const book = categoriesFor(vehicle?.kind ?? "car");
  const [category, setCategory] = useState<string>(book[0]);
  const [servicedOn, setServicedOn] = useState(todayISO);
  const [odometer, setOdometer] = useState("");
  const [cost, setCost] = useState("");
  const [nextOn, setNextOn] = useState("");
  const [nextOdo, setNextOdo] = useState("");
  const [note, setNote] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const today = todayISO();
  const odo = latestOdometer(fills);

  useEffect(() => {
    setCategory((current) => (book.includes(current) ? current : book[0]));
  }, [book, vehicle?.id]);

  if (!vehicle) return <NeedCar />;

  const meter = vehicle.meter;
  const distanceUnit = garage.settings.distanceUnit;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <form
        className="card grid gap-3 p-5 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          onAdd({
            vehicleId: vehicle.id,
            category,
            servicedOn,
            odometerKm: odometer ? toStored(Number(odometer), meter, distanceUnit) : null,
            cost: cost ? Number(cost) : 0,
            nextOn,
            nextOdometerKm: nextOdo ? toStored(Number(nextOdo), meter, distanceUnit) : null,
            note,
          });
          setCost("");
          setNote("");
          setNextOn("");
          setNextOdo("");
        }}
      >
        <h2 className="sm:col-span-2 text-lg font-semibold">Service book</h2>
        <Field label="Work">
          <select className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
            {book.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input className="field" type="date" required value={servicedOn} onChange={(event) => setServicedOn(event.target.value)} />
        </Field>
        <Field label={meterFieldLabel(meter, distanceUnit)}>
          <input className="field num" inputMode="decimal" value={odometer} onChange={(event) => setOdometer(event.target.value)} />
        </Field>
        <Field label={`Cost (${garage.settings.currency})`}>
          <input className="field num" inputMode="decimal" value={cost} onChange={(event) => setCost(event.target.value)} />
        </Field>
        <Field label="Next date">
          <input className="field" type="date" value={nextOn} onChange={(event) => setNextOn(event.target.value)} />
        </Field>
        <Field label={nextMeterLabel(meter, distanceUnit)}>
          <input className="field num" inputMode="decimal" value={nextOdo} onChange={(event) => setNextOdo(event.target.value)} />
        </Field>
        <Field label="Note">
          <input className="field sm:col-span-2" value={note} onChange={(event) => setNote(event.target.value)} />
        </Field>
        <button className="btn btn-amber sm:col-span-2" type="submit" disabled={busy}>
          Save service
        </button>
      </form>
      <ul className="card divide-y divide-line">
        {services.length === 0 ? (
          <li className="p-5 text-sm text-muted">Nothing in the book yet.</li>
        ) : (
          services.map((service) => {
            const state = serviceDue(service, odo, today, soonMargin(meter));
            return (
              <li key={service.id} className="flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    {service.category} · {service.servicedOn}
                  </p>
                  <p className="text-sm text-muted">
                    {service.odometerKm != null
                      ? formatMeter(service.odometerKm, meter, distanceUnit)
                      : "No meter"}
                    {" · "}
                    {formatMoney(service.cost, garage.settings.currency)}
                    {service.note ? ` · ${service.note}` : ""}
                  </p>
                  {state ? (
                    <p className={state === "overdue" ? "text-sm font-semibold text-amber" : "text-sm font-semibold text-pine"}>
                      {state === "overdue" ? "Overdue" : "Coming up"}
                      {service.nextOn ? ` · ${service.nextOn}` : ""}
                      {service.nextOdometerKm != null
                        ? ` · ${formatMeter(service.nextOdometerKm, meter, distanceUnit)}`
                        : ""}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={busy}
                  onClick={() => {
                    if (confirmId === service.id) onDelete(service.id);
                    else setConfirmId(service.id);
                  }}
                >
                  {confirmId === service.id ? "Confirm" : "Remove"}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

function CarPanel({
  garage,
  busy,
  onAdd,
  onUpdate,
  onDelete,
  onCancelPlus,
}: {
  garage: Garage;
  busy: boolean;
  onAdd: (input: { name: string; fuel: FuelId; tank: number | null; kind: KindId; meter: Meter }) => void;
  onUpdate: (input: {
    id: number;
    name: string;
    fuel: FuelId;
    tank: number | null;
    archived: boolean;
    kind: KindId;
    meter: Meter;
  }) => void;
  onDelete: (id: number) => void;
  onCancelPlus: () => void;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<KindId>("car");
  const [meter, setMeter] = useState<Meter>("km");
  const [fuel, setFuel] = useState<FuelId>("petrol");
  const [tank, setTank] = useState("");
  const limit = garage.plan.plan === "plus" ? 8 : 1;
  const active = garage.vehicles.filter((vehicle) => !vehicle.archived).length;
  const picked = kindById(kind);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form
        className="card grid gap-3 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          onAdd({ name, fuel, tank: tank ? Number(tank) : null, kind, meter });
          setName("");
          setTank("");
        }}
      >
        <h2 className="text-lg font-semibold">Add a craft</h2>
        <p className="text-sm text-muted">
          {active} of {limit} active on this plan.
        </p>
        <Field label="Name">
          <input className="field" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Daily" />
        </Field>
        <CraftChoice
          kind={kind}
          meter={meter}
          fuel={fuel}
          tank={tank}
          onKind={(id) => {
            const next = kindById(id);
            setKind(id);
            setMeter((next.meters as readonly string[]).includes(meter) ? meter : next.defaultMeter);
            setFuel(next.fuel);
          }}
          onMeter={setMeter}
          onFuel={setFuel}
          onTank={setTank}
        />
        <p className="text-sm leading-relaxed text-muted">{picked.log}</p>
        <button className="btn btn-amber" type="submit" disabled={busy}>
          Add craft
        </button>
        {garage.plan.plan === "free" ? (
          <p className="text-sm text-muted">
            Need another craft?{" "}
            <Link to="/plus" className="font-semibold text-fg underline-offset-2 hover:underline">
              See Plus
            </Link>
            .
          </p>
        ) : (
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={onCancelPlus}>
            Return to Garage plan
          </button>
        )}
      </form>
      <ul className="space-y-3">
        {garage.vehicles.map((vehicle) => (
          <VehicleEditor
            key={vehicle.id}
            vehicle={vehicle}
            hasFills={garage.fills.some((fill) => fill.vehicleId === vehicle.id)}
            busy={busy}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
}

function VehicleEditor({
  vehicle,
  hasFills,
  busy,
  onUpdate,
  onDelete,
}: {
  vehicle: Vehicle;
  hasFills: boolean;
  busy: boolean;
  onUpdate: (input: {
    id: number;
    name: string;
    fuel: FuelId;
    tank: number | null;
    archived: boolean;
    kind: KindId;
    meter: Meter;
  }) => void;
  onDelete: (id: number) => void;
}) {
  const [name, setName] = useState(vehicle.name);
  const [kind, setKind] = useState<KindId>(vehicle.kind);
  const [meter, setMeter] = useState<Meter>(vehicle.meter);
  const [fuel, setFuel] = useState<FuelId>(vehicle.fuel);
  const [tank, setTank] = useState(vehicle.tank ? String(vehicle.tank) : "");
  const [confirm, setConfirm] = useState(false);
  const locked = hasFills ? meterFamily(vehicle.meter) : null;
  const draft = (): {
    id: number;
    name: string;
    fuel: FuelId;
    tank: number | null;
    kind: KindId;
    meter: Meter;
  } => ({
    id: vehicle.id,
    name,
    fuel,
    tank: tank ? Number(tank) : null,
    kind,
    meter,
  });

  return (
    <li className="card grid gap-3 p-5">
      <p className="text-sm text-muted">
        {kindById(kind).label}
        {vehicle.archived ? " · archived" : ""}
      </p>
      <Field label="Name">
        <input className="field" value={name} onChange={(event) => setName(event.target.value)} />
      </Field>
      <CraftChoice
        kind={kind}
        meter={meter}
        fuel={fuel}
        tank={tank}
        locked={locked}
        onKind={(id) => {
          const next = kindById(id);
          const allowed = (next.meters as readonly Meter[]).filter((item) => !locked || meterFamily(item) === locked);
          if (allowed.length === 0) return;
          setKind(id);
          setMeter(allowed.includes(meter) ? meter : allowed[0]);
        }}
        onMeter={setMeter}
        onFuel={setFuel}
        onTank={setTank}
      />
      <p className="text-sm leading-relaxed text-muted">{kindById(kind).log}</p>
      {hasFills ? (
        <p className="text-sm text-muted">Fills are already logged, so this craft stays on {locked === "time" ? "engine hours" : "distance"}.</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-ink"
          disabled={busy}
          onClick={() => onUpdate({ ...draft(), archived: vehicle.archived })}
        >
          Save
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy}
          onClick={() => onUpdate({ ...draft(), archived: !vehicle.archived })}
        >
          {vehicle.archived ? "Restore" : "Archive"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy}
          onClick={() => {
            if (confirm) onDelete(vehicle.id);
            else setConfirm(true);
          }}
        >
          {confirm ? "Confirm delete" : "Delete"}
        </button>
      </div>
    </li>
  );
}

function CraftChoice({
  kind,
  meter,
  fuel,
  tank,
  locked,
  onKind,
  onMeter,
  onFuel,
  onTank,
}: {
  kind: KindId;
  meter: Meter;
  fuel: FuelId;
  tank: string;
  locked?: "distance" | "time" | null;
  onKind: (kind: KindId) => void;
  onMeter: (meter: Meter) => void;
  onFuel: (fuel: FuelId) => void;
  onTank: (tank: string) => void;
}) {
  const picked = kindById(kind);
  const meters = (picked.meters as readonly Meter[]).filter((item) => !locked || meterFamily(item) === locked);
  const unit = FUELS.find((item) => item.id === fuel)?.unit ?? "L";
  const groups = ["Road", "Water", "Air"] as const;

  return (
    <>
      <Field label="Type">
        <select className="field" value={kind} onChange={(event) => onKind(event.target.value as KindId)}>
          {groups.map((group) => (
            <optgroup key={group} label={group}>
          {KINDS.filter((item) => item.group === group).map((item) => {
            const compatible =
              !locked || (item.meters as readonly Meter[]).some((entry) => meterFamily(entry) === locked);
            return (
              <option key={item.id} value={item.id} disabled={!compatible}>
                {item.label}
                {compatible ? "" : " — different meter"}
              </option>
            );
          })}
            </optgroup>
          ))}
        </select>
      </Field>
      {meters.length > 1 ? (
        <Field label="Log">
          <select className="field" value={meter} onChange={(event) => onMeter(event.target.value as Meter)}>
            {meters.map((item) => (
              <option key={item} value={item}>
                {item === "nm" ? "Nautical miles — range" : "Engine hours — burn rate"}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
      <Field label="Fuel">
        <select className="field" value={fuel} onChange={(event) => onFuel(event.target.value as FuelId)}>
          {FUELS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label={`Tank (${unit}, up to ${picked.tankMax})`}>
        <input className="field num" inputMode="decimal" value={tank} onChange={(event) => onTank(event.target.value)} />
      </Field>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

function NeedCar() {
  return (
    <section className="card p-6">
      <h2 className="text-xl font-semibold">Name a craft first</h2>
      <p className="mt-2 text-muted">The log hangs off a craft. Add one on the Craft tab.</p>
    </section>
  );
}
