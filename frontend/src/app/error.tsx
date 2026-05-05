"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("ARCHIVE_SYSTEM_FAILURE:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 transition-colors">
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-ping rounded-full bg-red-500/10" />
        <div className="relative rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
      </div>

      <div className="max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
          System Integrity Compromised
        </h2>
        <p className="text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
          The requested data stream could not be reconciled. This may be a temporary synchronization failure in the archive layer.
        </p>
        
        {error.digest && (
          <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">
            ERR_DIGEST: {error.digest}
          </p>
        )}
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => reset()}
          className="group flex items-center gap-3 rounded-2xl bg-black px-8 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all shadow-xl shadow-black/10"
        >
          <RefreshCw size={16} className="transition-transform group-hover:rotate-180 duration-500" />
          Attempt Re-Sync
        </button>

        <Link
          href="/"
          className="flex items-center gap-3 rounded-2xl border border-zinc-200 px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white transition-all"
        >
          <Home size={16} />
          Return Base
        </Link>
      </div>
    </div>
  );
}