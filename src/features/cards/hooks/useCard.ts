import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { getEcho } from "@/lib/echo";
import type { CardDetail, Checklist } from "../types";

interface UseCardReturn {
  card: CardDetail | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateCard: (
    data: Partial<CardDetail> & { assignee_id?: number | null }
  ) => Promise<void>;
  deleteCard: () => Promise<void>;
  attachLabel: (labelIds: number[]) => Promise<void>;
  detachLabel: (labelId: number) => Promise<void>;
  addChecklist: (title: string) => Promise<Checklist>;
  deleteChecklist: (checklistId: number) => Promise<void>;
  addChecklistItem: (checklistId: number, title: string) => Promise<void>;
  toggleChecklistItem: (itemId: number, isCompleted: boolean) => Promise<void>;
  deleteChecklistItem: (itemId: number) => Promise<void>;
  uploadAttachment: (file: File) => Promise<void>;
  addExternalAttachment: (url: string, fileName: string) => Promise<void>;
  deleteAttachment: (attachmentId: number) => Promise<void>;
}

export function useCard(
  cardId: number | null,
  _token: string | null,
  boardId?: number | null
): UseCardReturn {
  const [card, setCard] = useState<CardDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCard = useCallback(async () => {
    if (!cardId) {
      setCard(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [cardData, checklistsData, attachmentsData] = await Promise.all([
        api.get<{ data: CardDetail }>(`/api/cards/${cardId}`),
        api
          .get<{ data: Checklist[] }>(`/api/cards/${cardId}/checklists`)
          .catch(() => ({ data: [] })),
        api
          .get<{ data: CardDetail["attachments"] }>(
            `/api/cards/${cardId}/attachments`
          )
          .catch(() => ({ data: [] })),
      ]);

      setCard({
        ...cardData.data,
        checklists: checklistsData.data,
        attachments: attachmentsData.data,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    fetchCard();
  }, [fetchCard]);

  const fetchChecklists = useCallback(async () => {
    if (!cardId) return;
    try {
      const data = await api.get<{ data: Checklist[] }>(
        `/api/cards/${cardId}/checklists`
      );
      setCard((prev) => (prev ? { ...prev, checklists: data.data } : null));
    } catch {}
  }, [cardId]);

  const fetchAttachments = useCallback(async () => {
    if (!cardId) return;
    try {
      const data = await api.get<{ data: CardDetail["attachments"] }>(
        `/api/cards/${cardId}/attachments`
      );
      setCard((prev) => (prev ? { ...prev, attachments: data.data } : null));
    } catch {}
  }, [cardId]);

  useEffect(() => {
    if (!cardId || !boardId) return;

    const echo = getEcho();
    if (!echo) return;
    const channel = echo.private(`board.${boardId}`);

    const handleCardUpdated = (payload: { card: Partial<CardDetail> }) => {
      if (payload.card.id === cardId) {
        setCard((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            title: payload.card.title ?? prev.title,
            description: payload.card.description ?? prev.description,
            due_date: payload.card.due_date ?? prev.due_date,
            is_completed: payload.card.is_completed ?? prev.is_completed,
            completed_at: payload.card.completed_at ?? prev.completed_at,
            assignee: payload.card.assignee ?? prev.assignee,
            labels: payload.card.labels ?? prev.labels,
            checklists: prev.checklists,
            attachments: prev.attachments,
          };
        });

        fetchChecklists();
        fetchAttachments();
      }
    };

    channel.listen(".CardUpdated", handleCardUpdated);

    return () => {
      channel.stopListening(".CardUpdated", handleCardUpdated);
    };
  }, [cardId, boardId, fetchChecklists, fetchAttachments]);

  const updateCard = async (
    data: Partial<CardDetail> & { assignee_id?: number | null }
  ) => {
    if (!cardId) return;
    const updated = await api.put<{ data: CardDetail }>(
      `/api/cards/${cardId}`,
      data
    );
    setCard((prev) => (prev ? { ...prev, ...updated.data } : null));
  };

  const deleteCard = async () => {
    if (!cardId) return;
    await api.delete(`/api/cards/${cardId}`);
    setCard(null);
  };

  const attachLabel = async (labelIds: number[]) => {
    if (!cardId) return;
    const updated = await api.post<{ data: { labels: CardDetail["labels"] } }>(
      `/api/cards/${cardId}/labels`,
      { label_ids: labelIds }
    );
    setCard((prev) => (prev ? { ...prev, labels: updated.data.labels } : null));
  };

  const detachLabel = async (labelId: number) => {
    if (!cardId) return;
    await api.delete(`/api/cards/${cardId}/labels/${labelId}`);
    setCard((prev) =>
      prev
        ? { ...prev, labels: prev.labels.filter((l) => l.id !== labelId) }
        : null
    );
  };

  const addChecklist = async (title: string): Promise<Checklist> => {
    if (!cardId) throw new Error("No card");
    const data = await api.post<{ data: Checklist }>(
      `/api/cards/${cardId}/checklists`,
      { title }
    );
    const newChecklist = {
      ...data.data,
      progress: { total: 0, completed: 0, percentage: 0 },
    };
    setCard((prev) =>
      prev ? { ...prev, checklists: [...prev.checklists, newChecklist] } : null
    );
    return newChecklist;
  };

  const deleteChecklist = async (checklistId: number) => {
    await api.delete(`/api/checklists/${checklistId}`);
    setCard((prev) =>
      prev
        ? {
            ...prev,
            checklists: prev.checklists.filter((c) => c.id !== checklistId),
          }
        : null
    );
  };

  const addChecklistItem = async (checklistId: number, title: string) => {
    const data = await api.post<{ data: Checklist["items"][0] }>(
      `/api/checklists/${checklistId}/items`,
      { title }
    );
    setCard((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        checklists: prev.checklists.map((c) => {
          if (c.id !== checklistId) return c;
          const newItems = [...c.items, data.data];
          return {
            ...c,
            items: newItems,
            progress: calcProgress(newItems),
          };
        }),
      };
    });
  };

  const toggleChecklistItem = async (itemId: number, isCompleted: boolean) => {
    await api.patch(`/api/checklist-items/${itemId}`, {
      is_completed: isCompleted,
    });
    setCard((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        checklists: prev.checklists.map((c) => {
          const itemIndex = c.items.findIndex((i) => i.id === itemId);
          if (itemIndex === -1) return c;
          const newItems = c.items.map((i) =>
            i.id === itemId ? { ...i, is_completed: isCompleted } : i
          );
          return { ...c, items: newItems, progress: calcProgress(newItems) };
        }),
      };
    });
  };

  const deleteChecklistItem = async (itemId: number) => {
    await api.delete(`/api/checklist-items/${itemId}`);
    setCard((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        checklists: prev.checklists.map((c) => {
          const newItems = c.items.filter((i) => i.id !== itemId);
          return { ...c, items: newItems, progress: calcProgress(newItems) };
        }),
      };
    });
  };

  const uploadAttachment = async (file: File) => {
    if (!cardId) return;
    const formData = new FormData();
    formData.append("file", file);
    const data = await api.upload<{ data: CardDetail["attachments"][0] }>(
      `/api/cards/${cardId}/attachments`,
      formData
    );
    setCard((prev) =>
      prev ? { ...prev, attachments: [data.data, ...prev.attachments] } : null
    );
  };

  const addExternalAttachment = async (url: string, fileName: string) => {
    if (!cardId) return;
    const data = await api.post<{ data: CardDetail["attachments"][0] }>(
      `/api/cards/${cardId}/attachments`,
      { url, file_name: fileName }
    );
    setCard((prev) =>
      prev ? { ...prev, attachments: [data.data, ...prev.attachments] } : null
    );
  };

  const deleteAttachment = async (attachmentId: number) => {
    await api.delete(`/api/attachments/${attachmentId}`);
    setCard((prev) =>
      prev
        ? {
            ...prev,
            attachments: prev.attachments.filter((a) => a.id !== attachmentId),
          }
        : null
    );
  };

  return {
    card,
    isLoading,
    error,
    refetch: fetchCard,
    updateCard,
    deleteCard,
    attachLabel,
    detachLabel,
    addChecklist,
    deleteChecklist,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    uploadAttachment,
    addExternalAttachment,
    deleteAttachment,
  };
}

function calcProgress(items: { is_completed: boolean }[]) {
  const total = items.length;
  const completed = items.filter((i) => i.is_completed).length;
  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
