"use client";

import { useMemo, useState } from "react";
import { estimateChargeTime, estimateCost, getVehicle } from "@/lib/vehicles";
import type { Connector } from "@/lib/types";

interface ChargeCalculatorProps {
  vehicleId: string;
  connectors: Connector[];
  usageCost: string | null;
}

export default function ChargeCalculator({
  vehicleId,
  connectors,
  usageCost,
}: ChargeCalculatorProps) {
  const [currentSoc, setCurrentSoc] = useState(20);
  const [targetSoc, setTargetSoc] = useState(80);
  const [selectedConnectorId, setSelectedConnectorId] = useState<number | null>(
    connectors.length > 0 ? connectors[0].id : null
  );

  const vehicle = getVehicle(vehicleId);
  const selectedConnector = connectors.find((c) => c.id === selectedConnectorId);

  const result = useMemo(() => {
    if (!vehicle || !selectedConnector?.power_kw) return null;
    const time = estimateChargeTime(
      vehicle,
      selectedConnector.power_kw,
      currentSoc,
      targetSoc
    );
    const cost = usageCost
      ? estimateCost(vehicle, selectedConnector.power_kw, currentSoc, targetSoc, usageCost)
      : null;
    return { time, cost };
  }, [vehicle, selectedConnector, currentSoc, targetSoc, usageCost]);

  if (!vehicle) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 rounded-lg p-3 space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Charge Calculator
      </h3>

      <div>
        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
          Connector
        </label>
        <select
          value={selectedConnectorId ?? ""}
          onChange={(e) => setSelectedConnectorId(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {connectors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.type} {c.power_kw && `(${c.power_kw} kW)`}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Current SoC (%)
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={currentSoc}
            onChange={(e) => setCurrentSoc(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
            {currentSoc}%
          </span>
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Target SoC (%)
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={targetSoc}
            onChange={(e) => setTargetSoc(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-xs font-medium text-green-700 dark:text-green-300">
            {targetSoc}%
          </span>
        </div>
      </div>

      {result && (
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-2 text-xs space-y-1">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Time:</strong> {result.time.hours}h {result.time.minutes}m
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Energy:</strong>{" "}
            {(vehicle.battery_kwh * ((targetSoc - currentSoc) / 100)).toFixed(1)} kWh
          </p>
          {result.cost && (
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Cost:</strong> {result.cost}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
