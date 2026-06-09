"use client";

import { useState } from "react";
import {
  CONNECTOR_OPTIONS,
  POWER_OPTIONS,
  type StationFilters,
} from "@/lib/types";

interface FilterPanelProps {
  filters: StationFilters;
  onChange: (filters: StationFilters) => void;
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  const update = (partial: Partial<StationFilters>) => {
    onChange({ ...filters, ...partial });
  };

  const hasFilters =
    filters.connectorType || filters.minPowerKw || filters.operator;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border shadow-sm bg-white/95 dark:bg-gray-800/95 text-sm transition-colors ${
          hasFilters
            ? "border-green-500 text-green-700 dark:text-green-400"
            : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span>Filters</span>
        {hasFilters && (
          <span className="w-2 h-2 rounded-full bg-green-500" />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 sm:right-0 mt-2 w-[calc(100vw-3rem)] sm:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-[1000] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Filters</h3>
            {hasFilters && (
              <button
                onClick={() =>
                  onChange({
                    connectorType: "",
                    minPowerKw: null,
                    operator: "",
                  })
                }
                className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Connector Type
              </label>
              <select
                value={filters.connectorType}
                onChange={(e) => update({ connectorType: e.target.value })}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All connectors</option>
                {CONNECTOR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Minimum Power
              </label>
              <select
                value={filters.minPowerKw ?? ""}
                onChange={(e) =>
                  update({
                    minPowerKw: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {POWER_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value ?? ""}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Network / Operator
              </label>
              <input
                type="text"
                value={filters.operator}
                onChange={(e) => update({ operator: e.target.value })}
                placeholder="e.g. ChargeFox, Tesla..."
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
