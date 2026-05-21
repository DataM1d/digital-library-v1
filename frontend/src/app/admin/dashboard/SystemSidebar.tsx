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
    <aside className="fixed left-0 top-0 bottom-0 w-64 backdrop-blur-sm z-50 p-6 flex flex-col justify-between border-r border-zinc-800/40 select-none">
      <div className="flex flex-col gap-8 w-full">
        <div className="flex flex-col items-center w-full py-2">
          <div className="w-12 h-12 border border-zinc-700/60 bg-zinc-900/30 text-zinc-100 rounded-full flex items-center justify-center font-mono font-bold text-base leading-none shadow-[0_0_16px_rgba(0,0,0,0.2)] flex-shrink-0">
            {initial}
          </div>
        </div>

        <nav className="w-full space-y-2">
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

      <div className="w-full space-y-2 pt-4 border-t border-zinc-900/40">
        <Link
          href="/"
          className="flex items-center gap-4 cursor-pointer text-zinc-400 hover:text-zinc-100 transition-all duration-300 p-4 w-full rounded-2xl hover:bg-zinc-900/20 group"
        >
          <div className="min-w-[24px] flex justify-center group-hover:-translate-y-0.5 transition-transform">
            <Home size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
            Home
          </span>
        </Link>

        <button className="flex items-center gap-4 cursor-pointer text-zinc-400 hover:text-zinc-100 transition-all duration-300 p-4 w-full rounded-2xl hover:bg-zinc-900/20 group">
          <div className="min-w-[24px] flex justify-center group-hover:rotate-12 transition-transform">
            <LogOut size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
            Logout
          </span>
        </button>
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
      className={`flex items-center gap-4 cursor-pointer p-4 rounded-2xl transition-all duration-500 relative w-full
      ${
        active
          ? "text-zinc-100 bg-zinc-800/40 border border-zinc-700/40 shadow-[0_0_16px_rgba(0,0,0,0.2)]"
          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/20 border border-transparent"
      }
    `}
    >
      <div className="min-w-[24px] flex justify-center">{icon}</div>
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
        {label}
      </span>
      {active && (
        <div className="absolute left-2 w-1 h-4 bg-zinc-300 rounded-full" />
      )}
    </Link>
  );
}
