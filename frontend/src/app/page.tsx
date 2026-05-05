import { Hero } from "@/components/registry/hero";
import { LibraryGrid } from "@/components/registry/LibraryGrid";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Hero />

      <section className="p-8 lg:p-12">
        <LibraryGrid />
      </section>
    </div>
  );
}