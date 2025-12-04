import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { getEcho, initializeEcho } from "@/lib/echo";
import type { Comment } from "../components/CommentsSection";

interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  addComment: (body: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useComments(
  cardId: number | null,
  boardId?: number | null
): UseCommentsReturn {
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

  useEffect(() => {
    if (!cardId || !boardId) return;

    const echo = getEcho() || initializeEcho();
    const channel = echo.private(`board.${boardId}`);

    const handleCommentCreated = (payload: {
      card_id: number;
      comment: Comment;
    }) => {
      if (payload.card_id === cardId) {
        setComments((prev) => {
          if (prev.some((c) => c.id === payload.comment.id)) return prev;
          return [payload.comment, ...prev];
        });
      }
    };

    const handleCommentDeleted = (payload: {
      card_id: number;
      comment_id: number;
    }) => {
      if (payload.card_id === cardId) {
        setComments((prev) => prev.filter((c) => c.id !== payload.comment_id));
      }
    };

    channel.listen(".CommentCreated", handleCommentCreated);
    channel.listen(".CommentDeleted", handleCommentDeleted);

    return () => {
      channel.stopListening(".CommentCreated", handleCommentCreated);
      channel.stopListening(".CommentDeleted", handleCommentDeleted);
    };
  }, [cardId, boardId]);

  const addComment = async (body: string) => {
    if (!cardId) return;

    const res = await api.post<{ data: Comment }>(
      `/api/cards/${cardId}/comments`,
      { body }
    );

    setComments((prev) => {
      if (prev.some((c) => c.id === res.data.id)) return prev;
      return [res.data, ...prev];
    });
  };

  const deleteComment = async (commentId: number) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    await api.delete(`/api/comments/${commentId}`);
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
