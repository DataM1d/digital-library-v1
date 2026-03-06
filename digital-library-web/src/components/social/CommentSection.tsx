"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PostComment } from "@/types";
import { Comment as CommentItem } from "./Comment";
import { Send } from "lucide-react";

export function CommentSection({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
        try {
            const data = await api.comments.getByPost(postSlug);
            setComments(data);
        } catch (err) {
            console.error("Failed to load comments:", err);
        }
    };
    fetchComments();
  }, [postSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
        const created: PostComment = await api.comments.create(postSlug, newComment);
        setComments((prev: PostComment[]) => [created, ...prev]);
        setNewComment("");
    } catch (err) {
        alert("You must be logged in to comment.");
        console.error("Failed to create comment:", err);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add to the archive discussion..."
          className="w-full min-h-25 rounded-2xl border border-zinc-200 bg-white p-4 text-sm focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white outline-none transition-all resize-none"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newComment.trim()}
          className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:bg-zinc-300 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
        >
          {isSubmitting ? "Posting..." : <><Send size={14} /> Post</>}
        </button>
      </form>

      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <p className="text-sm text-zinc-500 text-center py-10">No thoughts archived yet. Be the first.</p>
        )}
      </div>
    </div>
  );
}