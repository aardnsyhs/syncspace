/**
 * useUserNotifications (lightweight in-memory variant)
 * =====================================================
 * A simpler notification hook that keeps notifications in local state only
 * (no API persistence). Useful for components that need a quick toast-only
 * notification feed without the full CRUD surface of `useNotifications`.
 *
 * Uses `useWorkspaceSocket` so it participates in the shared Echo lifecycle.
 */

import { useEffect, useCallback, useState } from "react";
import { toast } from "sonner";
import { useWorkspaceSocket } from "@/hooks/useWorkspaceSocket";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: {
    card_id?: number;
    board_id?: number;
    comment_preview?: string;
  };
  created_at: string;
  read: boolean;
}

interface UseUserNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export function useUserNotifications(
  userId: number | null
): UseUserNotificationsReturn {
  const { subscribePrivate, leave } = useWorkspaceSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleNotification = useCallback(
    (payload: Omit<Notification, "id" | "read">) => {
      const notification: Notification = {
        ...payload,
        id: `${Date.now()}-${Math.random()}`,
        read: false,
      };

      setNotifications((prev) => [notification, ...prev].slice(0, 50));

      toast(payload.title, {
        description: payload.message,
        action: payload.data.board_id
          ? {
              label: "View",
              onClick: () => {
                console.log("Navigate to:", payload.data);
              },
            }
          : undefined,
      });
    },
    []
  );

  useEffect(() => {
    if (!userId) return;

    const channelName = `user.${userId}`;
    subscribePrivate<Omit<Notification, "id" | "read">>(
      channelName,
      ".UserNotification",
      handleNotification
    );

    return () => {
      leave(channelName);
    };
  }, [userId, subscribePrivate, leave, handleNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
  };
}
