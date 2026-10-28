import type {
  Billing,
  Currency,
  DistanceUnit,
  EconomyUnit,
  FuelId,
  KindId,
  Meter,
  PayProvider,
  PlanId,
  VolumeUnit,
} from "./constants";

export type Settings = {
  distanceUnit: DistanceUnit;
  economyUnit: EconomyUnit;
  currency: Currency;
  phone: string;
};

export type PlanState = {
  plan: PlanId;
  billing: Billing;
  provider: PayProvider;
  stripeReady: boolean;
};

export type Vehicle = {
  id: number;
  name: string;
  kind: KindId;
  meter: Meter;
  fuel: FuelId;
  volumeUnit: VolumeUnit;
  tank: number | null;
  archived: boolean;
};

export type Fill = {
  id: number;
  vehicleId: number;
  filledOn: string;
  odometerKm: number;
  volume: number;
  totalCost: number;
  station: string;
  fullTank: boolean;
  missedBefore: boolean;
  note: string;
};

export type ServiceRecord = {
  id: number;
  vehicleId: number;
  category: string;
  servicedOn: string;
  odometerKm: number | null;
  cost: number;
  nextOn: string | null;
  nextOdometerKm: number | null;
  note: string;
};

export type Garage = {
  settings: Settings;
  plan: PlanState;
  vehicles: Vehicle[];
  fills: Fill[];
  services: ServiceRecord[];
};
