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
    <div className="group flex items-center gap-10 py-8 border-b border-zinc-200/50 hover:bg-white/40 transition-all duration-500 px-8">
      {/* Visual Preview */}
      <div className="relative w-32 h-20 bg-zinc-100 overflow-hidden rounded-sm border border-zinc-200/50 flex-shrink-0">
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          className="object-cover saturate-[0.2] group-hover:saturate-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
        />
      </div>

      {/* Primary Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-medium text-zinc-400">
            {post.id.slice(0, 8).toUpperCase()}
          </span>
          <span className="text-[10px] font-serif italic text-zinc-400">
            in
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
            {post.category_name || "General"}
          </span>
        </div>
        <h3 className="text-xl font-serif italic text-zinc-900 group-hover:text-zinc-600 transition-colors truncate leading-tight">
          {post.title}
        </h3>
      </div>

      {/* Fixed-width stat containers to prevent the "chaotic" alignment */}
      <div className="hidden xl:flex items-center gap-12 flex-shrink-0">
        <div className="w-20 text-right">
          <div className="flex items-center justify-end gap-2 text-zinc-900">
            <Heart size={14} strokeWidth={2.5} />
            <span className="text-xs font-bold font-mono">248</span>
          </div>
          <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 mt-1">
            Appreciation
          </p>
        </div>
        <div className="w-20 text-right">
          <div className="flex items-center justify-end gap-2 text-zinc-900">
            <MessageSquare size={14} strokeWidth={2.5} />
            <span className="text-xs font-bold font-mono">12</span>
          </div>
          <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 mt-1">
            Discussion
          </p>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-8 flex-shrink-0">
        <span
          className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border ${
            post.status === "published"
              ? "border-emerald-100 text-emerald-700 bg-emerald-50/50"
              : "border-zinc-200 text-zinc-400 bg-zinc-50"
          }`}
        >
          {post.status}
        </span>

        <div className="flex items-center gap-1">
          <Link
            href={`/admin/edit/${post.slug}`}
            className="p-3 hover:bg-zinc-900 hover:text-white rounded-full transition-all duration-300"
          >
            <MoreHorizontal size={18} />
          </Link>
          <button className="p-3 text-zinc-400 hover:text-zinc-900 transition-colors">
            <ArrowUpRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
