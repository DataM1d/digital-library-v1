"use client";

import { NavLogo } from "./NavLogo";
import { NavLinks } from "./NavLinks";
import { NavActions } from "./NavActions";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 z-100 h-20 w-full border-b border-zinc-900 bg-black/40 backdrop-blur-sm transition-all duration-500">
      <div className="absolute -bottom-px left-0 h-[2.5px] w-full overflow-hidden bg-zinc-900/50">
        <div className="animate-pulse-line h-full w-full bg-linear-to-r from-blue-600/20 via-blue-400 to-blue-600/20 shadow-[0_0_20px_rgba(96,165,250,0.6)]" />
      </div>

      <div className="mx-auto flex h-full max-w-400 items-center justify-between px-8 relative">
        <div className="flex items-center gap-6 z-10">
          <NavLogo />
          <div className="h-4 w-px bg-zinc-800" />
        </div>
        
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <NavLinks />
        </div>
        
        <div className="flex items-center z-10">
          <NavActions />
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-line {
          0% { transform: translateX(-5%) scaleX(0.9); opacity: 0.7; }
          50% { transform: translateX(0%) scaleX(1); opacity: 1; }
          100% { transform: translateX(5%) scaleX(0.9); opacity: 0.7; }
        }
        .animate-pulse-line {
          animation: pulse-line 4s ease-in-out infinite alternate;
        }
      `}</style>
    </nav>
  );
}