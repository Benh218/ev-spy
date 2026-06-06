"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import FilterPanel from "@/components/FilterPanel";
import SearchBar from "@/components/SearchBar";
import StationDetail from "@/components/StationDetail";
import { searchStations } from "@/lib/api";
import type { StationFilters, StationListItem } from "@/lib/types";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-100">
      <div className="text-gray-400">Loading map...</div>
    </div>
  ),
});

const SYDNEY: [number, number] = [-33.8688, 151.2093];

export default function Home() {
  const [stations, setStations] = useState<StationListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailStationId, setDetailStationId] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [center, setCenter] = useState<[number, number]>(SYDNEY);
  const [zoom, setZoom] = useState(11);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StationFilters>({
    connectorType: "",
    minPowerKw: null,
    operator: "",
  });
  const [error, setError] = useState("");
  const loadingRef = useRef(false);

  const loadStations = useCallback(
    async (lat?: number, lng?: number, q?: string) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError("");

      try {
        let data: StationListItem[];

        if (q && q.includes(",")) {
          const [qlat, qlng] = q.split(",").map(Number);
          if (!isNaN(qlat) && !isNaN(qlng)) {
            data = await searchStations({
              lat: qlat,
              lng: qlng,
              radius_km: 50,
              connector_type: filters.connectorType || undefined,
              min_power_kw: filters.minPowerKw ?? undefined,
              operator: filters.operator || undefined,
            });
            setCenter([qlat, qlng]);
            setZoom(12);
          } else {
            data = await searchStations({
              q,
              connector_type: filters.connectorType || undefined,
              min_power_kw: filters.minPowerKw ?? undefined,
              operator: filters.operator || undefined,
            });
          }
        } else if (q) {
          data = await searchStations({
            q,
            connector_type: filters.connectorType || undefined,
            min_power_kw: filters.minPowerKw ?? undefined,
            operator: filters.operator || undefined,
          });
        } else if (lat !== undefined && lng !== undefined) {
          data = await searchStations({
            lat,
            lng,
            radius_km: 50,
            connector_type: filters.connectorType || undefined,
            min_power_kw: filters.minPowerKw ?? undefined,
            operator: filters.operator || undefined,
          });
        } else {
          data = await searchStations({
            connector_type: filters.connectorType || undefined,
            min_power_kw: filters.minPowerKw ?? undefined,
            operator: filters.operator || undefined,
          });
        }

        setStations(data);
        if (data.length === 0) {
          setError("No charging stations found in this area.");
        }
      } catch (e) {
        console.error("Failed to load stations", e);
        setError("Failed to load stations. Is the backend running?");
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [filters]
  );

  useEffect(() => {
    loadStations(center[0], center[1]);
  }, [filters]);

  const handleSearch = useCallback(
    (query: string) => {
      loadStations(undefined, undefined, query);
    },
    [loadStations]
  );

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCenter([lat, lng]);
        setZoom(13);
        loadStations(lat, lng);
      },
      () => {
        setError("Could not get your location. Please search manually.");
      }
    );
  }, [loadStations]);

  const handleSelect = useCallback((station: StationListItem) => {
    setSelectedId(station.id);
    setDetailStationId(station.id);
    setShowDetail(true);
  }, []);

  const handleMapMoveEnd = useCallback(
    (newCenter: [number, number], newZoom: number) => {
      setCenter(newCenter);
      setZoom(newZoom);
    },
    []
  );

  return (
    <main className="h-full flex flex-col">
      <header className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <svg
              className="w-7 h-7 text-green-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M7 2v11h3v9l7-12h-4l4-8z" />
            </svg>
            <span className="font-bold text-lg hidden sm:inline">
              ChargeSpot
            </span>
          </div>
          <div className="flex-1 max-w-2xl">
            <SearchBar
              onSearch={handleSearch}
              onUseMyLocation={handleUseMyLocation}
              loading={loading}
            />
          </div>
          <div className="flex-shrink-0">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        </div>
      </header>

      <div className="flex-1 relative flex">
        <div className="absolute inset-0">
          <Map
            stations={stations}
            selectedId={selectedId}
            onSelect={handleSelect}
            center={center}
            zoom={zoom}
            onMoveEnd={handleMapMoveEnd}
          />
        </div>

        {loading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
            <div className="bg-white rounded-full shadow-lg px-5 py-2 text-sm text-gray-600 flex items-center gap-2">
              <svg
                className="w-4 h-4 animate-spin text-green-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Loading stations...
            </div>
          </div>
        )}

        {error && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
            <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg px-5 py-3 text-sm text-red-700 max-w-md text-center">
              {error}
            </div>
          </div>
        )}

        {showDetail && detailStationId && (
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md z-[1000] shadow-2xl bg-white rounded-l-2xl overflow-hidden">
            <StationDetail
              stationId={detailStationId}
              onClose={() => setShowDetail(false)}
            />
          </div>
        )}

        <div className="absolute bottom-4 left-4 z-[1000]">
          <div className="bg-white/90 backdrop-blur rounded-lg shadow text-xs text-gray-500 px-3 py-2">
            {stations.length} station{stations.length !== 1 ? "s" : ""} shown
            {filters.connectorType && ` \u2022 filtered`}
          </div>
        </div>
      </div>
    </main>
  );
}
