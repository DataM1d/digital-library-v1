"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Plus } from "lucide-react";

export function NavActions() {
  const { logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="group relative flex items-center justify-center border border-white px-7 py-2.5 transition-all duration-500 hover:bg-white"
      >
        <div className="absolute inset-0 z-0 w-0 bg-white transition-all duration-500 ease-out group-hover:w-full" />
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white transition-colors duration-500 group-hover:text-black">
            Establish Connection
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-8">

      <Link
        href="/admin/create"
        className="group relative flex items-center justify-center border border-white px-7 py-2.5 transition-all duration-500 hover:bg-white"
      >
        <div className="absolute inset-0 z-0 w-0 bg-white transition-all duration-500 ease-out group-hover:w-full" />
        
        <div className="relative z-10 flex items-center gap-3">
          <Plus size={14} className="text-white transition-colors duration-500 group-hover:text-black" />
         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white transition-colors duration-500 group-hover:text-black">
            Register Artifact
          </span>
        </div>
      </Link>

      <button
        onClick={logout}
        className="group flex h-10 w-10 items-center justify-center border border-zinc-800 bg-transparent transition-all duration-500 hover:border-white hover:bg-white"
      >
        <LogOut size={16} className="text-zinc-500 transition-colors duration-500 group-hover:text-black" />
      </button>
    </div>
  );
}