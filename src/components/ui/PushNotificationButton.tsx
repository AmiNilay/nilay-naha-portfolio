"use client";

import { useState, useEffect } from "react";
import {
  BellRing,
  Loader2,
  CheckCircle,
  ShieldAlert,
  X,
  AlertTriangle,
} from "lucide-react";
import Toast from "./Toast";

type PermissionState =
  | "granted"
  | "denied"
  | "default"
  | "unsupported"
  | "no-sw";

interface BrowserInstructions {
  name: string;
  steps: string[];
}

function detectBrowser(): BrowserInstructions {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

  if (ua.includes("Firefox")) {
    return {
      name: "Firefox",
      steps: [
        "Click the lock icon (or shield icon) in the address bar on the left side of the URL.",
        'Find "Notifications" in the permissions list.',
        'Change it from "Block" to "Allow".',
        "Reload this page and try again.",
      ],
    };
  }

  if (ua.includes("Edg")) {
    return {
      name: "Microsoft Edge",
      steps: [
        "Click the lock icon in the address bar on the left side of the URL.",
        'Click "Permissions" or "Site permissions".',
        'Find "Notifications" and change it to "Allow".',
        "Reload this page and try again.",
      ],
    };
  }

  if (ua.includes("Brave")) {
    return {
      name: "Brave",
      steps: [
        "Click the lock icon in the address bar on the left side of the URL.",
        'Find "Notifications" in the site settings.',
        'Change it from "Block" to "Allow".',
        "Reload this page and try again.",
      ],
    };
  }

  return {
    name: "Chrome",
    steps: [
      "Click the lock icon (or tune icon) in the address bar on the left side of the URL.",
      'Find "Notifications" in the site settings.',
      'Change the dropdown from "Block" to "Allow".',
      "Reload this page and try again.",
    ],
  };
}

function getMobileInstructions(): string[] {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

  if (/iPad|iPhone|iPod/.test(ua)) {
    return [
      "Open the iOS Settings app.",
      'Scroll down and tap "Safari".',
      'Tap "Notifications".',
      'Find this website and enable "Allow Notifications".',
      "Return to this page and reload.",
    ];
  }

  if (/Android/.test(ua)) {
    return [
      "Open your phone's Settings app.",
      'Tap "Apps" (or "Apps & notifications").',
      "Find your browser (Chrome, Firefox, etc.) and tap it.",
      'Tap "Notifications" and make sure they are enabled.',
      "Return to this page and reload.",
    ];
  }

  return [];
}

/**
 * Gets the active service worker registration.
 * Checks existing registrations first (instant), then falls back to ready (waits).
 */
async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  // 1. Fast path: check if already registered
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing) return existing;

  // 2. Check all registrations (might be registered on a different scope)
  const all = await navigator.serviceWorker.getRegistrations();
  if (all.length > 0) return all[0];

  // 3. No service worker registered at all
  return null;
}

export default function PushNotificationButton() {
  const [permissionState, setPermissionState] =
    useState<PermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showDeniedHelp, setShowDeniedHelp] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    async function checkState() {
      // 1. Browser support check
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        setPermissionState("unsupported");
        return;
      }

      // 2. Check if service worker is registered
      const registration = await getServiceWorkerRegistration();
      if (!registration) {
        // No service worker found -- likely in dev mode
        setPermissionState("no-sw");
        return;
      }

      // 3. Check current notification permission
      const perm = Notification.permission as PermissionState;
      setPermissionState(perm);

      // 4. If already denied, prepare the help modal
      if (perm === "denied") {
        setShowDeniedHelp(true);
        return;
      }

      // 5. Check if already subscribed
      try {
        const subscription =
          await registration.pushManager.getSubscription();
        if (subscription) {
          setIsSubscribed(true);
          setPermissionState("granted");
          setTimeout(() => setIsHidden(true), 4000);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    }

    checkState();
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    setIsLoading(true);
    setToast(null);

    try {
      // Step 1: Browser support
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        throw new Error(
          "Push Notifications are not supported by this browser."
        );
      }

      // Step 2: Request permission first
      const permission = await Notification.requestPermission();
      setPermissionState(permission as PermissionState);

      if (permission === "denied") {
        setShowDeniedHelp(true);
        setIsLoading(false);
        return;
      }

      if (permission !== "granted") {
        setToast({
          message:
            "Notification permission was not granted. Please allow notifications to subscribe.",
          type: "error",
        });
        setIsLoading(false);
        return;
      }

      // Step 3: Get service worker registration (fast path)
      let registration = await getServiceWorkerRegistration();

      if (!registration) {
        // If no SW found, try waiting for ready (production deploy might
        // still be registering)
        try {
          registration = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise<never>((_, reject) =>
              setTimeout(
                () =>
                  reject(
                    new Error("timeout")
                  ),
                5000
              )
            ),
          ]);
        } catch {
          // Timed out -- no service worker available
          setPermissionState("no-sw");
          setIsLoading(false);
          return;
        }
      }

      if (!registration || !registration.pushManager) {
        setPermissionState("no-sw");
        setIsLoading(false);
        return;
      }

      // Step 4: Check VAPID key
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        throw new Error(
          "Push notification configuration is missing. Please contact the site owner."
        );
      }

      // Step 5: Subscribe
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      // Step 6: Save to backend (sends welcome notification)
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error || "Failed to save subscription on server."
        );
      }

      // Step 7: Success
      setIsSubscribed(true);
      setToast({
        message:
          "Notifications enabled! Check your browser for a welcome notification.",
        type: "success",
      });

      setTimeout(() => setIsHidden(true), 4000);
    } catch (error: any) {
      console.error("Push Subscription Error:", error);
      setToast({
        message:
          error.message || "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Hidden after successful subscription
  if (isHidden) return null;

  // Unsupported browser
  if (permissionState === "unsupported") return null;

  const isDenied = permissionState === "denied";
  const isNoSW = permissionState === "no-sw";
  const isMobile =
    typeof navigator !== "undefined" &&
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const browserInfo = !isMobile ? detectBrowser() : null;
  const mobileSteps = isMobile ? getMobileInstructions() : [];

  return (
    <div className="relative">
      {/* Denied Help Modal */}
      {isDenied && showDeniedHelp && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-6 bg-red-50 border-b border-red-100 flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-xl text-red-600 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-gray-900">
                  Notifications Are Blocked
                </h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  You previously blocked notifications for this site. Here is
                  how to re-enable them:
                </p>
              </div>
              <button
                onClick={() => setShowDeniedHelp(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                {isMobile
                  ? "Steps for your device"
                  : `Steps for ${browserInfo?.name || "your browser"}`}
              </p>
              <ol className="space-y-3">
                {(isMobile ? mobileSteps : browserInfo?.steps || []).map(
                  (step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 shrink-0 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-700 font-medium leading-relaxed">
                        {step}
                      </span>
                    </li>
                  )
                )}
              </ol>

              <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-800 font-medium">
                  After following the steps above, you must reload this page
                  for the changes to take effect.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowDeniedHelp(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Service Worker Info (dev mode or unregistered) */}
      {isNoSW && (
        <div className="px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-gray-500 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          Notifications unavailable
        </div>
      )}

      {/* Main Button (only shown if SW exists and not denied) */}
      {!isNoSW && (
        <button
          onClick={
            isDenied ? () => setShowDeniedHelp(true) : subscribeToPush
          }
          disabled={isLoading || (isSubscribed && !isDenied)}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 text-sm ${
            isDenied
              ? "bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 shadow-sm"
              : isSubscribed
                ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enabling...</span>
            </>
          ) : isDenied ? (
            <>
              <ShieldAlert className="w-4 h-4" />
              <span>Notifications Blocked</span>
            </>
          ) : isSubscribed ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Subscribed</span>
            </>
          ) : (
            <>
              <BellRing className="w-4 h-4" />
              <span>Get Notified</span>
            </>
          )}
        </button>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}