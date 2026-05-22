"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Activity, LogOut, Home } from "lucide-react";

export function SystemSidebar() {
  const pathname = usePathname();
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
    <aside className="fixed left-0 top-0 bottom-0 w-64 backdrop-blur-xl z-50 pb-6 pl-4 pr-6 flex flex-col justify-between border-r border-zinc-800/40 select-none pt-0">
      <div className="flex flex-col w-full">
        {/* Top section height calibrated to align perfectly with the Registry Header line */}
        <div className="flex items-center justify-center w-full h-[80px] flex-shrink-0">
          <div className="w-10 h-10 border border-zinc-800/80 bg-zinc-900/40 text-zinc-100 rounded-full flex items-center justify-center font-mono font-bold text-sm leading-none shadow-[0_0_16px_rgba(0,0,0,0.3)]">
            {initial}
          </div>
        </div>

        <div className="border-t border-zinc-800/40 -mx-4 -mr-6" />

        <nav className="w-full space-y-1.5 mt-6">
          <SidebarLink
            href="/admin/registry"
            icon={<Layers size={20} />}
            label="Library"
            active={pathname === "/admin/registry"}
          />
          <SidebarLink
            href="/admin/analytics"
            icon={<Activity size={20} />}
            label="Analytics"
            active={pathname === "/admin/analytics"}
          />
        </nav>
      </div>

      <div className="flex flex-col w-full">
        <div className="border-t border-zinc-800/40 -mx-4 -mr-6" />

        <div className="w-full space-y-1.5 mt-6">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-200 transition-all duration-300 py-3 pr-3 pl-2 w-full rounded-2xl hover:bg-zinc-900/30 group"
          >
            <div className="min-w-[24px] flex justify-center group-hover:-translate-y-0.5 transition-transform">
              <Home size={20} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
              Home
            </span>
          </Link>

          <button className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-200 transition-all duration-300 py-3 pr-3 pl-2 w-full rounded-2xl hover:bg-zinc-900/30 group bg-transparent border-none text-left p-0 outine-none">
            <div className="min-w-[24px] flex justify-center group-hover:rotate-12 transition-transform">
              <LogOut size={20} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function SidebarLink({ href, icon, label, active = false }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 cursor-pointer py-3 pr-3 pl-2 rounded-2xl transition-all duration-500 relative w-full
      ${
        active
          ? "text-zinc-100 bg-zinc-800/40 border border-zinc-700/40 shadow-[0_0_12px_rgba(0,0,0,0.2)]"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20 border border-transparent"
      }
    `}
    >
      <div className="min-w-[24px] flex justify-center">{icon}</div>
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
        {label}
      </span>
      {active && (
        <div className="absolute left-0 w-1 h-4 bg-zinc-200 rounded-full" />
      )}
    </Link>
  );
}
