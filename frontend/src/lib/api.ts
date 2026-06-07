import type { StationDetail, StationListItem, UserReport } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export interface StationSearchParams {
  lat?: number;
  lng?: number;
  radius_km?: number;
  q?: string;
  connector_type?: string;
  min_power_kw?: number;
  operator?: string;
  refresh?: boolean;
  limit?: number;
  offset?: number;
}

export async function searchStations(
  params: StationSearchParams
): Promise<StationListItem[]> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      qs.set(k, String(v));
    }
  });
  return fetchJson<StationListItem[]>(
    `${API_BASE}/api/stations?${qs.toString()}`
  );
}

export async function getStation(
  id: number
): Promise<StationDetail> {
  return fetchJson<StationDetail>(`${API_BASE}/api/stations/${id}`);
}

export async function submitReport(data: {
  station_id: number;
  status: string;
  comment?: string;
}): Promise<UserReport> {
  return fetchJson<UserReport>(`${API_BASE}/api/reports`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getStationReports(
  stationId: number
): Promise<UserReport[]> {
  return fetchJson<UserReport[]>(
    `${API_BASE}/api/reports/station/${stationId}`
  );
}

export async function refreshStations(
  lat: number,
  lng: number,
  radius_km: number = 50
): Promise<{ refreshed: number; radius_km: number }> {
  return fetchJson(
    `${API_BASE}/api/stations/refresh?lat=${lat}&lng=${lng}&radius_km=${radius_km}`,
    { method: "POST" }
  );
}

export async function seedMockData(force: boolean = true): Promise<{
  message: string;
  count: number;
}> {
  return fetchJson(`${API_BASE}/api/seed?force=${force}`, { method: "POST" });
}
