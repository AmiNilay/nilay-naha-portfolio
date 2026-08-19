export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAFBFC] dark:bg-gray-950">
      <div className="relative flex flex-col items-center">
        {/* Glowing background blur (matches your Hero section) */}
        <div className="absolute inset-0 -z-10 blur-[60px] opacity-60 dark:opacity-30 flex justify-center items-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-200 via-fuchsia-100 to-pink-100 dark:from-blue-900 dark:via-fuchsia-900 dark:to-pink-900 animate-pulse" />
        </div>
        
        {/* Logo Text */}
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#111827] dark:text-white mb-6 flex items-center gap-1">
          Dev<span className="text-teal-600 dark:text-teal-500">.Portfolio</span>
        </h2>
        
        {/* Premium Animated Loading Bar */}
        <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-1/2 bg-[#111827] dark:bg-white rounded-full animate-custom-loading" />
        </div>
      </div>
      
      {/* Custom CSS Animation for the loading bar */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes custom-loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-custom-loading {
          animation: custom-loading 1.5s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
