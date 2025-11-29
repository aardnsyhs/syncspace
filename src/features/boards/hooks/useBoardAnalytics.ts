import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

// Types
export interface ColumnStat {
  id: number;
  name: string;
  position: number;
  card_count: number;
}

export interface AnalyticsSummary {
  total_cards: number;
  columns: ColumnStat[];
  completed_last_7_days: number;
  completed_last_30_days: number;
  avg_cycle_time_days: number | null;
  avg_lead_time_days: number | null;
  wip_count: number;
}

export interface ThroughputData {
  week_start: string;
  week_end: string;
  completed_count: number;
}

export interface CumulativeFlowDay {
  date: string;
  columns: Record<number, number>;
}

export interface CumulativeFlowData {
  data: CumulativeFlowDay[];
  columns: { id: number; name: string; position: number }[];
}

export interface AssigneeData {
  assignee_id: number | null;
  assignee_name: string;
  assignee_avatar: string | null;
  card_count: number;
}

// Hook for summary analytics
export function useBoardAnalyticsSummary(
  boardId: number | null,
  _token: string | null
) {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!boardId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const json = await api.get<{ data: AnalyticsSummary }>(
        `/api/boards/${boardId}/analytics/summary`
      );
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for throughput data
export function useBoardThroughput(
  boardId: number | null,
  _token: string | null,
  weeks = 6
) {
  const [data, setData] = useState<ThroughputData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!boardId) {
      setData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const json = await api.get<{ data: ThroughputData[] }>(
        `/api/boards/${boardId}/analytics/throughput`,
        { weeks }
      );
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [boardId, weeks]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for cumulative flow data
export function useBoardCumulativeFlow(
  boardId: number | null,
  _token: string | null,
  days = 30
) {
  const [data, setData] = useState<CumulativeFlowData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!boardId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const json = await api.get<CumulativeFlowData>(
        `/api/boards/${boardId}/analytics/cumulative-flow`,
        { days }
      );
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [boardId, days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for assignee distribution
export function useBoardAssigneeDistribution(
  boardId: number | null,
  _token: string | null
) {
  const [data, setData] = useState<AssigneeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!boardId) {
      setData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const json = await api.get<{ data: AssigneeData[] }>(
        `/api/boards/${boardId}/analytics/assignees`
      );
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
