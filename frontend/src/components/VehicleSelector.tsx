"use client";

import { useCallback, useMemo, useState } from "react";
import { VEHICLE_MAKES, VEHICLES, getVehicle } from "@/lib/vehicles";
import type { Vehicle } from "@/lib/types";

interface VehicleSelectorProps {
  vehicleId: string;
  onChange: (id: string) => void;
}

export default function VehicleSelector({ vehicleId, onChange }: VehicleSelectorProps) {
  const [open, setOpen] = useState(false);
  const vehicle = getVehicle(vehicleId);

  const [selectedMake, setSelectedMake] = useState(vehicle?.make || "");

  const filtered = useMemo(
    () => (selectedMake ? VEHICLES.filter((v) => v.make === selectedMake) : []),
    [selectedMake]
  );

  const handleVehicleSelect = useCallback(
    (id: string) => {
      onChange(id);
      setOpen(false);
    },
    [onChange]
  );

  const clearVehicle = useCallback(() => {
    onChange("");
    setOpen(false);
  }, [onChange]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border shadow-sm bg-white/95 text-sm transition-colors dark:bg-gray-800 dark:border-gray-700 ${
          vehicle
            ? "border-blue-500 text-blue-700 dark:text-blue-400"
            : "border-gray-200 text-gray-600 dark:text-gray-400 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="hidden sm:inline">
          {vehicle ? `${vehicle.make} ${vehicle.model}` : "My EV"}
        </span>
        {vehicle && <span className="w-2 h-2 rounded-full bg-blue-500" />}
      </button>

      {open && (
        <div className="absolute top-full left-0 sm:right-0 mt-2 w-[calc(100vw-3rem)] sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-[1000] p-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm dark:text-white">My Vehicle</h3>
            {vehicleId && (
              <button onClick={clearVehicle} className="text-xs text-red-500 hover:text-red-700">
                Clear
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Make</label>
              <select
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select make...</option>
                {VEHICLE_MAKES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {selectedMake && (
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Model</label>
                <select
                  value={vehicleId}
                  onChange={(e) => handleVehicleSelect(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select model...</option>
                  {filtered.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.model} ({v.battery_kwh}kWh)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {vehicle && (
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-xs space-y-1">
                <p className="text-blue-800 dark:text-blue-300"><strong>Battery:</strong> {vehicle.battery_kwh} kWh</p>
                <p className="text-blue-800 dark:text-blue-300"><strong>Max AC:</strong> {vehicle.max_ac_kw} kW</p>
                <p className="text-blue-800 dark:text-blue-300"><strong>Max DC:</strong> {vehicle.max_dc_kw} kW</p>
                <p className="text-blue-800 dark:text-blue-300">
                  <strong>Connectors:</strong> {vehicle.connector_types.join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
