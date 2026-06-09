"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import FavoritesPanel from "@/components/FavoritesPanel";
import FilterPanel from "@/components/FilterPanel";
import StationList from "@/components/StationList";
import ThemeToggle from "@/components/ThemeToggle";
import SearchBar from "@/components/SearchBar";
import StationDetail from "@/components/StationDetail";
import TripPlanner from "@/components/TripPlanner";
import VehicleSelector from "@/components/VehicleSelector";
import { searchStations, seedMockData } from "@/lib/api";
import { useFavorites, useRecentStations, useTheme, useVehicle } from "@/lib/hooks";
import { parseUsageCost } from "@/lib/vehicles";
import type { StationFilters, StationListItem, TripWaypoint } from "@/lib/types";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-gray-400 dark:text-gray-600">Loading map...</div>
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
  const [zoom, setZoom] = useState(15);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StationFilters>({
    connectorType: "",
    minPowerKw: null,
    operator: "",
  });
  const [error, setError] = useState("");
  const [sortByPrice, setSortByPrice] = useState(false);
  const [showList, setShowList] = useState(false);
  const [routeWaypoints, setRouteWaypoints] = useState<TripWaypoint[]>([]);
  const reqIdRef = useRef(0);

  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recent, addRecent } = useRecentStations();
  const { dark, toggleTheme } = useTheme();
  const { vehicleId, setVehicleId } = useVehicle();

  const loadStations = useCallback(
    async (lat?: number, lng?: number, q?: string) => {
      const id = ++reqIdRef.current;
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
            if (id !== reqIdRef.current) return;
            setCenter([qlat, qlng]);
            setZoom(15);
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
          if (data.length > 0) {
            if (id !== reqIdRef.current) return;
            setCenter([data[0].latitude, data[0].longitude]);
            setZoom(15);
          }
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

        if (id !== reqIdRef.current) return;
        setStations(data);
        if (data.length === 0) {
          setError("No charging stations found in this area.");
        }
      } catch (e) {
        if (id !== reqIdRef.current) return;
        console.error("Failed to load stations", e);
        setError("Failed to load stations. Is the backend running?");
      } finally {
        if (id === reqIdRef.current) {
          setLoading(false);
        }
      }
    },
    [filters]
  );

  useEffect(() => {
    loadStations();
  }, [filters]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await seedMockData();
      await loadStations();
    } catch (e) {
      console.error("Failed to refresh", e);
      setError("Failed to refresh data.");
    } finally {
      setLoading(false);
    }
  }, [loadStations]);

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
        setZoom(14);
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
    setCenter([station.latitude, station.longitude]);
    setZoom(16);
  }, []);

  const handleTripNavigate = useCallback(
    (lat: number, lng: number, _label: string) => {
      setCenter([lat, lng]);
      setZoom(11);
      loadStations(lat, lng);
    },
    [loadStations]
  );

  const displayStations = useMemo(() => {
    if (!sortByPrice) return stations;
    const sorted = [...stations].sort((a, b) => parseUsageCost(a.usage_cost) - parseUsageCost(b.usage_cost));
    return sorted;
  }, [stations, sortByPrice]);

  const cheapestStationId = useMemo(() => {
    if (!sortByPrice || stations.length === 0) return null;
    const sorted = [...stations].sort((a, b) => parseUsageCost(a.usage_cost) - parseUsageCost(b.usage_cost));
    return sorted[0].id;
  }, [stations, sortByPrice]);

  return (
    <main className="h-full flex flex-col bg-white dark:bg-gray-900 transition-colors overflow-x-hidden">
      <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              <svg
                className="w-7 h-7 text-green-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7 2v11h3v9l7-12h-4l4-8z" />
              </svg>
              <span className="font-bold text-lg hidden sm:inline dark:text-white">
                ChargeSpot
              </span>
            </div>
            <div className="flex-1 max-w-2xl">
              <SearchBar
                onSearch={handleSearch}
                onUseMyLocation={handleUseMyLocation}
              />
            </div>
          </div>
          <div className="flex md:hidden items-center gap-2 flex-wrap mt-2 pb-1">
            <VehicleSelector vehicleId={vehicleId} onChange={setVehicleId} />
            <TripPlanner
              onNavigate={handleTripNavigate}
              onSelectStation={handleSelect}
              onWaypointsChange={setRouteWaypoints}
            />
            <button
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh mock data"
              className="flex-shrink-0 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <ThemeToggle dark={dark} onToggle={toggleTheme} />
            <button
              onClick={() => setShowList((p) => !p)}
              title={showList ? "Hide list" : "Show list"}
              className={`flex-shrink-0 p-3 rounded-xl border shadow-sm transition-colors ${
                showList
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setSortByPrice((p) => !p)}
              title={sortByPrice ? "Showing cheapest first" : "Sort by price"}
              className={`flex-shrink-0 p-3 rounded-xl border shadow-sm transition-colors ${
                sortByPrice
                  ? "bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <VehicleSelector vehicleId={vehicleId} onChange={setVehicleId} />
            <TripPlanner
              onNavigate={handleTripNavigate}
              onSelectStation={handleSelect}
              onWaypointsChange={setRouteWaypoints}
            />
            <button
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh mock data"
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <ThemeToggle dark={dark} onToggle={toggleTheme} />
            <button
              onClick={() => setShowList((p) => !p)}
              title={showList ? "Hide list" : "Show list"}
              className={`p-3 rounded-xl border shadow-sm transition-colors ${
                showList
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setSortByPrice((p) => !p)}
              title={sortByPrice ? "Showing cheapest first" : "Sort by price"}
              className={`p-3 rounded-xl border shadow-sm transition-colors ${
                sortByPrice
                  ? "bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        </div>
      </header>

      <div className="flex-1 relative flex">
        <div className="absolute inset-0">
          <Map
            stations={displayStations}
            selectedId={selectedId}
            onSelect={handleSelect}
            center={center}
            zoom={zoom}
            dark={dark}
            cheapestStationId={cheapestStationId}
            waypoints={routeWaypoints}
          />
        </div>

        {loading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
            <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg px-5 py-2 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
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
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-xl shadow-lg px-5 py-3 text-sm text-red-700 dark:text-red-300 max-w-md text-center">
              {error}
            </div>
          </div>
        )}

        {showDetail && detailStationId && (
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md z-[1000] shadow-2xl bg-white dark:bg-gray-900 rounded-l-2xl overflow-hidden">
            <StationDetail
              stationId={detailStationId}
              onClose={() => setShowDetail(false)}
              vehicleId={vehicleId}
              isFavorite={isFavorite(detailStationId)}
              onToggleFavorite={toggleFavorite}
              onAddRecent={addRecent}
            />
          </div>
        )}

        {showList && (
          <div className="absolute left-0 top-0 bottom-0 w-full max-w-sm z-[1000] shadow-2xl bg-white dark:bg-gray-900 rounded-r-2xl overflow-hidden border-r border-gray-200 dark:border-gray-700">
            <StationList
              stations={displayStations}
              selectedId={selectedId}
              onSelect={handleSelect}
              onClose={() => setShowList(false)}
            />
          </div>
        )}

        <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg shadow text-xs text-gray-500 dark:text-gray-400 px-3 py-2">
            {stations.length} station{stations.length !== 1 ? "s" : ""} shown
            {filters.connectorType && ` \u2022 filtered`}
            {sortByPrice && " \u2022 cheapest first"}
          </div>
          <FavoritesPanel
            favorites={favorites}
            stations={stations}
            onSelect={handleSelect}
            onToggleFavorite={toggleFavorite}
          />
          {recent.length > 0 && (
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg shadow text-xs text-gray-500 dark:text-gray-400 px-3 py-2 max-w-[250px]">
              <p className="font-semibold mb-1 dark:text-gray-300">Recent</p>
              <div className="space-y-1 max-h-[100px] overflow-y-auto">
                {recent.slice(0, 5).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setDetailStationId(r.id);
                      setShowDetail(true);
                    }}
                    className="block truncate w-full text-left hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
