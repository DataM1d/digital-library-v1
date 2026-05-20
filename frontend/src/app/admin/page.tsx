"use client";

import React from "react";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { RegistryRoot } from "./registry/RegistryRoot";

export default function AdminPage() {
  return (
    <div className="w-full space-y-8 max-w-7xl mx-auto">
      <DashboardHeader />
      <RegistryRoot />
    </div>
  );
}
