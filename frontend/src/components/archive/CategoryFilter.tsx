"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory?: string;
}

export function CategoryFilter({ categories, activeCategory: propActiveCategory }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const activeCategory = propActiveCategory || searchParams.get("category") || "all";

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }

    params.delete("page");
    
    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className={`flex flex-wrap gap-3 mb-12 transition-all duration-500 ${isPending ? "opacity-40 grayscale" : "opacity-100"}`}>
      <FilterChip 
        label="All_Artifacts" 
        active={activeCategory === "all" || activeCategory === ""} 
        onClick={() => handleCategoryChange("all")} 
        disabled={isPending}
      />
      {categories.map((cat) => (
        <FilterChip
          key={cat.id}
          label={cat.name}
          active={activeCategory === cat.slug}
          onClick={() => handleCategoryChange(cat.slug)}
          disabled={isPending}
        />
      ))}
    </div>
  );
}

function FilterChip({ 
  label, 
  active, 
  onClick, 
  disabled 
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void; 
  disabled?: boolean 
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative group px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-500 border isolate
        ${disabled ? "cursor-wait" : "cursor-pointer"}
        ${active 
          ? "bg-white/5 text-cyan-400 border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.15)]" 
          : "bg-transparent text-zinc-600 border-white/5 hover:border-white/20 hover:text-zinc-300"
        }`}
    >
      {active && (
        <div className="absolute inset-0 bg-cyan-500/5 blur-md rounded-xl -z-10" />
      )}
      
      <div className="flex items-center gap-2">
        {active && <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />}
        {label.replace(" ", "_")}
      </div>

      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-cyan-500 transition-all duration-700 ${active ? "w-1/2" : "w-0"}`} />
    </button>
  );
}