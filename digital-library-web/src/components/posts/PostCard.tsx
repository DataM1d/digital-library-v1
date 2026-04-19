"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Blurhash } from "react-blurhash";
import { useBlurLoad } from "@/hooks/useBlurLoad";
import { Post } from "@/types";
import { Heart, MessageCircle, ShieldCheck } from "lucide-react";

interface PostCardProps {
  post: Post;
  priority?: boolean;
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const { isLoaded, handleLoad, imageClassName } = useBlurLoad();

  // 1. CRITICAL: Prevent crash if post is missing from a Zod failure
  if (!post) return null;

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
  
  // 2. SAFE URL RESOLUTION: Handle missing image_url
  const rawUrl = post.image_url || ""; 
  const imageUrl = rawUrl.startsWith("http")
    ? rawUrl
    : `${backendUrl}${rawUrl}`;

  // 3. SAFE STRING CONVERSION: Handle missing or numeric IDs
  const displayId = post.id !== undefined 
    ? post.id.toString().padStart(4, "0") 
    : "0000";

  // 4. SAFE DATE HANDLING
  const postYear = post.created_at 
    ? new Date(post.created_at).getFullYear() 
    : new Date().getFullYear();

  return (
    <div className="masonry-item">
      <Link 
        href={`/posts/${post.slug || "#"}`} 
        className="industrial-card archive-stack group block overflow-hidden"
      >
        <div className="meta-header">
          <div className="flex items-center gap-2">
            <div className={`status-dot ${post.status === 'published' ? 'status-active' : 'status-draft'}`} />
            <span className="mono-label text-zinc-900">
              REF_{displayId}
            </span>
          </div>
          <div className="data-field uppercase">
            {post.status || "UNKNOWN"} // {postYear}
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden border-b border-zinc-900 bg-zinc-200">
          {post.blur_hash && !isLoaded && (
            <div className="absolute inset-0 z-10">
              <Blurhash
                hash={post.blur_hash}
                width="100%"
                height="100%"
                resolutionX={32}
                resolutionY={32}
                punch={1}
              />
            </div>
          )}

          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={post.alt_text || post.title || "Archive Image"}
              fill
              priority={priority}
              onLoad={handleLoad}
              className={`object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105 ${imageClassName} ${
                !isLoaded ? "opacity-0" : "opacity-100"
              }`}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-400 mono-label">
              NO_IMAGE_DATA
            </div>
          )}
          
          <div className="absolute top-3 right-3 z-20">
             <div className="inverted-box opacity-0 group-hover:opacity-100 transition-opacity">
                VIEW_RECORD
             </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <span className="mono-label text-zinc-400">
              {post.category_name || "GENERAL_ARCHIVE"}
            </span>
            <h3 className="text-lg font-medium leading-tight text-zinc-900 uppercase tracking-tight line-clamp-1">
              {post.title || "UNTITLED_ARTIFACT"}
            </h3>
          </div>

          <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-500 uppercase tracking-tight text-justify">
            {post.meta_description || post.content || "NO_DESCRIPTION_AVAILABLE"}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-zinc-200 bg-zinc-50/50 p-3">
          <div className="flex items-center gap-4">
            <div className="data-field flex items-center gap-1.5">
              <Heart 
                size={12} 
                className={post.user_has_liked ? "fill-red-500 text-red-500" : "text-zinc-400"} 
              />
              <span className={`text-[10px] font-mono ${post.user_has_liked ? "text-red-600" : "text-zinc-600"}`}>
                {post.like_count || 0}
              </span>
            </div>
            <div className="data-field flex items-center gap-1.5">
              <MessageCircle size={12} className="text-zinc-400" />
              <span className="text-[10px] font-mono text-zinc-600">
                {post.comment_count || 0}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
             <ShieldCheck size={10} className="text-zinc-400" />
             <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-tighter">verified_entry</span>
          </div>
        </div>
      </Link>
    </div>
  );
}