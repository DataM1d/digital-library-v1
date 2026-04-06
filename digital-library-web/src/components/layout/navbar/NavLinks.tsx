"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Discovery", href: "/" },
  { name: "Repository", href: "/archive" },
  { name: "Network", href: "/network" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="hidden items-center gap-6 lg:flex">
      {links.map((link) => {
        const isActive = pathname === link.href;
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`group relative flex items-center justify-center border px-7 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300
              ${isActive 
                ? "border-white bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]" 
                : "border-zinc-800 text-zinc-500 hover:border-white hover:text-white"
              }`}
          >
            {!isActive && (
              <div className="absolute inset-0 z-0 scale-x-0 bg-white transition-transform duration-300 origin-left group-hover:scale-x-100" />
            )}

            <span className={`relative z-10 transition-colors duration-300 
              ${isActive ? 'text-black' : 'group-hover:text-black'}
            `}>
              {link.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}