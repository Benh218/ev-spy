export interface Connector {
  id: number;
  type: string;
  power_kw: number | null;
  voltage: number | null;
  amperage: number | null;
  quantity: number;
}

export interface StationListItem {
  id: number;
  ocm_id: number;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  operator_name: string | null;
  connector_types: string[];
  max_power_kw: number | null;
  status_type: string | null;
}

export interface UserReport {
  id: number;
  station_id: number;
  status: string;
  comment: string | null;
  created_at: string;
}

export interface StationDetail {
  id: number;
  ocm_id: number;
  name: string;
  address: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  operator_name: string | null;
  usage_type: string | null;
  usage_cost: string | null;
  is_24hr: boolean | null;
  status_type: string | null;
  connectors: Connector[];
  latest_reports: UserReport[];
}

export interface StationFilters {
  connectorType: string;
  minPowerKw: number | null;
  operator: string;
}

export const CONNECTOR_OPTIONS = [
  "CCS",
  "CHAdeMO",
  "Type 2 (Mennekes)",
  "Type 2 (Socket)",
  "Type 2 (Tethered)",
  "Type 1 (J1772)",
  "Tesla (Supercharger)",
  "Tesla (Destination)",
  "Wall Outlet",
];

export const POWER_OPTIONS = [
  { label: "Any", value: null },
  { label: "7 kW+ (AC)", value: 7 },
  { label: "22 kW+ (Fast AC)", value: 22 },
  { label: "50 kW+ (DC Fast)", value: 50 },
  { label: "150 kW+ (Ultra Fast)", value: 150 },
  { label: "350 kW+ (Ultra Rapid)", value: 350 },
];

export const STATUS_COLORS: Record<string, string> = {
  working: "bg-green-500",
  broken: "bg-red-500",
  in_use: "bg-yellow-500",
  blocked: "bg-orange-500",
  unavailable: "bg-gray-500",
};

export const STATUS_LABELS: Record<string, string> = {
  working: "Working",
  broken: "Broken",
  in_use: "In Use",
  blocked: "Blocked",
  unavailable: "Unavailable",
};
