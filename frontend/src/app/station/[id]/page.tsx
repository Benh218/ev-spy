"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { getStation, submitReport } from "@/lib/api";
import type { StationDetail } from "@/lib/types";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/types";
import ChargeCalculator from "@/components/ChargeCalculator";
import NearbyAmenities from "@/components/NearbyAmenities";
import PhotoUpload from "@/components/PhotoUpload";
import { useFavorites, useVehicle, formatDate } from "@/lib/hooks";

export default function StationPage() {
  const { id } = useParams<{ id: string }>();
  const [station, setStation] = useState<StationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportStatus, setReportStatus] = useState("");
  const [reportComment, setReportComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [photosUpdated, setPhotosUpdated] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { vehicleId } = useVehicle();

  useEffect(() => {
    setLoading(true);
    getStation(Number(id))
      .then(setStation)
      .catch(() => setStation(null))
      .finally(() => setLoading(false));
  }, [id, photosUpdated]);

  const handleSubmitReport = useCallback(async () => {
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
  }, [id, reportStatus, reportComment]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-400 dark:text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 dark:text-gray-400">Station not found.</p>
        <Link href="/" className="text-green-600 hover:underline text-sm">
          Back to map
        </Link>
      </div>
    );
  }

  const fav = isFavorite(station.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="font-bold text-lg truncate dark:text-white">{station.name}</span>
          <button
            onClick={() => toggleFavorite(station.id)}
            className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg
              className={`w-5 h-5 ${fav ? "text-red-500 fill-current" : "text-gray-400"}`}
              fill={fav ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {station.address && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{station.address}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {station.suburb && <span className="text-xs bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded">{station.suburb}</span>}
          {station.state && <span className="text-xs bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded">{station.state}</span>}
          {station.postcode && <span className="text-xs bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded">{station.postcode}</span>}
          {station.operator_name && <span className="text-xs bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{station.operator_name}</span>}
          {station.is_24hr && <span className="text-xs bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-1 rounded">24/7</span>}
        </div>

        {station.usage_cost && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <span className="text-sm text-yellow-800 dark:text-yellow-300">Pricing: {station.usage_cost}</span>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <h2 className="font-semibold mb-3 dark:text-white">Connectors</h2>
          <div className="space-y-2">
            {station.connectors.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                <div>
                  <span className="text-sm font-medium dark:text-white">{c.type}</span>
                  {c.quantity > 1 && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">x{c.quantity}</span>}
                </div>
                {c.power_kw && <span className="text-sm font-semibold text-green-700 dark:text-green-400">{c.power_kw} kW</span>}
              </div>
            ))}
          </div>
        </div>

        {vehicleId && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <ChargeCalculator vehicleId={vehicleId} connectors={station.connectors} usageCost={station.usage_cost} />
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <NearbyAmenities lat={station.latitude} lng={station.longitude} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <PhotoUpload stationId={station.id} onUploaded={() => setPhotosUpdated((p) => p + 1)} />
        </div>

        {station.photos.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <h2 className="font-semibold mb-3 dark:text-white">Station Photos</h2>
            <div className="grid grid-cols-3 gap-2">
              {station.photos.map((p) => (
                <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity">
                  <img src={p.url} alt="" className="w-full h-20 object-cover" loading="lazy" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <h2 className="font-semibold mb-3 dark:text-white">Recent Reports</h2>
          {station.latest_reports.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">No reports yet. Be the first!</p>
          ) : (
            <div className="space-y-2">
              {station.latest_reports.map((r) => (
                <div key={r.id} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                  <span className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${STATUS_COLORS[r.status] || "bg-gray-400"}`} />
                  <div>
                    <span className="text-sm font-medium dark:text-white">{STATUS_LABELS[r.status] || r.status}</span>
                    {r.comment && <p className="text-xs text-gray-500 dark:text-gray-400">{r.comment}</p>}
                    <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(r.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <h2 className="font-semibold mb-3 dark:text-white">Report this station</h2>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setReportStatus(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  reportStatus === key
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
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
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm mb-2 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
