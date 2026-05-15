"use client";

import { PostEditor } from "@/app/admin/PostEditor";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Post } from "@/types";

export default function CreatePostPage() {
  const emptyPost: Post = {
    id: "",
    title: "",
    slug: "",
    content: "",
    image_url: "",
    category_id: "",
    category_name: "",
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: "",
    last_modified_by: "",
    like_count: 0,
    tags: [],
    alt_text: "",
    blur_hash: "",
    user_has_liked: false,
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <Link
        href="/admin"
        className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors mb-8"
      >
        <ArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-1"
        />
        Back to Control Center
      </Link>

      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          New Artifact
        </h1>
        <p className="text-zinc-500 mt-2">
          Document a new entry into the digital archive.
        </p>
      </header>

      <PostEditor post={emptyPost} isEditing={false} />
    </div>
  );
}
