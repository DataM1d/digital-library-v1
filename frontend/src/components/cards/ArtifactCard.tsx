import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Post } from "@/types";

export function ArtifactCard({ post }: { post: Post }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const imageUrl = post.image_url?.startsWith("http")
    ? post.image_url
    : `${API_URL}${post.image_url || "/placeholder.jpg"}`;

  return (
    <div className="archive-item group cursor-crosshair">
      <Link href={`/entry/${post.slug}`}>
        <div className="surface-artifact p-4 space-y-6">
          <div className="relative aspect-4/5 overflow-hidden bg-[hsl(var(--surface-muted))] rounded-[var(--radius-xs)]">
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover saturate-[0.1] contrast-[1.1] group-hover:saturate-100 group-hover:scale-105 transition-all duration-1000 ease-[var(--ease-out-expo)]"
            />
          </div>

          <div className="px-2 pb-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="meta text-[9px] text-[hsl(var(--text-accent))]">
                {post.category_name || "Unclassified"}
              </span>
              <span className="meta text-[9px] opacity-30">
                REF_{post.id.slice(0, 4)}
              </span>
            </div>
            <h2 className="text-xl leading-tight group-hover:text-[hsl(var(--text-muted))] transition-colors">
              {post.title}
            </h2>
          </div>
        </div>
      </Link>
    </div>
  );
}
