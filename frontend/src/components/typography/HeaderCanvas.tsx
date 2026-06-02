import React from "react";
import Image from "next/image";
import { HeaderNavbar } from "../layout/HeaderNavbar";

export function HeaderCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full overflow-hidden bg-[var(--surface)] pt-0 pb-12 md:pb-16 flex flex-col justify-between gap-12">
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="/assets/bg-header.jpg"
          alt="Archival blueprint texture"
          fill
          priority
          className="object-cover object-center opacity-25 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[var(--surface)] opacity-95" />
      </div>

      <div className="relative">
        <HeaderNavbar />
      </div>

      <div className="relative z-10 w-full px-6 md:px-12">{children}</div>
    </div>
  );
}
