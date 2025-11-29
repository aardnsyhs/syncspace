import { useState, useEffect, useCallback } from "react";
import { getEcho, initializeEcho } from "@/lib/echo";

export interface ActivityUser {
  id: number;
  name: string;
  avatar_url?: string;
}

export interface Activity {
  id: number;
  type: string;
  data: {
    entity?: string;
    action?: string;
    card_id?: number;
    card_title?: string;
    column_name?: string;
    column_id?: number;
    from_column?: string;
    to_column?: string;
    assignee_name?: string;
    comment_preview?: string;
    changes?: string[];
  };
  user: ActivityUser;
  card_id?: number;
  created_at: string;
}

interface UseBoardActivitiesReturn {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL;

export function useBoardActivities(
  boardId: number | null
): UseBoardActivitiesReturn {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!boardId) {
      setActivities([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/boards/${boardId}/activities`,
        {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }

      const json = await response.json();
      setActivities(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  // Handle real-time activity updates
  const handleActivityCreated = useCallback(
    (payload: { activity: Activity }) => {
      setActivities((prev) => [payload.activity, ...prev].slice(0, 50));
    },
    []
  );

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!boardId) return;

    const echo = getEcho() || initializeEcho();
    const channel = echo.private(`board.${boardId}`);
    channel.listen(".ActivityCreated", handleActivityCreated);

    return () => {
      channel.stopListening(".ActivityCreated");
      echo.leave(`board.${boardId}`);
    };
  }, [boardId, handleActivityCreated]);

  return {
    activities,
    isLoading,
    error,
    refetch: fetchActivities,
  };
}
