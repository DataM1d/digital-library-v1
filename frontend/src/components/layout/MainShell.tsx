import React from "react";

export function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <main className="section-container pt-32 pb-40">{children}</main>
    </div>
  );
}
