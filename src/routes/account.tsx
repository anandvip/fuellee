import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { CURRENCIES, type Currency, type DistanceUnit, type EconomyUnit } from "@/lib/fuellee/constants";
import { forgetGarage } from "@/lib/fuellee/device-copy";
import { deleteAccount, loadGarage, saveProfile, saveSettings } from "@/lib/fuellee/server";
import type { Garage } from "@/lib/fuellee/types";
import { Notice, Page } from "@/components/fuellee/shell";

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  const { user, isPending } = useCurrentUserState();
  const [garage, setGarage] = useState<Garage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [mode, setMode] = useState<"erase" | "donate">("erase");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>("km");
  const [economyUnit, setEconomyUnit] = useState<EconomyUnit>("kml");
  const [currency, setCurrency] = useState<Currency>("SGD");

  useEffect(() => {
    if (!user) return;
    setName(user.displayName ?? "");
    const pending = window.sessionStorage.getItem("fuellee.pendingPhone");
    if (pending) setPhone(pending);
  }, [user?.id, user?.displayName]);

  useEffect(() => {
    if (!user) return;
    let cancel = false;
    loadGarage()
      .then((next) => {
        if (cancel) return;
        setGarage(next);
        setDistanceUnit(next.settings.distanceUnit);
        setEconomyUnit(next.settings.economyUnit);
        setCurrency(next.settings.currency);
        if (next.settings.phone) setPhone(next.settings.phone);
      })
      .catch((reason: unknown) => {
        if (!cancel) setError(reason instanceof Error ? reason.message : "Could not load the account.");
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

  const erase = mode === "erase";

  return (
    <Page width="max-w-5xl">
      <div className="grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="card grid gap-4 p-5 lg:sticky lg:top-24">
          <div className="min-w-0">
            <p className="eyebrow">Profile</p>
            <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight">{name || "Your account"}</h1>
            <p className="mt-1 break-all text-sm text-muted">{user.primaryEmail}</p>
            <p className="mt-1 text-sm text-muted">{phone || "No phone yet"}</p>
          </div>
          {garage ? (
            <p className="text-sm">
              Plan: <span className="font-semibold">{garage.plan.plan === "plus" ? "Plus" : "Garage, free"}</span>
            </p>
          ) : null}
          <div className="grid gap-2">
            <Link to="/garage" className="btn btn-ghost w-full">
              Garage
            </Link>
            <Link to="/reports" className="btn btn-ink w-full">
              Tax record
            </Link>
            <Link to="/plus" className="btn btn-ghost w-full">
              Plus
            </Link>
            <button
              type="button"
              className="btn btn-ghost w-full"
              onClick={() => {
                void signOut("/").catch((reason: unknown) => {
                  setError(reason instanceof Error ? reason.message : "Sign-out did not finish.");
                });
              }}
            >
              Sign out
            </button>
          </div>
        </aside>

        <div className="grid min-w-0 gap-6">
          {error ? <Notice tone="amber">{error}</Notice> : null}
          {notice ? <Notice>{notice}</Notice> : null}

          <form
            className="card grid gap-3 p-5"
            onSubmit={(event) => {
              event.preventDefault();
              setBusy(true);
              setError(null);
              saveProfile({ data: { name, phone } })
                .then(() => {
                  window.sessionStorage.removeItem("fuellee.pendingPhone");
                  setNotice("Profile saved.");
                })
                .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not save."))
                .finally(() => setBusy(false));
            }}
          >
            <h2 className="text-lg font-semibold">Name and phone</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-muted">Name</span>
                <input className="field" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-muted">Phone</span>
                <input
                  className="field"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+91 98100 00000"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </label>
            </div>
            <p className="text-sm text-muted">Email stays {user.primaryEmail}. It is the login and cannot be edited here.</p>
            <button className="btn btn-ink w-full sm:w-auto" type="submit" disabled={busy}>
              Save profile
            </button>
          </form>

          <form
            className="card grid gap-3 p-5"
            onSubmit={(event) => {
              event.preventDefault();
              setBusy(true);
              setError(null);
              saveSettings({ data: { distanceUnit, economyUnit, currency } })
                .then(() => setNotice("Units saved."))
                .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not save."))
                .finally(() => setBusy(false));
            }}
          >
            <h2 className="text-lg font-semibold">Units</h2>
            <p className="text-sm leading-relaxed text-muted">
              Kilometres and miles apply to road craft. Boats and aircraft keep nautical miles or engine hours.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-muted">Distance</span>
                <select className="field" value={distanceUnit} onChange={(event) => setDistanceUnit(event.target.value as DistanceUnit)}>
                  <option value="km">Kilometres</option>
                  <option value="mi">Miles</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-muted">Economy</span>
                <select className="field" value={economyUnit} onChange={(event) => setEconomyUnit(event.target.value as EconomyUnit)}>
                  <option value="kml">km/L</option>
                  <option value="l100">L/100km</option>
                  <option value="mpg">mpg (US)</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-muted">Currency</span>
                <select className="field" value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}>
                  {CURRENCIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
            <button className="btn btn-ink w-full sm:w-auto" type="submit" disabled={busy}>
              Save units
            </button>
          </form>

          <section className="card grid gap-3 border-amber/50 p-5">
            <h2 className="text-lg font-semibold">Delete account</h2>
            <p className="text-sm leading-relaxed text-muted">
              The login, name, email, and phone are removed either way. An alert asks you to confirm before anything is deleted.
            </p>
            <fieldset className="grid gap-2">
              <legend className="sr-only">What happens to the log</legend>
              <label className="flex min-h-11 items-start gap-3 rounded-2xl border border-line p-3 text-sm">
                <input type="radio" name="fate" checked={erase} onChange={() => setMode("erase")} />
                <span>
                  <span className="font-semibold">Erase everything</span>
                  <span className="mt-1 block text-muted">
                    Removes the log and any donated copy from the behaviour dataset. Nothing of this account remains.
                  </span>
                </span>
              </label>
              <label className="flex min-h-11 items-start gap-3 rounded-2xl border border-line p-3 text-sm">
                <input type="radio" name="fate" checked={!erase} onChange={() => setMode("donate")} />
                <span>
                  <span className="font-semibold">Donate an anonymized copy</span>
                  <span className="mt-1 block text-muted">
                    A separate behaviour dataset keeps fuel type, amount, cost, and date. No name, email, phone, craft name, or place. It is not sent to a model from here.
                  </span>
                </span>
              </label>
            </fieldset>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-muted">Type DELETE to confirm</span>
              <input className="field" value={phrase} onChange={(event) => setPhrase(event.target.value)} autoComplete="off" />
            </label>
            <button
              type="button"
              className="btn btn-amber w-full sm:w-auto"
              disabled={busy || phrase !== "DELETE"}
              onClick={() => {
                const warning = erase
                  ? "Erase this account completely? The login and every fuel row, including a donated copy, will be removed. This cannot be undone."
                  : "Delete this login and keep an anonymized fuel copy in the behaviour dataset? Your name, email, and phone will not be in that copy. This cannot be undone.";
                if (!window.confirm(warning)) return;
                setBusy(true);
                setError(null);
                deleteAccount({ data: { phrase, mode } })
                  .then(() => {
                    forgetGarage();
                    return signOut("/");
                  })
                  .catch((reason: unknown) => {
                    setError(reason instanceof Error ? reason.message : "Could not delete the account.");
                    setBusy(false);
                  });
              }}
            >
              {erase ? "Erase account" : "Delete and donate the copy"}
            </button>
          </section>
        </div>
      </div>
    </Page>
  );
}
