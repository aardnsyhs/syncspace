/**
 * React Query Hooks for Boards
 *
 * Example hooks demonstrating React Query patterns for data fetching.
 * These can be used as templates for other features.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Board, Column, Label } from "@/types";

// Query Keys - centralized for cache management
export const boardKeys = {
  all: ["boards"] as const,
  lists: () => [...boardKeys.all, "list"] as const,
  list: (teamId: number) => [...boardKeys.lists(), teamId] as const,
  details: () => [...boardKeys.all, "detail"] as const,
  detail: (boardId: number) => [...boardKeys.details(), boardId] as const,
  labels: (boardId: number) =>
    [...boardKeys.detail(boardId), "labels"] as const,
};

interface BoardDetailResponse {
  data: Board & {
    columns: Column[];
    labels: Label[];
  };
}

interface BoardListItem {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  cards_count: number;
  members_count: number;
  created_at: string;
}

interface BoardsListResponse {
  data: BoardListItem[];
}

/**
 * Fetch a single board with columns and labels
 */
export function useBoard(boardId: number | undefined) {
  return useQuery({
    queryKey: boardKeys.detail(boardId!),
    queryFn: async () => {
      const response = await api.get<BoardDetailResponse>(
        `/api/boards/${boardId}`
      );
      return response.data;
    },
    enabled: !!boardId,
  });
}

/**
 * Fetch all boards for a team
 */
export function useTeamBoards(teamId: number | undefined) {
  return useQuery({
    queryKey: boardKeys.list(teamId!),
    queryFn: async () => {
      const response = await api.get<BoardsListResponse>(
        `/api/teams/${teamId}/boards`
      );
      return response.data;
    },
    enabled: !!teamId,
  });
}

/**
 * Fetch labels for a board
 */
export function useBoardLabels(boardId: number | undefined) {
  return useQuery({
    queryKey: boardKeys.labels(boardId!),
    queryFn: async () => {
      const response = await api.get<{ data: Label[] }>(
        `/api/boards/${boardId}/labels`
      );
      return response.data;
    },
    enabled: !!boardId,
  });
}

interface CreateBoardInput {
  name: string;
  description?: string;
  teamId: number;
}

/**
 * Create a new board
 */
export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description, teamId }: CreateBoardInput) => {
      const response = await api.post<{ data: BoardListItem }>(
        `/api/teams/${teamId}/boards`,
        { name, description }
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate the boards list to refetch
      queryClient.invalidateQueries({
        queryKey: boardKeys.list(variables.teamId),
      });
    },
  });
}

interface UpdateBoardInput {
  boardId: number;
  name?: string;
  description?: string;
  color?: string;
}

/**
 * Update a board
 */
export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boardId, ...data }: UpdateBoardInput) => {
      const response = await api.put<{ data: Board }>(
        `/api/boards/${boardId}`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the board in cache
      queryClient.setQueryData(boardKeys.detail(variables.boardId), {
        data,
      });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}

/**
 * Delete a board
 */
export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (boardId: number) => {
      await api.delete(`/api/boards/${boardId}`);
      return boardId;
    },
    onSuccess: () => {
      // Invalidate all board lists
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}
