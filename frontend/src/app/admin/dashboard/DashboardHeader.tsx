"use client";

import React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-end h-[86px] pl-8 pr-4 border-b border-zinc-800/40 bg-transparent w-full select-none">
      <div className="flex items-center">
        <Link
          href="/admin/create"
          className="group inline-flex items-center justify-center gap-3 bg-transparent text-zinc-400 py-2.5 rounded-xl hover:text-zinc-200 transition-all duration-300 w-56"
        >
          <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] translate-x-2">
            Create New
          </span>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center group-hover:bg-zinc-100 transition-colors duration-300 flex-shrink-0">
            <Plus
              size={14}
              className="text-zinc-400 group-hover:text-zinc-950 transition-colors duration-300"
              strokeWidth={2.5}
            />
          </div>
        </Link>
      </div>
    </header>
  );
}
