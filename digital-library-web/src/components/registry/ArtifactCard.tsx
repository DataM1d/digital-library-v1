"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, FileCode, ImageIcon } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  category_name?: string;
  created_at: string;
  image_url?: string;
}

export function ArtifactCard({ post, index }: { post: Post; index: number }) {
  const refNumber = (index + 1).toString().padStart(4, "0");

  return (
    <Link 
      href={`/posts/${post.slug}`}
      className="group relative flex flex-col border border-zinc-900 bg-[#09090b] transition-all duration-500 hover:border-zinc-500 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-900 bg-zinc-950 transition-colors group-hover:bg-zinc-900">
        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-white transition-colors">
          REF_{refNumber}
        </span>
        <div className="flex items-center gap-2">
           <span className="text-[8px] font-mono text-zinc-800 uppercase tracking-tighter">
            {post.category_name || "STATIC_ASSET"}
          </span>
          <FileCode size={10} className="text-zinc-800 group-hover:text-zinc-400" />
        </div>
      </div>

      <div className="relative aspect-video w-full bg-zinc-950 border-b border-zinc-900 overflow-hidden">
        {post.image_url ? (
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ease-in-out scale-105 group-hover:scale-100"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center border-zinc-900/50">
             <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-[1px] bg-zinc-900 group-hover:bg-zinc-700" />
                <span className="text-[8px] font-mono text-zinc-800 uppercase tracking-[0.4em]">No_Preview</span>
             </div>
          </div>
        )}
        
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <ArrowUpRight size={14} className="text-white" />
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="text-[13px] font-bold text-zinc-400 group-hover:text-white uppercase leading-tight tracking-wide transition-colors">
            {post.title}
          </h3>
          <p className="text-[9px] text-zinc-700 font-mono uppercase line-clamp-1">
             Status: Released // Rev_0{index % 3}
          </p>
        </div>

        <div className="mt-6 flex items-center gap-4">
           <div className="h-0.5 w-4 bg-zinc-800 group-hover:w-full group-hover:bg-zinc-500 transition-all duration-700" />
        </div>
      </div>
    </Link>
  );
}