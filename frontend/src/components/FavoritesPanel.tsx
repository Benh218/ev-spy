"use client";

import type { StationListItem } from "@/lib/types";

interface FavoritesPanelProps {
  favorites: number[];
  stations: StationListItem[];
  onSelect: (station: StationListItem) => void;
  onToggleFavorite: (id: number) => void;
}

export default function FavoritesPanel({
  favorites,
  stations,
  onSelect,
  onToggleFavorite,
}: FavoritesPanelProps) {
  if (favorites.length === 0) return null;

  const favStations = stations.filter((s) => favorites.includes(s.id));

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg shadow text-xs text-gray-500 dark:text-gray-400 px-3 py-2 max-w-[250px]">
      <p className="font-semibold mb-1 dark:text-gray-300">
        Favorites ({favStations.length})
      </p>
      {favStations.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500 italic">Click heart icon on a station to save</p>
      ) : (
        <div className="space-y-1 max-h-[120px] overflow-y-auto">
          {favStations.map((s) => (
            <div key={s.id} className="flex items-center gap-1">
              <button
                onClick={() => onSelect(s)}
                className="truncate flex-1 text-left hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                {s.name}
              </button>
              <button
                onClick={() => onToggleFavorite(s.id)}
                className="text-red-500 hover:text-red-700 flex-shrink-0"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
