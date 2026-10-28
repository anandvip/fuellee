import type { Garage } from "./types";

const KEY = "fuellee.garage.v1";

/** Last garage this browser successfully loaded. Reads work offline; writes still need the account. */
export function rememberGarage(userId: string, garage: Garage) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ userId, garage }));
  } catch {
    /* private mode or a full disk */
  }
}

export function recallGarage(userId: string): Garage | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { userId?: string; garage?: Garage };
    if (parsed.userId !== userId || !parsed.garage?.vehicles) return null;
    return parsed.garage;
  } catch {
    return null;
  }
}

export function forgetGarage() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
