import type { Vehicle } from "./types";

export const VEHICLES: Vehicle[] = [
  { id: "tesla-m3-2024", make: "Tesla", model: "Model 3 (2024+)", year: "2024", battery_kwh: 60, max_ac_kw: 11, max_dc_kw: 170, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "tesla-m3-lr-2024", make: "Tesla", model: "Model 3 Long Range (2024+)", year: "2024", battery_kwh: 82, max_ac_kw: 11, max_dc_kw: 250, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "tesla-my", make: "Tesla", model: "Model Y", year: "2024", battery_kwh: 75, max_ac_kw: 11, max_dc_kw: 250, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "tesla-ms", make: "Tesla", model: "Model S", year: "2024", battery_kwh: 100, max_ac_kw: 16.5, max_dc_kw: 250, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "tesla-mx", make: "Tesla", model: "Model X", year: "2024", battery_kwh: 100, max_ac_kw: 16.5, max_dc_kw: 250, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "tesla-cybertruck", make: "Tesla", model: "Cybertruck", year: "2024", battery_kwh: 123, max_ac_kw: 11, max_dc_kw: 250, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "byd-atto3", make: "BYD", model: "Atto 3", year: "2024", battery_kwh: 60.5, max_ac_kw: 7, max_dc_kw: 80, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "byd-dolphin", make: "BYD", model: "Dolphin", year: "2024", battery_kwh: 60.5, max_ac_kw: 7, max_dc_kw: 80, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "byd-seal", make: "BYD", model: "Seal", year: "2024", battery_kwh: 82.5, max_ac_kw: 7, max_dc_kw: 150, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "mg-zsev", make: "MG", model: "ZS EV", year: "2024", battery_kwh: 72.6, max_ac_kw: 7, max_dc_kw: 80, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "mg4", make: "MG", model: "MG4", year: "2024", battery_kwh: 64, max_ac_kw: 11, max_dc_kw: 135, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "hyundai-ioniq5", make: "Hyundai", model: "Ioniq 5", year: "2024", battery_kwh: 77.4, max_ac_kw: 11, max_dc_kw: 350, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "hyundai-ioniq6", make: "Hyundai", model: "Ioniq 6", year: "2024", battery_kwh: 77.4, max_ac_kw: 11, max_dc_kw: 350, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "hyundai-kona", make: "Hyundai", model: "Kona Electric", year: "2024", battery_kwh: 65.4, max_ac_kw: 11, max_dc_kw: 100, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "kia-ev6", make: "Kia", model: "EV6", year: "2024", battery_kwh: 77.4, max_ac_kw: 11, max_dc_kw: 350, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "kia-ev9", make: "Kia", model: "EV9", year: "2024", battery_kwh: 99.8, max_ac_kw: 11, max_dc_kw: 350, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "kia-niro", make: "Kia", model: "Niro EV", year: "2024", battery_kwh: 64.8, max_ac_kw: 11, max_dc_kw: 100, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "nissan-leaf", make: "Nissan", model: "Leaf", year: "2024", battery_kwh: 62, max_ac_kw: 6.6, max_dc_kw: 100, connector_types: ["CHAdeMO", "Type 1 (J1772)"] },
  { id: "nissan-ariya", make: "Nissan", model: "Ariya", year: "2024", battery_kwh: 91, max_ac_kw: 7.4, max_dc_kw: 130, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "bmw-ix", make: "BMW", model: "iX", year: "2024", battery_kwh: 111.5, max_ac_kw: 11, max_dc_kw: 200, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "bmw-i4", make: "BMW", model: "i4", year: "2024", battery_kwh: 83.9, max_ac_kw: 11, max_dc_kw: 250, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "merc-eqa", make: "Mercedes-Benz", model: "EQA", year: "2024", battery_kwh: 70.5, max_ac_kw: 11, max_dc_kw: 100, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "merc-eqb", make: "Mercedes-Benz", model: "EQB", year: "2024", battery_kwh: 70.5, max_ac_kw: 11, max_dc_kw: 100, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "merc-eqe", make: "Mercedes-Benz", model: "EQE", year: "2024", battery_kwh: 90.6, max_ac_kw: 11, max_dc_kw: 170, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "merc-eqs", make: "Mercedes-Benz", model: "EQS", year: "2024", battery_kwh: 118, max_ac_kw: 11, max_dc_kw: 200, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "volvo-xc40", make: "Volvo", model: "XC40 Recharge", year: "2024", battery_kwh: 82, max_ac_kw: 11, max_dc_kw: 200, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "volvo-c40", make: "Volvo", model: "C40 Recharge", year: "2024", battery_kwh: 82, max_ac_kw: 11, max_dc_kw: 200, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "polestar-2", make: "Polestar", model: "Polestar 2", year: "2024", battery_kwh: 82, max_ac_kw: 11, max_dc_kw: 200, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "toyota-bz4x", make: "Toyota", model: "bZ4X", year: "2024", battery_kwh: 71.4, max_ac_kw: 7, max_dc_kw: 150, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "subaru-solterra", make: "Subaru", model: "Solterra", year: "2024", battery_kwh: 71.4, max_ac_kw: 7, max_dc_kw: 150, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "ford-mache", make: "Ford", model: "Mustang Mach-E", year: "2024", battery_kwh: 91, max_ac_kw: 11, max_dc_kw: 150, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "porsche-taycan", make: "Porsche", model: "Taycan", year: "2024", battery_kwh: 105, max_ac_kw: 11, max_dc_kw: 320, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "audi-etron-q8", make: "Audi", model: "Q8 e-tron", year: "2024", battery_kwh: 114, max_ac_kw: 11, max_dc_kw: 170, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "audi-q4-etron", make: "Audi", model: "Q4 e-tron", year: "2024", battery_kwh: 82, max_ac_kw: 11, max_dc_kw: 135, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "cupra-born", make: "Cupra", model: "Born", year: "2024", battery_kwh: 82, max_ac_kw: 11, max_dc_kw: 170, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "gwm-ora", make: "GWM", model: "Ora", year: "2024", battery_kwh: 63, max_ac_kw: 7, max_dc_kw: 80, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "renault-megane", make: "Renault", model: "Megane E-Tech", year: "2024", battery_kwh: 65, max_ac_kw: 7.4, max_dc_kw: 130, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "skoda-enyaq", make: "Skoda", model: "Enyaq iV", year: "2024", battery_kwh: 82, max_ac_kw: 11, max_dc_kw: 135, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "vw-id3", make: "Volkswagen", model: "ID.3", year: "2024", battery_kwh: 82, max_ac_kw: 11, max_dc_kw: 135, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "vw-id4", make: "Volkswagen", model: "ID.4", year: "2024", battery_kwh: 82, max_ac_kw: 11, max_dc_kw: 135, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "vw-id5", make: "Volkswagen", model: "ID.5", year: "2024", battery_kwh: 82, max_ac_kw: 11, max_dc_kw: 135, connector_types: ["CCS", "Type 2 (Mennekes)"] },
  { id: "vw-idbuzz", make: "Volkswagen", model: "ID. Buzz", year: "2024", battery_kwh: 82, max_ac_kw: 11, max_dc_kw: 200, connector_types: ["CCS", "Type 2 (Mennekes)"] },
];

export const VEHICLE_MAKES = [...new Set(VEHICLES.map((v) => v.make))].sort();

export function getVehicle(id: string): Vehicle | undefined {
  return VEHICLES.find((v) => v.id === id);
}

export function getVehiclesByMake(make: string): Vehicle[] {
  return VEHICLES.filter((v) => v.make === make);
}

export function getCompatibleConnectors(vehicle: Vehicle): string[] {
  return vehicle.connector_types;
}

export function estimateChargeTime(
  vehicle: Vehicle,
  connectorPowerKw: number,
  currentSoc: number,
  targetSoc: number
): { hours: number; minutes: number } {
  const usableKwh = vehicle.battery_kwh * ((targetSoc - currentSoc) / 100);
  const effectivePower = Math.min(connectorPowerKw, vehicle.max_dc_kw);
  if (effectivePower <= 0) return { hours: 0, minutes: 0 };
  const hours = usableKwh / effectivePower;
  return {
    hours: Math.floor(hours),
    minutes: Math.round((hours % 1) * 60),
  };
}

export function estimateCost(
  vehicle: Vehicle,
  connectorPowerKw: number,
  currentSoc: number,
  targetSoc: number,
  pricePerKwh: string
): string {
  const usableKwh = vehicle.battery_kwh * ((targetSoc - currentSoc) / 100);
  const match = pricePerKwh.match(/\$?(\d+\.?\d*)/);
  if (!match) return "Unknown";
  const rate = parseFloat(match[1]);
  const total = usableKwh * rate;
  return `$${total.toFixed(2)}`;
}

export function isConnectorCompatible(connectorType: string, vehicle: Vehicle): boolean {
  return vehicle.connector_types.some(
    (vc) => connectorType.toLowerCase().includes(vc.toLowerCase().split(" ")[0].toLowerCase())
    || vc.toLowerCase().includes(connectorType.toLowerCase().split(" ")[0].toLowerCase())
  );
}
