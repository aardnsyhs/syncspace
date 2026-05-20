/**
 * useBoardPresence
 * ================
 * Tracks which users are currently viewing a board in real-time via the
 * `presence-board.{boardId}` channel.
 *
 * Uses `useWorkspaceSocket` so the presence channel is managed through the
 * same lifecycle-safe abstraction as all other real-time hooks.
 */

import { useEffect, useState, useCallback } from "react";
import { useWorkspaceSocket } from "@/hooks/useWorkspaceSocket";

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
  const { joinPresence, leave } = useWorkspaceSocket();

  const [members, setMembers] = useState<PresenceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleHere = useCallback((users: PresenceMember[]) => {
    setMembers(users);
    setIsLoading(false);
  }, []);

  const handleJoining = useCallback((user: PresenceMember) => {
    setMembers((prev) => {
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

    // Echo's join() prepends "presence-" — pass the bare name.
    const channelName = `presence-board.${boardId}`;

    joinPresence<PresenceMember>(channelName, {
      here: handleHere,
      joining: handleJoining,
      leaving: handleLeaving,
      error: handleError,
    });

    return () => {
      leave(channelName);
    };
  }, [boardId, joinPresence, leave, handleHere, handleJoining, handleLeaving, handleError]);

  return { members, isLoading, error };
}
