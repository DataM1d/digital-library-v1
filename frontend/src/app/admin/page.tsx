"use client";

import React from "react";
import { RegistryHeader } from "./registry/RegistryHeader";
import { RegistryRoot } from "./registry/RegistryRoot";

export default function AdminPage() {
  return (
    <div className="w-full space-y-6">
      <RegistryHeader count={0} />
      <RegistryRoot />
    </div>
  );
}
