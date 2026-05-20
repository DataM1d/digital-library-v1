"use client";

import React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  return (
    <header className="mb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-serif text-zinc-400 tracking-tight leading-none">
            The Library{" "}
            <span className="text-zinc-100 italic font-normal">Inventory</span>
          </h1>
          <p className="text-sm font-serif italic text-zinc-500 tracking-wide">
            A curated registry of digital artifacts and entries.
          </p>
        </div>

        <Link
          href="/admin/create"
          className="group inline-flex items-center gap-4 bg-zinc-900/40 border border-zinc-800/80 text-zinc-300 pl-5 pr-2 py-2 rounded-xl hover:bg-zinc-800/40 hover:text-zinc-100 hover:border-zinc-700/60 transition-all duration-300 shadow-[0_0_16px_rgba(0,0,0,0.2)] self-start lg:self-auto"
        >
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.15em]">
            New Entry
          </span>
          <div className="w-8 h-8 bg-zinc-800/50 border border-zinc-700/40 rounded-lg flex items-center justify-center group-hover:bg-zinc-100 group-hover:border-zinc-100 transition-colors duration-300">
            <Plus
              size={14}
              className="text-zinc-400 group-hover:text-zinc-950 transition-colors duration-300"
              strokeWidth={2.5}
            />
          </div>
        </Link>
      </div>

      <div className="mt-8 h-[1px] w-full bg-zinc-800/40" />
    </header>
  );
}
