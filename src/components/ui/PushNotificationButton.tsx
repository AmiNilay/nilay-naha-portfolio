"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2, CheckCircle } from "lucide-react";

// Safely converts the VAPID key for the browser
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setIsSubscribed(true);
        });
      });
    }
  }, []);

  const subscribeToPush = async () => {
    setLoading(true);
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      // DEBUG CHECK 1: Is the key missing?
      if (!publicKey) {
        alert("ERROR: VAPID Public Key is missing! Vercel did not inject it.");
        setLoading(false);
        return;
      }

      // DEBUG CHECK 2: Is the key the wrong length? (Should be ~87 chars)
      if (publicKey.length < 80) {
        alert(`ERROR: VAPID Key seems broken or too short. Length: ${publicKey.length}`);
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      if (!registration) {
        alert("ERROR: Service Worker not ready.");
        setLoading(false);
        return;
      }

      // Attempt to subscribe
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Save to database
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (res.ok) {
        setIsSubscribed(true);
      } else {
        const errorData = await res.json();
        alert(`DB ERROR: ${errorData.error}`);
      }
    } catch (error: any) {
      console.error("Push Subscription Error:", error);
      alert(`BROWSER ERROR: ${error.message}\n\n(If this says 'push service error', your browser is blocking notifications. Try standard Chrome!)`);
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) return null;

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-bold border border-green-200 dark:border-green-800">
        <CheckCircle className="w-4 h-4" /> Notifications On
      </div>
    );
  }

  return (
    <button
      onClick={subscribeToPush}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-bold transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
      Get Notified
    </button>
  );
}
