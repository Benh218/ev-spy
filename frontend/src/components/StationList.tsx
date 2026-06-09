"use client";

import type { StationListItem } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { parseUsageCost } from "@/lib/vehicles";

interface StationListProps {
  stations: StationListItem[];
  selectedId: number | null;
  onSelect: (station: StationListItem) => void;
  onClose: () => void;
}

const STATUS_DOT: Record<string, string> = {
  working: "bg-green-500",
  broken: "bg-red-500",
  in_use: "bg-yellow-500",
  blocked: "bg-orange-500",
  unavailable: "bg-gray-400",
};

export default function StationList({ stations, selectedId, onSelect, onClose }: StationListProps) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="font-bold text-lg dark:text-white">Stations</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{stations.length} found</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {stations.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8 italic">
            No stations found
          </p>
        )}
        {stations.map((s) => {
          const cost = parseUsageCost(s.usage_cost);
          const isSelected = s.id === selectedId;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={`w-full text-left rounded-xl p-3 border transition-colors ${
                isSelected
                  ? "bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[s.latest_status || ""] || "bg-gray-400"}`} />
                    <span className="text-sm font-medium truncate dark:text-white">{s.name}</span>
                  </div>
                  {s.address && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{s.address}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {s.connector_types.slice(0, 3).map((ct) => (
                      <span key={ct} className="text-[10px] bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">{ct}</span>
                    ))}
                    {s.connector_types.length > 3 && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">+{s.connector_types.length - 3}</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {s.usage_cost && (
                    <span className={`text-xs font-semibold ${cost < 0.4 ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}`}>
                      {s.usage_cost}
                    </span>
                  )}
                  {s.max_power_kw && (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{s.max_power_kw} kW</p>
                  )}
                </div>
              </div>
              {s.latest_status && s.latest_status !== "working" && (
                <div className="mt-1.5">
                  <span className="text-[10px] font-medium text-red-600 dark:text-red-400">
                    {STATUS_LABELS[s.latest_status] || s.latest_status}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
