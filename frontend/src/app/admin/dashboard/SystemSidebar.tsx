"use client";

import React, { useEffect, useState } from "react";
import { Layers, Activity, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export function SystemSidebar() {
  const [initial, setInitial] = useState<string>("A");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.username) {
          setInitial(parsed.username.charAt(0).toUpperCase());
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-24 hover:w-64 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] bg-[#050507]/60 backdrop-blur-md z-50 p-6 flex flex-col items-center group/sidebar overflow-hidden border-r border-zinc-800/40">
      <div className="mb-16">
        <div className="w-12 h-12 border border-zinc-700/60 bg-zinc-900/30 text-zinc-100 rounded-full flex items-center justify-center font-mono font-bold text-base leading-none transition-transform duration-500 group-hover/sidebar:scale-95 shadow-[0_0_16px_rgba(0,0,0,0.2)]">
          {initial}
        </div>
      </div>

      <nav className="flex-1 w-full space-y-2">
        <NavIcon icon={<Layers size={20} />} label="Library" active />
        <NavIcon icon={<Activity size={20} />} label="Analytics" />
      </nav>

      <div className="mt-auto w-full">
        <button className="flex items-center gap-4 cursor-pointer text-zinc-400 hover:text-zinc-100 transition-all duration-300 group/exit p-4 w-full rounded-2xl hover:bg-zinc-900/20">
          <div className="min-w-[24px] flex justify-center group-hover/exit:rotate-12 transition-transform">
            <LogOut size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover/sidebar:opacity-100 transition-opacity">
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
      className={`flex items-center gap-4 cursor-pointer group/item p-4 rounded-2xl transition-all duration-500 relative
      ${
        active
          ? "text-zinc-100 bg-zinc-800/40 border border-zinc-700/40 shadow-[0_0_16px_rgba(0,0,0,0.2)]"
          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/20"
      }
    `}
    >
      <div className="min-w-[24px] flex justify-center">{icon}</div>
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover/sidebar:opacity-100 transition-opacity whitespace-nowrap">
        {label}
      </span>
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-2 w-1 h-4 bg-zinc-300 rounded-full"
        />
      )}
    </div>
  );
}
