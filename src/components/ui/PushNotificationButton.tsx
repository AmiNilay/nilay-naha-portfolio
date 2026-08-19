"use client";

import { useState, useEffect } from "react";
import { BellRing, Loader2, CheckCircle } from "lucide-react";
import Toast from "./Toast";

export default function PushNotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // Check if the user is already subscribed when the page loads
    async function checkSubscription() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setIsSubscribed(true);
          setIsHidden(true); // Vanish immediately if already subscribed
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    }
    checkSubscription();
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    setIsLoading(true);
    try {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service Worker not supported in this browser.");
      }

      const registration = await navigator.serviceWorker.ready;
      if (!registration.pushManager) {
        throw new Error("Push Notifications are not supported by your browser.");
      }

      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        throw new Error("VAPID public key is missing.");
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      // Send subscription to your backend
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (!res.ok) throw new Error("Failed to save subscription on server.");

      // Change to Yellow "Subscribed" state
      setIsSubscribed(true);
      setToast({ message: "Successfully subscribed to notifications!", type: "success" });

      // Vanish completely after 3 seconds to keep the UI clean
      setTimeout(() => {
        setIsHidden(true);
      }, 3000);

    } catch (error: any) {
      console.error("Push Subscription Error:", error);
      setToast({ message: error.message || "Failed to subscribe.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // If hidden, render nothing (vanishes from the navbar)
  if (isHidden) return null;

  return (
    <>
      <button
        onClick={subscribeToPush}
        disabled={isLoading || isSubscribed}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-500 text-sm ${
          isSubscribed
            ? "bg-yellow-400 text-yellow-900 cursor-default scale-105 shadow-lg"
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSubscribed ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Subscribed
          </>
        ) : (
          <>
            <BellRing className="w-4 h-4" />
            Get Notified
          </>
        )}
      </button>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
