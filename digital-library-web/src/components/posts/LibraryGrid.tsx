import { Post } from "@/types";
import { PostCard } from "./PostCard";

interface LibraryGridProps {
  posts?: Post[]; 
}

export function LibraryGrid({ posts = [] }: { posts?: Post[] }) {
  // 1. Check if posts exists and is an array
  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="p-20 border border-dashed border-zinc-300 text-center">
        <p className="mono-label">EMPTY_REGISTRY // NO_DATA_DETECTED</p>
      </div>
    );
  }

  return (
    <div className="archive-masonry w-full">
      {posts.map((post) => {
        // 2. Only render if the post object actually exists
        if (!post) return null;
        
        return (
          <PostCard 
            key={post.id || `temp-${Math.random()}`} 
            post={post} 
          />
        );
      })}
    </div>
  );
}