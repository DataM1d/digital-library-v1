import Image from "next/image";
import Link from "next/link";
import { Post } from "@/types";
import { CategoryPill } from "./CategoryPill";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function PostCard({ post }: { post: Post }) {
    const imageUrl = post.image_url.startsWith("http") 
    ? post.image_url 
    : `${API_URL}${post.image_url}`;
    return (
    <Link href={`/posts/${post.slug}`} className="group flex flex-col space-y-3">
      <div className="relative aspect-16/10 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <CategoryPill name={post.category_name} />
          <span className="text-xs text-zinc-500 font-medium">❤️ {post.like_count}</span>
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:underline decoration-2 underline-offset-4">{post.title}</h3>
        <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {post.content}
        </p>
      </div>
    </Link>
    );
}