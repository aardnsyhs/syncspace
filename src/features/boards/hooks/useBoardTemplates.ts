import { useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export interface BoardTemplate {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  visibility: "global" | "team";
  column_count: number;
  columns?: {
    id: number;
    name: string;
    position: number;
    wip_limit: number | null;
    sample_cards?: { title: string; description: string | null }[];
  }[];
  creator?: { id: number; name: string } | null;
}

interface UseBoardTemplatesReturn {
  templates: BoardTemplate[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getTemplate: (id: number) => Promise<BoardTemplate>;
  createBoardFromTemplate: (
    teamId: number,
    templateId: number,
    name: string,
    description?: string,
    color?: string
  ) => Promise<{ id: number }>;
  saveAsTemplate: (
    teamId: number,
    boardId: number,
    name: string,
    description?: string
  ) => Promise<BoardTemplate>;
}

export function useBoardTemplates(
  token: string | null
): UseBoardTemplatesReturn {
  const [templates, setTemplates] = useState<BoardTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!token) {
      setTemplates([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/board-templates`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch templates");

      const json = await res.json();
      setTemplates(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const getTemplate = async (id: number): Promise<BoardTemplate> => {
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/api/board-templates/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) throw new Error("Failed to fetch template");

    const json = await res.json();
    return json.data;
  };

  const createBoardFromTemplate = async (
    teamId: number,
    templateId: number,
    name: string,
    description?: string,
    color?: string
  ): Promise<{ id: number }> => {
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(
      `${API_URL}/api/teams/${teamId}/boards/from-template`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          template_id: templateId,
          name,
          description,
          color,
        }),
      }
    );

    if (!res.ok) throw new Error("Failed to create board from template");

    const json = await res.json();
    return json.data;
  };

  const saveAsTemplate = async (
    teamId: number,
    boardId: number,
    name: string,
    description?: string
  ): Promise<BoardTemplate> => {
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/api/teams/${teamId}/board-templates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        board_id: boardId,
        name,
        description,
      }),
    });

    if (!res.ok) throw new Error("Failed to save as template");

    const json = await res.json();
    setTemplates((prev) => [...prev, json.data]);
    return json.data;
  };

  return {
    templates,
    isLoading,
    error,
    refetch: fetchTemplates,
    getTemplate,
    createBoardFromTemplate,
    saveAsTemplate,
  };
}
