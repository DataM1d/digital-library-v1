import { ShieldAlert } from "lucide-react";
import { Hero } from "@/components/layout/hero/Hero";
import { ArtifactGrid } from "@/components/layout/ArtifactGrid";
import { TechFooter } from "@/components/layout/TechFotter";
import { getPosts, getCategories } from "@/lib/api";
import { Post, Category } from "@/types";

interface HomePageProps {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}

async function fetchWithTimeout<T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), timeoutMs)
  );
  return Promise.race([promise, timeout]);
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { search: query = "", category = "", page = "1" } = await searchParams;

  let posts: Post[] = [];
  let categories: Category[] = [];
  let hasError = false;

  try {
    const [postsData, categoriesData] = await Promise.all([
      fetchWithTimeout(getPosts({ search: query, category, page: Number(page) })),
      fetchWithTimeout(getCategories()).catch(() => [])
    ]);
    posts = postsData?.data ?? [];
    categories = categoriesData ?? [];
  } catch (error) {
    hasError = true;
  }

  if (hasError) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <ShieldAlert size={32} className="text-zinc-900" />
          <div className="space-y-1">
            <h1 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-900">System Link Severed</h1>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Connection Timeout</p>
          </div>
          <button className="px-8 py-3 border border-zinc-200 text-[10px] font-bold uppercase tracking-widest hover:border-zinc-900 transition-all">
            Retry Protocol
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-zinc-900">
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-12 border-b border-zinc-200">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-xl">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400 block mb-4">Repository_01</span>
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight uppercase leading-[0.9]">
              Digital<br />Archive
            </h1>
          </div>
          <div className="flex flex-col gap-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Archive_Status: Active</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Node: Stockholm_HQ</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <Hero query={query} category={category} categories={categories} count={posts.length} />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="flex items-center justify-between mb-8 border-t border-zinc-900 pt-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Recent_Artifacts</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">{posts.length} Total</span>
        </div>
        <ArtifactGrid posts={posts} />
      </section>

      <footer className="mx-auto max-w-7xl px-6 py-12 border-t border-zinc-200">
        <TechFooter />
      </footer>
    </main>
  );
}