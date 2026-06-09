"use client";

import { useEffect, useRef } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onUseMyLocation: () => void;
}

export default function SearchBar({
  onSearch,
  onUseMyLocation,
}: SearchBarProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = formRef.current;
    const input = inputRef.current;
    if (!form || !input) return;

    const handleSubmit = (e: Event) => {
      e.preventDefault();
      const val = input.value.trim();
      if (val) onSearch(val);
    };

    form.addEventListener("submit", handleSubmit);
    input.addEventListener("focus", () => {
      setTimeout(() => input.select(), 0);
    });

    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, [onSearch]);

  return (
    <div style={{ width: "100%" }}>
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
    </div>
  );
}
