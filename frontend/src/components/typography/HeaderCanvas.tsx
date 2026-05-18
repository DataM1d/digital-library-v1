import React from "react";
import Image from "next/image";
import { HeaderNavbar } from "../layout/HeaderNavbar";

export function HeaderCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full overflow-hidden border-b border-[var(--border)] bg-[var(--surface)] pt-3 pb-16 md:pt-4 md:pb-24 flex flex-col justify-between gap-16">
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="/assets/bg-header.jpg"
          alt="Archival blueprint texture"
          fill
          priority
          className="object-cover object-center opacity-25 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-[var(--surface)] opacity-90" />
      </div>

      <div className="relative z-20 w-full px-4">
        <HeaderNavbar />
      </div>

      <div className="relative z-10 w-full px-8 md:px-16">{children}</div>
    </div>
  );
}
