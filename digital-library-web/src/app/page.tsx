import { Activity, ShieldAlert, Terminal } from "lucide-react";
import { Hero } from "@/components/layout/hero/Hero";
import { ArtifactGrid } from "@/components/layout/ArtifactGrid";
import { TechFooter } from "@/components/layout/TechFotter";
import { GlobalGrid } from "@/components/layout/GlobalGrid";
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
      <main className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="relative flex flex-col items-center gap-8 group">
          <div className="absolute inset-0 bg-red-500/10 blur-[100px] rounded-full animate-pulse" />
          
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
            <ShieldAlert size={32} className="text-red-500" />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-[12px] font-black uppercase tracking-[0.8em] text-white">System_Link_Severed</h1>
            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Error_Code: 0x8004100E // Connection Timeout</p>
          </div>

          <button 
            className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-white hover:border-white/20 transition-all duration-500"
          >
            Re-Initialize Protocol
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#050505] overflow-hidden">
      <GlobalGrid />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="pt-12 pb-6 flex items-center justify-between opacity-20">
          <div className="flex items-center gap-4">
            <Terminal size={14} className="text-cyan-500" />
            <span className="text-[8px] font-mono uppercase tracking-[0.4em]">Node_Status: Online</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-zinc-800" />
            <span className="text-[8px] font-mono uppercase tracking-[0.4em]">Region: SE_STOCKHOLM</span>
          </div>
        </div>

        <Hero query={query} category={category} categories={categories} count={posts.length} />
        
        <div className="mt-24">
          <ArtifactGrid posts={posts} />
        </div>

        <TechFooter />
      </div>

      <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden 2xl:flex flex-col gap-12 opacity-20">
        <div className="[writing-mode:vertical-lr] rotate-180 text-[7px] font-black uppercase tracking-[1em] text-zinc-500">
          Data_Stream_Access
        </div>
        <div className="h-24 w-px bg-gradient-to-b from-transparent via-zinc-500 to-transparent mx-auto" />
      </div>
    </main>
  );
}