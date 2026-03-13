"use client";

import { use, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Post } from "@/types";
import { PostEditor } from "@/components/admin/PostEditor";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [post, setPost] = useState<Post | null>(null);

    useEffect(() => {
        api.posts.slug(slug).then(setPost);
    }, [slug]);

    if (!post) {
      return (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="animate-spin text-zinc-300" size={32} />
        </div>
      );
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <Link 
              href="/admin" 
              className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors mb-8"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Back to Control Center
            </Link>

            <header className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">Edit Artifact</h1>
                <p className="text-zinc-500 mt-2">Modify the data or classification for <span className="text-zinc-900 dark:text-zinc-100 font-mono text-sm">{slug}</span></p>
            </header>
            
            <PostEditor post={post} isEditing={true} />
        </div>
    );
}