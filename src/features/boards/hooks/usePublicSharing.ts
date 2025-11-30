import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL;

interface PublicSharingState {
  isPublic: boolean;
  publicToken: string | null;
  publicUrl: string | null;
}

interface BoardPublicResponse {
  data: {
    is_public: boolean;
    public_token: string | null;
    public_url: string | null;
  };
}

interface UsePublicSharingReturn {
  isLoading: boolean;
  error: string | null;
  enable: (boardId: number) => Promise<PublicSharingState>;
  disable: (boardId: number) => Promise<void>;
  regenerate: (boardId: number) => Promise<PublicSharingState>;
}

export function usePublicSharing(
  _token: string | null
): UsePublicSharingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enable = useCallback(
    async (boardId: number): Promise<PublicSharingState> => {
      setIsLoading(true);
      setError(null);

      try {
        const json = await api.post<BoardPublicResponse>(
          `/api/boards/${boardId}/public/enable`
        );
        return {
          isPublic: json.data.is_public,
          publicToken: json.data.public_token,
          publicUrl: json.data.public_url,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const disable = useCallback(async (boardId: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await api.post(`/api/boards/${boardId}/public/disable`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const regenerate = useCallback(
    async (boardId: number): Promise<PublicSharingState> => {
      setIsLoading(true);
      setError(null);

      try {
        const json = await api.post<BoardPublicResponse>(
          `/api/boards/${boardId}/public/regenerate`
        );
        return {
          isPublic: true,
          publicToken: json.data.public_token,
          publicUrl: json.data.public_url,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    enable,
    disable,
    regenerate,
  };
}

export function usePublicBoard(publicToken: string | null) {
  const [board, setBoard] = useState<PublicBoardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    if (!publicToken) {
      setBoard(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      
      const res = await fetch(`${API_URL}/api/public/boards/${publicToken}`, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Board not found or link has expired");
        }
        throw new Error("Failed to fetch board");
      }

      const json = await res.json();
      setBoard(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [publicToken]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  return { board, isLoading, error, refetch: fetchBoard };
}

export interface PublicBoardData {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  columns: {
    id: number;
    name: string;
    position: number;
    wip_limit: number | null;
    cards: {
      id: number;
      title: string;
      description: string | null;
      position: number;
      due_date: string | null;
      labels: { id: number; name: string; color: string }[];
      checklist_progress: {
        total: number;
        completed: number;
        percentage: number;
      } | null;
    }[];
  }[];
  labels: { id: number; name: string; color: string }[];
}
