"use client";

import { useCallback, useEffect, useState } from "react";

const FAVORITES_KEY = "chargespot_favorites";
const RECENT_KEY = "chargespot_recent";
const THEME_KEY = "chargespot_theme";
const VEHICLE_KEY = "chargespot_vehicle";
const MAX_RECENT = 20;

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []);

  const toggleFavorite = useCallback((stationId: number) => {
    setFavorites((prev) => {
      const next = prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (stationId: number) => favorites.includes(stationId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}

export function useRecentStations() {
  const [recent, setRecent] = useState<
    { id: number; name: string; timestamp: number }[]
  >([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch {}
  }, []);

  const addRecent = useCallback((id: number, name: string) => {
    setRecent((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      const next = [{ id, name, timestamp: Date.now() }, ...filtered].slice(
        0,
        MAX_RECENT
      );
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { recent, addRecent };
}

export function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === "dark") {
        setDark(true);
        document.documentElement.classList.add("dark");
      } else if (stored === "light") {
        setDark(false);
        document.documentElement.classList.remove("dark");
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setDark(true);
        document.documentElement.classList.add("dark");
      }
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  return { dark, toggleTheme };
}

export function useVehicle() {
  const [vehicleId, setVehicleIdState] = useState<string>("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(VEHICLE_KEY);
      if (stored) setVehicleIdState(stored);
    } catch {}
  }, []);

  const setVehicleId = useCallback((id: string) => {
    setVehicleIdState(id);
    localStorage.setItem(VEHICLE_KEY, id);
  }, []);

  return { vehicleId, setVehicleId };
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
