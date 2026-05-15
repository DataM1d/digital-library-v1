"use client";

import React from "react";
import { SystemSidebar } from "@/app/admin/dashboard/SystemSidebar";
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader";
import { RegistryRoot } from "@/app/admin/registry/RegistryRoot";
import { CategoryManager } from "@/app/admin/CategoryManager";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#F2F2F1] text-[#1A1A1E] font-sans selection:bg-[#E2E2E0]">
      <SystemSidebar />

      <main className="pl-32 pr-12 pt-12 pb-32 max-w-[2400px] mx-auto">
        <DashboardHeader />

        {/* Changed grid-cols-12 to grid-cols-10 to give the main area more relative weight */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-16 items-start">
          {/* Main Registry now takes 7 out of 10 columns (70% width) */}
          <div className="lg:col-span-7 space-y-8">
            <RegistryRoot />
          </div>

          {/* Sidebar takes 3 out of 10 columns (30% width) */}
          <aside className="lg:col-span-3 sticky top-12 space-y-8">
            <div className="bg-white/40 border border-zinc-200/50 p-8 backdrop-blur-md shadow-sm">
              <CategoryManager />
            </div>

            <div className="p-8 border border-dashed border-zinc-300 opacity-60">
              <h4 className="font-serif italic text-sm mb-4">Library Note</h4>
              <p className="text-[11px] leading-relaxed text-zinc-500 font-medium italic">
                The current archive contains curated artifacts from various
                historical and architectural periods. Ensure all metadata is
                verified before publishing.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
