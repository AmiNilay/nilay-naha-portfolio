"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Toast from "@/components/ui/Toast";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function PushNotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [supportStatus, setSupportStatus] = useState<"checking" | "supported" | "unsupported">("checking");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setSupportStatus("supported");
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.pushManager.getSubscription().then((subscription) => {
              setIsSubscribed(!!subscription);
            });
          }
        });
      } else {
        setSupportStatus("unsupported");
      }
    }
  }, []);

  const subscribeToPush = async () => {
    setLoading(true);
    try {
      if (supportStatus === "unsupported") {
        throw new Error("Push notifications are not supported by your browser.");
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error("Notification permission denied.");
      }

      let registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        try {
          registration = await navigator.serviceWorker.register('/sw.js');
        } catch (err) {
          // Catch the 404 in dev mode
          throw new Error("Service Worker not found. (Note: Push notifications only work in Production/Vercel, not in npm run dev)");
        }
      }

      registration = await navigator.serviceWorker.ready;

      if (!registration) {
        throw new Error("Service Worker failed to initialize.");
      }

      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        throw new Error("VAPID public key is missing in environment variables.");
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (!res.ok) throw new Error("Failed to save subscription on server.");

      setIsSubscribed(true);
      setToast({ message: "Successfully subscribed to notifications!", type: "success" });
    } catch (error: any) {
      console.error("Push Subscription Error:", error);
      setToast({ message: error.message || "Failed to subscribe.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (supportStatus === "checking") return null;

  if (supportStatus === "unsupported") {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm bg-gray-200 text-gray-500 cursor-not-allowed">
        <AlertCircle className="w-4 h-4" /> Unsupported
      </button>
    );
  }

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-900/50 cursor-default">
        <CheckCircle2 className="w-4 h-4" /> Notifications On
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <button
        onClick={subscribeToPush}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
        Get Notified
      </button>
    </>
  );
}
