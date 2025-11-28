import { useEffect, useCallback, useState } from "react";
import { toast } from "sonner";
import echo from "@/lib/echo";

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
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleNotification = useCallback(
    (payload: Omit<Notification, "id" | "read">) => {
      const notification: Notification = {
        ...payload,
        id: `${Date.now()}-${Math.random()}`,
        read: false,
      };

      setNotifications((prev) => [notification, ...prev].slice(0, 50));

      // Show toast notification
      toast(payload.title, {
        description: payload.message,
        action: payload.data.board_id
          ? {
              label: "View",
              onClick: () => {
                // Navigate to board/card - implement based on your router
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

    const channel = echo.private(`user.${userId}`);
    channel.listen(".UserNotification", handleNotification);

    return () => {
      channel.stopListening(".UserNotification");
      echo.leave(`user.${userId}`);
    };
  }, [userId, handleNotification]);

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
