export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAFAFA]/90 dark:bg-[#0B0F14]/90 backdrop-blur-3xl">
      {/* Apple Ambient Specular Radial Light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center"
      >
        <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#0F766E]/15 via-transparent to-[#F59E0B]/10 blur-[120px] dark:opacity-60" />
      </div>

      {/* Floating Apple Glassmorphic Card */}
      <div className="relative z-10 flex flex-col items-center px-8 py-7 rounded-3xl bg-white/70 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] border-t-white/90 dark:border-t-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
        {/* Monogram Badge */}
        <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] dark:from-[#F59E0B] dark:to-[#FBBF24] flex items-center justify-center text-white dark:text-[#0B0F14] font-black text-xl shadow-[0_4px_16px_rgba(15,118,110,0.3)] dark:shadow-[0_4px_16px_rgba(245,158,11,0.35)]">
          N
        </div>

        {/* Brand Label with Apple Optical Letter Spacing */}
        <h2 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-0.5">
          Nilay Naha<span className="text-[#0F766E] dark:text-[#F59E0B]">.</span>
        </h2>
        <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mt-0.5 mb-5 tracking-tight">
          Software Engineer
        </p>

        {/* Apple Fluid Pill Progress Indicator */}
        <div className="w-40 h-1.5 bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 w-2/5 bg-gradient-to-r from-transparent via-[#0F766E] to-[#0F766E] dark:via-[#F59E0B] dark:to-[#FBBF24] rounded-full animate-apple-shimmer shadow-[0_0_10px_rgba(15,118,110,0.5)] dark:shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
        </div>
      </div>
    </div>
  );
}
