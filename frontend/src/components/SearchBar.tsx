"use client";

import { useEffect, useRef } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onUseMyLocation: () => void;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export default function SearchBar({
  onSearch,
  onUseMyLocation,
}: SearchBarProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    const form = formRef.current;
    const input = inputRef.current;
    const suggestionsEl = suggestionsRef.current;
    if (!form || !input || !suggestionsEl) return;

    const handleSubmit = (e: Event) => {
      e.preventDefault();
      if (suggestionsEl) suggestionsEl.innerHTML = "";
      const val = input.value.trim();
      if (val) onSearch(val);
    };

    const debounce = (fn: () => void, ms: number) => {
      let timer: ReturnType<typeof setTimeout>;
      return () => {
        clearTimeout(timer);
        timer = setTimeout(fn, ms);
      };
    };

    const renderSuggestions = (items: Suggestion[]) => {
      if (!suggestionsEl) return;
      suggestionsEl.innerHTML = "";
      if (items.length === 0) return;
      const list = document.createElement("div");
      list.className = "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden";
      items.forEach((item) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "w-full text-left px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors";
        btn.textContent = item.display_name;
        btn.addEventListener("click", () => {
          if (suggestionsEl) suggestionsEl.innerHTML = "";
          input.value = item.display_name.split(",")[0].trim();
          onSearch(`${item.lat},${item.lon}`);
        });
        list.appendChild(btn);
      });
      suggestionsEl.appendChild(list);
    };

    const fetchSuggestions = debounce(async () => {
      if (!input || !suggestionsEl) return;
      const q = input.value.trim();
      if (q.length < 2) {
        suggestionsEl.innerHTML = "";
        return;
      }
      const reqId = ++reqIdRef.current;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=au`,
          { headers: { "User-Agent": "ChargeSpot/1.0" } }
        );
        if (!res.ok) throw new Error(`Nominatim ${res.status}`);
        if (reqId !== reqIdRef.current) return;
        const data = await res.json();
        if (reqId !== reqIdRef.current) return;
        renderSuggestions(data);
      } catch {
        if (reqId === reqIdRef.current && suggestionsEl) suggestionsEl.innerHTML = "";
      }
    }, 300);

    form.addEventListener("submit", handleSubmit);
    input.addEventListener("input", fetchSuggestions);
    input.addEventListener("focus", () => {
      if (input.value.trim().length >= 2) fetchSuggestions();
    });
    document.addEventListener("click", (e) => {
      if (suggestionsEl && form && !form.contains(e.target as Node)) suggestionsEl.innerHTML = "";
    });

    return () => {
      form.removeEventListener("submit", handleSubmit);
      input.removeEventListener("input", fetchSuggestions);
    };
  }, [onSearch]);

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <form
        ref={formRef}
        style={{
          display: "flex",
          gap: "8px",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <input
          ref={inputRef}
          name="q"
          type="text"
          placeholder="Search suburb or place"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          style={{
            flex: 1,
            minWidth: 0,
            height: "48px",
            padding: "0 12px",
            borderRadius: "12px",
            border: "2px solid #22c55e",
            backgroundColor: "#ffffff",
            color: "#000000",
            fontSize: "16px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <button
          type="submit"
          style={{
            height: "48px",
            width: "48px",
            borderRadius: "12px",
            backgroundColor: "#22c55e",
            color: "#ffffff",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onUseMyLocation}
          style={{
            height: "48px",
            width: "48px",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            border: "2px solid #22c55e",
            cursor: "pointer",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4m0 12v4m-10-10h4m12 0h4" />
          </svg>
        </button>
      </form>
      <div
        ref={suggestionsRef}
        style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          zIndex: 9999,
        }}
      />
    </div>
  );
}
