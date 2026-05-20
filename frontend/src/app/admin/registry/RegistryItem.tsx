"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MoreHorizontal,
  ArrowUpRight,
  MessageSquare,
  Heart,
} from "lucide-react";
import { Post } from "@/types";

export function RegistryItem({ post }: { post: Post }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const imageUrl = post.image_url?.startsWith("http")
    ? post.image_url
    : `${API_URL}${post.image_url || "/placeholder.jpg"}`;

  return (
    <div className="group flex items-center gap-8 py-6 border-b border-zinc-800/40 hover:bg-zinc-900/10 transition-all duration-500 px-8">
      <div className="relative w-32 h-20 bg-zinc-950/50 overflow-hidden rounded-xl border border-zinc-800/60 flex-shrink-0 shadow-[0_0_16px_rgba(0,0,0,0.4)]">
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          className="object-cover saturate-[0.1] group-hover:saturate-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-wider">
            {post.id.slice(0, 8).toUpperCase()}
          </span>
          <span className="text-[10px] font-serif italic text-zinc-500">
            in
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 font-mono">
            {post.category_name || "General"}
          </span>
        </div>
        <h3 className="text-xl font-serif italic text-zinc-100 group-hover:text-white transition-colors truncate leading-tight">
          {post.title}
        </h3>
      </div>

      <div className="hidden xl:flex items-center gap-8 flex-shrink-0">
        <div className="w-24 text-right">
          <div className="flex items-center justify-end gap-2 text-zinc-200">
            <Heart size={14} strokeWidth={2} className="text-zinc-400" />
            <span className="text-xs font-bold font-mono">248</span>
          </div>
          <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 mt-1 font-mono">
            Appreciation
          </p>
        </div>
        <div className="w-24 text-right">
          <div className="flex items-center justify-end gap-2 text-zinc-200">
            <MessageSquare
              size={14}
              strokeWidth={2}
              className="text-zinc-400"
            />
            <span className="text-xs font-bold font-mono">12</span>
          </div>
          <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 mt-1 font-mono">
            Discussion
          </p>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-6 flex-shrink-0">
        <span
          className={`text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border font-mono ${
            post.status === "published"
              ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
              : "border-zinc-800 text-zinc-500 bg-transparent"
          }`}
        >
          {post.status}
        </span>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/edit/${post.slug}`}
            className="p-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 border border-transparent hover:border-zinc-700/40 rounded-full transition-all duration-300"
          >
            <MoreHorizontal size={18} />
          </Link>
          <button className="p-3 text-zinc-400 hover:text-zinc-100 transition-colors">
            <ArrowUpRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
