"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onUseMyLocation: () => void;
  loading?: boolean;
}

interface Suggestion {
  display: string;
  lat: number;
  lng: number;
}

export default function SearchBar({
  onSearch,
  onUseMyLocation,
  loading,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q + ", Australia"
        )}&limit=5`
      );
      if (!res.ok) throw new Error(`Nominatim ${res.status}`);
      const data = await res.json();
      setSuggestions(
        data.map((item: any) => ({
          display: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }))
      );
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 400);
  };

  const handleSelect = (s: Suggestion) => {
    setQuery(s.display.split(",")[0]);
    setShowSuggestions(false);
    onSearch(`${s.lat},${s.lng}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(query);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search suburb, postcode, or place..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm bg-white/95 backdrop-blur text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 z-[1000] max-h-60 overflow-y-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={() => handleSelect(s)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-green-50 border-b border-gray-50 last:border-0 transition-colors"
                >
                  <span className="block truncate text-gray-800 dark:text-gray-200">{s.display}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          title="Search"
          className="px-4 py-3 rounded-xl bg-green-600 text-white shadow-sm hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden sm:inline">Search</span>
        </button>
        <button
          type="button"
          onClick={onUseMyLocation}
          title="Use my location"
          className="px-3 py-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
