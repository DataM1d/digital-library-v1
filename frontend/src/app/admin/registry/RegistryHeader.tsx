"use client";

import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

interface RegistryHeaderProps {
  count: number;
}

export function RegistryHeader({ count }: RegistryHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-950/20">
      <div className="flex items-center gap-2 flex-1 mr-12">
        <Search size={18} className="text-zinc-300 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search the archive registry..."
          className="bg-transparent outline-none text-m font-mono text-zinc-200 placeholder:text-zinc-400 focus:placeholder:text-zinc-300 w-full tracking-wide mt-1 transition-all duration-600"
        />
      </div>
      <div className="flex items-center flex-shrink-0">
        <button className="flex items-center gap-1 text-[15px] font-bold uppercase tracking-[0.15em] text-zinc-300 hover:text-zinc-100 transition-colors font-mono bg-zinc-900/30 hover:bg-zinc-900/60 cursor-pointer">
          <SlidersHorizontal size={15} />
          Filter
        </button>
      </div>
    </div>
  );
}
