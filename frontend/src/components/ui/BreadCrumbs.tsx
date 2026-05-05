import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs({ current }: { current: string }) {
  return (
    <nav className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-8">
      <Link href="/" className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
        <Home size={14} />
        Discovery
      </Link>
      <ChevronRight size={12} />
      <span className="text-zinc-900 dark:text-zinc-100 font-semibold truncate max-w-50">
        {current}
      </span>
    </nav>
  );
}