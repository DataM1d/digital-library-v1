"use client";

import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

interface RegistryHeaderProps {
  count: number;
}

export function RegistryHeader({ count }: RegistryHeaderProps) {
  return (
    <div className="flex items-center justify-between p-8 border-b border-zinc-800/40 bg-zinc-950/10">
      <div className="flex items-center gap-4 flex-1">
        <Search size={18} className="text-zinc-500" />
        <input
          type="text"
          placeholder="Search the archive..."
          className="bg-transparent outline-none text-sm font-mono text-zinc-200 placeholder:text-zinc-600 w-full max-w-sm tracking-wide"
        />
      </div>
      <div className="flex items-center gap-6">
        <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400 hover:text-zinc-100 transition-colors font-mono">
          <SlidersHorizontal size={14} />
          Filter
        </button>
        <div className="h-4 w-[1px] bg-zinc-800" />
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
          Count: {count.toString().padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}
