import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Mark } from "@/components/fuellee/mark";
import { Page } from "@/components/fuellee/shell";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <Page>
      <Hero />
      <Method />
      <Features />
      <Pricing />
      <AccountBlock />
      <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-sm text-muted">
        <span className="inline-flex items-center gap-2">
          <Mark className="size-7" />
          Fuellee
        </span>
        <span>A private log. Not a public garage.</span>
      </footer>
    </Page>
  );
}

function Hero() {
  return (
    <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div>
        <p className="eyebrow">Fuel · service · account</p>
        <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          A quiet log for the trip from A to B.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          Cars, motorcycles, boats, and aircraft. Fill-ups, real economy between full tanks, and the service book — saved to your account. Fuellee does not publish your garage.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <HeroCta />
          <a href="#method" className="btn btn-ghost">
            How the figure is made
          </a>
        </div>
      </div>
      <Instrument />
    </section>
  );
}

function HeroCta() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <span className="inline-block h-11 w-44 animate-pulse rounded-full bg-fg/10" />;
  if (user) {
    return (
      <Link to="/garage" className="btn btn-amber">
        Open your garage
      </Link>
    );
  }
  return (
    <Link to="/login" className="btn btn-amber">
      Create your garage
    </Link>
  );
}

function Instrument() {
  return (
    <aside className="card relative overflow-hidden p-6 sm:p-8">
      <div className="absolute top-0 right-0 h-28 w-28 rounded-bl-[4rem] bg-fg" />
      <p className="eyebrow relative">Sample · not your car</p>
      <p className="num relative mt-6 text-5xl font-medium tracking-tight">13.3</p>
      <p className="relative text-sm text-muted">km/L · last full tank</p>
      <dl className="relative mt-8 grid grid-cols-2 gap-4 border-t border-line pt-5">
        <div>
          <dt className="eyebrow">Per km</dt>
          <dd className="num mt-1 text-xl">S$0.20</dd>
        </div>
        <div>
          <dt className="eyebrow">That chain</dt>
          <dd className="num mt-1 text-xl">460 km</dd>
        </div>
        <div>
          <dt className="eyebrow">Fuel in it</dt>
          <dd className="num mt-1 text-xl">34.6 L</dd>
        </div>
        <div>
          <dt className="eyebrow">Paid</dt>
          <dd className="num mt-1 text-xl">S$92</dd>
        </div>
      </dl>
      <p className="relative mt-5 text-sm leading-relaxed text-muted">
        Full at 12,400 km. A partial, then full again at 12,860. Economy is 460 ÷ 34.6.
      </p>
    </aside>
  );
}

function Method() {
  const steps = [
    ["01", "Two full tanks", "The first full tank only marks the meter. Nothing is divided yet."],
    ["02", "Everything between", "Partials count. The litres, kilograms, or kilowatt-hours all sit in the same chain."],
    ["03", "A gap stays a gap", "If you missed a fill, mark it. Fuellee will not invent a mileage across a hole."],
  ];
  return (
    <section id="method" className="mt-20 scroll-mt-24">
      <p className="eyebrow">The figure</p>
      <h2 className="mt-2 max-w-lg text-3xl font-semibold tracking-tight">The meter, over what actually went in.</h2>
      <ol className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map(([index, title, copy]) => (
          <li key={index} className="card p-5">
            <p className="num text-sm text-amber">{index}</p>
            <h3 className="mt-3 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{copy}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Features() {
  const rows = [
    ["Fill", "Odometer, nautical miles, or engine hours — the meter that craft actually has."],
    ["Economy", "Road craft use km/L, L/100km, or mpg. Boats and planes use nm/L, L/nm, or nautical mpg. An hour meter shows burn rate."],
    ["Service", "The book follows the craft: chain and valves, anodes and impellers, annual and 100-hour. Overdue is marked, not nagged."],
    ["Account", "Sign up with email, Google, or X. Sign out when you leave the seat. Delete account removes the garage and the login."],
    ["Plus", "One vehicle on Garage. Plus keeps eight, a year of the spend chart, and a CSV of the log."],
  ];
  return (
    <section id="features" className="mt-20 scroll-mt-24">
      <p className="eyebrow">What the app actually does</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">The landing page matches the garage.</h2>
      <div className="mt-8 divide-y divide-line border-y border-line">
        {rows.map(([title, copy]) => (
          <div key={title} className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr] sm:gap-8">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-muted">{copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="mt-20 scroll-mt-24">
      <p className="eyebrow">Pricing</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">Garage is enough for one craft. Plus is the rest.</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="card p-6">
          <h3 className="text-xl font-semibold">Garage</h3>
          <p className="num mt-3 text-4xl">S$0</p>
          <ul className="mt-5 space-y-2 text-sm text-muted">
            <li>One active vehicle</li>
            <li>Fills, economy, and the service book</li>
            <li>Three months of the spend chart</li>
            <li>Sign out and delete account</li>
          </ul>
          <Link to="/login" className="btn btn-ghost mt-6">
            Start free
          </Link>
        </article>
        <article className="card border-amber p-6">
          <h3 className="text-xl font-semibold">Plus</h3>
          <p className="num mt-3 text-4xl">
            S$6.90 <span className="text-base font-sans font-medium text-muted">/ month</span>
          </p>
          <p className="mt-1 text-sm text-muted">or S$59 a year</p>
          <ul className="mt-5 space-y-2 text-sm text-muted">
            <li>Up to eight vehicles</li>
            <li>Twelve months of the chart</li>
            <li>CSV export of the log</li>
            <li>Same private account</li>
          </ul>
          <Link to="/plus" className="btn btn-amber mt-6">
            See Plus
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            When card checkout is connected, Plus is paid on a secure payment page before the plan turns on. Until then, confirming Plus switches your account so you can use the full garage.
          </p>
        </article>
      </div>
    </section>
  );
}

function AccountBlock() {
  return (
    <section id="account" className="mt-20 scroll-mt-24 grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div>
        <p className="eyebrow">Your login</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">The log belongs to an account, so it can leave with you.</h2>
        <p className="mt-4 leading-relaxed text-muted">
          A fuel log without a login cannot tell one driver from another, and it cannot be deleted on purpose. Fuellee uses sign-up, sign-in, sign-out, and delete account. Rows are stored against that login and are not readable by anyone else.
        </p>
      </div>
      <ul className="card divide-y divide-line">
        {[
          ["Sign up", "Email and a password, or continue with Google or X."],
          ["Sign in", "Come back on another browser and the garage is there."],
          ["Sign out", "Leaves this browser. The account stays."],
          ["Delete account", "An alert confirms it. Erase every row, or leave an anonymized fuel copy in a separate dataset and remove your name, email, and phone."],
        ].map(([title, copy]) => (
          <li key={title} className="p-5">
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted">{copy}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
