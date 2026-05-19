import React from "react";

export function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-[#08080a] text-[var(--text-bright)] flex flex-col">
      {children}
    </div>
  );
}
