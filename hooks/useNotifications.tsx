"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface Notification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  timestamp: Date;
  tag?: string;
  data?: any;
}

interface NotificationContextType {
  supported: boolean;
  permission: NotificationPermission;
  notifications: Notification[];
  requestPermission: () => Promise<boolean>;
  showNotification: (title: string, options?: NotificationOptions & { data?: any }) => globalThis.Notification | null;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
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
    localStorage.setItem("notification-history", JSON.stringify(notifications.slice(0, 20)));
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

  // Use ref for deduplication to avoid dependency on notifications
  const notificationsRef = React.useRef<Notification[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions & { data?: any }) => {
      try {
        // Deduplication: check if same notification exists in last 5 seconds
        const fiveSecondsAgo = new Date(Date.now() - 5000);
        const isDuplicate = notificationsRef.current.some(n =>
          n.title === title &&
          n.body === (options?.body || "") &&
          n.timestamp > fiveSecondsAgo
        );

        if (isDuplicate) return null;

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

  return (
    <NotificationContext.Provider
      value={{
        supported,
        permission,
        notifications,
        requestPermission,
        showNotification,
        clearNotifications,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
