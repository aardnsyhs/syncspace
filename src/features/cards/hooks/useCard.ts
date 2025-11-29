import { useState, useEffect, useCallback } from "react";
import type { CardDetail, Checklist } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

interface UseCardReturn {
  card: CardDetail | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  // Mutations
  updateCard: (
    data: Partial<CardDetail> & { assignee_id?: number | null }
  ) => Promise<void>;
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
  token: string | null
): UseCardReturn {
  const [card, setCard] = useState<CardDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCard = useCallback(async () => {
    if (!cardId || !token) {
      setCard(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch card with all relations
      const [cardRes, checklistsRes, attachmentsRes] = await Promise.all([
        fetch(`${API_URL}/api/cards/${cardId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }),
        fetch(`${API_URL}/api/cards/${cardId}/checklists`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }),
        fetch(`${API_URL}/api/cards/${cardId}/attachments`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }),
      ]);

      if (!cardRes.ok) throw new Error("Failed to fetch card");

      const cardData = await cardRes.json();
      const checklistsData = checklistsRes.ok
        ? await checklistsRes.json()
        : { data: [] };
      const attachmentsData = attachmentsRes.ok
        ? await attachmentsRes.json()
        : { data: [] };

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
  }, [cardId, token]);

  useEffect(() => {
    fetchCard();
  }, [fetchCard]);

  const updateCard = async (
    data: Partial<CardDetail> & { assignee_id?: number | null }
  ) => {
    if (!cardId || !token) return;

    const res = await fetch(`${API_URL}/api/cards/${cardId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update card");

    const updated = await res.json();
    setCard((prev) => (prev ? { ...prev, ...updated.data } : null));
  };

  const attachLabel = async (labelIds: number[]) => {
    if (!cardId || !token) return;

    const res = await fetch(`${API_URL}/api/cards/${cardId}/labels`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ label_ids: labelIds }),
    });

    if (!res.ok) throw new Error("Failed to attach labels");

    const updated = await res.json();
    setCard((prev) => (prev ? { ...prev, labels: updated.data.labels } : null));
  };

  const detachLabel = async (labelId: number) => {
    if (!cardId || !token) return;

    const res = await fetch(
      `${API_URL}/api/cards/${cardId}/labels/${labelId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) throw new Error("Failed to detach label");

    setCard((prev) =>
      prev
        ? { ...prev, labels: prev.labels.filter((l) => l.id !== labelId) }
        : null
    );
  };

  const addChecklist = async (title: string): Promise<Checklist> => {
    if (!cardId || !token) throw new Error("No card");

    const res = await fetch(`${API_URL}/api/cards/${cardId}/checklists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) throw new Error("Failed to add checklist");

    const data = await res.json();
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
    if (!token) return;

    const res = await fetch(`${API_URL}/api/checklists/${checklistId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to delete checklist");

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
    if (!token) return;

    const res = await fetch(`${API_URL}/api/checklists/${checklistId}/items`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) throw new Error("Failed to add item");

    const data = await res.json();

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
            progress: {
              total: newItems.length,
              completed: newItems.filter((i) => i.is_completed).length,
              percentage:
                newItems.length > 0
                  ? Math.round(
                      (newItems.filter((i) => i.is_completed).length /
                        newItems.length) *
                        100
                    )
                  : 0,
            },
          };
        }),
      };
    });
  };

  const toggleChecklistItem = async (itemId: number, isCompleted: boolean) => {
    if (!token) return;

    const res = await fetch(`${API_URL}/api/checklist-items/${itemId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ is_completed: isCompleted }),
    });

    if (!res.ok) throw new Error("Failed to toggle item");

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

          return {
            ...c,
            items: newItems,
            progress: {
              total: newItems.length,
              completed: newItems.filter((i) => i.is_completed).length,
              percentage:
                newItems.length > 0
                  ? Math.round(
                      (newItems.filter((i) => i.is_completed).length /
                        newItems.length) *
                        100
                    )
                  : 0,
            },
          };
        }),
      };
    });
  };

  const deleteChecklistItem = async (itemId: number) => {
    if (!token) return;

    const res = await fetch(`${API_URL}/api/checklist-items/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to delete item");

    setCard((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        checklists: prev.checklists.map((c) => {
          const newItems = c.items.filter((i) => i.id !== itemId);
          return {
            ...c,
            items: newItems,
            progress: {
              total: newItems.length,
              completed: newItems.filter((i) => i.is_completed).length,
              percentage:
                newItems.length > 0
                  ? Math.round(
                      (newItems.filter((i) => i.is_completed).length /
                        newItems.length) *
                        100
                    )
                  : 0,
            },
          };
        }),
      };
    });
  };

  const uploadAttachment = async (file: File) => {
    if (!cardId || !token) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/api/cards/${cardId}/attachments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload attachment");

    const data = await res.json();
    setCard((prev) =>
      prev ? { ...prev, attachments: [data.data, ...prev.attachments] } : null
    );
  };

  const addExternalAttachment = async (url: string, fileName: string) => {
    if (!cardId || !token) return;

    const res = await fetch(`${API_URL}/api/cards/${cardId}/attachments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ url, file_name: fileName }),
    });

    if (!res.ok) throw new Error("Failed to add attachment");

    const data = await res.json();
    setCard((prev) =>
      prev ? { ...prev, attachments: [data.data, ...prev.attachments] } : null
    );
  };

  const deleteAttachment = async (attachmentId: number) => {
    if (!token) return;

    const res = await fetch(`${API_URL}/api/attachments/${attachmentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to delete attachment");

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
