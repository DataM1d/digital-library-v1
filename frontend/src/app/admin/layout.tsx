"use client";

import React from "react";
import Image from "next/image";
import { SystemSidebar } from "@/app/admin/dashboard/SystemSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="relative flex min-h-screen bg-[#050507] text-zinc-100 overflow-hidden select-none">
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="/assets/bg-header.jpg"
          alt="Archival blueprint texture background"
          fill
          priority
          className="object-cover object-center opacity-15 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/40 via-[#050507]/70 to-[#050507]/90 backdrop-blur-[1.5px]" />
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,#050507_100%)] opacity-80" />

      <div className="relative z-10 flex w-full">
        <SystemSidebar />

        <main className="flex-1 min-h-screen overflow-y-auto pl-64 pr-8 pb-10 md:pr-12 backdrop-blur-[1px] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]">
          {children}
        </main>
      </div>
    </div>
  );
}
