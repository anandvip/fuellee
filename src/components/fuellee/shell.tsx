import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Mark } from "./mark";

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="text-lg font-semibold tracking-tight">Fuellee</span>
        </Link>
        <nav className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
          <Link to="/" hash="features" className="hidden min-h-11 items-center px-3 text-sm font-medium sm:flex">
            Features
          </Link>
          <Link to="/" hash="pricing" className="hidden min-h-11 items-center px-3 text-sm font-medium sm:flex">
            Pricing
          </Link>
          <AuthLinks />
        </nav>
      </div>
    </header>
  );
}

function AuthLinks() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <span className="inline-block h-9 w-24 animate-pulse rounded-full bg-fg/10" />;
  }
  if (!user) {
    return (
      <Link to="/login" className="btn btn-amber">
        Sign in
      </Link>
    );
  }
  const word = (user.displayName ?? "").trim().split(/\s+/)[0];
  const label = !word ? "Account" : word.length > 14 ? `${word.slice(0, 13)}…` : word;
  return (
    <>
      <Link to="/account" className="btn btn-ghost max-w-[9.5rem] px-3">
        <span className="truncate">{label}</span>
      </Link>
      <Link to="/garage" className="btn btn-ink px-3">
        Garage
      </Link>
    </>
  );
}

export function Page({ children, width = "max-w-6xl" }: { children: ReactNode; width?: string }) {
  return (
    <div className="min-h-screen">
      <TopBar />
      <main className={`mx-auto ${width} px-4 py-8 sm:px-6 sm:py-12`}>{children}</main>
    </div>
  );
}

export function Notice({ children, tone = "pine" }: { children: ReactNode; tone?: "pine" | "amber" }) {
  const color = tone === "amber" ? "border-amber/50 bg-amber/10" : "border-pine/40 bg-pine/10";
  return <p className={`rounded-2xl border px-4 py-3 text-sm ${color}`}>{children}</p>;
}
