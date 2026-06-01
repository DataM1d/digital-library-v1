export function ArtifactForm() {
  return (
    <form className="flex flex-col h-full">
      <div className="flex flex-col gap-5 flex-grow -mt-2">
        <div className="space-y-2">
          <label className="text-[14px] font-mono uppercase tracking-tight text-zinc-500">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full bg-zinc-450 border border-zinc-800 p-4 text-sm text-zinc-300 focus:border-zinc-500 outline-none transition-all rounded-l placeholder:text-zinc-500 mt-2"
            placeholder="e.g. Neon Horizon"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[14px] font-mono uppercase tracking-tight text-zinc-500 pl-0.4">
            Description
          </label>
          <textarea
            rows={6}
            className="w-full bg-zinc-450 border border-zinc-800 p-4 text-sm text-zinc-300 focus:border-zinc-500 outline-none transition-all rounded-l resize-none placeholder:text-zinc-500 mt-2"
            placeholder="What is the story behind this artifact?"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[14px] font-mono uppercase tracking-tight text-zinc-500">
            Tags
          </label>
          <input
            className="w-full bg-zinc-450 border border-zinc-800 p-4 text-sm text-zinc-300 focus:border-zinc-500 outline-none transition-all rounded-l placeholder:text-zinc-500 mt-2"
            placeholder="cyberpunk, 3d, concept"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-transparent text-zinc-200 font-mono text-s uppercase tracking-widest hover:bg-zinc-1000 transition-all rounded-xl font-bold mt-6 border-1 border-zinc-800 hover:border-zinc-600"
      >
        Publish to Archive
      </button>
    </form>
  );
}
