export function ArchiveHeader() {
  return (
    <header className="mb-32 pt-48 px-8 lg:px-16 w-full">
      <div className="max-w-[1400px] mx-auto">
        {/* Adjusted size to 80px max so it stays elegant and not "massive" */}
        <h1 className="text-[clamp(48px,6vw,80px)] leading-[1.1] tracking-[-0.03em] font-serif font-light">
          {/* Line 1: Anchored Left */}
          <span className="block text-[hsl(var(--text-soft))] opacity-30 italic">
            A collection of
          </span>

          {/* Line 2: Indented/Staggered to the middle */}
          <span className="block text-[hsl(var(--surface))] drop-shadow-sm py-2 pl-[15%] lg:pl-[25%]">
            digital artifacts
          </span>

          {/* Line 3: Anchored Left again */}
          <span className="block italic text-[hsl(var(--text-primary))] opacity-80">
            & fragments.
          </span>
        </h1>

        {/* The 15% opacity divider line */}
        <div className="mt-32 w-full h-[1px] bg-[hsl(var(--surface))] opacity-[0.85]" />
      </div>
    </header>
  );
}
