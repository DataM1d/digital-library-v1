"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Index", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: "Fragments", href: "/fragments" },
];

export function HeaderNavbar() {
  const pathname = usePathname();

  return (
    <div className="flex w-full items-baseline select-none pl-6 pr-6 transition-all duration-300">
      <Link href="/" className="flex items-baseline gap-3 group shrink-0">
        <div className="relative w-12 h-8 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 self-center">
          <Image
            src="/svg/logo.svg"
            alt="Archive Identity Mark"
            fill
            priority
            className="object-contain"
          />
        </div>

        <span className="font-mono text-[22px] tracking-tight uppercase text-[var(--text-bright)] group-hover:opacity-85 transition-opacity font-semibold pl-0">
          ARCHIVE
        </span>
      </Link>

      <nav className="ml-auto max-w-[60%] flex-1 flex justify-start hidden sm:flex">
        <ul className="flex items-baseline gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`font-mono text-[16px] tracking-widest uppercase transition-colors relative pb-1 block ${
                    isActive
                      ? "text-[var(--text-bright)] font-medium"
                      : "text-[var(--text-dim)] hover:text-zinc-300"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-white opacity-80" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 ml-12 hidden md:block">
        <Link
          href="/login"
          className="font-mono text-[16px] tracking-widest uppercase text-[var(--text-muted)] hover:text-[var(--text-bright)] transition-colors flex items-baseline gap-2.5 group font-bold"
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
