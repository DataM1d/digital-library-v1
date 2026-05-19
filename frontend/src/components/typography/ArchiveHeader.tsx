import React from "react";
import { HeaderCanvas } from "./HeaderCanvas";

export function ArchiveHeader() {
  return (
    <HeaderCanvas>
      <header className="w-full pl-6 sm:pl-[20%] md:pl-[40%] lg:pl-[64%] transition-all duration-300">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-tight drop-shadow-xl select-none">
          <span className="block text-[var(--text-dim)] tracking-wide">
            A collection of
          </span>

          <span className="block italic text-[var(--text-bright)] pl-[10%] md:pl-[20%] py-2 font-mono tracking-wide">
            digital artifacts
          </span>

          <span className="block text-[var(--text-dim)] tracking-wide">
            & fragments.
          </span>
        </h1>
      </header>
    </HeaderCanvas>
  );
}
