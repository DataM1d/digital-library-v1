"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Critical UI Error:", error);
    }, [error]);

    return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 rounded-full bg-red-50 p-4 dark:bg-red-900/20">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Archive Access Error</h2>
      <p className="mt-2 text-sm text-zinc-500 max-w-xs">
        We encountered a problem retrieving the data. This might be a temporary connection issue.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
      >
        <RotateCcw size={16} /> Try Again
      </button>
    </div>
  );
}