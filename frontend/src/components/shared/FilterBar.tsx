"use client";

import React from "react";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function FilterBar({ searchQuery, onSearchChange }: FilterBarProps) {
  return (
    <div className="w-full px-0 pb-4">
      <div className="w-full relative group">
        <div
          style={{ color: "var(--search-icon)" }}
          className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 z-10 group-focus-within:!text-[var(--search-text-focus)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search fragments..."
          style={{
            borderColor: "var(--search-border)",
            color: "var(--search-placeholder)",
          }}
          onFocus={(e) => {
            const el = e.target as HTMLInputElement;
            el.style.borderColor = "var(--search-border-focus)";
            el.style.color = "var(--search-text-focus)";
          }}
          onBlur={(e) => {
            const el = e.target as HTMLInputElement;
            el.style.borderColor = "var(--search-border)";
            el.style.color = "var(--search-placeholder)";
          }}
          className="w-full bg-transparent border border-zinc-800/60 pl-16 pr-6 py-4 rounded-full font-mono text-sm placeholder-[var(--search-placeholder)] focus:outline-none transition-all duration-300 tracking-widest relative z-0 font-bold"
        />
      </div>
    </div>
  );
}
