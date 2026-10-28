-- Fuellee: per-user garage. user_id is Better Auth's text id.
create table if not exists fuellee_settings (
  user_id text primary key,
  distance_unit text not null default 'km',
  economy_unit text not null default 'kml',
  currency text not null default 'SGD',
  updated_at timestamptz not null default now()
);

create table if not exists fuellee_plans (
  user_id text primary key,
  plan text not null default 'free',
  billing text not null default 'none',
  provider text not null default 'none',
  stripe_customer text,
  stripe_subscription text,
  updated_at timestamptz not null default now()
);

create table if not exists fuellee_vehicles (
  id serial primary key,
  user_id text not null,
  name text not null,
  fuel text not null default 'petrol',
  volume_unit text not null default 'L',
  tank double precision,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists fuellee_vehicles_user_idx on fuellee_vehicles (user_id);

create table if not exists fuellee_fills (
  id serial primary key,
  user_id text not null,
  vehicle_id integer not null,
  filled_on date not null,
  odometer_km double precision not null,
  volume double precision not null,
  total_cost double precision not null,
  station text not null default '',
  full_tank boolean not null default true,
  missed_before boolean not null default false,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists fuellee_fills_user_idx on fuellee_fills (user_id, vehicle_id);

create table if not exists fuellee_services (
  id serial primary key,
  user_id text not null,
  vehicle_id integer not null,
  category text not null,
  serviced_on date not null,
  odometer_km double precision,
  cost double precision not null default 0,
  next_on date,
  next_odometer_km double precision,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists fuellee_services_user_idx on fuellee_services (user_id, vehicle_id);
