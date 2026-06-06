"use client";

import { useEffect, useState } from "react";
import type { StationDetail } from "@/lib/types";
import { getStation, submitReport } from "@/lib/api";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/types";

interface StationDetailProps {
  stationId: number;
  onClose: () => void;
}

export default function StationDetail({
  stationId,
  onClose,
}: StationDetailProps) {
  const [station, setStation] = useState<StationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportStatus, setReportStatus] = useState("");
  const [reportComment, setReportComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getStation(stationId)
      .then(setStation)
      .catch(() => setStation(null))
      .finally(() => setLoading(false));
  }, [stationId]);

  const handleSubmitReport = async () => {
    if (!reportStatus) return;
    setSubmitting(true);
    try {
      await submitReport({
        station_id: stationId,
        status: reportStatus,
        comment: reportComment || undefined,
      });
      setReportStatus("");
      setReportComment("");
      const updated = await getStation(stationId);
      setStation(updated);
    } catch (e) {
      console.error("Failed to submit report", e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="p-6 text-center text-gray-500">
        Station not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="font-bold text-lg truncate pr-2">{station.name}</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {station.address && (
          <p className="text-sm text-gray-600">{station.address}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {station.suburb && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {station.suburb}
            </span>
          )}
          {station.state && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {station.state}
            </span>
          )}
          {station.postcode && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {station.postcode}
            </span>
          )}
          {station.operator_name && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
              {station.operator_name}
            </span>
          )}
        </div>

        {station.usage_cost && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <span className="text-xs font-medium text-yellow-800">
              Pricing: {station.usage_cost}
            </span>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Connectors
          </h3>
          <div className="space-y-2">
            {station.connectors.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
              >
                <div>
                  <span className="text-sm font-medium">{c.type}</span>
                  {c.quantity > 1 && (
                    <span className="text-xs text-gray-500 ml-1">
                      x{c.quantity}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {c.power_kw && (
                    <span className="text-sm font-semibold text-green-700">
                      {c.power_kw} kW
                    </span>
                  )}
                  {c.amperage && (
                    <span className="text-xs text-gray-500 ml-1">
                      {c.amperage}A
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Recent Reports
          </h3>
          {station.latest_reports.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              No reports yet. Be the first!
            </p>
          ) : (
            <div className="space-y-2">
              {station.latest_reports.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2"
                >
                  <span
                    className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                      STATUS_COLORS[r.status] || "bg-gray-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium">
                      {STATUS_LABELS[r.status] || r.status}
                    </span>
                    {r.comment && (
                      <p className="text-xs text-gray-500 truncate">
                        {r.comment}
                      </p>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Report this station
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setReportStatus(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  reportStatus === key
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={reportComment}
            onChange={(e) => setReportComment(e.target.value)}
            placeholder="Add a comment (optional)..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSubmitReport}
            disabled={!reportStatus || submitting}
            className="w-full py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
