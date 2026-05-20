/**
 * useNotifications
 * ================
 * Manages the notification list for the authenticated user.
 *
 * ─── Real-time strategy ─────────────────────────────────────────────────────
 * Incoming WebSocket events are applied as optimistic updates directly to
 * local state — no API round-trip is made per event. This eliminates the
 * N-requests-per-notification problem that existed when every event triggered
 * a full `fetchNotifications()` call.
 *
 * The incoming `RealTimeNotification` payload is shaped to match the
 * `Notification` interface exactly so the UI never flickers or receives
 * mismatched data.
 *
 * A full refetch is only performed:
 *   - On mount (to hydrate the initial list).
 *   - When the user explicitly calls `refetch()` (e.g. on panel open).
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useWorkspaceSocket } from "@/hooks/useWorkspaceSocket";
import { useAuth } from "@/features/auth";
import { NOTIFICATIONS_FETCH_LIMIT } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: {
    card_id?: number;
    board_id?: number;
  } | null;
  /** `false` when unread, `true` when read. Mirrors the API shape. */
  read: boolean;
  created_at: string;
}

interface NotificationsResponse {
  data: Notification[];
  meta: {
    unread_count: number;
  };
}

/**
 * The shape broadcast by Laravel's `UserNotification` event.
 * Must stay in sync with `app/Events/UserNotification.php` → `broadcastWith()`.
 *
 * We intentionally do NOT include `id` here because the backend generates it
 * server-side. We assign a temporary client-side ID for the optimistic entry
 * and replace it on the next full fetch.
 */
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

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refetch: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const { subscribePrivate, leave } = useWorkspaceSocket();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Track whether a full fetch is already in-flight so concurrent calls
   * (e.g. mount + WebSocket event arriving simultaneously) don't race.
   */
  const isFetchingRef = useRef(false);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchNotifications = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const response = await api.get<NotificationsResponse>(
        "/api/notifications",
        { limit: NOTIFICATIONS_FETCH_LIMIT }
      );
      setNotifications(response.data ?? []);
      setUnreadCount(response.meta?.unread_count ?? 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Hydrate on mount.
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ---------------------------------------------------------------------------
  // Real-time subscription — optimistic updates only, no refetch
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!user?.id) return;

    const channelName = `user.${user.id}`;

    subscribePrivate<RealTimeNotification>(
      channelName,
      ".UserNotification",
      (payload) => {
        // Show a toast immediately.
        toast(payload.title, { description: payload.message });

        // Build an optimistic notification that matches the `Notification`
        // interface exactly. We use a temporary ID prefixed with "optimistic-"
        // so it can be identified and replaced after the next full fetch.
        const optimistic: Notification = {
          id: `optimistic-${Date.now()}-${Math.random()}`,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          data: payload.data ?? null,
          read: false,
          created_at: payload.created_at ?? new Date().toISOString(),
        };

        // Prepend to the list (newest first) and cap at the fetch limit
        // so the list doesn't grow unboundedly between full fetches.
        setNotifications((prev) =>
          [optimistic, ...prev].slice(0, NOTIFICATIONS_FETCH_LIMIT)
        );
        setUnreadCount((prev) => prev + 1);
      }
    );

    return () => {
      leave(channelName);
    };
  }, [user?.id, subscribePrivate, leave]);

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update first — the UI responds instantly.
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await api.post(`/api/notifications/${id}/read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Roll back on failure.
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update.
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await api.post("/api/notifications/read-all");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      // Refetch to restore correct state on failure.
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const deleteNotification = useCallback(async (id: string) => {
    // Optimistic removal.
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (target && !target.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((n) => n.id !== id);
    });

    try {
      await api.delete(`/api/notifications/${id}`);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      // Refetch to restore correct state on failure.
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const clearAll = useCallback(async () => {
    // Optimistic clear.
    setNotifications([]);
    setUnreadCount(0);

    try {
      await api.delete("/api/notifications");
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      toast.error("Failed to clear notifications");
      // Refetch to restore correct state on failure.
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

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
