"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import type { StationListItem } from "@/lib/types";

interface MapProps {
  stations: StationListItem[];
  selectedId: number | null;
  onSelect: (station: StationListItem) => void;
  center: [number, number];
  zoom: number;
  onMoveEnd?: (center: [number, number], zoom: number) => void;
}

function createIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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

function MapController({
  center,
  zoom,
  onMoveEnd,
}: {
  center: [number, number];
  zoom: number;
  onMoveEnd?: (center: [number, number], zoom: number) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      const c = map.getCenter();
      onMoveEnd?.([c.lat, c.lng], map.getZoom());
    },
  });

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

export default function Map({
  stations,
  selectedId,
  onSelect,
  center,
  zoom,
  onMoveEnd,
}: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController center={center} zoom={zoom} onMoveEnd={onMoveEnd} />

      {stations.map((s) => (
        <Marker
          key={s.id}
          position={[s.latitude, s.longitude]}
          icon={s.id === selectedId ? selectedIcon : defaultIcon}
          eventHandlers={{
            click: () => onSelect(s),
          }}
        >
          <Popup>
            <div className="text-sm min-w-[200px]">
              <strong className="text-base">{s.name}</strong>
              {s.address && <p className="text-gray-600 mt-1">{s.address}</p>}
              {s.operator_name && (
                <p className="text-gray-500 text-xs mt-1">
                  {s.operator_name}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                {s.connector_types.slice(0, 3).map((ct) => (
                  <span
                    key={ct}
                    className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded"
                  >
                    {ct}
                  </span>
                ))}
                {s.connector_types.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{s.connector_types.length - 3}
                  </span>
                )}
              </div>
              {s.max_power_kw && (
                <p className="text-xs text-gray-500 mt-1">
                  Up to {s.max_power_kw} kW
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
