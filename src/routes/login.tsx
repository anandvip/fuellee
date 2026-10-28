import { useState, type FormEvent } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { authClient, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { saveProfile } from "@/lib/fuellee/server";
import { Page } from "@/components/fuellee/shell";

export const Route = createFileRoute("/login")({ component: LoginPage });

const BEARER_KEY = "grok-auth.bearer-token";
const PENDING_PHONE = "fuellee.pendingPhone";

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return (
      <Page width="max-w-5xl">
        <div className="card h-80 animate-pulse" />
      </Page>
    );
  }
  if (user) return <Navigate to="/garage" />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const options = {
      onSuccess(ctx: { response: Response }) {
        const token = ctx.response.headers.get("set-auth-token");
        if (token) window.sessionStorage.setItem(BEARER_KEY, token);
      },
    };
    const result =
      mode === "up"
        ? await authClient.signUp.email({ email, password, name: name.trim() || email }, options)
        : await authClient.signIn.email({ email, password }, options);
    if (result.error) {
      setBusy(false);
      setError(result.error.message ?? "That did not work.");
      return;
    }
    if (mode === "up") {
      try {
        window.sessionStorage.setItem(PENDING_PHONE, phone);
        await saveProfile({ data: { name: name.trim() || email, phone } });
        window.sessionStorage.removeItem(PENDING_PHONE);
      } catch (reason: unknown) {
        setBusy(false);
        setError(reason instanceof Error ? reason.message : "The account exists. Add the phone number in settings.");
        window.location.assign("/account");
        return;
      }
    }
    window.location.assign("/garage");
  }

  return (
    <Page width="max-w-5xl">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-12">
        <div className="order-2 lg:order-1">
          <p className="eyebrow">Free account</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {mode === "up" ? "Register, then the log is yours." : "Welcome back."}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
            Email and a phone number. No card. The garage stays on this login, and you can erase it later.
          </p>
          <ul className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
            {[
              ["Name", "How the tax record addresses you."],
              ["Email", "The login. Also printed on an expense record."],
              ["Phone", "Stored on the profile. Fuellee does not text a code."],
            ].map(([title, copy]) => (
              <li key={title} className="card p-4">
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-muted">{copy}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="order-1 lg:order-2">
          <form className="card grid gap-4 p-5 sm:p-6" onSubmit={(event) => void submit(event)}>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className={mode === "up" ? "btn btn-amber" : "btn btn-ghost"} onClick={() => setMode("up")}>
                Register
              </button>
              <button type="button" className={mode === "in" ? "btn btn-amber" : "btn btn-ghost"} onClick={() => setMode("in")}>
                Sign in
              </button>
            </div>
            {GROK_PROVIDERS.length > 0 ? (
              <div className="grid gap-2">
                {GROK_PROVIDERS.map((provider) => (
                  <button
                    key={provider.providerId}
                    type="button"
                    className="btn btn-ink w-full"
                    onClick={() => {
                      void signIn(provider.providerId, { callbackURL: "/account" }).catch((reason: unknown) => {
                        setError(reason instanceof Error ? reason.message : "Sign-in failed.");
                      });
                    }}
                  >
                    Continue with {provider.label}
                  </button>
                ))}
                <p className="text-center text-sm text-muted">or email</p>
              </div>
            ) : null}
            {mode === "up" ? (
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Name</span>
                <input className="field" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} />
              </label>
            ) : null}
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Email</span>
              <input
                className="field"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            {mode === "up" ? (
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Phone</span>
                <input
                  className="field"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+65 9123 4567"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </label>
            ) : null}
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Password</span>
              <input
                className="field"
                type="password"
                required
                minLength={8}
                autoComplete={mode === "up" ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {error ? <p className="text-sm text-amber">{error}</p> : null}
            <button className="btn btn-amber w-full" type="submit" disabled={busy}>
              {busy ? "Working…" : mode === "up" ? "Create free account" : "Sign in"}
            </button>
            <p className="text-sm text-muted">
              <Link to="/" className="font-medium text-fg">
                Back to the overview
              </Link>
            </p>
          </form>
        </div>
      </div>
    </Page>
  );
}
