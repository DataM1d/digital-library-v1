import { PostComment as CommentType } from "@/types";
import { User } from "lucide-react";

interface CommentProps {
  comment: CommentType;
}

export function Comment({ comment }: CommentProps) {
    return (
        <div className="group flex flex-col space-y-3 border-l-2 border-zinc-100 pl-4 py-2 dark:border-zinc-800 transition-colors hover:border-zinc-200">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
                <div className="h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center dark:bg-zinc-800">
                    <User size={12} />
                </div>
                <span className="font-medium text-zinc-900 dark:text-white">
                    User #{comment.user_id}
                </span>
                <span>•</span>
                <span>{new Date(comment.created_at).toLocaleDateString()}</span>
            </div>

            <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                {comment.content}
            </p>

            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 space-y-4">
                    {comment.replies?.map((reply: CommentType) => (
                      <Comment key={reply.id} comment={reply} />
                    ))}
                </div>
            )}
        </div>
    )
}