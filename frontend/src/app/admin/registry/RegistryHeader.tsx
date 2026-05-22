"use client";

import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

interface RegistryHeaderProps {
  count: number;
}

export function RegistryHeader({ count }: RegistryHeaderProps) {
  return (
    <div className="flex items-center justify-between pt-10 pb-5 px-8 border-b border-zinc-800/40 bg-transparent">
      <div className="flex items-center gap-3 flex-1 mr-10">
        <Search size={16} className="text-zinc-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search the archive registry..."
          className="bg-transparent outline-none text-sm font-mono text-zinc-300 placeholder:text-zinc-500 focus:placeholder:text-zinc-400 w-full tracking-wide transition-all duration-300"
        />
      </div>
      <div className="flex items-center flex-shrink-0">
        <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-200 transition-colors font-mono cursor-pointer bg-transparent border-none p-0">
          <SlidersHorizontal size={14} />
          Filter
        </button>
      </div>
    </div>
  );
}
