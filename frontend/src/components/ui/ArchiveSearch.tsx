"use client"

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export function ArchiveSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("search") || "");
    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedQuery) {
            params.set("search", debouncedQuery);
        } else {
            params.delete("search");
        }
        router.push(`/?${params.toString()}`);
    }, [debouncedQuery, router, searchParams]);

    return (
    <div className="relative w-full max-w-lg group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
        <Search size={18} />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the archive..."
        className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl py-3 pl-12 pr-10 text-sm outline-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute inset-y-0 right-4 flex items-center text-zinc-400 hover:text-red-500 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
    )
}