"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Library, Heart, LayoutGrid, User, Settings } from "lucide-react";

const navItems = [
  { name: "Overview", href: "/", icon: Home },
  { name: "Discovery", href: "/discover", icon: Compass },
  { name: "Collection", href: "/library", icon: Library },
  { name: "Favorites", href: "/favorites", icon: Heart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#080808] border-r border-zinc-900 flex flex-col z-[100] font-sans">

      <div className="h-20 px-8 flex items-center">
        <Link href="/" className="group">
          <div className="text-white tracking-[0.4em] font-bold text-[12px] uppercase transition-colors group-hover:text-zinc-400">
            Archive
          </div>
          <div className="text-zinc-600 text-[8px] tracking-[0.2em] uppercase mt-1">
            Digital_Asset_Registry
          </div>
        </Link>
      </div>


      <nav className="flex-1 px-4 mt-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-sm transition-all duration-300 group ${
                  isActive 
                    ? "bg-zinc-900 text-white" 
                    : "text-zinc-500 hover:bg-zinc-900/40 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={15} strokeWidth={isActive ? 1.5 : 1} />
                  <span className="text-[11px] uppercase tracking-[0.15em] font-medium">
                    {item.name}
                  </span>
                </div>
                {isActive && <div className="w-1 h-1 bg-white rounded-full" />}
              </Link>
            );
          })}
        </div>

        <div className="mt-16 px-4">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[9px] text-zinc-600 uppercase tracking-[0.3em] font-bold">
              Index
            </span>
            <div className="h-[1px] flex-1 ml-4 bg-zinc-900" />
          </div>
          
          <div className="flex flex-col gap-4">
            {["Design_Systems", "Backend_Core", "Visual_Assets"].map((tag, idx) => (
              <button 
                key={tag} 
                className="group flex items-center justify-between text-[10px] text-zinc-500 hover:text-white transition-colors uppercase tracking-widest text-left"
              >
                <span>{tag.replace('_', ' ')}</span>
                <span className="text-[8px] text-zinc-800 group-hover:text-zinc-600 font-mono">
                    (0{idx + 1})
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-8 border-t border-zinc-900 bg-[#080808]">
        <div className="flex items-center justify-between group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-900/50 group-hover:border-zinc-500 transition-colors">
              <User size={14} className="text-zinc-400 group-hover:text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-200 font-bold tracking-wider uppercase">User_Admin</span>
              <span className="text-[8px] text-zinc-600 tracking-tighter uppercase font-mono">Stockholm_HQ</span>
            </div>
          </div>
          <Settings size={12} className="text-zinc-700 hover:text-white transition-colors" />
        </div>
      </div>
    </aside>
  );
}