import React from "react";

export function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen flex flex-col items-start justify-start">
      {children}
    </div>
  );
}
