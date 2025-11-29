import { useState, useCallback, useEffect, useMemo } from "react";
import { api } from "@/lib/api";

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

interface BoardCardsResponse {
  data: {
    cards: FilteredCard[];
    columns: ColumnWithWip[];
  };
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
  _token: string | null
): UseBoardFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [cards, setCards] = useState<FilteredCard[]>([]);
  const [columns, setColumns] = useState<ColumnWithWip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchCards = useCallback(async () => {
    if (!boardId) {
      setCards([]);
      setColumns([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, string | number | boolean | undefined> = {};
      if (filters.search) params.search = filters.search;
      if (filters.assigneeId) params.assignee_id = filters.assigneeId;
      if (filters.labels.length) params.labels = filters.labels.join(",");
      if (filters.due !== "any") params.due = filters.due;
      if (filters.myCards) params.my_cards = true;

      const json = await api.get<BoardCardsResponse>(
        `/api/boards/${boardId}/cards`,
        params
      );
      setCards(json.data.cards);
      setColumns(json.data.columns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [boardId, filters]);

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
