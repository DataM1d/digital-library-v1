"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MoreHorizontal,
  ArrowUpRight,
  MessageSquare,
  Heart,
  FileImage,
} from "lucide-react";
import { Post } from "@/types";

export function RegistryItem({ post }: { post: Post }) {
  const [imgError, setImgError] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const imageUrl = post.image_url?.startsWith("http")
    ? post.image_url
    : `${API_URL}${post.image_url || "/placeholder.jpg"}`;

  return (
    <div className="group flex items-start justify-between py-6 hover:bg-zinc-900/15 transition-all duration-300 pl-8 pr-6 last:border-0">
      <div className="w-[35%] min-w-0 pr-6 pt-1">
        <h3 className="text-lg font-serif text-zinc-200 group-hover:text-zinc-100 transition-colors truncate leading-snug tracking-wide">
          {post.title}
        </h3>
      </div>

      <div className="w-[25%] flex justify-center flex-shrink-0">
        <div className="relative w-44 h-24 bg-zinc-950/90 overflow-hidden rounded-xl border border-zinc-800/40 shadow-2xl flex items-center justify-center group-hover:border-zinc-700/50 transition-colors duration-300">
          {!imgError ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              priority
              onError={() => setImgError(true)}
              className="object-cover saturate-0 opacity-40 group-hover:saturate-100 group-hover:opacity-90 group-hover:scale-102 transition-all duration-500 ease-out"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 opacity-20 group-hover:opacity-40 transition-opacity">
              <FileImage
                size={18}
                className="text-zinc-400"
                strokeWidth={1.5}
              />
              <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">
                Missing_Asset
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent pointer-events-none" />
        </div>
      </div>

      <div className="w-[20%] flex items-start justify-center gap-6 flex-shrink-0 pt-1">
        <div className="flex flex-col items-center min-w-[55px]">
          <div className="flex items-center gap-2 text-zinc-300 group-hover:text-zinc-100 transition-colors">
            <Heart
              size={14}
              strokeWidth={2.5}
              className="text-zinc-500 group-hover:text-zinc-400 transition-colors"
            />
            <span className="text-sm font-bold font-mono tracking-tight">
              248
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1 font-mono">
            Likes
          </p>
        </div>
        <div className="flex flex-col items-center min-w-[55px]">
          <div className="flex items-center gap-2 text-zinc-300 group-hover:text-zinc-100 transition-colors">
            <MessageSquare
              size={14}
              strokeWidth={2.5}
              className="text-zinc-500 group-hover:text-zinc-400 transition-colors"
            />
            <span className="text-sm font-bold font-mono tracking-tight">
              12
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1 font-mono">
            Replies
          </p>
        </div>
      </div>

      <div className="w-[20%] flex items-center justify-end gap-5 flex-shrink-0 pt-1">
        <span
          className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-2.5 py-1 ${
            post.status === "published" ? "text-emerald-400" : "text-zinc-500"
          }`}
        >
          {post.status}
        </span>

        <div className="flex items-center gap-1">
          <Link
            href={`/admin/edit/${post.slug}`}
            className="p-2 text-zinc-500 hover:text-zinc-200 bg-transparent hover:bg-zinc-900/40 rounded-lg transition-all duration-200"
          >
            <MoreHorizontal size={15} />
          </Link>
          <button className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors">
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
