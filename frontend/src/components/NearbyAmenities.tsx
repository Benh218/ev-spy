"use client";

import { useCallback, useEffect, useState } from "react";

interface Amenity {
  name: string;
  type: string;
  distance: number;
  lat: number;
  lng: number;
}

interface NearbyAmenitiesProps {
  lat: number;
  lng: number;
}

const AMENITY_TYPES = [
  { key: "cafe", label: "Cafes", icon: "☕" },
  { key: "restaurant", label: "Restaurants", icon: "🍽️" },
  { key: "shopping_mall", label: "Shopping", icon: "🛍️" },
  { key: "park", label: "Parks", icon: "🌳" },
  { key: "toilet", label: "Toilets", icon: "🚻" },
  { key: "supermarket", label: "Supermarkets", icon: "🛒" },
];

export default function NearbyAmenities({ lat, lng }: NearbyAmenitiesProps) {
  const [selectedType, setSelectedType] = useState("cafe");
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAmenities = useCallback(async () => {
    setLoading(true);
    try {
      const overpassQuery = `
        [out:json];
        node["amenity"="${selectedType}"](around:1000,${lat},${lng});
        out body 10;
      `;
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: `data=${encodeURIComponent(overpassQuery)}`,
      });
      const data = await res.json();
      setAmenities(
        data.elements.map((el: any) => ({
          name: el.tags?.name || `${selectedType}`,
          type: selectedType,
          distance: haversine(lat, lng, el.lat, el.lng),
          lat: el.lat,
          lng: el.lon,
        })).sort((a: Amenity, b: Amenity) => a.distance - b.distance)
      );
    } catch {
      setAmenities([]);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, selectedType]);

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Nearby Amenities
      </h3>
      <div className="flex flex-wrap gap-1 mb-2">
        {AMENITY_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setSelectedType(t.key)}
            className={`px-2 py-1 rounded-lg text-xs transition-colors ${
              selectedType === t.key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-xs text-gray-400 dark:text-gray-500">Loading...</p>
      ) : amenities.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">
          None found nearby
        </p>
      ) : (
        <div className="space-y-1">
          {amenities.slice(0, 5).map((a, i) => (
            <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-700/50 rounded-lg px-2 py-1">
              <span className="text-gray-700 dark:text-gray-300 truncate">{a.name}</span>
              <span className="text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                {a.distance < 1
                  ? `${Math.round(a.distance * 1000)}m`
                  : `${a.distance.toFixed(1)}km`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
