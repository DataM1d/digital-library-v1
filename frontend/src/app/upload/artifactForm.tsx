export function ArtifactForm() {
  return (
    <form className="flex flex-col h-full">
      <div className="flex flex-col gap-6 flex-grow -mt-1.5">
        <div className="space-y-2">
          <label className="text-[14px] font-mono uppercase tracking-tight text-zinc-300">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full bg-zinc-450 border border-zinc-800 p-4 text-sm text-zinc-300 focus:border-zinc-500 outline-none transition-all  placeholder:text-zinc-400 mt-3"
            placeholder="e.g. Neon Horizon"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[14px] font-mono uppercase tracking-tight text-zinc-300">
            Description
          </label>
          <textarea
            rows={8}
            className="w-full bg-zinc-450 border border-zinc-800 p-4 text-sm text-zinc-300 focus:border-zinc-500 outline-none transition-all  resize-none placeholder:text-zinc-400 mt-3"
            placeholder="What is the story behind this artifact?"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[14px] font-mono uppercase tracking-tight text-zinc-300">
            Tags
          </label>
          <input
            className="w-full bg-zinc-450 border border-zinc-800 p-4 text-sm text-zinc-300 focus:border-zinc-500 outline-none transition-all  placeholder:text-zinc-400 mt-3"
            placeholder="cyberpunk, 3d, concept"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-transparent text-zinc-200 font-mono text-s uppercase tracking-wider hover:bg-zinc-1000 transition-all  font-bold mt-6 border-1 border-zinc-800 hover:border-zinc-400 hover:cursor-pointer"
      >
        Publish to Archive
      </button>
    </form>
  );
}
