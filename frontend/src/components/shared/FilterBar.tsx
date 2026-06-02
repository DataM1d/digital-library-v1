"use client";

import React from "react";
import { Search } from "lucide-react";

interface FilterBarProps {
  value: string;
  onChange: (query: string) => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className="w-full px-0 pb-4">
      <div className="w-full relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 transition-colors duration-300 z-10 group-focus-within:text-zinc-400">
          <Search size={18} strokeWidth={2.5} />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search fragments..."
          className="w-full bg-transparent border border-zinc-800/60 pl-16 pr-6 py-4 rounded-full font-mono text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-600 focus:text-zinc-100 outline-none transition-all duration-300 tracking-widest relative z-0 font-bold"
        />
      </div>
    </div>
  );
}
