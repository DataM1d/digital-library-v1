"use client";

import { usePosts } from "@/hooks/usePosts";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { Plus, ExternalLink, Pencil, Trash2, Loader2, FileText, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Post } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function AdminDashboard() {
  const { posts, isLoading, searchQuery, setSearchQuery, deletePost } = usePosts();

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Archive Control</h1>
          <p className="text-zinc-500 mt-1">Manage your digital collection and taxonomy.</p>
        </div>
        <Link 
          href="/admin/create" 
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg"
        >
          <Plus size={20} />
          New Artifact
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <FileText size={16} />
              Stored Artifacts ({posts.length})
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text"
                placeholder="Search archive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none w-full sm:w-64"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex py-20 justify-center">
              <Loader2 className="animate-spin text-zinc-300" />
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <ArtifactRow 
                  key={post.id} 
                  post={post} 
                  onDelete={() => {
                    if (confirm("Purge this artifact?")) deletePost(post.id);
                  }} 
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <CategoryManager />
        </div>
      </div>
    </div>
  );
}

function ArtifactRow({ post, onDelete }: { post: Post; onDelete: () => void }) {
  const imageUrl = post.image_url?.startsWith("http") 
    ? post.image_url 
    : `${API_URL}${post.image_url || "/placeholder.jpg"}`;

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl group hover:border-zinc-400 dark:hover:border-zinc-600 transition-all">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative border border-zinc-100 dark:border-zinc-700">
          <Image 
            src={imageUrl} 
            alt={post.title}
            fill
            sizes="56px"
            className="object-cover transition-transform group-hover:scale-110"
          />
        </div>
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{post.title}</h3>
          <p className="text-xs font-mono text-zinc-500 uppercase">{post.slug}</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Link href={`/posts/${post.slug}`} target="_blank" className="p-2 text-zinc-400 hover:text-black dark:hover:text-white">
          <ExternalLink size={18} />
        </Link>
        <Link href={`/admin/edit/${post.slug}`} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
          <Pencil size={18} />
        </Link>
        <button onClick={onDelete} className="p-2 text-zinc-400 hover:text-red-500">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}