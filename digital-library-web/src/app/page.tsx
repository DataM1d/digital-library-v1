import { Archive } from "lucide-react";
import { PostCard } from "@/components/posts/PostCard";
import { SearchBar } from "@/components/discovery/SearchBar";
import { CategoryFilter } from "@/components/archive/CategoryFilter";
import { getPosts, getCategories } from "@/lib/api";
import { Post } from "@/types";
interface HomePageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;

  const query = resolvedParams.search || "";
  const category = resolvedParams.category || "";
  const page = Number(resolvedParams.page) || 1;

  const [postsResponse, categories] = await Promise.all([
    getPosts({ search: query, category, page }),
    getCategories().catch(() => [])
  ]);

  const posts: Post[] = postsResponse.data || [];

  return (
<main className="min-h-screen px-6 py-20 transition-colors">
      <div className="mx-auto max-w-7xl">
        <header className="mb-16 flex flex-col items-center text-center space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <Archive size={24} className="text-zinc-900 dark:text-zinc-100" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white sm:text-6xl">
                The Digital Archive
              </h1>
              <p className="mx-auto max-w-md text-sm font-medium uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                Curated Discoveries & Artifacts
              </p>
            </div>
          </div>
          
          <div className="w-full max-w-2xl space-y-6">
            <SearchBar defaultValue={query} />
            <CategoryFilter categories={categories} />
          </div>
        </header>

        <section className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {posts.length > 0 ? (
            posts.map((post: Post, index: number) => (
              <PostCard 
                key={post.id} 
                post={post} 
                priority={index < 3} 
              />
            ))
          ) : (
            <div className="col-span-full py-40 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[3rem]">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
                {query ? `No results for "${query}"` : "The archive is currently empty"}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}