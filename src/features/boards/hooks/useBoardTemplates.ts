import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

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
  _token: string | null
): UseBoardTemplatesReturn {
  const [templates, setTemplates] = useState<BoardTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const json = await api.get<{ data: BoardTemplate[] }>(
        "/api/board-templates"
      );
      setTemplates(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const getTemplate = async (id: number): Promise<BoardTemplate> => {
    const json = await api.get<{ data: BoardTemplate }>(
      `/api/board-templates/${id}`
    );
    return json.data;
  };

  const createBoardFromTemplate = async (
    teamId: number,
    templateId: number,
    name: string,
    description?: string,
    color?: string
  ): Promise<{ id: number }> => {
    const json = await api.post<{ data: { id: number } }>(
      `/api/teams/${teamId}/boards/from-template`,
      {
        template_id: templateId,
        name,
        description,
        color,
      }
    );
    return json.data;
  };

  const saveAsTemplate = async (
    teamId: number,
    boardId: number,
    name: string,
    description?: string
  ): Promise<BoardTemplate> => {
    const json = await api.post<{ data: BoardTemplate }>(
      `/api/teams/${teamId}/board-templates`,
      {
        board_id: boardId,
        name,
        description,
      }
    );
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
