"use client";

import { use } from "react";
import { PostEditor } from "@/components/admin/PostEditor";
import { usePostDetail } from "@/hooks/usePostDetail";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { post, loading, error } = usePostDetail(slug);

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <Link 
        href="/admin" 
        className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        Back to Control Center
      </Link>

      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-tighter ext-zinc-900 dark:text-white uppercase">
          Modify Artifact
        </h1>
        <p className="text-zinc-500 mt-2 font-medium">
          Updating record for: <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md">{slug}</span>
        </p>
      </header>

      {loading ? (
        <div className="relative overflow-hidden flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[3rem]">
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-zinc-50/50 to-transparent dark:via-zinc-800/20 animate-scan pointer-events-none" />
          <Loader2 className="h-8 w-8 animate-spin text-zinc-300 mb-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
            Accessing Archive Records...
          </span>
        </div>
      ) : error || !post ? (
        <div className="flex flex-col items-center justify-center py-32 bg-red-50/50 dark:bg-red-900/5 border border-red-100 dark:border-red-900/20 rounded-[3rem]">
          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
          <h2 className="text-lg font-bold text-red-900 dark:text-red-400">Data Retrieval Failed</h2>
          <p className="text-sm text-red-600/70 dark:text-red-400/60 mt-1">{error || "Record not found"}</p>
          <Link href="/admin" className="mt-6 text-xs font-black uppercase underline underline-offset-4">
            Return to Safety
          </Link>
        </div>
      ) : (
        <PostEditor post={post} isEditing={true} />
      )}
    </div>
  )
}