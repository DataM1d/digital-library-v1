"use client";

import { CATEGORY_COLORS } from "@/lib/constants";

export function CategoryPill({ name }: { name: string }) {
  const colorClass = CATEGORY_COLORS[name] || "bg-zinc-900 text-zinc-500 border-white/5";

  return (
    <div className="group relative inline-flex">
      <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <span className={`relative inline-flex items-center gap-2 rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-300 group-hover:border-cyan-500/50 group-hover:text-white ${colorClass}`}>
        <div className="w-1 h-1 rounded-full bg-current shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        {name}
      </span>
    </div>
  );
}