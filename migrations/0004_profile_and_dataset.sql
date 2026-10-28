-- Phone on the profile. Donated fuel rows live in a separate dataset with no identity.
alter table fuellee_settings add column if not exists phone text not null default '';

create table if not exists fuellee_training_logs (
  id serial primary key,
  batch_id text not null,
  dataset text not null default 'behaviour',
  kind text not null,
  meter text not null,
  fuel text not null,
  volume_unit text not null,
  filled_on date not null,
  volume double precision not null,
  total_cost double precision not null,
  currency text not null,
  full_tank boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists fuellee_training_batch_idx on fuellee_training_logs (batch_id);

-- Lets "erase everything" find a donated batch after the login is gone.
-- The training rows themselves have no user id, name, email, or phone.
create table if not exists fuellee_training_owner (
  user_id text primary key,
  batch_id text not null,
  deleted_at timestamptz not null default now()
);
