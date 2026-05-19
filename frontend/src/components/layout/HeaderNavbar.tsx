"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export function HeaderNavbar() {
  return (
    <div className="flex w-full items-baseline select-none px-6 md:px-12 py-4 transition-all duration-300">
      <Link href="/" className="flex items-baseline group shrink-0">
        <div className="relative w-12 h-8 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 self-center">
          <Image
            src="/svg/logo.svg"
            alt="Archive Identity Mark"
            fill
            priority
            className="object-contain"
          />
        </div>

        <span className="font-mono text-[22px] mr-2 mt-3 tracking-tight uppercase text-[var(--text-bright)] group-hover:opacity-85 transition-opacity font-semibold">
          ARCHIVE
        </span>
      </Link>

      <div className="shrink-0 ml-auto hidden md:block">
        <Link
          href="/login"
          className="font-mono text-[16px] tracking-widest uppercase text-[var(--text-muted)] hover:text-[var(--text-bright)] transition-colors flex items-baseline gap-1 group font-bold"
        >
          <span>Login</span>

          <div className="relative w-5 h-4 transition-transform duration-200 group-hover:scale-105 self-center">
            <Image
              src="/svg/user.svg"
              alt="User Account Icon"
              fill
              className="object-contain brightness-90 group-hover:brightness-100 transition-all"
            />
          </div>
        </Link>
      </div>
    </div>
  );
}
