"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import type { StationListItem } from "@/lib/types";
import type { TripWaypoint } from "@/lib/types";
import { STATUS_LABELS, STATUS_MARKER_COLORS } from "@/lib/types";

interface MapProps {
  stations: StationListItem[];
  selectedId: number | null;
  onSelect: (station: StationListItem) => void;
  center: [number, number];
  zoom: number;
  dark?: boolean;
  cheapestStationId?: number | null;
  waypoints?: TripWaypoint[];
}

function createIcon(color: string, pulse = false) {
  const pulseClass = pulse ? " @keyframes pulse{0%{opacity:1}50%{opacity:0.5}100%{opacity:1}}" : "";
  return L.divIcon({
    className: "",
    html: `<svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>${pulseClass}</style>
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.27 21.73 0 14 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="14" cy="14" r="6" fill="#fff"/>
    </svg>`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
  });
}

const defaultIcon = createIcon("#22c55e");
const selectedIcon = createIcon("#2563eb");
const cheapestIcon = createIcon("#f59e0b");

function getStatusIcon(status: string | null | undefined) {
  const color = STATUS_MARKER_COLORS[status || ""] || "#22c55e";
  return createIcon(color, status === "in_use");
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const initial = useRef(true);

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    map.setView(center, zoom, { animate: true });
  }, [center[0], center[1], zoom]);

  return null;
}

function RouteLayer({ waypoints }: { waypoints: TripWaypoint[] }) {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (waypoints.length < 2) return;

    const group = L.layerGroup().addTo(map);
    layerRef.current = group;
    let cancelled = false;

    const originIcon = L.divIcon({
      className: "",
      html: '<div style="width:16px;height:16px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker([waypoints[0].lat, waypoints[0].lng], { icon: originIcon })
      .bindPopup(`<b>Origin:</b> ${waypoints[0].label}`)
      .addTo(group);

    const destIcon = L.divIcon({
      className: "",
      html: '<div style="width:16px;height:16px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    const last = waypoints[waypoints.length - 1];
    L.marker([last.lat, last.lng], { icon: destIcon })
      .bindPopup(`<b>Destination:</b> ${last.label}`)
      .addTo(group);

    const coords = waypoints.map((w) => `${w.lng},${w.lat}`).join(";");
    fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full&alternatives=false`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.routes || data.routes.length === 0) return;
        const route = data.routes[0];
        const latlngs: [number, number][] = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]] as [number, number]
        );
        L.polyline(latlngs, { color: "#8b5cf6", weight: 4, opacity: 0.7 }).addTo(group);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      group.remove();
    };
  }, [waypoints, map]);

  return null;
}

export default function Map({ stations, selectedId, onSelect, center, zoom, dark, cheapestStationId, waypoints }: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={dark
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
        detectRetina={true}
      />

      <MapController center={center} zoom={zoom} />
      {waypoints && waypoints.length >= 2 && <RouteLayer waypoints={waypoints} />}

      {stations.map((s) => {
        let icon = defaultIcon;
        if (s.id === selectedId) {
          icon = selectedIcon;
        } else if (s.id === cheapestStationId) {
          icon = cheapestIcon;
        } else {
          icon = getStatusIcon(s.latest_status);
        }
        return (
          <Marker
            key={s.id}
            position={[s.latitude, s.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => onSelect(s),
            }}
          >
            <Popup>
              <div className="text-sm min-w-[200px] dark:text-white">
                <div className="flex items-center justify-between">
                  <strong className="text-base">{s.name}</strong>
                  {s.latest_status && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      s.latest_status === "working" ? "bg-green-100 text-green-800" :
                      s.latest_status === "broken" ? "bg-red-100 text-red-800" :
                      s.latest_status === "in_use" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {STATUS_LABELS[s.latest_status] || s.latest_status}
                    </span>
                  )}
                </div>
                {s.address && <p className="text-gray-600 dark:text-gray-400 mt-1">{s.address}</p>}
                {s.operator_name && (
                  <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                    {s.operator_name}
                  </p>
                )}
                {s.usage_cost && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                    {s.usage_cost}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.connector_types.slice(0, 4).map((ct) => (
                    <span
                      key={ct}
                      className="text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded"
                    >
                      {ct}
                    </span>
                  ))}
                  {s.connector_types.length > 4 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{s.connector_types.length - 4}
                    </span>
                  )}
                </div>
                {s.max_power_kw && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Up to {s.max_power_kw} kW
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
