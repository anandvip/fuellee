import { createFileRoute } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { GarageApp } from "@/components/fuellee/garage-app";
import { Page } from "@/components/fuellee/shell";

export const Route = createFileRoute("/garage")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } =>
    typeof search.session_id === "string" ? { session_id: search.session_id } : {},
  component: GaragePage,
});

function GaragePage() {
  const { session_id } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <Page>
        <div className="h-10 w-40 animate-pulse rounded-full bg-fg/10" />
        <div className="card mt-6 h-48 animate-pulse" />
      </Page>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return (
    <Page>
      <GarageApp sessionId={session_id} />
    </Page>
  );
}
