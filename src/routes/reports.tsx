import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { FUELS, kindById } from "@/lib/fuellee/constants";
import { recallGarage, rememberGarage } from "@/lib/fuellee/device-copy";
import { loadGarage } from "@/lib/fuellee/server";
import type { Fill, Garage, ServiceRecord } from "@/lib/fuellee/types";
import { formatMoney, formatPlainDate } from "@/lib/fuellee/format";
import { Notice, Page } from "@/components/fuellee/shell";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

type Span = "month" | "half" | "year";

function ReportsPage() {
  const { user, isPending } = useCurrentUserState();
  const now = new Date();
  const [garage, setGarage] = useState<Garage | null>(null);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [span, setSpan] = useState<Span>("month");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [half, setHalf] = useState<1 | 2>(now.getMonth() < 6 ? 1 : 2);

  useEffect(() => {
    if (!user) return;
    let cancel = false;
    loadGarage()
      .then((next) => {
        if (cancel) return;
        rememberGarage(user.id, next);
        setGarage(next);
        setOffline(false);
      })
      .catch(() => {
        if (cancel) return;
        const copy = recallGarage(user.id);
        if (copy) {
          setGarage(copy);
          setOffline(true);
        } else {
          setError("Could not load the log, and this device has no saved copy.");
        }
      });
    return () => {
      cancel = true;
    };
  }, [user?.id]);

  if (isPending || (user && !garage && !error)) {
    return (
      <Page width="max-w-5xl">
        <div className="card h-64 animate-pulse" />
      </Page>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <Page width="max-w-5xl">
      <ReportSheet
        garage={garage}
        error={error}
        offline={offline}
        name={user.displayName ?? "Account holder"}
        email={user.primaryEmail ?? ""}
        span={span}
        year={year}
        month={month}
        half={half}
        onSpan={setSpan}
        onYear={setYear}
        onMonth={setMonth}
        onHalf={setHalf}
      />
    </Page>
  );
}

function ReportSheet({
  garage,
  error,
  offline,
  name,
  email,
  span,
  year,
  month,
  half,
  onSpan,
  onYear,
  onMonth,
  onHalf,
}: {
  garage: Garage | null;
  error: string | null;
  offline: boolean;
  name: string;
  email: string;
  span: Span;
  year: number;
  month: number;
  half: 1 | 2;
  onSpan: (span: Span) => void;
  onYear: (year: number) => void;
  onMonth: (month: number) => void;
  onHalf: (half: 1 | 2) => void;
}) {
  const period = useMemo(() => bounds(span, year, month, half), [span, year, month, half]);
  const fills = garage?.fills.filter((fill) => fill.filledOn >= period.start && fill.filledOn <= period.end) ?? [];
  const services =
    garage?.services.filter((service) => service.servicedOn >= period.start && service.servicedOn <= period.end) ?? [];
  const fuelTotal = fills.reduce((sum, fill) => sum + fill.totalCost, 0);
  const serviceTotal = services.reduce((sum, service) => sum + service.cost, 0);
  const volume = volumeByUnit(fills, garage);
  const years = Array.from({ length: 8 }, (_, index) => new Date().getFullYear() - index);
  const currency = garage?.settings.currency ?? "SGD";

  return (
    <div className="grid gap-6">
      <div className="no-print flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Expense record</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Fuel for the period</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/garage" className="btn btn-ghost">
            Garage
          </Link>
          <Link to="/account" className="btn btn-ghost">
            Account
          </Link>
          <button type="button" className="btn btn-amber" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>

      <form className="no-print card grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-muted">Period</span>
          <select className="field" value={span} onChange={(event) => onSpan(event.target.value as Span)}>
            <option value="month">Month</option>
            <option value="half">Half year</option>
            <option value="year">Year</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-muted">Year</span>
          <select className="field" value={year} onChange={(event) => onYear(Number(event.target.value))}>
            {years.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        {span === "month" ? (
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-muted">Month</span>
            <select className="field" value={month} onChange={(event) => onMonth(Number(event.target.value))}>
              {MONTHS.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {span === "half" ? (
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-muted">Half</span>
            <select className="field" value={half} onChange={(event) => onHalf(Number(event.target.value) as 1 | 2)}>
              <option value={1}>January – June</option>
              <option value={2}>July – December</option>
            </select>
          </label>
        ) : null}
      </form>

      {error ? <Notice tone="amber">{error}</Notice> : null}
      {offline ? (
        <div className="no-print">
          <Notice tone="amber">Showing the copy saved on this device. A new fill needs a connection.</Notice>
        </div>
      ) : null}

      <article className="card p-5 sm:p-8">
        <header className="border-b border-line pb-4">
          <p className="eyebrow">Fuellee · fuel expense record</p>
          <h2 className="mt-2 text-2xl font-semibold">{period.label}</h2>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Name</dt>
              <dd className="font-medium">{name}</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="break-all font-medium">{email || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Phone</dt>
              <dd className="font-medium">{garage?.settings.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Currency</dt>
              <dd className="font-medium">{currency}</dd>
            </div>
          </dl>
        </header>

        <h3 className="mt-6 font-semibold">Fuel</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Craft</th>
                <th className="py-2 pr-3 font-medium">Fuel</th>
                <th className="py-2 pr-3 font-medium">Quantity</th>
                <th className="py-2 pr-3 font-medium">Paid</th>
                <th className="py-2 font-medium">Place</th>
              </tr>
            </thead>
            <tbody>
              {fills.length === 0 ? (
                <tr>
                  <td className="py-3 text-muted" colSpan={6}>
                    No fuel in this period.
                  </td>
                </tr>
              ) : (
                fills
                  .slice()
                  .sort((a, b) => a.filledOn.localeCompare(b.filledOn) || a.id - b.id)
                  .map((fill) => {
                    const vehicle = garage?.vehicles.find((item) => item.id === fill.vehicleId);
                    const fuel = FUELS.find((item) => item.id === vehicle?.fuel);
                    return (
                      <tr key={fill.id} className="border-b border-line/80">
                        <td className="py-2 pr-3 whitespace-nowrap">{formatPlainDate(fill.filledOn)}</td>
                        <td className="py-2 pr-3">
                          {vehicle?.name ?? "Removed"}
                          {vehicle ? <span className="text-muted"> · {kindById(vehicle.kind).label}</span> : null}
                        </td>
                        <td className="py-2 pr-3">{fuel?.label ?? vehicle?.fuel ?? "—"}</td>
                        <td className="num py-2 pr-3 whitespace-nowrap">
                          {fill.volume} {vehicle?.volumeUnit ?? ""}
                        </td>
                        <td className="num py-2 pr-3 whitespace-nowrap">{formatMoney(fill.totalCost, currency)}</td>
                        <td className="py-2">{fill.station || "—"}</td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm">
          Fuel paid: <span className="num font-semibold">{formatMoney(fuelTotal, currency)}</span>
          {volume.length > 0 ? <span className="text-muted"> · {volume.join(" · ")}</span> : null}
        </p>

        <h3 className="mt-8 font-semibold">Upkeep</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Craft</th>
                <th className="py-2 pr-3 font-medium">Work</th>
                <th className="py-2 font-medium">Paid</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td className="py-3 text-muted" colSpan={4}>
                    No upkeep in this period.
                  </td>
                </tr>
              ) : (
                services
                  .slice()
                  .sort((a, b) => a.servicedOn.localeCompare(b.servicedOn) || a.id - b.id)
                  .map((service) => <ServiceRow key={service.id} service={service} garage={garage} currency={currency} />)
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm">
          Upkeep paid: <span className="num font-semibold">{formatMoney(serviceTotal, currency)}</span>
        </p>
        <p className="mt-4 border-t border-line pt-4 text-base font-semibold">
          Period total: <span className="num">{formatMoney(fuelTotal + serviceTotal, currency)}</span>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Amounts are what you logged, in {currency}. This is a private record for your expense file. It is not a tax assessment.
        </p>
      </article>
    </div>
  );
}

function ServiceRow({ service, garage, currency }: { service: ServiceRecord; garage: Garage | null; currency: string }) {
  const vehicle = garage?.vehicles.find((item) => item.id === service.vehicleId);
  return (
    <tr className="border-b border-line/80">
      <td className="py-2 pr-3 whitespace-nowrap">{formatPlainDate(service.servicedOn)}</td>
      <td className="py-2 pr-3">{vehicle?.name ?? "Removed"}</td>
      <td className="py-2 pr-3">{service.category}</td>
      <td className="num py-2 whitespace-nowrap">{formatMoney(service.cost, currency)}</td>
    </tr>
  );
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function bounds(span: Span, year: number, month: number, half: 1 | 2) {
  if (span === "month") {
    const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const mm = String(month).padStart(2, "0");
    return {
      start: `${year}-${mm}-01`,
      end: `${year}-${mm}-${String(last).padStart(2, "0")}`,
      label: `${MONTHS[month - 1]} ${year}`,
    };
  }
  if (span === "half") {
    return half === 1
      ? { start: `${year}-01-01`, end: `${year}-06-30`, label: `January – June ${year}` }
      : { start: `${year}-07-01`, end: `${year}-12-31`, label: `July – December ${year}` };
  }
  return { start: `${year}-01-01`, end: `${year}-12-31`, label: String(year) };
}

function volumeByUnit(fills: Fill[], garage: Garage | null) {
  const totals = new Map<string, number>();
  for (const fill of fills) {
    const unit = garage?.vehicles.find((item) => item.id === fill.vehicleId)?.volumeUnit ?? "units";
    totals.set(unit, (totals.get(unit) ?? 0) + fill.volume);
  }
  return [...totals.entries()].map(([unit, amount]) => `${amount.toFixed(1)} ${unit}`);
}
