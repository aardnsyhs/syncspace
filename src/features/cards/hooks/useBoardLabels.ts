import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { getEcho, initializeEcho } from "@/lib/echo";
import type { Label } from "../types";

interface UseBoardLabelsReturn {
  labels: Label[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createLabel: (name: string, color: string) => Promise<Label>;
  updateLabel: (
    labelId: number,
    data: { name?: string; color?: string }
  ) => Promise<void>;
  deleteLabel: (labelId: number) => Promise<void>;
}

export function useBoardLabels(
  boardId: number | null,
  _token: string | null
): UseBoardLabelsReturn {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLabels = useCallback(async () => {
    if (!boardId) {
      setLabels([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.get<{ data: Label[] }>(
        `/api/boards/${boardId}/labels`
      );
      setLabels(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  useEffect(() => {
    if (!boardId) return;

    const echo = getEcho() || initializeEcho();
    const channel = echo.private(`board.${boardId}`);

    const handleLabelCreated = (payload: { label: Label }) => {
      setLabels((prev) => {
        if (prev.some((l) => l.id === payload.label.id)) return prev;
        return [...prev, payload.label];
      });
    };

    const handleLabelUpdated = (payload: { label: Label }) => {
      setLabels((prev) =>
        prev.map((l) => (l.id === payload.label.id ? payload.label : l))
      );
    };

    const handleLabelDeleted = (payload: { label_id: number }) => {
      setLabels((prev) => prev.filter((l) => l.id !== payload.label_id));
    };

    channel.listen(".LabelCreated", handleLabelCreated);
    channel.listen(".LabelUpdated", handleLabelUpdated);
    channel.listen(".LabelDeleted", handleLabelDeleted);

    return () => {
      channel.stopListening(".LabelCreated", handleLabelCreated);
      channel.stopListening(".LabelUpdated", handleLabelUpdated);
      channel.stopListening(".LabelDeleted", handleLabelDeleted);
    };
  }, [boardId]);

  const createLabel = async (name: string, color: string): Promise<Label> => {
    if (!boardId) throw new Error("No board");

    const data = await api.post<{ data: Label }>(
      `/api/boards/${boardId}/labels`,
      { name, color }
    );
    setLabels((prev) => [...prev, data.data]);
    return data.data;
  };

  const updateLabel = async (
    labelId: number,
    updateData: { name?: string; color?: string }
  ) => {
    if (!boardId) return;

    const updated = await api.patch<{ data: Label }>(
      `/api/boards/${boardId}/labels/${labelId}`,
      updateData
    );
    setLabels((prev) => prev.map((l) => (l.id === labelId ? updated.data : l)));
  };

  const deleteLabel = async (labelId: number) => {
    if (!boardId) return;

    await api.delete(`/api/boards/${boardId}/labels/${labelId}`);
    setLabels((prev) => prev.filter((l) => l.id !== labelId));
  };

  return {
    labels,
    isLoading,
    error,
    refetch: fetchLabels,
    createLabel,
    updateLabel,
    deleteLabel,
  };
}
