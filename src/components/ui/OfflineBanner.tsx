"use client";

import { useState, useEffect } from "react";
import { WifiOff, X, RefreshCw } from "lucide-react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    // Set initial state
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setIsDismissed(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setIsReconnecting(true);
      // Auto-hide the "back online" message after 3 seconds
      setTimeout(() => setIsReconnecting(false), 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Don't render anything if online and not reconnecting
  if (!isOffline && !isReconnecting) return null;

  // "Back online" success banner
  if (isReconnecting && !isOffline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-green-600 text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-bold shadow-lg animate-slideDown">
        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span>Connection restored. Syncing data...</span>
      </div>
    );
  }

  // Offline banner (dismissible)
  if (isOffline && !isDismissed) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between gap-3 text-sm font-bold shadow-lg animate-slideDown">
        <div className="flex items-center gap-3">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            You are offline. Browsing cached content -- the site still works.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.location.reload()}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Retry connection"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}