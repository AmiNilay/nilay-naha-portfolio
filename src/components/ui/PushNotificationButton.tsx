"use client";

import { useState, useEffect } from "react";
import { BellRing, Loader2, CheckCircle } from "lucide-react";
import Toast from "./Toast";

const PUSH_SW_URL = "/push-sw.js";
const PUSH_SW_SCOPE = "/push/";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0));
};

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

/** Returns a human-readable reason push can't work here, or null if it can. */
function getUnsupportedReason(): string | null {
  if (!window.isSecureContext) return "Notifications need a secure (https) connection.";
  if (isIOS() && !isStandalone()) {
    return "On iPhone/iPad, tap Share → \"Add to Home Screen\", open the site from there, then tap the bell.";
  }
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return "This browser doesn't support push notifications.";
  }
  return null;
}

async function getPushRegistration() {
  const registration = await navigator.serviceWorker.register(PUSH_SW_URL, { scope: PUSH_SW_SCOPE });
  if (registration.active) return registration;

  // Wait for the freshly installed worker to activate before subscribing.
  const worker = registration.installing || registration.waiting;
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Service worker took too long to start.")), 10000);
    worker?.addEventListener("statechange", () => {
      if (worker.state === "activated") {
        clearTimeout(timeout);
        resolve();
      }
    });
    if (!worker) {
      clearTimeout(timeout);
      resolve();
    }
  });
  return registration;
}

export default function PushNotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    if (getUnsupportedReason()) return;
    navigator.serviceWorker
      .getRegistration(PUSH_SW_SCOPE)
      .then((reg) => reg?.pushManager.getSubscription())
      .then((sub) => {
        if (sub) setIsHidden(true);
      })
      .catch(() => {});
  }, []);

  const subscribeToPush = async () => {
    const unsupported = getUnsupportedReason();
    if (unsupported) {
      setToast({ message: unsupported, type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) throw new Error("Notifications aren't configured on the server yet.");

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error(
          permission === "denied"
            ? "Notifications are blocked. Allow them in your browser's site settings, then try again."
            : "Notification permission was dismissed."
        );
      }

      const registration = await getPushRegistration();
      const subscription =
        (await registration.pushManager.getSubscription()) ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        }));

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      if (!res.ok) throw new Error("Couldn't save your subscription. Please try again.");

      setIsSubscribed(true);
      setToast({ message: "You're subscribed! You'll be notified about new posts and projects.", type: "success" });
      setTimeout(() => setIsHidden(true), 3000);
    } catch (error: any) {
      console.error("Push Subscription Error:", error);
      setToast({ message: error?.message || "Failed to subscribe.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const toastEl = toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />;
  if (isHidden) return toastEl || null;

  const label = isSubscribed ? "Subscribed" : "Get Notified";

  return (
    <>
      <button
        onClick={subscribeToPush}
        disabled={isLoading || isSubscribed}
        aria-label={label}
        title={label}
        className={`flex items-center justify-center gap-2 h-9 w-9 sm:w-auto sm:px-4 rounded-full font-semibold transition-all duration-300 text-sm shrink-0 ${
          isSubscribed
            ? "bg-yellow-400 text-yellow-900 cursor-default shadow-lg"
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-95"
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSubscribed ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <BellRing className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">{label}</span>
      </button>

      {toastEl}
    </>
  );
}
