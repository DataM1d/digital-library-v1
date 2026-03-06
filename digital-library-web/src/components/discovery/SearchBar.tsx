"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react"; // npm install lucide-react if needed

export function SearchBar({ onSearch }: { onSearch: (val: string) => void }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="relative w-full max-w-xl">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
        <Search size={18} />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for archives, titles, or authors..."
        className="block w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
      />
    </div>
  );
}