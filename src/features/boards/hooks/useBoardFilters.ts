import { useState, useCallback, useEffect, useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export interface FilterState {
  search: string;
  assigneeId: number | null;
  labels: number[];
  due: "any" | "overdue" | "today" | "this_week" | "no_due";
  myCards: boolean;
}

export interface FilteredCard {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  position: number;
  due_date: string | null;
  assignee: { id: number; name: string; avatar_url?: string } | null;
  labels: { id: number; board_id: number; name: string; color: string }[];
  column: { id: number; name: string; position: number };
}

export interface ColumnWithWip {
  id: number;
  name: string;
  position: number;
  wip_limit: number | null;
  card_count: number;
  wip_exceeded: boolean;
}

interface UseBoardFiltersReturn {
  filters: FilterState;
  setSearch: (search: string) => void;
  setAssigneeId: (id: number | null) => void;
  setLabels: (labels: number[]) => void;
  setDue: (due: FilterState["due"]) => void;
  setMyCards: (myCards: boolean) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  // Data
  cards: FilteredCard[];
  columns: ColumnWithWip[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  assigneeId: null,
  labels: [],
  due: "any",
  myCards: false,
};

export function useBoardFilters(
  boardId: number | null,
  token: string | null
): UseBoardFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [cards, setCards] = useState<FilteredCard[]>([]);
  const [columns, setColumns] = useState<ColumnWithWip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset filters when board changes
  useEffect(() => {
    setFilters(DEFAULT_FILTERS);
  }, [boardId]);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setAssigneeId = useCallback((assigneeId: number | null) => {
    setFilters((prev) => ({ ...prev, assigneeId }));
  }, []);

  const setLabels = useCallback((labels: number[]) => {
    setFilters((prev) => ({ ...prev, labels }));
  }, []);

  const setDue = useCallback((due: FilterState["due"]) => {
    setFilters((prev) => ({ ...prev, due }));
  }, []);

  const setMyCards = useCallback((myCards: boolean) => {
    setFilters((prev) => ({ ...prev, myCards }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== "" ||
      filters.assigneeId !== null ||
      filters.labels.length > 0 ||
      filters.due !== "any" ||
      filters.myCards
    );
  }, [filters]);

  // Fetch filtered cards
  const fetchCards = useCallback(async () => {
    if (!boardId || !token) {
      setCards([]);
      setColumns([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.assigneeId)
        params.set("assignee_id", String(filters.assigneeId));
      if (filters.labels.length) params.set("labels", filters.labels.join(","));
      if (filters.due !== "any") params.set("due", filters.due);
      if (filters.myCards) params.set("my_cards", "true");

      const url = `${API_URL}/api/boards/${boardId}/cards?${params.toString()}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch cards");

      const json = await res.json();
      setCards(json.data.cards);
      setColumns(json.data.columns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [boardId, token, filters]);

  // Debounced fetch for search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCards();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchCards]);

  return {
    filters,
    setSearch,
    setAssigneeId,
    setLabels,
    setDue,
    setMyCards,
    clearFilters,
    hasActiveFilters,
    cards,
    columns,
    isLoading,
    error,
    refetch: fetchCards,
  };
}
