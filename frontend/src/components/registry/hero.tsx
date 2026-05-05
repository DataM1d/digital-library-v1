"use client";

import React from "react";
import { Search } from "lucide-react";

export function Hero() {
  return (
    <section className="px-8 py-12 lg:px-16 border-b border-zinc-900 bg-[#080808]">
      <div className="w-full">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.4em]">
            Registry Entry  2026
          </span>
          <div className="h-[1px] w-8 bg-zinc-800" />
        </div>

        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-white uppercase leading-none mb-6">
          Digital <span className="text-zinc-800">Library</span>
        </h1>

        <p className="max-w-2xl text-[10px] text-zinc-500 uppercase leading-relaxed tracking-widest font-medium opacity-80">
          A curated repository of fullstack systems, scalable architecture, and technical documentation. 
          Designed for high-capacity asset retrieval and system documentation.
        </p>

        <div className="mt-10 flex w-full items-center border border-zinc-900 bg-zinc-900/5 focus-within:border-zinc-700 transition-all duration-500">
          <div className="pl-6 text-zinc-700">
            <Search size={14} />
          </div>
          <input 
            type="text" 
            placeholder="FILTER_COLLECTION_BY_KEYWORD..." 
            className="flex-1 bg-transparent p-5 text-[10px] uppercase tracking-[0.2em] text-white outline-none placeholder:text-zinc-800"
          />
          <button className="bg-zinc-900 px-10 py-5 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all border-l border-zinc-900">
            Find Record
          </button>
        </div>
      </div>
    </section>
  );
}