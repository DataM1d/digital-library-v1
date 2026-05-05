"use client";

import { use } from "react";
import { usePostDetail } from "@/hooks/usePostDetail";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Loader2, ShieldAlert, Share2 } from "lucide-react";

export default function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { post, loading, error, toggleLike } = usePostDetail(slug);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-800" />
          <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-600">Retrieving_Data...</span>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] p-6">
        <ShieldAlert size={40} className="text-zinc-900 mb-4" />
        <h1 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-8">
          Err: Artifact_Not_Found
        </h1>
        <Link href="/" className="text-[9px] font-mono uppercase tracking-widest text-zinc-700 hover:text-white border border-zinc-900 px-6 py-3 transition-colors">
          Return_to_Registry
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-400 font-sans">
      <nav className="border-b border-zinc-900 px-8 py-6 flex items-center justify-between sticky top-0 bg-[#050505]/80 backdrop-blur-md z-50">
        <Link 
          href="/"
          className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Back_to_Collection
        </Link>
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleLike} 
            className={`flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest transition-colors ${post.user_has_liked ? 'text-white' : 'text-zinc-600 hover:text-zinc-300'}`}
          >
            <Heart size={14} className={post.user_has_liked ? "fill-white" : ""} />
            {post.like_count.toString().padStart(2, '0')}
          </button>
          <Share2 size={14} className="text-zinc-600 cursor-pointer hover:text-white" />
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 border-r border-zinc-900">
          <div className="relative aspect-[21/9] w-full bg-zinc-950 border-b border-zinc-900">
            {post.image_url && (
              <Image
                src={post.image_url}
                alt={post.alt_text || post.title}
                fill
                className="object-cover opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000"
                priority
              />
            )}
          </div>

          <div className="p-8 lg:p-16 max-w-4xl">
            <header className="mb-12">
               <div className="flex items-center gap-3 mb-6">
                 <span className="px-2 py-1 bg-zinc-900 text-zinc-500 text-[8px] font-mono uppercase tracking-widest">
                   {post.category_name}
                 </span>
                 <span className="text-zinc-800 text-[8px] font-mono uppercase">
                   Status: {post.status}
                 </span>
               </div>
               <h1 className="text-4xl lg:text-7xl font-bold tracking-tighter text-white uppercase leading-[0.9]">
                 {post.title}
               </h1>
            </header>

            <div className="prose prose-invert prose-zinc max-w-none">
              <p className="text-sm lg:text-base leading-relaxed text-zinc-500 font-medium whitespace-pre-wrap selection:bg-white selection:text-black">
                {post.content}
              </p>
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-80 p-8 flex flex-col gap-12 bg-[#080808]">
          <section>
            <h4 className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <div className="h-[1px] w-4 bg-zinc-800" />
              Technical_Specs
            </h4>
            <div className="space-y-6">
              <SpecItem label="Artifact_ID" value={`#${post.id.toString().slice(0, 8)}`} />
              <SpecItem label="Release_Date" value={new Date(post.created_at).toLocaleDateString("en-SE")} />
              <SpecItem label="Contributor_UID" value={post.created_by} />
              <SpecItem label="Category_Link" value={post.category_name} />
              <SpecItem label="Auth_Status" value="VERIFIED_ARCHIVE" color="text-emerald-500" />
            </div>
          </section>

          <section className="pt-12 border-t border-zinc-900">
            <h4 className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <div className="h-[1px] w-4 bg-zinc-800" />
              System_Logs
            </h4>
            <div className="bg-zinc-950 p-4 font-mono text-[9px] text-zinc-600 uppercase border border-zinc-900 space-y-1">
              <div>&gt; Accessing_Registry...</div>
              <div>&gt; Syncing_Artifact_{post.id.toString().slice(0, 4)}...</div>
              <div className="text-zinc-400">&gt; Finalizing_Render...</div>
              <div className="text-emerald-900/50">&gt; Status_Success</div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function SpecItem({ label, value, color = "text-zinc-300" }: { label: string, value: string, color?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">{label}</span>
      <span className={`text-[11px] font-mono uppercase tracking-tight ${color}`}>{value}</span>
    </div>
  );
}