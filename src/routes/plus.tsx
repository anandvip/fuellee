import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Page, Notice } from "@/components/fuellee/shell";
import { startCheckout } from "@/lib/fuellee/server";

export const Route = createFileRoute("/plus")({ component: PlusPage });

function PlusPage() {
  const { user, isPending } = useCurrentUserState();
  const [interval, setInterval] = useState<"month" | "year">("year");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const result = await startCheckout({
        data: { interval, origin: window.location.origin },
      });
      if (result.mode === "stripe") {
        window.location.assign(result.url);
        return;
      }
      window.location.assign("/garage");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Checkout did not start.");
      setBusy(false);
    }
  }

  return (
    <Page width="max-w-xl">
      <p className="eyebrow">Plus</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">The rest of the garage.</h1>
      <p className="mt-3 leading-relaxed text-muted">
        Eight vehicles, a year of the spend chart, and a CSV of every fill. Priced in Singapore dollars.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2">
        <button type="button" className={interval === "month" ? "btn btn-amber" : "btn btn-ghost"} onClick={() => setInterval("month")}>
          S$6.90 / month
        </button>
        <button type="button" className={interval === "year" ? "btn btn-amber" : "btn btn-ghost"} onClick={() => setInterval("year")}>
          S$59 / year
        </button>
      </div>
      <div className="card mt-6 p-5 text-sm leading-relaxed text-muted">
        If a card processor is connected, this opens a secure checkout and Plus starts only after payment. If it is not, confirming switches this account to Plus so the full garage can be used. You can return to the free Garage plan from the Craft tab. Deleting the account cancels a card subscription when one exists.
      </div>
      {error ? (
        <div className="mt-4">
          <Notice tone="amber">{error}</Notice>
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-2">
        {isPending ? <span className="inline-block h-11 w-40 animate-pulse rounded-full bg-fg/10" /> : null}
        {!isPending && !user ? (
          <Link to="/login" className="btn btn-amber">
            Sign in to start Plus
          </Link>
        ) : null}
        {!isPending && user ? (
          <button type="button" className="btn btn-amber" disabled={busy} onClick={() => void confirm()}>
            {busy ? "Working…" : "Confirm Plus"}
          </button>
        ) : null}
        <Link to="/" className="btn btn-ghost">
          Back
        </Link>
      </div>
    </Page>
  );
}
