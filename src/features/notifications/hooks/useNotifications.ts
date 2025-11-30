import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getEcho, initializeEcho } from "@/lib/echo";
import { useAuth } from "@/features/auth";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: {
    card_id?: number;
    board_id?: number;
  } | null;
  read: boolean;
  created_at: string;
}

interface NotificationsResponse {
  data: Notification[];
  meta: {
    unread_count: number;
  };
}

interface RealTimeNotification {
  type: string;
  title: string;
  message: string;
  data: {
    card_id?: number;
    board_id?: number;
  };
  created_at: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get<NotificationsResponse>(
        "/api/notifications",
        { limit: 20 }
      );
      setNotifications(response.data || []);
      setUnreadCount(response.meta?.unread_count || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const echo = getEcho() || initializeEcho();
    const channel = echo.private(`user.${user.id}`);

    channel.listen(".UserNotification", (payload: RealTimeNotification) => {
      
      toast(payload.title, {
        description: payload.message,
      });

      fetchNotifications();
    });

    return () => {
      echo.leave(`user.${user.id}`);
    };
  }, [user?.id, fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.post(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === id);
        if (notification && !notification.read) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await api.delete("/api/notifications");
      setNotifications([]);
      setUnreadCount(0);
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      toast.error("Failed to clear notifications");
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refetch: fetchNotifications,
  };
}
