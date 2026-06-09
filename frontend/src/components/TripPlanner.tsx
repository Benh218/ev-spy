"use client";

import { useCallback, useState } from "react";
import type { StationListItem, TripWaypoint } from "@/lib/types";
import { searchStations } from "@/lib/api";

interface TripPlannerProps {
  onNavigate: (lat: number, lng: number, label: string) => void;
  onSelectStation: (station: StationListItem) => void;
}

export default function TripPlanner({ onNavigate, onSelectStation }: TripPlannerProps) {
  const [open, setOpen] = useState(false);
  const [waypoints, setWaypoints] = useState<TripWaypoint[]>([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [planning, setPlanning] = useState(false);
  const [stations, setStations] = useState<StationListItem[]>([]);

  const geocode = useCallback(async (query: string): Promise<TripWaypoint | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Australia")}&limit=1`
      );
      const data = await res.json();
      if (data.length === 0) return null;
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        label: data[0].display_name.split(",")[0],
      };
    } catch {
      return null;
    }
  }, []);

  const handlePlan = useCallback(async () => {
    if (!origin || !destination) return;
    setPlanning(true);
    setStations([]);

    const orig = await geocode(origin);
    const dest = await geocode(destination);

    if (!orig || !dest) {
      setPlanning(false);
      return;
    }

    setWaypoints([orig, dest]);

    const midLat = (orig.lat + dest.lat) / 2;
    const midLng = (orig.lng + dest.lng) / 2;
    const latDiff = Math.abs(orig.lat - dest.lat);
    const lngDiff = Math.abs(orig.lng - dest.lng);
    const radiusKm = Math.max(latDiff, lngDiff) * 111 / 2 + 50;

    try {
      const results = await searchStations({
        lat: midLat,
        lng: midLng,
        radius_km: Math.min(radiusKm, 500),
        limit: 50,
      });
      setStations(results);
      onNavigate(midLat, midLng, "Route midpoint");
    } catch (e) {
      console.error("Trip planner search failed", e);
    } finally {
      setPlanning(false);
    }
  }, [origin, destination, geocode, onNavigate]);

  const clear = useCallback(() => {
    setOrigin("");
    setDestination("");
    setWaypoints([]);
    setStations([]);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border shadow-sm bg-white/95 text-sm transition-colors dark:bg-gray-800 dark:border-gray-700 ${
          waypoints.length > 0
            ? "border-purple-500 text-purple-700 dark:text-purple-400"
            : "border-gray-200 text-gray-600 dark:text-gray-400 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span className="hidden sm:inline">Trip</span>
        {waypoints.length > 0 && <span className="w-2 h-2 rounded-full bg-purple-500" />}
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-[1000] p-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm dark:text-white">Trip Planner</h3>
            {waypoints.length > 0 && (
              <button onClick={clear} className="text-xs text-red-500 hover:text-red-700">
                Clear
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Origin</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Suburb or place..."
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Suburb or place..."
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={handlePlan}
              disabled={planning || !origin || !destination}
              className="w-full py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {planning ? "Planning..." : "Find chargers along route"}
            </button>

            {stations.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {stations.length} stations along route
                </p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {stations.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSelectStation(s)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700"
                    >
                      <span className="font-medium dark:text-white">{s.name}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">
                        {s.operator_name && `(${s.operator_name})`}
                      </span>
                      {s.max_power_kw && (
                        <span className="text-green-600 dark:text-green-400 ml-1">{s.max_power_kw}kW</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
