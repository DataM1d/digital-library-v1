"use client";

import Link from "next/link";

export function NavLogo() {
  return (
    <Link href="/" className="group flex items-center gap-6">
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden border border-zinc-800 bg-transparent transition-all duration-700 group-hover:border-white">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-px w-full scale-x-0 bg-blue-500/40 transition-transform duration-700 group-hover:scale-x-100" />
          <div className="absolute h-full w-px scale-y-0 bg-blue-500/40 transition-transform duration-700 group-hover:scale-y-100" />
        </div>

        <svg
          viewBox="0 0 100 100"
          className="relative z-10 h-7 w-7 transition-all duration-500 group-hover:scale-110"
        >
          <path
            d="M50 5 L95 95 L5 95 Z"
            fill="none"
            stroke="white"
            strokeWidth="2"
            className="transition-all duration-500 group-hover:stroke-blue-400"
          />
          <path
            d="M30 65 L70 65"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="square"
            className="transition-all duration-500 group-hover:translate-x-1 group-hover:stroke-blue-500"
          />
          <circle cx="50" cy="42" r="2.5" fill="white" className="animate-pulse" />
        </svg>

        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-zinc-950 p-0.5">
          <div className="h-full w-full bg-blue-600 transition-all duration-500 group-hover:bg-white" />
        </div>
        
        <div className="absolute -top-1 -left-1 h-2 w-2 border-t border-l border-white/0 transition-all duration-500 group-hover:border-white/40" />
      </div>

      <div className="flex flex-col space-y-0.5">
        <div className="flex items-baseline space-x-1">
          <span className="font-mono text-[16px] font-black tracking-[-0.02em] text-white">
            AR
          </span>
          <span className="font-mono text-[16px] font-thin tracking-[-0.02em] text-zinc-500 transition-colors duration-500 group-hover:text-blue-400">
            CHIVE
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-[7px] font-bold uppercase tracking-[0.4em] text-zinc-600">
            System.Core
          </span>
          <div className="h-px w-2 bg-zinc-800 transition-all duration-500 group-hover:w-8 group-hover:bg-blue-500/50" />
          <span className="font-mono text-[7px] text-blue-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            v3.0.4
          </span>
        </div>
      </div>
    </Link>
  );
}