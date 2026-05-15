"use client";

import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

interface RegistryHeaderProps {
  count: number;
}

export function RegistryHeader({ count }: RegistryHeaderProps) {
  return (
    <div className="flex items-center justify-between p-8 border-b border-zinc-200">
      <div className="flex items-center gap-6 flex-1">
        <Search size={18} className="text-zinc-400" />
        <input
          type="text"
          placeholder="Search the archive..."
          className="bg-transparent outline-none text-sm font-medium text-zinc-900 placeholder:text-zinc-300 w-full max-w-sm"
        />
      </div>
      <div className="flex items-center gap-8">
        <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 hover:text-zinc-900 transition-colors">
          <SlidersHorizontal size={14} />
          Filter
        </button>
        <div className="h-4 w-[1px] bg-zinc-200" />
        <p className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">
          Count: {count.toString().padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}
