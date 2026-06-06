"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { getStation, submitReport } from "@/lib/api";
import type { StationDetail } from "@/lib/types";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/types";

export default function StationPage() {
  const { id } = useParams<{ id: string }>();
  const [station, setStation] = useState<StationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportStatus, setReportStatus] = useState("");
  const [reportComment, setReportComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getStation(Number(id))
      .then(setStation)
      .catch(() => setStation(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmitReport = async () => {
    if (!reportStatus) return;
    setSubmitting(true);
    try {
      await submitReport({
        station_id: Number(id),
        status: reportStatus,
        comment: reportComment || undefined,
      });
      setReportStatus("");
      setReportComment("");
      const updated = await getStation(Number(id));
      setStation(updated);
    } catch (e) {
      console.error("Failed to submit report", e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Station not found.</p>
        <Link href="/" className="text-green-600 hover:underline text-sm">
          Back to map
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link
            href="/"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <span className="font-bold text-lg truncate">{station.name}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
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
            <span className="text-sm text-yellow-800">
              Pricing: {station.usage_cost}
            </span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold mb-3">Connectors</h2>
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
                {c.power_kw && (
                  <span className="text-sm font-semibold text-green-700">
                    {c.power_kw} kW
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold mb-3">Recent Reports</h2>
          {station.latest_reports.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              No reports yet. Be the first!
            </p>
          ) : (
            <div className="space-y-2">
              {station.latest_reports.map((r) => (
                <div
                  key={r.id}
                  className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2"
                >
                  <span
                    className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                      STATUS_COLORS[r.status] || "bg-gray-400"
                    }`}
                  />
                  <div>
                    <span className="text-sm font-medium">
                      {STATUS_LABELS[r.status] || r.status}
                    </span>
                    {r.comment && (
                      <p className="text-xs text-gray-500">{r.comment}</p>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold mb-3">Report this station</h2>
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
            placeholder="Add a comment..."
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
      </main>
    </div>
  );
}
