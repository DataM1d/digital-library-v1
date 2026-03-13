"use client";

import { use } from "react";
import { usePostDetail } from "@/hooks/usePostDetail";
import { CategoryPill } from "@/components/discovery/CategoryPill";
import { CommentSection } from "@/components/social/CommentSection";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Calendar, User, Loader2, Share2 } from "lucide-react";

export default function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { post, loading, error, likesCount, isLiked, toggleLike } = usePostDetail(slug);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-200 dark:text-zinc-800" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Retrieving Artifact</span>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-zinc-950 p-6 text-center">
        <h1 className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white mb-6">
          {error || "Artifact Data Corrupted or Missing"}
        </h1>
        <Link href="/" className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <ArrowLeft size={14} />
          Return to Archive
        </Link>
      </div>
    );
  }

  const imageUrl = post.image_url.startsWith("http") 
    ? post.image_url 
    : `${API_URL}${post.image_url}`;

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 pb-32 transition-colors">
      <nav className="mx-auto max-w-5xl px-6 py-10">
        <Link 
          href="/" 
          className="group inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Back to Collection
        </Link>
      </nav>

      <article className="mx-auto max-w-5xl px-6">
        <header className="space-y-8 mb-16">
          <div className="flex flex-wrap items-center gap-4">
            <CategoryPill name={post.category_name} />
            <span className="text-zinc-300 dark:text-zinc-800">|</span>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <Calendar size={14} />
              {new Date(post.created_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[0.9]">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-6 border-y border-zinc-100 py-6 dark:border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200/50 dark:border-zinc-800/50">
                <User size={18} className="text-zinc-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-400">Contributor</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">Collector #{post.created_by}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={toggleLike}
                className={`flex items-center gap-2 rounded-2xl border px-6 py-3 text-xs font-black uppercase tracking-widest transition-all transform active:scale-95 ${
                  isLiked 
                  ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20" 
                  : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-700"
                }`}
              >
                <Heart size={16} className={isLiked ? "fill-current" : ""} />
                {likesCount}
              </button>
              
              <button className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="relative aspect-16/9 w-full overflow-hidden rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-900 mb-20 shadow-2xl shadow-zinc-200/50 dark:shadow-none">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-1000 hover:scale-105"
            priority
          />
        </div>

        <div className="max-w-3xl mx-auto mb-32">
          <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none">
            <p className="text-xl leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-medium">
              {post.content}
            </p>
          </div>
        </div>

        <section className="max-w-3xl mx-auto border-t border-zinc-100 pt-20 dark:border-zinc-900">
          <div className="flex items-center gap-3 mb-12">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Archive Discussion</h3>
            <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-900" />
          </div>
          <CommentSection postSlug={slug} />
        </section>
      </article>
    </main>
  );
}