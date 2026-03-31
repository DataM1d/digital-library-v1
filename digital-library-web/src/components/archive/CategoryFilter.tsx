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
    <div className={`flex flex-wrap gap-2 mb-8 transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
      <FilterChip 
        label="All Artifacts" 
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
      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border
        ${disabled ? "cursor-wait opacity-70" : "cursor-pointer"}
        ${active 
          ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-md scale-105" 
          : "bg-transparent text-zinc-500 border-zinc-200 hover:border-zinc-800 dark:border-zinc-800 dark:hover:border-zinc-400"
        }`}
    >
      {label}
    </button>
  );
}