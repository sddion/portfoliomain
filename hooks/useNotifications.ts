import { useState, useEffect, useCallback } from "react";

export interface Notification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  timestamp: Date;
  tag?: string;
  data?: any;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ("Notification" in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }

    // Load notification history from localStorage
    const stored = localStorage.getItem("notification-history");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(
          parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }))
        );
      } catch (e) {
        console.error("Failed to parse notification history", e);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("notification-history", JSON.stringify(notifications.slice(0, 20)));
    }
  }, [notifications]);

  const requestPermission = useCallback(async () => {
    if (!supported) {
      throw new Error("Notifications not supported");
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [supported]);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions & { data?: any }) => {
      try {
        // ALWAYS add to internal history first
        const newNotification: Notification = {
          id: `notif-${Date.now()}-${Math.random()}`,
          title,
          body: options?.body || "",
          icon: options?.icon,
          timestamp: new Date(),
          tag: options?.tag,
          data: options?.data,
        };

        setNotifications((prev) => [newNotification, ...prev].slice(0, 20));

        // Only show browser notification if granted
        if (supported && permission === "granted") {
          return new Notification(title, options);
        }
        return null;
      } catch (error) {
        console.error("Error showing notification:", error);
        return null;
      }
    },
    [supported, permission]
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem("notification-history");
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    supported,
    permission,
    notifications,
    requestPermission,
    showNotification,
    clearNotifications,
    removeNotification,
  };
}
