"use client";

import { useEffect, useState } from "react";
import { Bell, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

export default function PwaSection() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [pushConfigured, setPushConfigured] = useState(false);
  const [pushPublicKey, setPushPublicKey] = useState<string | null>(null);
  const [message, setMessage] = useState("Install the app to unlock native-feeling launch, share-targets, and delegated notifications.");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
    setPermission(Notification.permission);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    const setupPush = async () => {
      if (!("serviceWorker" in navigator)) {
        return;
      }

      try {
        const response = await fetch("/api/notifications/public-key", { cache: "no-store" });
        const data = await response.json();
        setPushConfigured(Boolean(data.configured));
        setPushPublicKey(data.publicKey || null);

        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          setSubscription(existingSubscription);
        }
      } catch (error) {
        console.error("Failed to initialize push notifications:", error);
      }
    };

    setupPush();

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      setMessage(
        isStandalone
          ? "PortfolioHub is already installed on this device."
          : "The install prompt is not available yet. Open the deployed site over HTTPS and interact with it once before installing."
      );
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setMessage(choice.outcome === "accepted" ? "Install prompt accepted." : "Install prompt dismissed.");
  };

  const ensureNotificationPermission = async () => {
    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);
    if (nextPermission !== "granted") {
      throw new Error("Notification permission was not granted.");
    }
  };

  const handleEnableNotifications = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service workers are not supported in this browser.");
      }

      if (Notification.permission !== "granted") {
        await ensureNotificationPermission();
      }

      const registration = await navigator.serviceWorker.ready;

      if (!pushConfigured || !pushPublicKey || !("PushManager" in window)) {
        setMessage("Notification permission is granted. Add VAPID keys in the deployment environment to enable server push.");
        return;
      }

      const existingSubscription = await registration.pushManager.getSubscription();
      const nextSubscription =
        existingSubscription ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(pushPublicKey),
        }));

      setSubscription(nextSubscription);
      setMessage("Push notifications are enabled for this device.");
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Failed to enable notifications.";
      setMessage(nextMessage);
    }
  };

  const handleSendTestNotification = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service workers are not supported in this browser.");
      }

      if (Notification.permission !== "granted") {
        await ensureNotificationPermission();
      }

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = subscription || (await registration.pushManager.getSubscription());

      if (pushConfigured && existingSubscription) {
        const response = await fetch("/api/notifications/test", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscription: existingSubscription,
            title: "PortfolioHub",
            body: "Android push is wired correctly for the installed app.",
            url: "/dashboard",
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to send push notification.");
        }

        setMessage("Test push notification sent.");
        return;
      }

      registration.active?.postMessage({
        type: "SHOW_NOTIFICATION",
        payload: {
          title: "PortfolioHub",
          body: "Local notification fallback is working on this device.",
          url: "/dashboard",
        },
      });
      setMessage("Local notification sent from the service worker.");
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Failed to send a test notification.";
      setMessage(nextMessage);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">PWA and Android App</h2>
          <p className="text-gray-600 mt-2">
            Installed PWAs and Bubblewrap-built Android apps still use the deployed HTTPS origin, so your
            Next.js route handlers remain available at /api/... on Vercel.
          </p>
        </div>
        <div className="rounded-full bg-blue-50 p-3 text-blue-600">
          <Smartphone className="h-6 w-6" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={handleInstall}
          className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-white transition-colors hover:bg-slate-800"
        >
          <Download className="h-4 w-4" />
          {isStandalone ? "Installed" : "Install App"}
        </button>

        <button
          onClick={handleEnableNotifications}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700"
        >
          <Bell className="h-4 w-4" />
          Enable Notifications
        </button>

        <button
          onClick={handleSendTestNotification}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-white transition-colors hover:bg-emerald-700"
        >
          <Bell className="h-4 w-4" />
          Send Test Notification
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        <p className="font-medium text-gray-900">Status</p>
        <p className="mt-2">{message}</p>
        <p className="mt-2">
          Notification permission: <span className="font-medium capitalize">{permission}</span>
        </p>
        <p className="mt-1">
          Push configuration: <span className="font-medium">{pushConfigured ? "Configured" : "Local notification fallback only"}</span>
        </p>
        <p className="mt-1">
          Android quick actions, share-targets, protocol handlers, and asset-links are wired through the web manifest.
          Native Android home-screen widgets are not part of the standard PWA/TWA feature set.
        </p>
      </div>
    </div>
  );
}