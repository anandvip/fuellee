-- Craft type and the meter it is actually logged on.
-- Existing rows were cars: a road odometer, stored in kilometres.
alter table fuellee_vehicles add column if not exists kind text not null default 'car';
alter table fuellee_vehicles add column if not exists meter text not null default 'km';
