"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2, CheckCircle } from "lucide-react";

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
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.pushManager) {
          reg.pushManager.getSubscription().then((sub) => {
            if (sub) setIsSubscribed(true);
          });
        }
      });
    }
  }, []);

  const subscribeToPush = async () => {
    setLoading(true);
    try {
      // 1. Force the browser to ask for permission FIRST
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Permission denied! Please click the lock icon in your URL bar and allow notifications.");
        setLoading(false);
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        alert("ERROR: VAPID Public Key is missing!");
        setLoading(false);
        return;
      }

      // 2. Safely get the Service Worker without hanging forever
      let registration = await navigator.serviceWorker.getRegistration();
      
      // If it's missing, force register it
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
      }

      if (!registration) {
        alert("ERROR: Service Worker could not be found.");
        setLoading(false);
        return;
      }

      // 3. Subscribe to Push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 4. Save to Database
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (res.ok) {
        setIsSubscribed(true);
        alert("Success! You will now receive notifications.");
      } else {
        const errorData = await res.json();
        alert(`DB ERROR: ${errorData.error}`);
      }
    } catch (error: any) {
      console.error("Push Subscription Error:", error);
      alert(`BROWSER ERROR: ${error.message}`);
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
