"use client";

import React from "react";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  return (
    <header className="mb-16">
      <nav className="flex items-center gap-2 mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
        <span>Archive</span>
        <span className="text-zinc-300">/</span>
        <span className="text-zinc-900">Index</span>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-6xl md:text-7xl font-serif italic text-zinc-900 tracking-tight leading-none">
            The Library{" "}
            <span className="font-sans not-italic font-extralight text-zinc-400">
              Inventory
            </span>
          </h1>
          <p className="text-[15px] text-zinc-500 font-medium italic opacity-70">
            A curated registry of digital artifacts and entries.
          </p>
        </div>

        <Link
          href="/admin/create"
          className="group flex items-center gap-6 bg-zinc-200/50 border border-zinc-300/50 text-zinc-900 pl-8 pr-1 py-1 rounded-sm hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-500"
        >
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">
            New Entry
          </span>
          <div className="w-12 h-12 bg-white flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <PlusIcon
              size={18}
              className="text-zinc-900 group-hover:text-white"
              strokeWidth={2}
            />
          </div>
        </Link>
      </div>

      <div className="mt-12 h-[1px] w-full bg-zinc-200/60" />
    </header>
  );
}
