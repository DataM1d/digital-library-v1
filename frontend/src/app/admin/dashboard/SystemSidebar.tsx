"use client";

import React from "react";
import {
  Zap,
  Layers,
  Activity,
  Globe,
  ShieldCheck,
  Settings,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";

export function SystemSidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-24 hover:w-64 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] bg-zinc-950 z-50 p-6 flex flex-col items-center group overflow-hidden border-r border-white/5">
      <div className="mb-16">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-90">
          <Zap className="text-zinc-950 fill-zinc-950" size={18} />
        </div>
      </div>

      <nav className="flex-1 w-full space-y-2">
        <NavIcon icon={<Layers size={20} />} label="Library" active />
        <NavIcon icon={<Activity size={20} />} label="Analytics" />
        <NavIcon icon={<Globe size={20} />} label="Public Site" />
        <NavIcon icon={<ShieldCheck size={20} />} label="Admin" />
      </nav>

      <div className="mt-auto w-full space-y-2">
        <NavIcon icon={<Settings size={20} />} label="Settings" />
        <button className="flex items-center gap-6 cursor-pointer text-zinc-500 hover:text-white transition-all duration-300 group/exit p-4 w-full">
          <div className="min-w-[20px] group-hover/exit:rotate-12 transition-transform">
            <LogOut size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}

function NavIcon({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-6 cursor-pointer group/item p-4 rounded-full transition-all duration-500
      ${active ? "text-white bg-white/10" : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"}
    `}
    >
      <div className="min-w-[20px] flex justify-center">{icon}</div>
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {label}
      </span>
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-2 w-1 h-4 bg-white rounded-full"
        />
      )}
    </div>
  );
}
