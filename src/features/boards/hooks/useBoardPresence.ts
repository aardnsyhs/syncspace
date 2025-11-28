import { useEffect, useState, useCallback } from "react";
import echo from "@/lib/echo";

export interface PresenceMember {
  id: number;
  name: string;
  avatar_url?: string;
}

interface UseBoardPresenceReturn {
  members: PresenceMember[];
  isLoading: boolean;
  error: string | null;
}

export function useBoardPresence(
  boardId: number | null
): UseBoardPresenceReturn {
  const [members, setMembers] = useState<PresenceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleHere = useCallback((users: PresenceMember[]) => {
    setMembers(users);
    setIsLoading(false);
  }, []);

  const handleJoining = useCallback((user: PresenceMember) => {
    setMembers((prev) => {
      // Avoid duplicates
      if (prev.some((m) => m.id === user.id)) return prev;
      return [...prev, user];
    });
  }, []);

  const handleLeaving = useCallback((user: PresenceMember) => {
    setMembers((prev) => prev.filter((m) => m.id !== user.id));
  }, []);

  const handleError = useCallback((err: Error) => {
    setError(err.message);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!boardId) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    echo
      .join(`presence-board.${boardId}`)
      .here(handleHere)
      .joining(handleJoining)
      .leaving(handleLeaving)
      .error(handleError);

    return () => {
      echo.leave(`presence-board.${boardId}`);
    };
  }, [boardId, handleHere, handleJoining, handleLeaving, handleError]);

  return { members, isLoading, error };
}
