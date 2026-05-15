export function HeaderBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Rule 1: The Technical Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--surface)) 1px, transparent 1px),
                            linear-gradient(to bottom, hsl(var(--surface)) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Rule 2: The Large Geometric "Asset" Indicator */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full border border-[hsl(var(--surface))] opacity-[0.02] blur-sm" />

      {/* Rule 3: Subtle Radial Gradient to focus the center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,hsl(var(--background))_100%)] opacity-60" />

      {/* Rule 4: Grain/Noise overlay (Optional if you have a noise SVG or CSS filter) */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay brightness-100 contrast-150"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
