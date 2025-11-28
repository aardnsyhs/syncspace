import { useState, useEffect, useCallback } from "react";
import type { Label } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

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
  token: string | null
): UseBoardLabelsReturn {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLabels = useCallback(async () => {
    if (!boardId || !token) {
      setLabels([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/boards/${boardId}/labels`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch labels");

      const data = await res.json();
      setLabels(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [boardId, token]);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  const createLabel = async (name: string, color: string): Promise<Label> => {
    if (!boardId || !token) throw new Error("No board");

    const res = await fetch(`${API_URL}/api/boards/${boardId}/labels`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ name, color }),
    });

    if (!res.ok) throw new Error("Failed to create label");

    const data = await res.json();
    setLabels((prev) => [...prev, data.data]);
    return data.data;
  };

  const updateLabel = async (
    labelId: number,
    data: { name?: string; color?: string }
  ) => {
    if (!boardId || !token) return;

    const res = await fetch(
      `${API_URL}/api/boards/${boardId}/labels/${labelId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!res.ok) throw new Error("Failed to update label");

    const updated = await res.json();
    setLabels((prev) => prev.map((l) => (l.id === labelId ? updated.data : l)));
  };

  const deleteLabel = async (labelId: number) => {
    if (!boardId || !token) return;

    const res = await fetch(
      `${API_URL}/api/boards/${boardId}/labels/${labelId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) throw new Error("Failed to delete label");

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
