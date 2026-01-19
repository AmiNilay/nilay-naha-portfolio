export default function Loading() {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">Loading...</p>
        </div>
      </div>
    );
  }