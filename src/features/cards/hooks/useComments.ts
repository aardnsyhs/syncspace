import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Comment } from "../components/CommentsSection";

interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  addComment: (body: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useComments(cardId: number | null): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!cardId) {
      setComments([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get<{ data: Comment[] }>(
        `/api/cards/${cardId}/comments`
      );
      setComments(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (body: string) => {
    if (!cardId) return;

    const res = await api.post<{ data: Comment }>(
      `/api/cards/${cardId}/comments`,
      { body }
    );

    setComments((prev) => [res.data, ...prev]);
  };

  const deleteComment = async (commentId: number) => {
    await api.delete(`/api/comments/${commentId}`);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return {
    comments,
    isLoading,
    error,
    addComment,
    deleteComment,
    refetch: fetchComments,
  };
}
